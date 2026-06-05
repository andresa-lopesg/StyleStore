# Decisões Técnicas — StyleStore

Registro de decisões de arquitetura e design do sistema. Cada entrada explica **o que** foi decidido, **por que** e **como** se aplica no projeto.

---

## [DB-001] Uso de Views SQL no banco de dados

**Data:** 2026-05-13
**Status:** Planejado

### O que é

Uma View é uma consulta SQL salva no banco que se comporta como uma tabela virtual. Não armazena dados — executa a query no momento em que é chamada.

### Por que usar

Alguns endpoints do sistema precisam consolidar dados de várias tabelas (joins, agregações, cálculos). Fazer isso via `Include` no EF Core carrega objetos completos na memória desnecessariamente. Views resolvem isso no banco, retornando apenas o que a tela precisa.

### Como entra no projeto

**1. Migration com SQL raw**
```csharp
migrationBuilder.Sql(@"CREATE VIEW vw_NomeDaView AS SELECT ...");
// Down:
migrationBuilder.Sql("DROP VIEW IF EXISTS vw_NomeDaView");
```

**2. Model sem chave primária**
```csharp
public class NomeDaViewDto
{
    public string Campo { get; set; } = string.Empty;
    // ...
}
```

**3. Registro no AppDbContext**
```csharp
public DbSet<NomeDaViewDto> NomeDaView { get; set; }

// OnModelCreating:
modelBuilder.Entity<NomeDaViewDto>()
    .HasNoKey()
    .ToView("vw_NomeDaView");
```

**4. Uso no controller**
```csharp
Ok(await _context.NomeDaView.ToListAsync())
```

---

### Views planejadas

#### `vw_KpisDashboard`
**Serve para:** página Dashboard
**Campos:** `TotalPedidosHoje`, `ReceitaDoMes`, `PedidosPendentes`, `ProdutosComEstoqueBaixo`
**Motivo:** o Dashboard faz múltiplas queries separadas hoje; uma view consolida tudo em uma chamada para `GET /api/dashboard`.

---

#### `vw_EstoqueConsolidado`
**Serve para:** página Estoque
**Campos:** `ProdutoId`, `NomeProduto`, `Categoria`, `EstoqueTotal`, `VariantesComEstoqueZero`, `AlertaBaixo`
**Motivo:** `Produto.EstoqueTotal` é um campo manual que pode ficar inconsistente com a soma real das `ProdutoVariantes`. A view calcula o total correto direto no banco.

---

#### `vw_PedidosDetalhados`
**Serve para:** página Pedidos
**Campos:** `PedidoId`, `NomeCliente`, `NomeFuncionario`, `TotalItens`, `Total`, `Status`, `DataPedido`
**Motivo:** `PedidosController.GetAll` faz `Include` em cascata (cliente + funcionário + itens de todos os pedidos). A view retorna só os campos necessários para a listagem.

---

#### `vw_ProducaoComProgresso`
**Serve para:** página Produção
**Campos:** `ProducaoId`, `NomeProduto`, `QuantidadePlanejada`, `QuantidadeProduzida`, `ProgressoPercent`, `Status`, `Responsavel`
**Motivo:** o campo `ProgressoPercent` é calculado no SQL (`QuantidadeProduzida * 100 / QuantidadePlanejada`), evitando cálculo no frontend ou no C#.

---

### Regras de uso

- Views são **somente leitura** — não usar para INSERT/UPDATE/DELETE
- Modelos de view ficam em `Models/Views/` (pasta separada dos models de entidade)
- Sempre criar e dropar a view na migration (`Up` e `Down`)
- Nomear com prefixo `vw_`

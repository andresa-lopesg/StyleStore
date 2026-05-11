using ApiClientes.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiClientes.Data;

public static class Seeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Categorias.AnyAsync()) return;

        // ── CATEGORIAS ────────────────────────────────────────────────
        var categorias = new List<Categoria>
        {
            new() { Nome = "Camisetas",    Descricao = "Camisetas femininas e masculinas",         Ativa = true },
            new() { Nome = "Vestidos",     Descricao = "Vestidos casuais e de festa",              Ativa = true },
            new() { Nome = "Calças",       Descricao = "Calças jeans, sociais e leggings",         Ativa = true },
            new() { Nome = "Blusas",       Descricao = "Blusas de frio e tricô",                  Ativa = true },
            new() { Nome = "Bermudas",     Descricao = "Bermudas e shorts femininos e masculinos", Ativa = true },
            new() { Nome = "Jaquetas",     Descricao = "Jaquetas e casacos",                       Ativa = true },
            new() { Nome = "Acessórios",   Descricao = "Bolsas, cintos e chapéus",                 Ativa = true },
            new() { Nome = "Pijamas",      Descricao = "Conjuntos e pijamas",                      Ativa = true },
        };
        db.Categorias.AddRange(categorias);
        await db.SaveChangesAsync();

        // ── PRODUTOS ──────────────────────────────────────────────────
        var produtos = new List<Produto>
        {
            // Camisetas
            new() { Nome = "Camiseta Básica Branca",       Descricao = "100% algodão, corte slim",            Preco = 59.90m,  PrecoCusto = 22.00m, EstoqueTotal = 85,  Referencia = "CAM-001-BR", CategoriaId = categorias[0].Id, Ativo = true },
            new() { Nome = "Camiseta Básica Preta",        Descricao = "100% algodão, corte slim",            Preco = 59.90m,  PrecoCusto = 22.00m, EstoqueTotal = 72,  Referencia = "CAM-001-PT", CategoriaId = categorias[0].Id, Ativo = true },
            new() { Nome = "Camiseta Estampada Floral",    Descricao = "Malha suave, estampa exclusiva",      Preco = 79.90m,  PrecoCusto = 30.00m, EstoqueTotal = 43,  Referencia = "CAM-002-FL", CategoriaId = categorias[0].Id, Ativo = true },
            new() { Nome = "Camiseta Cropped Tie-Dye",     Descricao = "Tendência verão, corte cropped",      Preco = 69.90m,  PrecoCusto = 25.00m, EstoqueTotal = 38,  Referencia = "CAM-003-TD", CategoriaId = categorias[0].Id, Ativo = true },
            new() { Nome = "Camiseta Polo Listrada",       Descricao = "Poliéster, casual e esportiva",       Preco = 89.90m,  PrecoCusto = 35.00m, EstoqueTotal = 29,  Referencia = "CAM-004-PL", CategoriaId = categorias[0].Id, Ativo = true },
            // Vestidos
            new() { Nome = "Vestido Midi Floral",          Descricao = "Viscose, caimento leve e elegante",   Preco = 179.90m, PrecoCusto = 65.00m, EstoqueTotal = 24,  Referencia = "VES-001-FL", CategoriaId = categorias[1].Id, Ativo = true },
            new() { Nome = "Vestido Longo Boho",           Descricao = "Estilo boho chic, mangas longas",     Preco = 219.90m, PrecoCusto = 80.00m, EstoqueTotal = 18,  Referencia = "VES-002-BH", CategoriaId = categorias[1].Id, Ativo = true },
            new() { Nome = "Vestido Curto de Festa",       Descricao = "Crepe, ideal para ocasiões especiais",Preco = 259.90m, PrecoCusto = 95.00m, EstoqueTotal = 12,  Referencia = "VES-003-FT", CategoriaId = categorias[1].Id, Ativo = true },
            new() { Nome = "Vestido Chemise Listrado",     Descricao = "Linho, confortável para o dia a dia", Preco = 139.90m, PrecoCusto = 52.00m, EstoqueTotal = 31,  Referencia = "VES-004-LS", CategoriaId = categorias[1].Id, Ativo = true },
            // Calças
            new() { Nome = "Calça Jeans Skinny",           Descricao = "Denim premium, lycra 2%",             Preco = 149.90m, PrecoCusto = 55.00m, EstoqueTotal = 56,  Referencia = "CAL-001-SK", CategoriaId = categorias[2].Id, Ativo = true },
            new() { Nome = "Calça Jeans Wide Leg",         Descricao = "Corte reto, tendência atual",         Preco = 169.90m, PrecoCusto = 62.00m, EstoqueTotal = 41,  Referencia = "CAL-002-WL", CategoriaId = categorias[2].Id, Ativo = true },
            new() { Nome = "Legging Suplex",               Descricao = "Alta compressão, uso fitness",        Preco = 99.90m,  PrecoCusto = 38.00m, EstoqueTotal = 67,  Referencia = "CAL-003-LG", CategoriaId = categorias[2].Id, Ativo = true },
            new() { Nome = "Calça Social Slim",            Descricao = "Poliéster, ideal para trabalho",      Preco = 189.90m, PrecoCusto = 70.00m, EstoqueTotal = 22,  Referencia = "CAL-004-SC", CategoriaId = categorias[2].Id, Ativo = true },
            // Blusas
            new() { Nome = "Blusa de Tricô Canelada",      Descricao = "Malha canelada, quentinha",           Preco = 119.90m, PrecoCusto = 45.00m, EstoqueTotal = 35,  Referencia = "BLU-001-TC", CategoriaId = categorias[3].Id, Ativo = true },
            new() { Nome = "Blusa Cropped Manga Longa",    Descricao = "Ribana, estilo streetwear",           Preco = 89.90m,  PrecoCusto = 33.00m, EstoqueTotal = 48,  Referencia = "BLU-002-CR", CategoriaId = categorias[3].Id, Ativo = true },
            new() { Nome = "Blusa Ombro a Ombro",          Descricao = "Viscose, sensual e elegante",         Preco = 109.90m, PrecoCusto = 40.00m, EstoqueTotal = 27,  Referencia = "BLU-003-OO", CategoriaId = categorias[3].Id, Ativo = true },
            // Bermudas
            new() { Nome = "Bermuda Jeans Feminina",       Descricao = "Denim com destroyed, casual",         Preco = 99.90m,  PrecoCusto = 38.00m, EstoqueTotal = 44,  Referencia = "BER-001-JF", CategoriaId = categorias[4].Id, Ativo = true },
            new() { Nome = "Short Tactel Masculino",       Descricao = "Tactel, leve e esportivo",            Preco = 79.90m,  PrecoCusto = 29.00m, EstoqueTotal = 53,  Referencia = "BER-002-TM", CategoriaId = categorias[4].Id, Ativo = true },
            // Jaquetas
            new() { Nome = "Jaqueta Jeans Oversized",      Descricao = "Denim delavê, tendência inverno",     Preco = 299.90m, PrecoCusto = 110.00m, EstoqueTotal = 15, Referencia = "JAQ-001-JO", CategoriaId = categorias[5].Id, Ativo = true },
            new() { Nome = "Jaqueta de Couro Sintético",   Descricao = "PU de alta qualidade, forro interno", Preco = 349.90m, PrecoCusto = 130.00m, EstoqueTotal = 9,  Referencia = "JAQ-002-CS", CategoriaId = categorias[5].Id, Ativo = true },
            new() { Nome = "Corta Vento Color Block",      Descricao = "Nylon, impermeável, leve",            Preco = 199.90m, PrecoCusto = 75.00m,  EstoqueTotal = 20, Referencia = "JAQ-003-CV", CategoriaId = categorias[5].Id, Ativo = true },
            // Acessórios
            new() { Nome = "Bolsa Tiracolo Couro",         Descricao = "Couro legítimo, alça regulável",      Preco = 189.90m, PrecoCusto = 70.00m,  EstoqueTotal = 19, Referencia = "ACE-001-BT", CategoriaId = categorias[6].Id, Ativo = true },
            new() { Nome = "Cinto de Couro Trançado",      Descricao = "Couro legítimo, trançado artesanal",  Preco = 79.90m,  PrecoCusto = 28.00m,  EstoqueTotal = 33, Referencia = "ACE-002-CT", CategoriaId = categorias[6].Id, Ativo = true },
            // Pijamas
            new() { Nome = "Pijama Curto Estampado",       Descricao = "Viscose macia, estampa exclusiva",    Preco = 129.90m, PrecoCusto = 48.00m,  EstoqueTotal = 37, Referencia = "PIJ-001-CE", CategoriaId = categorias[7].Id, Ativo = true },
            new() { Nome = "Pijama Longo Listrado",        Descricao = "Algodão, quentinho para o inverno",   Preco = 149.90m, PrecoCusto = 55.00m,  EstoqueTotal = 28, Referencia = "PIJ-002-LL", CategoriaId = categorias[7].Id, Ativo = true },
        };
        db.Produtos.AddRange(produtos);
        await db.SaveChangesAsync();

        // ── VARIANTES ─────────────────────────────────────────────────
        var tamanhos = new[] { "P", "M", "G", "GG" };
        var cores = new[] { "Branco", "Preto", "Azul", "Rosa", "Bege" };
        var rng = new Random(42);
        var variantes = new List<ProdutoVariante>();
        foreach (var produto in produtos.Take(12))
        {
            foreach (var tam in tamanhos)
            {
                variantes.Add(new ProdutoVariante
                {
                    ProdutoId = produto.Id,
                    Tamanho = tam,
                    Cor = cores[rng.Next(cores.Length)],
                    Estoque = rng.Next(3, 20),
                });
            }
        }
        db.ProdutoVariantes.AddRange(variantes);
        await db.SaveChangesAsync();

        // ── CLIENTES ──────────────────────────────────────────────────
        var clientes = new List<Cliente>
        {
            new() { Nome = "Ana Paula Ferreira",    Email = "ana.ferreira@email.com",    Telefone = "(11) 99123-4567" },
            new() { Nome = "Juliana Costa",         Email = "juliana.costa@gmail.com",   Telefone = "(21) 98765-4321" },
            new() { Nome = "Mariana Oliveira",      Email = "mari.oliveira@hotmail.com", Telefone = "(31) 97654-3210" },
            new() { Nome = "Fernanda Lima",         Email = "fer.lima@email.com",        Telefone = "(11) 96543-2109" },
            new() { Nome = "Beatriz Santos",        Email = "bia.santos@gmail.com",      Telefone = "(51) 95432-1098" },
            new() { Nome = "Camila Rodrigues",      Email = "camila.r@email.com",        Telefone = "(41) 94321-0987" },
            new() { Nome = "Patrícia Alves",        Email = "patricia.alves@gmail.com",  Telefone = "(61) 93210-9876" },
            new() { Nome = "Larissa Mendes",        Email = "larissa.m@hotmail.com",     Telefone = "(71) 92109-8765" },
            new() { Nome = "Vanessa Carvalho",      Email = "vanessa.c@email.com",       Telefone = "(81) 91098-7654" },
            new() { Nome = "Renata Souza",          Email = "renata.s@gmail.com",        Telefone = "(11) 90987-6543" },
            new() { Nome = "Lucas Pereira",         Email = "lucas.p@email.com",         Telefone = "(11) 99876-5432" },
            new() { Nome = "Gabriel Martins",       Email = "gabriel.m@gmail.com",       Telefone = "(21) 98765-4320" },
            new() { Nome = "Rafael Torres",         Email = "rafael.t@hotmail.com",      Telefone = "(31) 97654-3211" },
            new() { Nome = "Diego Nascimento",      Email = "diego.n@email.com",         Telefone = "(41) 96543-2108" },
            new() { Nome = "Thiago Barbosa",        Email = "thiago.b@gmail.com",        Telefone = "(51) 95432-1097" },
        };
        db.Clientes.AddRange(clientes);
        await db.SaveChangesAsync();

        // ── FUNCIONÁRIOS ──────────────────────────────────────────────
        var funcionarios = new List<Funcionario>
        {
            new() { Nome = "Roberta Campos",    Email = "roberta.campos@stylestore.com",  Telefone = "(11) 98000-1111", Cargo = "Gerente",     Salario = 4800.00m, Cpf = "123.456.789-01", DataAdmissao = new DateTime(2021, 3, 1, 0, 0, 0, DateTimeKind.Utc),  Ativo = true },
            new() { Nome = "Carlos Eduardo",    Email = "carlos.edu@stylestore.com",      Telefone = "(11) 98000-2222", Cargo = "Vendedor",    Salario = 2400.00m, Cpf = "234.567.890-12", DataAdmissao = new DateTime(2022, 1, 15, 0, 0, 0, DateTimeKind.Utc), Ativo = true },
            new() { Nome = "Aline Ribeiro",     Email = "aline.r@stylestore.com",         Telefone = "(11) 98000-3333", Cargo = "Vendedor",    Salario = 2400.00m, Cpf = "345.678.901-23", DataAdmissao = new DateTime(2022, 6, 1, 0, 0, 0, DateTimeKind.Utc),  Ativo = true },
            new() { Nome = "Marcos Vieira",     Email = "marcos.v@stylestore.com",        Telefone = "(11) 98000-4444", Cargo = "Estoquista",  Salario = 2000.00m, Cpf = "456.789.012-34", DataAdmissao = new DateTime(2023, 2, 10, 0, 0, 0, DateTimeKind.Utc), Ativo = true },
            new() { Nome = "Priscila Nunes",    Email = "priscila.n@stylestore.com",      Telefone = "(11) 98000-5555", Cargo = "Caixa",       Salario = 1900.00m, Cpf = "567.890.123-45", DataAdmissao = new DateTime(2023, 7, 20, 0, 0, 0, DateTimeKind.Utc), Ativo = true },
            new() { Nome = "Felipe Gomes",      Email = "felipe.g@stylestore.com",        Telefone = "(11) 98000-6666", Cargo = "Costureiro",  Salario = 2800.00m, Cpf = "678.901.234-56", DataAdmissao = new DateTime(2021, 9, 5, 0, 0, 0, DateTimeKind.Utc),  Ativo = true },
            new() { Nome = "Tatiane Freitas",   Email = "tatiane.f@stylestore.com",       Telefone = "(11) 98000-7777", Cargo = "Designer",    Salario = 3500.00m, Cpf = "789.012.345-67", DataAdmissao = new DateTime(2020, 11, 1, 0, 0, 0, DateTimeKind.Utc), Ativo = true },
            new() { Nome = "Paulo Henrique",    Email = "paulo.h@stylestore.com",         Telefone = "(11) 98000-8888", Cargo = "Auxiliar",    Salario = 1500.00m, Cpf = "890.123.456-78", DataAdmissao = new DateTime(2024, 1, 8, 0, 0, 0, DateTimeKind.Utc),  Ativo = true },
        };
        db.Funcionarios.AddRange(funcionarios);
        await db.SaveChangesAsync();

        // ── USUÁRIOS ──────────────────────────────────────────────────
        var usuarios = new List<Usuario>
        {
            new() { Nome = "Admin StyleStore",  Email = "admin@stylestore.com",   SenhaHash = "hashed_admin_123",   CriadoEm = DateTime.UtcNow.AddMonths(-12) },
            new() { Nome = "Roberta Campos",    Email = "roberta@stylestore.com", SenhaHash = "hashed_roberta_456", CriadoEm = DateTime.UtcNow.AddMonths(-10) },
            new() { Nome = "Tatiane Freitas",   Email = "tatiane@stylestore.com", SenhaHash = "hashed_tatiane_789", CriadoEm = DateTime.UtcNow.AddMonths(-8)  },
        };
        db.Usuarios.AddRange(usuarios);
        await db.SaveChangesAsync();

        // ── PEDIDOS ───────────────────────────────────────────────────
        var pedidosData = new (int clienteIdx, int funcIdx, StatusPedido status, DateTime data, decimal desconto, string? obs, string? endereco)[]
        {
            (0,  1, StatusPedido.Entregue,    DateTime.UtcNow.AddDays(-45), 0m,     null,                         "Rua das Flores, 123 - SP"),
            (1,  2, StatusPedido.Entregue,    DateTime.UtcNow.AddDays(-40), 20m,    "Cliente VIP",                "Av. Paulista, 456 - SP"),
            (2,  1, StatusPedido.Entregue,    DateTime.UtcNow.AddDays(-35), 0m,     null,                         "Rua Augusta, 789 - SP"),
            (3,  2, StatusPedido.Entregue,    DateTime.UtcNow.AddDays(-30), 15m,    null,                         "Rua Oscar Freire, 100 - SP"),
            (4,  1, StatusPedido.Entregue,    DateTime.UtcNow.AddDays(-28), 0m,     null,                         "Av. Brasil, 500 - RJ"),
            (5,  2, StatusPedido.Enviado,     DateTime.UtcNow.AddDays(-20), 0m,     null,                         "Rua XV, 220 - PR"),
            (6,  1, StatusPedido.Enviado,     DateTime.UtcNow.AddDays(-18), 30m,    "Desconto fidelidade",        "Rua do Comércio, 15 - MG"),
            (7,  2, StatusPedido.Separando,   DateTime.UtcNow.AddDays(-12), 0m,     null,                         "Av. Getúlio Vargas, 300 - BA"),
            (8,  1, StatusPedido.EmProducao,  DateTime.UtcNow.AddDays(-8),  0m,     "Peça personalizada",         "Rua Nova, 88 - PE"),
            (9,  2, StatusPedido.Confirmado,  DateTime.UtcNow.AddDays(-5),  0m,     null,                         "Av. Central, 42 - GO"),
            (10, 1, StatusPedido.Confirmado,  DateTime.UtcNow.AddDays(-4),  10m,    null,                         "Rua das Acácias, 77 - SP"),
            (11, 2, StatusPedido.Pendente,    DateTime.UtcNow.AddDays(-3),  0m,     null,                         "Av. das Nações, 1 - DF"),
            (12, 1, StatusPedido.Pendente,    DateTime.UtcNow.AddDays(-2),  0m,     "Entrega urgente",            "Rua Bela Vista, 55 - SP"),
            (13, 2, StatusPedido.Pendente,    DateTime.UtcNow.AddDays(-1),  0m,     null,                         "Rua do Porto, 200 - SP"),
            (14, 1, StatusPedido.Pendente,    DateTime.UtcNow,              0m,     null,                         "Av. Independência, 999 - RS"),
        };

        var itensPorPedido = new[]
        {
            new[] { (0, 2), (9, 1) },
            new[] { (5, 1), (6, 1), (20, 1) },
            new[] { (1, 3), (16, 2) },
            new[] { (7, 1), (21, 1) },
            new[] { (10, 2), (11, 1) },
            new[] { (2, 1), (13, 2) },
            new[] { (18, 1), (22, 1) },
            new[] { (3, 2), (14, 1) },
            new[] { (6, 1) },
            new[] { (0, 1), (1, 1), (4, 1) },
            new[] { (9, 1), (17, 1) },
            new[] { (19, 1) },
            new[] { (5, 2), (12, 1) },
            new[] { (7, 1), (23, 2) },
            new[] { (15, 1), (24, 1) },
        };

        var pedidos = new List<Pedido>();
        for (int i = 0; i < pedidosData.Length; i++)
        {
            var (ci, fi, status, data, desc, obs, end) = pedidosData[i];
            decimal total = 0;
            foreach (var (pi, qty) in itensPorPedido[i])
                total += produtos[pi].Preco * qty;
            total -= desc;

            pedidos.Add(new Pedido
            {
                ClienteId = clientes[ci].Id,
                FuncionarioId = funcionarios[fi].Id,
                Status = status,
                DataPedido = data,
                Desconto = desc,
                Total = total,
                Observacao = obs,
                EnderecoEntrega = end,
                DataEntregaPrevista = data.AddDays(7),
                CriadoEm = data,
            });
        }
        db.Pedidos.AddRange(pedidos);
        await db.SaveChangesAsync();

        // Itens dos pedidos
        var itensList = new List<ItemPedido>();
        for (int i = 0; i < pedidos.Count; i++)
        {
            foreach (var (pi, qty) in itensPorPedido[i])
            {
                itensList.Add(new ItemPedido
                {
                    PedidoId = pedidos[i].Id,
                    ProdutoId = produtos[pi].Id,
                    Quantidade = qty,
                    PrecoUnitario = produtos[pi].Preco,
                    Tamanho = tamanhos[rng.Next(tamanhos.Length)],
                    Cor = cores[rng.Next(cores.Length)],
                });
            }
        }
        db.ItensPedido.AddRange(itensList);
        await db.SaveChangesAsync();

        // ── PRODUÇÃO ──────────────────────────────────────────────────
        var ordens = new List<Producao>
        {
            new() { ProdutoId = produtos[0].Id,  Responsavel = "Felipe Gomes",   QuantidadePlanejada = 100, QuantidadeProduzida = 100, Status = StatusProducao.Concluido,   DataInicio = DateTime.UtcNow.AddDays(-60), DataFim = DateTime.UtcNow.AddDays(-50), Observacao = "Lote de verão" },
            new() { ProdutoId = produtos[5].Id,  Responsavel = "Felipe Gomes",   QuantidadePlanejada = 50,  QuantidadeProduzida = 50,  Status = StatusProducao.Concluido,   DataInicio = DateTime.UtcNow.AddDays(-55), DataFim = DateTime.UtcNow.AddDays(-45) },
            new() { ProdutoId = produtos[9].Id,  Responsavel = "Paulo Henrique", QuantidadePlanejada = 80,  QuantidadeProduzida = 80,  Status = StatusProducao.Concluido,   DataInicio = DateTime.UtcNow.AddDays(-50), DataFim = DateTime.UtcNow.AddDays(-40) },
            new() { ProdutoId = produtos[18].Id, Responsavel = "Felipe Gomes",   QuantidadePlanejada = 30,  QuantidadeProduzida = 30,  Status = StatusProducao.Concluido,   DataInicio = DateTime.UtcNow.AddDays(-40), DataFim = DateTime.UtcNow.AddDays(-30) },
            new() { ProdutoId = produtos[1].Id,  Responsavel = "Felipe Gomes",   QuantidadePlanejada = 120, QuantidadeProduzida = 72,  Status = StatusProducao.EmAndamento, DataInicio = DateTime.UtcNow.AddDays(-15), Observacao = "Segundo lote temporada" },
            new() { ProdutoId = produtos[6].Id,  Responsavel = "Paulo Henrique", QuantidadePlanejada = 40,  QuantidadeProduzida = 18,  Status = StatusProducao.EmAndamento, DataInicio = DateTime.UtcNow.AddDays(-10) },
            new() { ProdutoId = produtos[13].Id, Responsavel = "Felipe Gomes",   QuantidadePlanejada = 60,  QuantidadeProduzida = 0,   Status = StatusProducao.Aguardando,  DataInicio = DateTime.UtcNow.AddDays(5),  Observacao = "Aguardando tecido" },
            new() { ProdutoId = produtos[19].Id, Responsavel = "Paulo Henrique", QuantidadePlanejada = 20,  QuantidadeProduzida = 0,   Status = StatusProducao.Aguardando,  DataInicio = DateTime.UtcNow.AddDays(10), Observacao = "Coleção inverno" },
            new() { ProdutoId = produtos[3].Id,  Responsavel = "Felipe Gomes",   QuantidadePlanejada = 70,  QuantidadeProduzida = 35,  Status = StatusProducao.Pausado,     DataInicio = DateTime.UtcNow.AddDays(-20), Observacao = "Aguardando aprovação estampa" },
        };
        db.Producoes.AddRange(ordens);
        await db.SaveChangesAsync();
    }
}

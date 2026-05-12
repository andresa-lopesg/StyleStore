# StyleStore — Sistema de Gestão de Loja

Sistema completo para gerenciamento de uma loja de moda, com painel administrativo dark mode, CRUD de todos os módulos e integração entre front-end e back-end.

---

## Tecnologias

### Back-end
| Tecnologia | Versão |
|---|---|
| .NET | 8.0 |
| ASP.NET Core (Web API) | 8.0 |
| Entity Framework Core | 8.0 |
| SQL Server (Azure SQL Edge) | latest |
| Swagger / OpenAPI | 6.6 |

### Front-end
| Tecnologia | Versão |
|---|---|
| React | 19 |
| Vite | 8 |
| TypeScript | 6 |
| Tailwind CSS | 4 |
| React Router | 7 |
| TanStack Query | 5 |
| Axios | 1 |
| Recharts | 3 |
| React Hook Form | 7 |
| Lucide React | 1 |

---

## Estrutura do Projeto

```
ApiClientes/
├── Controllers/           # Endpoints da API REST
│   ├── ClientesController.cs
│   ├── UsuariosController.cs
│   ├── CategoriasController.cs
│   ├── ProdutosController.cs
│   ├── FuncionariosController.cs
│   ├── PedidosController.cs
│   └── ProducaoController.cs
├── Models/                # Entidades do banco de dados
│   ├── Cliente.cs
│   ├── Usuario.cs
│   ├── Categoria.cs
│   ├── Produto.cs
│   ├── ProdutoVariante.cs
│   ├── Funcionario.cs
│   ├── Pedido.cs
│   ├── ItemPedido.cs
│   └── Producao.cs
├── Data/
│   └── AppDbContext.cs    # Contexto do Entity Framework
├── Migrations/            # Migrações do banco de dados
├── appsettings.json       # String de conexão e configurações
├── Program.cs             # Configuração da aplicação
└── frontend/              # Aplicação React
    └── src/
        ├── components/
        │   ├── layout/    # Sidebar, TopBar, Layout
        │   └── ui/        # Button, Input, Modal, Table, Badge...
        ├── pages/         # Dashboard, Clientes, Produtos...
        ├── services/      # Camada de chamadas à API (axios)
        └── types/         # Tipos TypeScript compartilhados
```

---

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) para rodar o SQL Server (Azure SQL Edge)

---

## Configuração do Banco de Dados

O banco roda no **Azure SQL Edge via Docker**. Suba o container antes de iniciar a API:

```bash
docker run -d --name sql_edge -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=SuaSenha' -p 1433:1433 mcr.microsoft.com/azure-sql-edge
```

Edite a string de conexão em `appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=loja;User Id=sa;Password=SuaSenha;TrustServerCertificate=True"
}
```

---

## Como Rodar

### 1. Back-end

```bash
# Na raiz do projeto
dotnet run --environment Development
```

A API estará disponível em `http://localhost:5067`
Documentação Swagger em `http://localhost:5067/swagger`

### 2. Front-end

```bash
cd frontend
npm install      # apenas na primeira vez
npm run dev
```

O painel estará disponível em `http://localhost:5173`

---

## Módulos do Sistema

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | KPIs em tempo real, gráfico de receita mensal, status de pedidos, últimos pedidos, nível de estoque por produto |
| **Pedidos** | CRUD completo, visualização detalhada com itens, controle de status (Pendente → Entregue) |
| **Produtos** | CRUD com categoria, preço de venda e custo, SKU/referência, alerta de estoque baixo |
| **Categorias** | Gerenciamento de categorias de produto, ativar/inativar |
| **Clientes** | Cadastro e edição de clientes da loja |
| **Funcionários** | Cadastro com cargo, salário, CPF, data de admissão |
| **Produção** | Ordens de produção com progresso, responsável e datas |
| **Estoque** | Visão consolidada com alertas de estoque zero e baixo, nível visual por produto |
| **Usuários** | Usuários do sistema |

### Status de Pedido

| Status | Descrição |
|---|---|
| Pendente | Pedido recebido, aguardando confirmação |
| Confirmado | Pedido confirmado |
| Em Produção | Peças sendo produzidas |
| Separando | Pedido em separação no estoque |
| Enviado | Pedido despachado |
| Entregue | Entrega confirmada |
| Cancelado | Pedido cancelado |

### Status de Produção

| Status | Descrição |
|---|---|
| Aguardando | Ordem criada, aguardando início |
| Em Andamento | Produção em curso |
| Pausado | Produção temporariamente interrompida |
| Concluído | Produção finalizada |
| Cancelado | Ordem cancelada |

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/clientes` | Listar / Criar clientes |
| GET/PUT/DELETE | `/api/clientes/{id}` | Buscar / Editar / Excluir |
| GET/POST | `/api/produtos` | Listar / Criar produtos |
| GET/POST | `/api/categorias` | Listar / Criar categorias |
| GET/POST | `/api/funcionarios` | Listar / Criar funcionários |
| GET/POST | `/api/pedidos` | Listar / Criar pedidos |
| PATCH | `/api/pedidos/{id}/status` | Atualizar status do pedido |
| GET/POST | `/api/producao` | Listar / Criar ordens de produção |
| PATCH | `/api/producao/{id}/status` | Atualizar status da produção |
| GET/POST | `/api/usuarios` | Listar / Criar usuários |

---

## Banco de Dados — Diagrama de Entidades

```
Categoria ──< Produto ──< ProdutoVariante
                │
                └──< ItemPedido >──┐
                                   │
Cliente ──< Pedido ──< ItemPedido  │
              │                    │
         Funcionario         Produto (ref)

Produto ──< Producao
```

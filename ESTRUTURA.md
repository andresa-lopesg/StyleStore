# Mapa do Projeto — StyleStore

Guia de orientação para entender onde cada arquivo vive e qual é o seu papel no sistema.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Fluxo Completo](#fluxo-completo)
- [Backend (API em C#)](#backend-api-em-c)
  - [Controllers](#controllers--os-garçons)
  - [Models](#models--o-formato-dos-dados)
  - [Data (Banco)](#data--a-ponte-com-o-banco)
  - [Migrations](#migrations--histórico-do-banco)
  - [Configuração](#configuração)
- [Frontend (React)](#frontend-react)
  - [Pages (Telas)](#pages--as-telas)
  - [Services (Chamadas à API)](#services--chamadas-à-api)
  - [Types (Formatos)](#types--formatos-dos-dados)
  - [Components (Peças reutilizáveis)](#components--peças-reutilizáveis)

---

## Visão Geral

O projeto tem **duas partes** que se comunicam via HTTP:

| Parte | Tecnologia | Responsabilidade |
|---|---|---|
| **Backend** | ASP.NET Core 8 + C# | Regras de negócio, banco de dados, API REST |
| **Frontend** | React + TypeScript | Interface visual que o usuário usa |

---

## Fluxo Completo

Quando o usuário clica em algo na tela, isso é o que acontece por baixo:

```
Tela (Pages)
    ↓  o usuário clica em "Salvar"
Service
    ↓  manda requisição HTTP (GET / POST / PUT / DELETE)
Controller
    ↓  recebe e processa o pedido
Model
    ↓  define o formato dos dados
AppDbContext (Data)
    ↓  executa o SQL
Banco de dados (SQL Server)
```

---

## Backend (API em C#)

### Controllers — os garçons

> O controller é o garçom: recebe o pedido do cliente (frontend), processa e traz a resposta. Cada controller cuida de um assunto.

| Arquivo | Responsabilidade |
|---|---|
| [Controllers/ClientesController.cs](Controllers/ClientesController.cs) | Endpoints de clientes — listar, criar, editar, deletar |
| [Controllers/ProdutosController.cs](Controllers/ProdutosController.cs) | Endpoints de produtos |
| [Controllers/CategoriasController.cs](Controllers/CategoriasController.cs) | Endpoints de categorias |
| [Controllers/PedidosController.cs](Controllers/PedidosController.cs) | Endpoints de pedidos |
| [Controllers/FuncionariosController.cs](Controllers/FuncionariosController.cs) | Endpoints de funcionários |
| [Controllers/ProducaoController.cs](Controllers/ProducaoController.cs) | Endpoints de produção |
| [Controllers/UsuariosController.cs](Controllers/UsuariosController.cs) | Endpoints de usuários e autenticação |

---

### Models — o formato dos dados

> O Model é o "formulário" que define quais campos cada entidade tem. Ex: um `Cliente` tem nome, CPF, telefone... O banco cria uma tabela com base nele.

| Arquivo | O que representa |
|---|---|
| [Models/Cliente.cs](Models/Cliente.cs) | Estrutura de um cliente |
| [Models/Produto.cs](Models/Produto.cs) | Estrutura de um produto |
| [Models/Categoria.cs](Models/Categoria.cs) | Estrutura de uma categoria |
| [Models/Pedido.cs](Models/Pedido.cs) | Estrutura de um pedido |
| [Models/ItemPedido.cs](Models/ItemPedido.cs) | Itens individuais dentro de um pedido |
| [Models/ProdutoVariante.cs](Models/ProdutoVariante.cs) | Variantes de produto (ex: tamanho, cor) |
| [Models/Funcionario.cs](Models/Funcionario.cs) | Estrutura de um funcionário |
| [Models/Producao.cs](Models/Producao.cs) | Estrutura de um registro de produção |
| [Models/Usuario.cs](Models/Usuario.cs) | Estrutura de um usuário do sistema |

---

### Data — a ponte com o banco

> É aqui que o C# "aprende" a falar com o SQL Server. O `AppDbContext` é o arquivo mais importante dessa camada.

| Arquivo | O que faz |
|---|---|
| [Data/AppDbContext.cs](Data/AppDbContext.cs) | Define quais tabelas existem e como se relacionam — é o **schema** do banco |
| [Data/Seeder.cs](Data/Seeder.cs) | Popula o banco com dados iniciais de exemplo ao subir o sistema pela primeira vez |

---

### Migrations — histórico do banco

> Cada migration é como um "save" do banco. Toda vez que o schema muda (nova coluna, nova tabela), uma migration registra essa mudança.

| Arquivo | O que faz |
|---|---|
| [Migrations/20260512111540_InitialCreate.cs](Migrations/20260512111540_InitialCreate.cs) | Criou todas as tabelas do zero — a migration inicial |
| [Migrations/AppDbContextModelSnapshot.cs](Migrations/AppDbContextModelSnapshot.cs) | Foto atual do banco — gerado automaticamente pelo Entity Framework |

---

### Configuração

| Arquivo | O que faz |
|---|---|
| [Program.cs](Program.cs) | Ponto de entrada da API — onde tudo começa a rodar |
| [appsettings.json](appsettings.json) | Configurações do sistema (string de conexão com o banco) |
| [appsettings.Development.json](appsettings.Development.json) | Configurações específicas para ambiente de desenvolvimento local |
| [appsettings.example.json](appsettings.example.json) | Modelo de configuração para novos desenvolvedores |
| [ApiClientes.csproj](ApiClientes.csproj) | Arquivo de projeto C# — lista as dependências (pacotes NuGet) |

---

## Frontend (React)

### Pages — as telas

> Cada arquivo é uma página completa que o usuário enxerga no navegador.

| Arquivo | Tela |
|---|---|
| [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx) | Tela inicial com resumo geral do sistema |
| [frontend/src/pages/Clientes.tsx](frontend/src/pages/Clientes.tsx) | Gerenciamento de clientes |
| [frontend/src/pages/Produtos.tsx](frontend/src/pages/Produtos.tsx) | Gerenciamento de produtos |
| [frontend/src/pages/Categorias.tsx](frontend/src/pages/Categorias.tsx) | Gerenciamento de categorias |
| [frontend/src/pages/Pedidos.tsx](frontend/src/pages/Pedidos.tsx) | Gerenciamento de pedidos |
| [frontend/src/pages/Funcionarios.tsx](frontend/src/pages/Funcionarios.tsx) | Gerenciamento de funcionários |
| [frontend/src/pages/Producao.tsx](frontend/src/pages/Producao.tsx) | Gerenciamento de produção |
| [frontend/src/pages/Estoque.tsx](frontend/src/pages/Estoque.tsx) | Controle de estoque |
| [frontend/src/pages/Usuarios.tsx](frontend/src/pages/Usuarios.tsx) | Gerenciamento de usuários do sistema |

---

### Services — chamadas à API

> O service é o intermediário entre a tela e o backend. A tela pede os dados, o service vai buscar na API e traz de volta.

| Arquivo | O que faz |
|---|---|
| [frontend/src/services/api.ts](frontend/src/services/api.ts) | Configuração base do Axios — define a URL base e headers padrão |
| [frontend/src/services/clientes.ts](frontend/src/services/clientes.ts) | Funções para buscar, criar, editar e deletar clientes via API |
| [frontend/src/services/produtos.ts](frontend/src/services/produtos.ts) | Idem para produtos |
| [frontend/src/services/categorias.ts](frontend/src/services/categorias.ts) | Idem para categorias |
| [frontend/src/services/pedidos.ts](frontend/src/services/pedidos.ts) | Idem para pedidos |
| [frontend/src/services/funcionarios.ts](frontend/src/services/funcionarios.ts) | Idem para funcionários |
| [frontend/src/services/producao.ts](frontend/src/services/producao.ts) | Idem para produção |
| [frontend/src/services/usuarios.ts](frontend/src/services/usuarios.ts) | Idem para usuários |

---

### Types — formatos dos dados

> No frontend, os types definem o "formato" esperado dos dados que chegam da API. É o equivalente aos Models do backend.

| Arquivo | O que faz |
|---|---|
| [frontend/src/types/index.ts](frontend/src/types/index.ts) | Todas as interfaces TypeScript do projeto (Cliente, Produto, Pedido...) |

---

### Components — peças reutilizáveis

> Pedaços de tela que aparecem em várias páginas diferentes. Criados uma vez, usados em todo lugar.

#### Layout (estrutura da tela)

| Arquivo | O que é |
|---|---|
| [frontend/src/components/layout/Layout.tsx](frontend/src/components/layout/Layout.tsx) | Estrutura geral — define onde fica o menu e onde fica o conteúdo |
| [frontend/src/components/layout/Sidebar.tsx](frontend/src/components/layout/Sidebar.tsx) | Menu lateral de navegação |
| [frontend/src/components/layout/TopBar.tsx](frontend/src/components/layout/TopBar.tsx) | Barra superior |

#### UI (componentes visuais)

| Arquivo | O que é |
|---|---|
| [frontend/src/components/ui/Modal.tsx](frontend/src/components/ui/Modal.tsx) | Janela pop-up (para formulários de criar/editar) |
| [frontend/src/components/ui/Table.tsx](frontend/src/components/ui/Table.tsx) | Tabela de dados |
| [frontend/src/components/ui/Button.tsx](frontend/src/components/ui/Button.tsx) | Botão padronizado |
| [frontend/src/components/ui/Input.tsx](frontend/src/components/ui/Input.tsx) | Campo de texto |
| [frontend/src/components/ui/Select.tsx](frontend/src/components/ui/Select.tsx) | Campo de seleção (dropdown) |
| [frontend/src/components/ui/Badge.tsx](frontend/src/components/ui/Badge.tsx) | Etiqueta de status (ex: "Ativo", "Pendente") |
| [frontend/src/components/ui/ConfirmDialog.tsx](frontend/src/components/ui/ConfirmDialog.tsx) | Caixa de confirmação (ex: "Tem certeza que deseja deletar?") |

---

#### Ponto de entrada do frontend

| Arquivo | O que faz |
|---|---|
| [frontend/src/main.tsx](frontend/src/main.tsx) | Onde o React começa a rodar — monta a aplicação no HTML |
| [frontend/src/App.tsx](frontend/src/App.tsx) | Define as rotas do frontend (qual URL abre qual página) |

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [dbo].[Categorias] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(max) NOT NULL,
    [Descricao] nvarchar(max) NOT NULL,
    [Ativa] bit NOT NULL,
    [CriadoEm] datetime2 NOT NULL,
    CONSTRAINT [PK_Categorias] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [dbo].[Clientes] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Telefone] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Clientes] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [dbo].[Funcionarios] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Telefone] nvarchar(max) NOT NULL,
    [Cargo] nvarchar(max) NOT NULL,
    [Salario] numeric(18,2) NOT NULL,
    [Cpf] nvarchar(max) NOT NULL,
    [DataAdmissao] datetime2 NOT NULL,
    [Ativo] bit NOT NULL,
    [CriadoEm] datetime2 NOT NULL,
    CONSTRAINT [PK_Funcionarios] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [dbo].[Usuarios] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [SenhaHash] nvarchar(max) NOT NULL,
    [CriadoEm] datetime2 NOT NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [dbo].[Produtos] (
    [Id] int NOT NULL IDENTITY,
    [Nome] nvarchar(max) NOT NULL,
    [Descricao] nvarchar(max) NOT NULL,
    [Preco] numeric(18,2) NOT NULL,
    [PrecoCusto] numeric(18,2) NOT NULL,
    [EstoqueTotal] int NOT NULL,
    [ImagemUrl] nvarchar(max) NULL,
    [Referencia] nvarchar(max) NULL,
    [Ativo] bit NOT NULL,
    [CriadoEm] datetime2 NOT NULL,
    [CategoriaId] int NOT NULL,
    CONSTRAINT [PK_Produtos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Produtos_Categorias_CategoriaId] FOREIGN KEY ([CategoriaId]) REFERENCES [dbo].[Categorias] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[Pedidos] (
    [Id] int NOT NULL IDENTITY,
    [DataPedido] datetime2 NOT NULL,
    [Status] int NOT NULL,
    [Total] numeric(18,2) NOT NULL,
    [Desconto] numeric(18,2) NOT NULL,
    [Observacao] nvarchar(max) NULL,
    [EnderecoEntrega] nvarchar(max) NULL,
    [DataEntregaPrevista] datetime2 NULL,
    [CriadoEm] datetime2 NOT NULL,
    [ClienteId] int NOT NULL,
    [FuncionarioId] int NULL,
    CONSTRAINT [PK_Pedidos] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Pedidos_Clientes_ClienteId] FOREIGN KEY ([ClienteId]) REFERENCES [dbo].[Clientes] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Pedidos_Funcionarios_FuncionarioId] FOREIGN KEY ([FuncionarioId]) REFERENCES [dbo].[Funcionarios] ([Id])
);
GO

CREATE TABLE [dbo].[Producoes] (
    [Id] int NOT NULL IDENTITY,
    [QuantidadePlanejada] int NOT NULL,
    [QuantidadeProduzida] int NOT NULL,
    [Status] int NOT NULL,
    [DataInicio] datetime2 NOT NULL,
    [DataFim] datetime2 NULL,
    [Observacao] nvarchar(max) NULL,
    [Responsavel] nvarchar(max) NOT NULL,
    [CriadoEm] datetime2 NOT NULL,
    [ProdutoId] int NOT NULL,
    CONSTRAINT [PK_Producoes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Producoes_Produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [dbo].[Produtos] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[ProdutoVariantes] (
    [Id] int NOT NULL IDENTITY,
    [Tamanho] nvarchar(max) NOT NULL,
    [Cor] nvarchar(max) NOT NULL,
    [Estoque] int NOT NULL,
    [CodigoBarras] nvarchar(max) NULL,
    [ProdutoId] int NOT NULL,
    CONSTRAINT [PK_ProdutoVariantes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProdutoVariantes_Produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [dbo].[Produtos] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[ItensPedido] (
    [Id] int NOT NULL IDENTITY,
    [Quantidade] int NOT NULL,
    [PrecoUnitario] numeric(18,2) NOT NULL,
    [Tamanho] nvarchar(max) NULL,
    [Cor] nvarchar(max) NULL,
    [PedidoId] int NOT NULL,
    [ProdutoId] int NOT NULL,
    CONSTRAINT [PK_ItensPedido] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ItensPedido_Pedidos_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [dbo].[Pedidos] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ItensPedido_Produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [dbo].[Produtos] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ItensPedido_PedidoId] ON [dbo].[ItensPedido] ([PedidoId]);
GO

CREATE INDEX [IX_ItensPedido_ProdutoId] ON [dbo].[ItensPedido] ([ProdutoId]);
GO

CREATE INDEX [IX_Pedidos_ClienteId] ON [dbo].[Pedidos] ([ClienteId]);
GO

CREATE INDEX [IX_Pedidos_FuncionarioId] ON [dbo].[Pedidos] ([FuncionarioId]);
GO

CREATE INDEX [IX_Producoes_ProdutoId] ON [dbo].[Producoes] ([ProdutoId]);
GO

CREATE INDEX [IX_Produtos_CategoriaId] ON [dbo].[Produtos] ([CategoriaId]);
GO

CREATE INDEX [IX_ProdutoVariantes_ProdutoId] ON [dbo].[ProdutoVariantes] ([ProdutoId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260512143414_InitialCreate', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [dbo].[ItensPedido] DROP CONSTRAINT [FK_ItensPedido_Produtos_ProdutoId];
GO

ALTER TABLE [dbo].[Pedidos] DROP CONSTRAINT [FK_Pedidos_Clientes_ClienteId];
GO

ALTER TABLE [dbo].[Produtos] DROP CONSTRAINT [FK_Produtos_Categorias_CategoriaId];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Usuarios]') AND [c].[name] = N'SenhaHash');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Usuarios] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [dbo].[Usuarios] ALTER COLUMN [SenhaHash] nvarchar(255) NOT NULL;
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Usuarios]') AND [c].[name] = N'Nome');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Usuarios] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [dbo].[Usuarios] ALTER COLUMN [Nome] nvarchar(150) NOT NULL;
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Usuarios]') AND [c].[name] = N'Email');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Usuarios] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [dbo].[Usuarios] ALTER COLUMN [Email] nvarchar(150) NOT NULL;
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Produtos]') AND [c].[name] = N'Referencia');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Produtos] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [dbo].[Produtos] ALTER COLUMN [Referencia] nvarchar(50) NULL;
GO

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Produtos]') AND [c].[name] = N'Nome');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Produtos] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [dbo].[Produtos] ALTER COLUMN [Nome] nvarchar(200) NOT NULL;
GO

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Produtos]') AND [c].[name] = N'ImagemUrl');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Produtos] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [dbo].[Produtos] ALTER COLUMN [ImagemUrl] nvarchar(500) NULL;
GO

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Produtos]') AND [c].[name] = N'Descricao');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Produtos] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [dbo].[Produtos] ALTER COLUMN [Descricao] nvarchar(1000) NOT NULL;
GO

ALTER TABLE [dbo].[Produtos] ADD [AtualizadoEm] datetime2 NULL;
GO

DECLARE @var7 sysname;
SELECT @var7 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Producoes]') AND [c].[name] = N'Responsavel');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Producoes] DROP CONSTRAINT [' + @var7 + '];');
ALTER TABLE [dbo].[Producoes] ALTER COLUMN [Responsavel] nvarchar(150) NOT NULL;
GO

DECLARE @var8 sysname;
SELECT @var8 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Producoes]') AND [c].[name] = N'Observacao');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Producoes] DROP CONSTRAINT [' + @var8 + '];');
ALTER TABLE [dbo].[Producoes] ALTER COLUMN [Observacao] nvarchar(1000) NULL;
GO

ALTER TABLE [dbo].[Producoes] ADD [AtualizadoEm] datetime2 NULL;
GO

ALTER TABLE [dbo].[Producoes] ADD [FuncionarioId] int NULL;
GO

ALTER TABLE [dbo].[Pedidos] ADD [AtualizadoEm] datetime2 NULL;
GO

DECLARE @var9 sysname;
SELECT @var9 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Funcionarios]') AND [c].[name] = N'Telefone');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Funcionarios] DROP CONSTRAINT [' + @var9 + '];');
ALTER TABLE [dbo].[Funcionarios] ALTER COLUMN [Telefone] nvarchar(20) NOT NULL;
GO

DECLARE @var10 sysname;
SELECT @var10 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Funcionarios]') AND [c].[name] = N'Nome');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Funcionarios] DROP CONSTRAINT [' + @var10 + '];');
ALTER TABLE [dbo].[Funcionarios] ALTER COLUMN [Nome] nvarchar(150) NOT NULL;
GO

DECLARE @var11 sysname;
SELECT @var11 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Funcionarios]') AND [c].[name] = N'Email');
IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Funcionarios] DROP CONSTRAINT [' + @var11 + '];');
ALTER TABLE [dbo].[Funcionarios] ALTER COLUMN [Email] nvarchar(150) NOT NULL;
GO

DECLARE @var12 sysname;
SELECT @var12 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Funcionarios]') AND [c].[name] = N'Cpf');
IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Funcionarios] DROP CONSTRAINT [' + @var12 + '];');
ALTER TABLE [dbo].[Funcionarios] ALTER COLUMN [Cpf] nvarchar(14) NOT NULL;
GO

DECLARE @var13 sysname;
SELECT @var13 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Funcionarios]') AND [c].[name] = N'Cargo');
IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Funcionarios] DROP CONSTRAINT [' + @var13 + '];');
ALTER TABLE [dbo].[Funcionarios] ALTER COLUMN [Cargo] nvarchar(100) NOT NULL;
GO

ALTER TABLE [dbo].[Funcionarios] ADD [AtualizadoEm] datetime2 NULL;
GO

DECLARE @var14 sysname;
SELECT @var14 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Clientes]') AND [c].[name] = N'Telefone');
IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Clientes] DROP CONSTRAINT [' + @var14 + '];');
ALTER TABLE [dbo].[Clientes] ALTER COLUMN [Telefone] nvarchar(20) NOT NULL;
GO

DECLARE @var15 sysname;
SELECT @var15 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Clientes]') AND [c].[name] = N'Nome');
IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Clientes] DROP CONSTRAINT [' + @var15 + '];');
ALTER TABLE [dbo].[Clientes] ALTER COLUMN [Nome] nvarchar(150) NOT NULL;
GO

DECLARE @var16 sysname;
SELECT @var16 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Clientes]') AND [c].[name] = N'Email');
IF @var16 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Clientes] DROP CONSTRAINT [' + @var16 + '];');
ALTER TABLE [dbo].[Clientes] ALTER COLUMN [Email] nvarchar(150) NOT NULL;
GO

DECLARE @var17 sysname;
SELECT @var17 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Categorias]') AND [c].[name] = N'Nome');
IF @var17 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Categorias] DROP CONSTRAINT [' + @var17 + '];');
ALTER TABLE [dbo].[Categorias] ALTER COLUMN [Nome] nvarchar(100) NOT NULL;
GO

DECLARE @var18 sysname;
SELECT @var18 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[dbo].[Categorias]') AND [c].[name] = N'Descricao');
IF @var18 IS NOT NULL EXEC(N'ALTER TABLE [dbo].[Categorias] DROP CONSTRAINT [' + @var18 + '];');
ALTER TABLE [dbo].[Categorias] ALTER COLUMN [Descricao] nvarchar(500) NOT NULL;
GO

ALTER TABLE [dbo].[Categorias] ADD [AtualizadoEm] datetime2 NULL;
GO

CREATE UNIQUE INDEX [IX_Usuarios_Email] ON [dbo].[Usuarios] ([Email]);
GO

CREATE INDEX [IX_Producoes_FuncionarioId] ON [dbo].[Producoes] ([FuncionarioId]);
GO

CREATE UNIQUE INDEX [IX_Funcionarios_Cpf] ON [dbo].[Funcionarios] ([Cpf]);
GO

CREATE UNIQUE INDEX [IX_Funcionarios_Email] ON [dbo].[Funcionarios] ([Email]);
GO

ALTER TABLE [dbo].[ItensPedido] ADD CONSTRAINT [FK_ItensPedido_Produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [dbo].[Produtos] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[Pedidos] ADD CONSTRAINT [FK_Pedidos_Clientes_ClienteId] FOREIGN KEY ([ClienteId]) REFERENCES [dbo].[Clientes] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[Producoes] ADD CONSTRAINT [FK_Producoes_Funcionarios_FuncionarioId] FOREIGN KEY ([FuncionarioId]) REFERENCES [dbo].[Funcionarios] ([Id]);
GO

ALTER TABLE [dbo].[Produtos] ADD CONSTRAINT [FK_Produtos_Categorias_CategoriaId] FOREIGN KEY ([CategoriaId]) REFERENCES [dbo].[Categorias] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260518184854_AND135_136_138_139_SchemaFixes', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [dbo].[MovimentacoesEstoque] (
    [Id] int NOT NULL IDENTITY,
    [ProdutoId] int NOT NULL,
    [VarianteId] int NULL,
    [Tipo] int NOT NULL,
    [Quantidade] int NOT NULL,
    [EstoqueAnterior] int NOT NULL,
    [EstoqueAtual] int NOT NULL,
    [Motivo] nvarchar(max) NULL,
    [PedidoId] int NULL,
    [CriadoEm] datetime2 NOT NULL,
    CONSTRAINT [PK_MovimentacoesEstoque] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_MovimentacoesEstoque_Pedidos_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [dbo].[Pedidos] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_MovimentacoesEstoque_ProdutoVariantes_VarianteId] FOREIGN KEY ([VarianteId]) REFERENCES [dbo].[ProdutoVariantes] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_MovimentacoesEstoque_Produtos_ProdutoId] FOREIGN KEY ([ProdutoId]) REFERENCES [dbo].[Produtos] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_MovimentacoesEstoque_PedidoId] ON [dbo].[MovimentacoesEstoque] ([PedidoId]);
GO

CREATE INDEX [IX_MovimentacoesEstoque_ProdutoId_CriadoEm] ON [dbo].[MovimentacoesEstoque] ([ProdutoId], [CriadoEm]);
GO

CREATE INDEX [IX_MovimentacoesEstoque_VarianteId] ON [dbo].[MovimentacoesEstoque] ([VarianteId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260519110141_AddMovimentacaoEstoque', N'8.0.11');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [dbo].[Produtos] ADD [EstoqueMinimo] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260519165627_AddEstoqueMinimo', N'8.0.11');
GO

COMMIT;
GO


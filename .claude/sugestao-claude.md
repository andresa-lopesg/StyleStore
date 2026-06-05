# Sugestões de Melhoria — StyleStore

Análise feita após leitura completa do código (controllers, models, pages, services, components).

---

## O que está funcionando bem

- Todos os 7 controllers com CRUD completo
- Todos os 9 models com relacionamentos corretos
- 9 páginas frontend implementadas
- Componentes UI reutilizáveis (Modal, Table, Button, Badge, ConfirmDialog…)
- Seeder com dados de exemplo robustos
- CORS e Swagger configurados
- Tratamento de referência circular com `ReferenceHandler.IgnoreCycles` + `[JsonIgnore]`

---

## Melhorias sugeridas

### 1. Autenticação & Autorização (prioridade alta)

O model `Usuario` armazena `SenhaHash`, mas não há login implementado. Qualquer pessoa com acesso à URL pode chamar todos os endpoints.

**O que implementar:**
- Endpoint `POST /api/auth/login` que valida email + senha e retorna um JWT
- Configurar `AddAuthentication` e `AddAuthorization` no `Program.cs`
- Adicionar `[Authorize]` nos controllers
- Tela de login no frontend com React Router (rota pública)
- `PrivateRoute` para proteger as rotas autenticadas

---

### 2. Itens do Pedido — interface frontend (prioridade alta)

Ao criar ou editar um pedido, não há como adicionar produtos. A tabela `ItensPedido` é populada pelo Seeder, mas o frontend não expõe essa funcionalidade.

**O que implementar:**
- Seção de itens dentro do modal de criação/edição de pedido
- Seleção de produto, quantidade, tamanho e cor
- Cálculo automático do total com base nos itens

---

### 3. Variantes de Produto (prioridade alta)

`ProdutoVariante` (tamanho, cor, estoque, código de barras) existe no banco e o Seeder cria variantes, mas:
- O backend não tem endpoint dedicado (`/api/produtos/{id}/variantes`)
- O frontend não tem interface para criar, editar ou remover variantes

**O que implementar:**
- Endpoint CRUD para variantes dentro do controller de produtos
- Seção de variantes no modal de produto no frontend

---

### 4. Upload de Imagem de Produto (prioridade média)

O campo `ImagemUrl` existe no model `Produto` mas não há upload implementado — o campo fica sempre `null`.

**O que implementar:**
- Endpoint `POST /api/produtos/{id}/imagem` para receber multipart/form-data
- Salvar arquivo localmente ou integrar com serviço de armazenamento (ex: Azure Blob)
- Input de upload no modal de produto no frontend

---

### 5. Validações no Backend (prioridade média)

Os models não têm atributos de validação. O backend aceita qualquer valor sem checar formato.

**O que adicionar:**
- `[Required]` nos campos obrigatórios
- `[EmailAddress]` em campos de email
- `[StringLength]` para limitar tamanho de strings
- Habilitar validação automática com `ModelState.IsValid` nos controllers ou usar um filtro global

---

### 6. Paginação na API (prioridade média)

Todos os endpoints `GET` retornam todos os registros sem limite. Com o crescimento dos dados isso vira um problema de performance.

**O que implementar:**
- Parâmetros `?page=1&pageSize=20` nos endpoints de listagem
- Retornar envelope com `{ data: [], total, page, pageSize }` ou usar header `X-Total-Count`

---

### 7. Tratamento de Erros (prioridade baixa)

Os controllers não têm try-catch. Um erro inesperado retorna 500 sem mensagem útil.

**O que implementar:**
- Middleware global de tratamento de exceções no `Program.cs`
- Retornar respostas padronizadas `{ error: "mensagem" }` em vez de stack trace

---

## Resumo

| # | Melhoria | Prioridade |
|---|---|---|
| 1 | Autenticação JWT + rotas protegidas | Alta |
| 2 | Interface CRUD para itens do pedido | Alta |
| 3 | Endpoint + interface para variantes de produto | Alta |
| 4 | Upload de imagem de produto | Média |
| 5 | Validações nos models do backend | Média |
| 6 | Paginação nos endpoints de listagem | Média |
| 7 | Tratamento global de erros | Baixa |

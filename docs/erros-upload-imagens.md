# Erros encontrados ao implementar o Upload de Imagens

**Projeto:** StyleStore  
**Data:** 21/05/2026  
**Contexto:** Este documento descreve, de forma detalhada e didática, cada erro encontrado durante a implementação do sistema de upload de imagens de produtos. Foi escrito para servir como material de estudo e referência futura.

---

## Introdução — O que queríamos fazer

O objetivo era simples: permitir que o usuário escolha uma imagem no computador, clique em salvar dentro do modal de produto, e a imagem apareça na listagem de produtos.

Para isso, precisávamos de três coisas funcionando juntas:

1. **Frontend** — um campo para selecionar o arquivo e enviá-lo ao servidor
2. **Backend** — um endpoint que recebe o arquivo, salva no disco e registra o caminho no banco
3. **Servidor de arquivos estáticos** — para que a imagem salva possa ser exibida no navegador

Cada uma dessas partes gerou pelo menos um erro. Abaixo está o relato completo.

---

## Erro 1 — Primeira abordagem: URLs externas do Unsplash

### O que tentamos

Antes de implementar o upload de verdade, a primeira ideia foi popular os produtos com URLs de imagens do Unsplash (um site de fotos gratuitas). Colocamos links assim no banco de dados:

```
https://images.unsplash.com/photo-123456789?w=400
```

As imagens carregavam normalmente na tela porque o navegador simplesmente baixava a foto diretamente do servidor do Unsplash.

### Por que não funcionou

Apesar de tecnicamente funcionar, essa abordagem foi **descartada** porque:

- As imagens não representavam os produtos reais da loja
- Dependíamos de um serviço externo — se o Unsplash ficasse fora do ar, as imagens sumiam
- O usuário não teria controle sobre as próprias imagens

### O que fizemos

Removemos todas as URLs do banco de dados e começamos a implementar um sistema de upload real, onde o arquivo vai do computador do usuário para o servidor da loja.

---

## Erro 2 — `Content-Type` manual quebrava o envio do arquivo

### Contexto — o que é `Content-Type`

Quando o navegador envia dados para um servidor, ele precisa informar **qual tipo de dado está enviando**. Isso é feito pelo cabeçalho (header) HTTP chamado `Content-Type`.

Existem dois tipos relevantes aqui:

| Tipo | Usado para |
|---|---|
| `application/json` | Enviar dados de texto/formulário em formato JSON |
| `multipart/form-data` | Enviar arquivos binários (imagens, PDFs etc.) |

### O que aconteceu

Na primeira tentativa de enviar a imagem, configuramos manualmente o header assim:

```typescript
headers: { 'Content-Type': 'multipart/form-data' }
```

Parecia correto — afinal, estávamos enviando um arquivo. Mas o upload falhava e o servidor não conseguia ler o arquivo.

### Por que quebrou

O `multipart/form-data` não é só um tipo — ele precisa de uma informação extra chamada **`boundary`** (fronteira). O boundary é um código aleatório gerado pelo navegador que funciona como um separador entre os campos do formulário dentro do corpo da requisição.

Um header completo e correto gerado automaticamente pelo navegador fica assim:

```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
```

Quando setamos o header manualmente, apenas escrevemos `multipart/form-data` sem o boundary. O servidor recebe os dados, tenta encontrar os separadores para ler cada campo — e não encontra nada. O arquivo não é lido.

**Analogia:** é como mandar uma carta dizendo "os parágrafos estão separados por linha dupla" mas esquecer de colocar as linhas duplas. O leitor não consegue separar onde começa e termina cada parte.

### O que fizemos

Removemos o header manual e deixamos o navegador gerar o `Content-Type` com o boundary automaticamente. O navegador sabe fazer isso sozinho quando recebe um `FormData`.

---

## Erro 3 — Axios sobrescrevia o `Content-Type` correto

### Contexto — o que é o Axios

O projeto usa uma biblioteca chamada **Axios** para fazer chamadas HTTP do frontend para o backend. O Axios facilita o envio de requisições, mas tem um comportamento padrão que causou problemas.

### O que aconteceu

Mesmo após remover o header manual do erro anterior, o upload continuava falhando. O sintoma era estranho: **dois toasts apareciam ao mesmo tempo na tela**:

- ✅ "Produto atualizado com sucesso"
- ❌ "Erro ao enviar imagem."

O produto era salvo, mas a imagem não. E o modal não fechava porque o código só fecha o modal quando o upload tem sucesso.

### Por que quebrou

O Axios possui um **interceptor padrão** — um código interno que é executado antes de cada requisição. Esse interceptor força o header `Content-Type: application/json` em todas as requisições POST, independente do que estamos enviando.

Então o que acontecia era:

1. O código criava o `FormData` com o arquivo
2. O navegador ia gerar o `Content-Type: multipart/form-data; boundary=...` correto
3. O Axios interceptava a requisição antes de enviar
4. O Axios substituía o header por `Content-Type: application/json`
5. O servidor recebia um arquivo binário com header de JSON — inválido
6. Upload falhava com erro 400

```
Código → FormData com arquivo
Axios  → "vou colocar Content-Type: application/json aqui"
Servidor → "recebi JSON mas o corpo é um arquivo binário... não entendo"
```

### O que fizemos

Trocamos o Axios pelo **`fetch` nativo** do navegador exclusivamente para o upload. O `fetch` não tem interceptores e não interfere no `Content-Type` quando recebe um `FormData` — deixa o navegador setar o header correto automaticamente.

```typescript
// ❌ Antes — com Axios (o interceptor quebrava o Content-Type)
api.post(`/produtos/${id}/imagem`, formData)

// ✅ Depois — com fetch nativo (sem interferência)
const res = await fetch(`/api/produtos/${id}/imagem`, { method: 'POST', body: formData })
```

O resto do projeto continua usando Axios normalmente — só o upload usa `fetch`.

---

## Erro 4 — Imagens salvas no disco mas retornando 404

### Contexto — como um servidor serve arquivos

Quando você acessa uma imagem no navegador por uma URL como `/images/produto.png`, o servidor precisa:

1. Receber a requisição
2. Encontrar o arquivo no disco
3. Enviar o arquivo como resposta

No ASP.NET Core, isso é feito pelo middleware `UseStaticFiles()`. Ele precisa saber **em qual pasta do disco** deve procurar os arquivos.

### O que aconteceu

Após corrigir o upload, os arquivos estavam sendo salvos corretamente no disco. Conseguimos confirmar isso olhando a pasta:

```
/Users/andresa/Documents/ApiClientes/wwwroot/images/produtos/arquivo.png ✅ existe
```

Mas ao tentar exibir a imagem no navegador, o servidor retornava **404 (não encontrado)**. O arquivo existia, mas o servidor dizia que não existia.

### Por que quebrou — o problema dos dois caminhos

Aqui precisamos entender como o .NET executa um projeto.

Quando você escreve código C# e roda o projeto, o .NET **compila** o código e gera um arquivo executável (binário) em uma pasta separada:

```
Código fonte:  /ApiClientes/Program.cs
Executável:    /ApiClientes/bin/Debug/net8.0/ApiClientes
```

É o **executável** que roda de verdade, não o código fonte. E quando o executável está rodando, ele considera que sua "casa" é a pasta onde ele mora (`bin/Debug/net8.0/`).

O problema foi esse:

| O que fazia | Caminho usado | Resultado |
|---|---|---|
| Controller salvava o arquivo | Relativo ao diretório de trabalho: `/ApiClientes/wwwroot/` | Arquivo salvo aqui ✅ |
| `UseStaticFiles()` servia arquivos | Relativo ao executável: `/ApiClientes/bin/Debug/net8.0/wwwroot/` | Pasta não existe ❌ |

**Analogia:** é como guardar as chaves na gaveta da sala, mas procurar na gaveta do quarto. As chaves existem, mas você está olhando no lugar errado.

### Como confirmamos o problema

Rodamos um comando para verificar se a imagem estava acessível diretamente no servidor:

```bash
curl http://localhost:5067/images/produtos/arquivo.png
# resultado: 404 Not Found
```

E verificamos que a pasta `wwwroot` na pasta do executável não existia:

```bash
ls /ApiClientes/bin/Debug/net8.0/wwwroot/
# resultado: pasta não existe
```

### O que fizemos

Configuramos o `UseStaticFiles()` para usar explicitamente `Directory.GetCurrentDirectory()`, que retorna o diretório de trabalho do processo — que é a raiz do projeto onde os arquivos realmente estão.

```csharp
// ❌ Antes — procurava em bin/Debug/net8.0/wwwroot/ (pasta errada)
app.UseStaticFiles();

// ✅ Depois — procura em /ApiClientes/wwwroot/ (pasta correta)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
    RequestPath = "",
});
```

---

## Erro 5 — Erro de compilação por namespace incorreto

### Contexto — o que é um namespace

No C#, as classes ficam organizadas em **namespaces** — como pastas dentro de pastas. Para usar uma classe, você precisa indicar o namespace correto onde ela mora.

### O que aconteceu

Ao escrever o código do `UseStaticFiles` com as novas opções, usamos o namespace errado:

```csharp
// Escrevemos assim:
new Microsoft.AspNetCore.StaticFiles.StaticFileOptions
```

O compilador retornou o seguinte erro ao tentar subir o servidor:

```
error CS0234: O nome de tipo ou namespace "StaticFileOptions" não existe
no namespace "Microsoft.AspNetCore.StaticFiles"
```

### Por que quebrou

A classe `StaticFileOptions` não mora no namespace `Microsoft.AspNetCore.StaticFiles` — ela mora em `Microsoft.AspNetCore.Builder`. São dois namespaces diferentes dentro do mesmo framework.

### O que fizemos

Corrigimos o namespace:

```csharp
// ❌ Errado
new Microsoft.AspNetCore.StaticFiles.StaticFileOptions

// ✅ Correto
new Microsoft.AspNetCore.Builder.StaticFileOptions
```

O servidor compilou e subiu normalmente.

---

## Erro 6 — Proxy do Vite não repassava requisições de imagens

### Contexto — o que é o Vite Proxy

O frontend roda em `localhost:5173` e o backend roda em `localhost:5067`. São portas diferentes. Normalmente, o navegador bloqueia requisições entre portas diferentes por uma política de segurança chamada **CORS**.

Para contornar isso em desenvolvimento, o Vite (o servidor do frontend) funciona como um **proxy reverso** — ele recebe as requisições do navegador e as repassa para o backend, como se fosse um intermediário.

```
Navegador → localhost:5173/api/... → Vite → localhost:5067/api/...
```

### O que aconteceu

Mesmo após corrigir o backend para servir os arquivos corretamente (erro 4), as imagens ainda apareciam com erro 404 no navegador.

Ao testar diretamente no backend, funcionava:
```bash
curl http://localhost:5067/images/produtos/arquivo.png → 200 OK ✅
```

Mas pelo frontend, não:
```bash
curl http://localhost:5173/images/produtos/arquivo.png → 404 ❌
```

### Por que quebrou

O Vite só repassa para o backend as rotas que foram **explicitamente configuradas**. O arquivo `vite.config.ts` tinha apenas a rota `/api` configurada:

```typescript
proxy: {
  '/api': { target: 'http://localhost:5067' }
  // /images não estava aqui — o Vite não sabia o que fazer com essas requisições
}
```

Quando o navegador pedia `/images/produto.png`, o Vite não sabia que deveria repassar para o backend — simplesmente retornava 404.

### O que fizemos

Adicionamos a rota `/images` na configuração do proxy do Vite:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5067',
    changeOrigin: true,
  },
  '/images': {                         // ← adicionado
    target: 'http://localhost:5067',
    changeOrigin: true,
  },
},
```

Após reiniciar o servidor do Vite (`npm run dev`), as imagens passaram a carregar corretamente no navegador.

---

## Resumo geral

| # | Erro | Causa | Solução |
|---|---|---|---|
| 1 | URLs externas rejeitadas | Imagens não representavam os produtos reais | Implementar upload real |
| 2 | Boundary ausente no Content-Type | Header `Content-Type` setado manualmente sem boundary | Remover header manual |
| 3 | Axios sobrescrevia o Content-Type | Interceptor padrão do Axios forçava `application/json` | Usar `fetch` nativo para upload |
| 4 | Imagens salvas mas retornando 404 | `UseStaticFiles` procurava na pasta do executável, não do projeto | Usar `Directory.GetCurrentDirectory()` no `UseStaticFiles` |
| 5 | Erro de compilação | Namespace incorreto para `StaticFileOptions` | Corrigir para `Microsoft.AspNetCore.Builder` |
| 6 | Imagens 404 no frontend | Proxy do Vite não tinha rota `/images` configurada | Adicionar `/images` no `vite.config.ts` |

---

## O que aprendemos

1. **Nunca setar `Content-Type` manualmente ao enviar arquivos** — deixe o navegador fazer isso.
2. **O Axios tem comportamentos padrão** que podem interferir em casos específicos como upload de arquivos.
3. **No .NET, o executável e o código fonte ficam em pastas diferentes** — caminhos relativos podem apontar para lugares errados dependendo de onde o processo está rodando.
4. **O Vite Proxy precisa ser configurado para cada rota** — ele não repassa automaticamente tudo para o backend.
5. **Testar cada camada separadamente** (backend direto, depois via proxy) ajuda a identificar exatamente onde está o problema.

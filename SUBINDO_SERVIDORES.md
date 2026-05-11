# Como subir os servidores

Você precisa de **dois terminais abertos** — um para o back-end e um para o front-end.

---

## Antes de tudo — PostgreSQL

O banco roda em segundo plano (não precisa de terminal aberto), mas precisa estar ligado.

Como o PostgreSQL está instalado como aplicativo no Mac:

1. Abra o **Finder → Aplicativos → PostgreSQL 18**
2. Clique duas vezes para abrir
3. Clique em **Start** se o servidor estiver parado

Ou via terminal:
```bash
open /Applications/PostgreSQL\ 18/pgAdmin\ 4.app
```

> Enquanto o ícone do PostgreSQL estiver na barra de menu, o banco está rodando.

---

---

## Terminal 1 — Back-end (API .NET)

```bash
cd /Users/andresa/Documents/ApiClientes
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

Aguarde aparecer:
```
Hosting environment: Development
Now listening on: http://localhost:5067
```

> Os dados do banco são populados automaticamente na primeira vez que subir.

---

## Terminal 2 — Front-end (React)

```bash
cd /Users/andresa/Documents/ApiClientes/frontend
npm run dev
```

Aguarde aparecer:
```
VITE ready in ... ms
➜  Local: http://localhost:5173/
```

---

## Acessar

| O quê | URL |
|---|---|
| Painel (front-end) | http://localhost:5173 |
| API (back-end) | http://localhost:5067 |
| Swagger (docs da API) | http://localhost:5067/swagger |

---

## Para parar

Em cada terminal pressione `Ctrl + C`.

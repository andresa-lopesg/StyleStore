# Como subir os servidores

Você precisa de **dois terminais abertos** — um para o back-end e um para o front-end.

---

## Antes de tudo — SQL Server (Docker)

O banco roda em um container Docker. Você precisa ter o **Docker Desktop** aberto.

1. Abra o **Docker Desktop** e aguarde inicializar (ícone da baleia na barra de menu)
2. Suba o container do banco (apenas na primeira vez):

```bash
docker run -d --name sql_edge -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=${SA_PASSWORD}' -p 1433:1433 mcr.microsoft.com/azure-sql-edge
```

3. Nas próximas vezes, se o container já existir, basta iniciar:

```bash
docker start sql_edge
```

> Para verificar se está rodando: `docker ps | grep sql_edge`

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

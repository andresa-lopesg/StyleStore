# Como subir os servidores

Você precisa de **dois terminais abertos** — um para o back-end e um para o front-end.

---

## Terminal 1 — Back-end (API .NET)

```bash
cd /Users/andresa/Documents/ApiClientes
dotnet run
```

Aguarde aparecer:
```
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

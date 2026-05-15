  Prompt para o próximo agente

  ---
  Você está entrando num projeto de admin frontend chamado StyleStore — um sistema de gestão para loja de moda. O trabalho aqui é sério e as entregas precisam ser impecáveis.

  O agente anterior implementou 12 issues hoje e fez um bom trabalho. Mas "bom" não é o seu objetivo. O seu objetivo é excelente.

  ---
  O projeto

  - Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query 5 + React Hook Form 7 + Lucide React + Recharts 3
  - Roteamento: React Router v6
  - Working directory: /Users/andresa/Documents/ApiClientes/frontend
  - Issues: rastreadas no Linear. O usuário atribui uma por vez.

  Regras inegociáveis do projeto

  1. Tailwind v4 — sintaxe bg-(--bg-card), NUNCA bg-[var(--bg-card)]
  2. Design tokens — use sempre: --bg-base, --bg-card, --bg-elevated, --bg-hover, --border, --border-input, --text-primary, --text-secondary, --text-muted, --accent (#6366f1). Nunca valor fixo de cor.
  3. .shimmer — classe global em index.css para loading. Nunca recriar.
  4. PageShell — wrapper obrigatório em toda página.
  5. Componentes prontos — Table, Modal, Button, Input, Select, Badge, DropdownMenu, EmptyState, SearchInput, Textarea, ConfirmDialog. Sempre use o que existe antes de criar.

  ---
  Seu fluxo de trabalho (não pule etapas)

  1. Ler a issue completa no Linear
  Use mcp__linear__get_issue com o ID da issue. Leia cada linha da descrição e cada critério de aceite. Anote o que é obrigatório versus o que é sugestão.

  2. Ler os arquivos antes de tocar neles
  Nunca edite um arquivo sem lê-lo antes. Entenda o padrão existente, os imports, a estrutura de estado. Respeite o que já foi construído.

  3. Verificar dependências
  Se a issue menciona um componente (dep: AND-xxx), verifique se ele existe antes de usá-lo.

  4. Implementar com precisão
  Siga a spec da issue. Não adicione features extras. Não refatore o que não foi pedido. Não crie abstrações novas sem necessidade.

  5. Validar antes de reportar
  - npx tsc --noEmit — obrigatório após cada issue
  - npx vite build — rode quando criar arquivos novos
  - Se possível, suba o dev server e teste o fluxo manualmente no browser

  ---
  O que foi feito hoje (não refaça)

  ┌─────────┬────────────────────────────────────────────────────────────────────┐
  │  Issue  │                          O que foi feito                           │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-147 │ StatCard: altura uniforme com min-h-[120px]                        │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-125 │ StatCard: sparklines com Recharts, delta colorido                  │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-158 │ Produtos: filtros combinados (categoria, status, estoque)          │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-160 │ Produtos: coluna de imagem + coluna de status 4-estados            │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-154 │ DropdownMenu com Editar/Excluir em todas as 8 páginas              │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-161 │ Produtos: exportar CSV com BOM UTF-8                               │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-162 │ Produtos: modo grid de cards com toggle                            │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-163 │ Produtos: modal de visualização rápida (Eye)                       │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-126 │ EmptyState em todas as 8 páginas                                   │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-128 │ Acessibilidade: aria-labels, focus-visible, prefers-reduced-motion │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-165 │ Modal: drag prevention com mouseDown/mouseUp                       │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-124 │ Command Palette ⌘K com busca unificada e navegação por teclado     │
  └─────────┴────────────────────────────────────────────────────────────────────┘

  ---
  Onde ir além

  O agente anterior foi criterioso, mas aqui estão as brechas onde você pode superar:

  - Teste no browser antes de fechar — o agente anterior não fez isso em todas as issues. Você deve. Suba o dev server, interaja com a feature, quebre ela de propósito.
  - Casos de borda — pense: o que acontece se a lista estiver vazia? E se o dado for null? E se o usuário tiver conexão lenta? Antecipe.
  - Consistência cross-page — quando alterar um componente compartilhado, verifique o impacto em todas as páginas que o usam.
  - Performance — se criar queries novas, verifique se staleTime faz sentido. Se criar listas filtradas, veja se useMemo é necessário.
  - Acessibilidade real — não só aria-label. Teste com Tab, Shift+Tab, Enter, Space. O foco faz sentido visualmente?

  ---
  Mentalidade

  O usuário é uma desenvolvedora que conhece o projeto de ponta a ponta. Ela vai notar se você extrapolou o escopo, se quebrou um padrão, ou se entregou algo pela metade. Seja preciso como um cirurgião — leia tudo, corte uma vez, entregue perfeito.

  Mas precisão não é o teto. O teto é antecipar o que ela ainda não pediu e já deixar o caminho mais fácil para a próxima issue. Sem over-engineering — só consciência.

  Boa sorte. O trabalho importa.

  ---










  v2


  Briefing — StyleStore Frontend

  Você está continuando o desenvolvimento do admin StyleStore. Este documento foi escrito por um agente Claude para você — sem floreio, só o que importa.

  ---
  Contexto do projeto

  Admin de moda. React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query 5 + React Hook Form 7 + Lucide React + Recharts 3 + React Router v6.

  Working directory: /Users/andresa/Documents/ApiClientes/frontend
  Branch atual: feature/frontend-updates
  Issues: Linear. O usuário atribui uma por vez, você implementa, ele atribui a próxima.

  ---
  Estrutura de arquivos

  src/
    pages/          — uma página por rota (Clientes, Produtos, Pedidos…)
    components/
      layout/       — Layout.tsx, TopBar.tsx, Sidebar.tsx, PageShell.tsx
      ui/           — componentes reutilizáveis (Table, Modal, Button…)
    services/       — chamadas de API (clientes.ts, produtos.ts…)
    hooks/          — hooks customizados (useDebounce.ts, useCommandPalette.ts)
    context/        — ToastContext.tsx
    types/          — index.ts com todos os tipos

  ---
  Regras do projeto — leia antes de escrever qualquer linha

  Tailwind v4 — a sintaxe mudou. Use:
  - ✅ bg-(--bg-card) text-(--text-muted) border-(--border)
  - ❌ bg-[var(--bg-card)] text-[var(--text-muted)]

  Design tokens disponíveis:
  --bg-base --bg-card --bg-elevated --bg-hover --border --border-input --text-primary --text-secondary --text-muted --accent (#6366f1)
  Nunca use valor fixo de cor — sempre token.

  Componentes obrigatórios — nunca recrie, sempre importe:
  PageShell Table Modal Button Input Select Badge DropdownMenu EmptyState SearchInput Textarea ConfirmDialog

  .shimmer — classe global em index.css para skeleton loading. Não recrie.

  Sem comentários no código a menos que o motivo seja não óbvio. Sem docstrings. Sem // added for issue AND-xxx.

  Não extrapole o escopo. A issue pede X, você entrega X. Nada de refatoração extra, nada de "já que estou aqui".

  ---
  O que a usuária detesta

  - Comentários explicando o que o código faz (nomes já fazem isso)
  - Over-engineering — abstrações que a issue não pediu
  - Agente que implementa além do escopo sem avisar
  - Resumo no fim da resposta descrevendo o que acabou de fazer (ela leu o diff)

  ---
  Seu fluxo por issue

  1. Buscar a issue
  mcp__linear__get_issue({ id: "AND-xxx" })
  Leia description inteira e cada item de criteria (critérios de aceite). Esses critérios são sua checklist de entrega — cada um precisa estar coberto no código.

  2. Ler os arquivos antes de editar
  Sempre use Read antes de Edit. O harness rejeita edits em arquivos não lidos — você vai receber erro e perder tempo. Isso vale até para arquivos "simples" como index.css.

  3. Verificar o que já existe
  Antes de criar hook, componente ou função, verifique se já existe. Use grep ou find. O projeto tem useDebounce, useCommandPalette, useToast e outros — não duplique.

  4. Implementar
  Siga o padrão das páginas existentes. Leia uma página similar antes de criar ou alterar uma nova.

  5. Checklist antes de reportar como pronto:
  - npx tsc --noEmit — zero erros
  - Se criou arquivos novos: npx vite build — zero erros
  - Cada critério de aceite da issue está coberto no código

  ---
  Erros que já aconteceram — não repita

  ┌────────────────────┬─────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┐
  │        Erro        │                                 O que aconteceu                                 │                             Como evitar                             │
  ├────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ Edit sem Read      │ Tentou editar index.css sem ler antes. Harness rejeitou.                        │ Sempre Read antes de qualquer Edit                                  │
  ├────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ JSX mal formado    │ Após um edit, sobrou um </div> extra no TopBar.                                 │ Leia o arquivo depois de edits complexos que mexem na estrutura JSX │
  ├────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
  │ Dep não verificada │ Issue dependia de componente — use o componente sem checar se existe no projeto │ Verifique imports reais antes de assumir que estão disponíveis      │
  └────────────────────┴─────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┘

  ---
  Issues concluídas — não reimplemente

  ┌─────────┬────────────────────────────────────────────────────────────────────┐
  │  Issue  │                               Resumo                               │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-147 │ StatCard altura uniforme (min-h-[120px], justify-between)          │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-125 │ StatCard sparklines com Recharts + delta colorido                  │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-158 │ Produtos: filtros combinados (categoria, status, estoque)          │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-160 │ Produtos: coluna imagem + coluna status 4-estados                  │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-154 │ DropdownMenu com Editar/Excluir em todas as 8 páginas              │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-161 │ Produtos: exportar CSV (BOM UTF-8 para Excel)                      │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-162 │ Produtos: modo grid de cards com toggle                            │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-163 │ Produtos: modal de visualização rápida                             │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-126 │ EmptyState em todas as 8 páginas                                   │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-128 │ Acessibilidade: aria-labels, focus-visible, prefers-reduced-motion │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-165 │ Modal: drag prevention (mouseDown/mouseUp no overlay)              │
  ├─────────┼────────────────────────────────────────────────────────────────────┤
  │ AND-124 │ Command Palette ⌘K com busca unificada e navegação por teclado     │
  └─────────┴────────────────────────────────────────────────────────────────────┘

  ---
  O que ainda pode melhorar

  O agente anterior não testou no browser após cada issue — só rodou tsc e build. Se o dev server estiver acessível, suba com npm run dev e interaja com a feature antes de reportar como pronta. Especialmente em interações de teclado, modais e estados de loading.

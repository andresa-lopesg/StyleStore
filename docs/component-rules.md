# Component Rules — ApiClientes

Regras que todo agente e desenvolvedor deve seguir ao mexer no frontend.
O objetivo é manter o código coeso, o design consistente e o risco de regressão baixo.

---

## Regras de estilo

### Nunca usar valores hardcoded

Se existe um token CSS para o valor, use o token.

```tsx
// ERRADO
<div className="bg-[#161616] border border-[#2a2a2a] text-[#666]">

// CERTO
<div className="bg-(--bg-elevated) border-(--border-input) text-(--text-muted)">
```

Tokens disponíveis: ver `docs/design-system.md` ou `frontend/src/index.css`.

### Nunca criar estilos inline sem necessidade

`style=` é permitido apenas para valores dinâmicos que não podem ser expressos em Tailwind (ex: largura percentual calculada em runtime, posição de tooltip).

```tsx
// ERRADO
<div style={{ backgroundColor: '#161616', padding: '16px' }}>

// CERTO
<div className="bg-(--bg-elevated) p-4">

// PERMITIDO — valor dinâmico
<div style={{ width: `${progress}%` }}>
```

### Tamanho mínimo de texto

`text-xs` (12px) é o mínimo para qualquer texto visível ao usuário.
`text-[10px]` é proibido, exceto em labels de seção do sidebar (todos-maiúsculas com tracking-widest).

---

## Regras de componentes

### Sempre reutilizar componentes existentes

Antes de criar um novo elemento de UI, verificar se já existe em `src/components/ui/`:

| Necessidade | Componente |
|-------------|-----------|
| Campo de texto | `Input` |
| Campo de seleção | `Select` |
| Campo de texto longo | `Textarea` |
| Botão | `Button` |
| Badge de status | `Badge` |
| Tabela de dados | `Table` |
| Modal/dialog | `Modal` |
| Confirmação de exclusão | `ConfirmDialog` |
| Notificação temporária | `useToast` + `ToastContainer` |
| Busca com ícone | `SearchInput` |
| Empty state | `EmptyState` |
| KPI / métrica | `StatCard` |
| Barra de filtros | `FilterBar` |
| Menu contextual | `DropdownMenu` |
| Header de página | `PageShell` |

### Componentes devem aceitar `className`

Todo componente que renderiza um elemento raiz deve aceitar e aplicar `className` externo:

```tsx
interface ButtonProps {
  className?: string;
  // ...
}

export default function Button({ className, ...props }: ButtonProps) {
  return (
    <button className={`... ${className ?? ''}`} {...props}>
  );
}
```

### Componentes devem ser composáveis

Prefira `children` a props de conteúdo complexo. Evite "component bloat" — não adicione props para cada variação de layout imaginável.

```tsx
// RUIM — prop para cada caso
<Card title="..." subtitle="..." footer="..." badge="..." />

// BOM — composição
<Card>
  <CardHeader>...</CardHeader>
  <CardBody>...</CardBody>
</Card>
```

### Não duplicar variantes visuais

Se um componente já tem uma variante que resolve o caso, use-a. Não criar uma nova variante ligeiramente diferente só para o caso específico.

Antes de adicionar uma prop `variant` nova, questionar: isso vai ser reutilizado em pelo menos 3 lugares? Se não, resolve no ponto de uso com `className`.

---

## Regras de escopo

### Não alterar lógica de negócio

Tasks de UI não tocam em:
- Funções de cálculo de negócio (ex: cálculo de total de pedido)
- Regras de validação de domínio (ex: quantidade mínima de estoque)
- Fluxos de autenticação

Se uma mudança visual exige alterar lógica de negócio, parar e consultar.

### Não alterar APIs

Tasks de UI não modificam:
- Arquivos em `src/services/`
- Contratos de tipos em `src/types/`
- Chamadas HTTP ou URLs de endpoint

Se o componente precisa de um dado que a API não retorna, criar uma issue separada para o backend.

### Não alterar hooks existentes

Tasks de UI não modificam hooks em `src/hooks/` nem o contexto em `src/context/`.

Exceção: criar um novo hook para infraestrutura de UI (ex: `useDebounce`, `useClickOutside`) é permitido — mas não modificar hooks existentes.

### Não alterar stores ou estado global

Se existir estado global (Context, Zustand, etc.), tasks de UI só leem — nunca escrevem sem uma issue específica para isso.

---

## Regras de formulários

- Sempre usar `react-hook-form` — nunca `useState` para campos de formulário
- Sempre `mode: 'onBlur'` + `reValidateMode: 'onChange'`
- Sempre passar `isValid` para `Input` quando o campo foi tocado e é válido (borda verde)
- Sempre passar `error` quando há erro de validação
- `Select` e `Textarea` seguem o mesmo padrão de `Input`

---

## Regras de queries

- Usar `@tanstack/react-query` para todo fetch de dados
- Nunca fazer fetch em `useEffect` manual
- Dados já carregados ficam em cache — se a mesma query já foi feita em outra página, não há nova requisição
- `queryKey` deve ser consistente: `['entidade']` para listas, `['entidade', id]` para item único

---

## Regras de animação

- Não criar animações com `style={{ transition: '...' }}` ou `style={{ animation: '...' }}`
- Usar apenas as classes definidas em `index.css`: `animate-page-enter`, `shimmer`, `toast-animate`, `modal-panel-animate`, `modal-overlay-animate`
- Para novos casos, adicionar o `@keyframes` em `index.css` e criar a classe utilitária lá

---

## Checklist antes de marcar uma task como Done

- [ ] Nenhum valor hardcoded — só tokens CSS
- [ ] Nenhum `text-[10px]` — mínimo `text-xs`
- [ ] Componentes existentes foram usados (não recriados)
- [ ] Novo componente aceita `className` e `children` quando faz sentido
- [ ] Lógica de negócio, APIs, hooks e stores não foram alterados
- [ ] Formulários usam `react-hook-form` com `mode: 'onBlur'`
- [ ] Estados de loading usam `.shimmer`
- [ ] TypeScript sem erros de tipo (`any` não é aceitável)
- [ ] Nenhum `console.log` deixado no código

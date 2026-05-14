# Design System — ApiClientes

Tokens definidos em `frontend/src/index.css`. Sempre usar as variáveis CSS — nunca os valores hex diretamente no código.

---

## Colors

### Backgrounds (superfícies)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-base` | `#09090f` | Fundo da página inteira |
| `--bg-card` | `#101018` | Cards, sidebar, topbar |
| `--bg-elevated` | `#16161f` | Inputs, modais, dropdowns |
| `--bg-hover` | `#1e1e2a` | Hover de itens interativos |

Hierarquia de elevação: `--bg-base` → `--bg-card` → `--bg-elevated` → `--bg-hover`

### Borders

| Token | Valor | Uso |
|-------|-------|-----|
| `--border` | `#1f1f2e` | Separadores internos (tabelas, header de modal) |
| `--border-input` | `#2a2a3a` | Borda de inputs, selects, textareas |

### Text

| Token | Valor | Uso |
|-------|-------|-----|
| `--text-primary` | `#f1f1f5` | Títulos, valores principais, texto de destaque |
| `--text-secondary` | `#9090a8` | Dados em células de tabela, labels |
| `--text-muted` | `#52526a` | Labels de campo, metadata, texto de apoio |
| `--text-placeholder` | `#3a3a52` | Placeholder de inputs |

### Accent

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent` | `#6366f1` | Botão primário, active state, focus de input |
| `--accent-2` | `#8b5cf6` | Gradientes, badges de destaque |

### Semantic (Tailwind — sem token próprio)

| Intenção | Classe bg | Classe text | Uso |
|----------|-----------|-------------|-----|
| success | `bg-green-500/15` | `text-green-400` | Badge Ativo, delta positivo |
| warning | `bg-yellow-500/15` | `text-yellow-400` | Badge Estoque baixo, alerta |
| danger | `bg-red-500/15` | `text-red-400` | Badge Inativo/Sem estoque, erro |
| info | `bg-blue-500/15` | `text-blue-400` | Badge informativo |
| neutral | `bg-(--bg-elevated)` | `text-(--text-secondary)` | Badge neutro |

---

## Spacing

Escala baseada em múltiplos de 4px (sistema Tailwind padrão).

| Valor | Tailwind | Pixels | Uso típico |
|-------|----------|--------|------------|
| 1 | `gap-1` / `p-1` | 4px | Espaço mínimo entre ícones |
| 2 | `gap-2` / `p-2` | 8px | Espaço interno de botões pequenos |
| 3 | `gap-3` / `p-3` | 12px | Gap entre elementos em toolbar |
| 4 | `gap-4` / `p-4` | 16px | Padding de células de tabela, gap de formulário |
| 5 | `gap-5` / `p-5` | 20px | Padding padrão de cards e modais |
| 6 | `gap-6` / `p-6` | 24px | Padding de seções de página |
| 8 | `gap-8` / `p-8` | 32px | Espaço entre seções maiores |
| 10 | `gap-10` / `p-10` | 40px | Padding de páginas em tela pequena |
| 12 | `gap-12` / `p-12` | 48px | Margem de empty states |

---

## Border Radius

| Nome | Tailwind | Pixels | Uso |
|------|----------|--------|-----|
| sm | `rounded` | 4px | Tags, badges pequenos |
| md | `rounded-md` | 6px | — (raramente usado) |
| lg | `rounded-lg` | 8px | Botões, inputs, selects |
| xl | `rounded-xl` | 12px | Cards, modais, dropdowns |
| 2xl | `rounded-2xl` | 16px | Cards de destaque, superfícies grandes |
| full | `rounded-full` | 50% | Badges pill, avatares, indicadores de ponto |

---

## Shadows

| Nome | Valor | Uso |
|------|-------|-----|
| sm | `shadow-sm` | Botão com active state |
| surface | `shadow-[0_2px_12px_rgba(0,0,0,0.35)]` | Cards, sidebar, componentes elevados |
| lg | `shadow-lg` | — |
| modal | `shadow-2xl` | Modais e dropdowns |
| glow | `shadow-sm shadow-indigo-600/30` | Active state da sidebar |

---

## Typography

| Nome | Classes | Uso |
|------|---------|-----|
| page-title | `text-lg font-semibold text-(--text-primary)` | Título do PageShell |
| section-title | `text-sm font-semibold text-(--text-primary)` | Título de card/seção |
| kpi-value | `text-2xl font-bold text-(--text-primary)` | Valor principal de KPI |
| body | `text-sm text-(--text-secondary)` | Texto padrão em tabelas |
| label | `text-xs font-medium text-(--text-muted)` | Label de campo de formulário |
| caption | `text-xs text-(--text-muted)` | Metadata, datas, subtítulos |
| nav-section | `text-[10px] font-semibold uppercase tracking-widest text-(--text-muted)` | Label de seção do sidebar — única exceção ao mínimo de text-xs |

**Regra:** tamanho mínimo é `text-xs` (12px) em qualquer texto visível ao usuário. A única exceção são os labels de seção do sidebar que usam `text-[10px]` por serem todos-maiúsculas com `tracking-widest`.

---

## Component Sizes

### Buttons

| Size | Classes |
|------|---------|
| sm | `h-7 px-2.5 text-xs` |
| md (default) | `h-9 px-4 text-sm` |
| lg | `h-10 px-5 text-sm font-medium` |

### Inputs / Selects / Textareas

| Elemento | Altura | Classes base |
|----------|--------|-------------|
| Input | `h-9` | `px-3 bg-(--bg-elevated) border-(--border-input) rounded-lg text-sm` |
| Select | `h-9` | igual ao Input |
| Textarea | sem altura fixa | `min-h-[80px] py-2.5 px-3` — sem `resize` |

### Modais

| Size | Max-width |
|------|-----------|
| sm | `max-w-md` |
| md | `max-w-lg` |
| lg | `max-w-2xl` |

Altura máxima do body: `max-h-[calc(90vh-72px)]` com `overflow-y-auto`.

---

## Animações

Definidas em `frontend/src/index.css`. Nunca criar animações inline ou via `style=`.

| Classe | Duração | Uso |
|--------|---------|-----|
| `animate-page-enter` | 180ms | Entrada de página (aplicada no `<main>` do Layout) |
| `modal-panel-animate` | 200ms | Entrada do painel da modal |
| `modal-overlay-animate` | 150ms | Entrada do overlay da modal |
| `toast-animate` | 200ms | Entrada de toast |
| `shimmer` | 1.4s loop | Loading skeleton |

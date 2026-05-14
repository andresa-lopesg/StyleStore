# UI Spec — ApiClientes

## Direção visual

Dark premium. Inspirado em Linear e Vercel.

O produto deve transmitir controle e clareza. Interfaces ruidosas (bordas visíveis em todo lugar, sombras pesadas, gradientes decorativos) contradizem isso. Cada elemento visual deve justificar sua existência.

---

## Paleta de tons

Fundo quase-preto com leve toque azul/roxo — não preto puro. Preto puro (`#000`) é agressivo e cansativo. O tom base (`#09090f`) é escuro o suficiente para parecer premium mas suave o suficiente para uso prolongado.

A hierarquia de superfície é definida por tom, não por borda:

```
--bg-base     #09090f   página inteira
--bg-card     #101018   cards, sidebar, topbar
--bg-elevated #16161f   inputs, modais, dropdowns
--bg-hover    #1e1e2a   hover de itens interativos
```

Cada nível é ~6–8 pontos mais claro que o anterior. Isso cria profundidade sem precisar de bordas.

---

## Densidade visual

**Baixa densidade.** Não lotar a tela.

- Cards têm padding generoso (`p-5` ou `p-6`)
- Linhas de tabela têm altura confortável (`py-3.5`)
- Elementos não se tocam — sempre há espaço respirável entre eles
- Formulários usam `gap-4` entre campos, não `gap-2`

Exceção: quando o dado é denso por natureza (tabelas com muitas colunas, modais com muitos campos), a densidade pode subir — mas nunca abaixo de `gap-3`.

---

## Tipografia

- Fonte: Inter
- Tamanho mínimo: `text-xs` (12px) — nunca abaixo disso
- Hierarquia dentro de um card:
  - Título principal: `text-sm font-semibold text-(--text-primary)`
  - Valor principal (KPI): `text-2xl font-bold text-(--text-primary)`
  - Label/sublabel: `text-xs text-(--text-muted)`
  - Dado secundário: `text-sm text-(--text-secondary)`

---

## Bordas e separação

**Preferência: separação por elevação de superfície, não por borda visível.**

Cards não têm borda — a diferença de tom entre `--bg-base` e `--bg-card` já é separação suficiente. Usar `shadow-[0_2px_12px_rgba(0,0,0,0.35)]` como complemento quando necessário.

Bordas são reservadas para:
- Inputs e selects: `border-(--border-input)` — indica que é editável
- Separadores internos de componentes (ex: header do modal): `border-(--border)`
- Tabelas: apenas linha inferior de cada linha, `border-(--border)`

Nunca usar `border` em cards, containers ou seções de layout.

---

## Hover states

Discretos. O hover não deve surpreender.

- Itens de lista/nav: `hover:bg-(--bg-elevated)` + `hover:text-white`
- Botões ghost: `hover:bg-(--bg-elevated)`
- Linhas de tabela: `hover:bg-(--bg-elevated)`
- Transição: `transition-colors duration-150`

---

## Sombras

Usadas com parcimônia.

- Cards e superfícies elevadas: `shadow-[0_2px_12px_rgba(0,0,0,0.35)]`
- Modais e dropdowns: `shadow-2xl`
- Active state da sidebar: `shadow-sm shadow-indigo-600/30`
- Nunca usar sombras coloridas intensas ou `drop-shadow` em elementos de UI comuns

---

## Cor de acento

Indigo (`#6366f1`) como cor primária de ação. Roxo (`#8b5cf6`) como secundária/gradiente.

Usar acento apenas em:
- Botão primário (`bg-indigo-600`)
- Active state da sidebar (`bg-indigo-600`)
- Focus de inputs (`focus:border-(--accent)`)
- Links e badges de destaque

**Não** usar acento como fundo de cards, seções ou backgrounds de página.

---

## Animações

Sutis e funcionais — existem para orientar a atenção, não para decorar.

- Entrada de página: `opacity 0→1 + translateY 6px→0` em 180ms
- Entrada de modal: `scale 0.97→1 + translateY 8px→0` em 200ms
- Overlay do modal: `opacity 0→1` em 150ms
- Toast: `opacity 0→1 + translateY 8px→0` em 200ms
- Shimmer de loading: loop infinito de 1.4s

Nenhuma animação deve durar mais de 300ms. Nenhum bounce, spring ou efeito físico.

---

## Estado de carregamento

Usar classe `.shimmer` (definida em `index.css`) para todos os estados de loading.

O shimmer usa `--bg-elevated` e `--bg-hover` — nunca cores hardcoded. Isso garante que o skeleton pareça parte da interface, não um placeholder genérico.

---

## Responsividade

O produto é primariamente desktop. Layout mínimo pensado para 1280px de largura.

- `max-w-screen-2xl mx-auto` no container principal para ultrawide
- Grids de cards usam `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- Sidebar colapsa para 64px em telas menores
- Modais: `max-w-md` (sm), `max-w-lg` (md), `max-w-2xl` (lg)

Mobile não é suportado nesta versão.

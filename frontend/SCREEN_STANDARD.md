# Screen Standard — StyleStore Frontend

Lei do design system. Aplicar em todas as telas existentes e futuras.
Devs e agents devem seguir este documento ao criar ou modificar qualquer tela.

---

## 1. Regras de Cor

**NUNCA** usar cores hardcoded (`#111`, `#666`, `#1e1e1e`, `bg-[#161616]`, etc.).
**SEMPRE** usar os tokens CSS definidos em `src/index.css`.

### Hierarquia de superfícies (do mais escuro ao mais claro)

| Token | Valor | Uso |
|---|---|---|
| `--bg-base` | `#09090f` | Fundo da página (body) |
| `--bg-card` | `#101018` | Cards, sidebar, topbar |
| `--bg-elevated` | `#16161f` | Inputs, dropdowns, modais |
| `--bg-hover` | `#1e1e2a` | Estado hover de itens |

### Texto

| Token | Uso |
|---|---|
| `--text-primary` | Títulos, valores principais |
| `--text-secondary` | Labels, texto de apoio |
| `--text-muted` | Subtítulos, counters, timestamps |
| `--text-placeholder` | Placeholder de inputs |

### Accent

| Token | Uso |
|---|---|
| `--accent` | Indigo — cor de destaque principal, focus, links |
| `--accent-2` | Roxo — destaque secundário |

---

## 2. Regras de Separação Visual

**Princípio:** elevação separa superfícies, não bordas visíveis.

| Elemento | Classe correta |
|---|---|
| Card | `bg-(--bg-card) rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.35)]` |
| Sidebar | `bg-(--bg-card) shadow-[2px_0_16px_rgba(0,0,0,0.4)]` |
| Modal | `bg-(--bg-card) rounded-xl shadow-2xl` |
| TopBar | `bg-(--bg-base) border-b border-(--border)` |

Separadores **internos** (entre itens de lista dentro de um card) podem usar `border-(--border)` com opacidade baixa — isso é diferente de borda de card.

---

## 3. Regras de Tipografia

| Contexto | Classe |
|---|---|
| Título de página | `text-lg font-semibold text-(--text-primary)` — via `<PageShell>` |
| Subtítulo/counter | `text-xs text-(--text-muted)` — via `<PageShell>` |
| Label de formulário | `text-xs font-medium text-(--text-secondary)` |
| Conteúdo de tabela | `text-sm text-(--text-secondary)` |
| Badge / chip | `text-xs font-medium` |

**Tamanho mínimo:** `text-xs` (12px). **PROIBIDO** usar `text-[10px]` ou menor.

---

## 4. Regras de Componentes

**NUNCA** usar elementos HTML nativos em formulários. **SEMPRE** usar os componentes de `src/components/ui/`.

| Elemento | Componente correto | Caminho |
|---|---|---|
| Campo de texto | `<Input>` | `components/ui/Input.tsx` |
| Select / dropdown | `<Select>` | `components/ui/Select.tsx` |
| Textarea | `<Textarea>` | `components/ui/Textarea.tsx` |
| Botão | `<Button>` | `components/ui/Button.tsx` |
| Badge de status | `<Badge>` | `components/ui/Badge.tsx` |
| Tabela de dados | `<Table>` | `components/ui/Table.tsx` |
| Modal / drawer | `<Modal>` | `components/ui/Modal.tsx` |
| Confirmação | `<ConfirmDialog>` | `components/ui/ConfirmDialog.tsx` |

---

## 5. Estrutura de Página

Toda página **obrigatoriamente** usa `<PageShell>` como wrapper raiz.

```tsx
import PageShell from '../components/layout/PageShell';

export default function MinhaPagina() {
  return (
    <PageShell
      title="Título da Página"
      subtitle="contador ou descrição opcional"
      action={<Button variant="primary">Ação Principal</Button>}
    >
      {/* conteúdo da página */}
    </PageShell>
  );
}
```

**Props do PageShell:**
- `title` (obrigatório) — nome da seção, ex: "Pedidos"
- `subtitle` (opcional) — contador dinâmico, ex: `${data.length} registros`
- `action` (opcional) — botão de ação principal (ex: "Novo Pedido")
- `children` — conteúdo da página

---

## 6. Template de Nova Página

Copie este template ao criar qualquer nova tela:

```tsx
// src/pages/NovaPagina.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/layout/PageShell';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function NovaPagina() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['chave'],
    queryFn: /* service.getAll */,
  });

  const filtered = data.filter(item =>
    item.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell
      title="Nova Página"
      subtitle={`${data.length} registros`}
      action={
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          Novo Item
        </Button>
      }
    >
      {/* Busca */}
      <div className="relative w-72">
        {/* <SearchInput> — usar Input com ícone de Search */}
      </div>

      {/* Tabela */}
      <Table columns={[]} data={filtered} keyField="id" loading={isLoading} />

      {/* Modal de criação/edição */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Item">
        {/* formulário com <Input>, <Select>, <Textarea> */}
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && console.log('delete', deleteId)}
      />
    </PageShell>
  );
}
```

---

## 7. Checklist antes de fazer PR

- [ ] Nenhuma cor hardcoded (`bg-[#...]`, `text-[#...]`, `border-[#...]`)
- [ ] Página usa `<PageShell>` como wrapper
- [ ] Formulários usam componentes de `ui/` (sem `<select>`, `<input>`, `<textarea>` nativos)
- [ ] Texto mínimo `text-xs` — nada menor
- [ ] Cards sem `border` visível — usar `shadow` para elevação
- [ ] Feedback de operações via `useToast()`
- [ ] Loading state via prop `loading` da `<Table>` ou `<Skeleton>`

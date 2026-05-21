import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, AlertTriangle, MoreVertical, Download, LayoutGrid, List, Eye, SearchX, Layers, Wallet, Tag, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { produtosService } from '../services/produtos';
import { categoriasService } from '../services/categorias';
import type { Produto } from '../types';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import FilterBar from '../components/ui/FilterBar';
import DropdownMenu from '../components/ui/DropdownMenu';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';

type FormData = {
  nome: string; descricao: string; preco: number; precoCusto: number;
  estoqueTotal: number; estoqueMinimo: number; referencia: string; categoriaId: number; ativo: boolean;
};

function ImagemUploadField({
  currentUrl,
  selectedFile,
  onFileChange,
}: {
  currentUrl?: string | null;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(currentUrl ?? null);
    }
  }, [selectedFile, currentUrl]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) return;
    onFileChange(file);
  }

  return (
    <div className="col-span-2">
      <p className="text-xs font-medium text-(--text-secondary) mb-1.5">Imagem do Produto</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-xl overflow-hidden bg-(--bg-hover) flex items-center justify-center border border-(--border-input) shrink-0 cursor-pointer hover:border-(--accent) transition-colors"
        >
          {previewUrl
            ? <img src={previewUrl} className="w-full h-full object-cover" alt="" onError={() => setPreviewUrl(null)} />
            : <Upload size={18} className="text-(--text-muted)" />
          }
        </button>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="secondary" size="sm" icon={<Upload size={13} />} onClick={() => inputRef.current?.click()}>
            {previewUrl ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          {selectedFile && (
            <Button type="button" variant="ghost" size="sm" onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = ''; }}>
              Cancelar
            </Button>
          )}
          <p className="text-xs text-(--text-muted)">JPG, PNG ou WEBP · máx 5 MB</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
    </div>
  );
}

export default function Produtos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [viewProduto, setViewProduto] = useState<Produto | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });

  const totalProdutos = data.length;
  const totalEstoque = data.reduce((s, p) => s + (p.estoqueTotal ?? 0), 0);
  const valorEstoque = data.reduce((s, p) => s + ((p.preco ?? 0) * (p.estoqueTotal ?? 0)), 0);
  const categoriasAtivas = categorias.length;
  const novosEsteMes = data.filter(p => {
    const d = new Date(p.criadoEm);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const produtosAtivos = data.filter(p => p.ativo).length;

  useEffect(() => { setSelectedIds([]); setSelectionMode(false); }, [search, catFilter, statusFilter]);

  function toggleSelectionMode() {
    setSelectionMode(prev => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }

  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => produtosService.uploadImagem(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); closeModal(); },
    onError: () => toast('Erro ao enviar imagem.', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: produtosService.create,
    onSuccess: (novoProduto) => {
      toast('Produto criado com sucesso');
      if (selectedFile) {
        uploadMutation.mutate({ id: novoProduto.id, file: selectedFile });
      } else {
        qc.invalidateQueries({ queryKey: ['produtos'] });
        closeModal();
      }
    },
    onError: () => toast('Erro ao criar produto. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Produto }) => produtosService.update(id, data),
    onSuccess: () => {
      toast('Produto atualizado com sucesso');
      if (selectedFile && editing) {
        uploadMutation.mutate({ id: editing.id, file: selectedFile });
      } else {
        qc.invalidateQueries({ queryKey: ['produtos'] });
        closeModal();
      }
    },
    onError: () => toast('Erro ao atualizar produto. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: produtosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); setDeleteId(null); toast('Produto excluído com sucesso'); },
    onError: () => toast('Erro ao excluir produto. Tente novamente.', 'error'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) await produtosService.delete(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
      const count = selectedIds.length;
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      toast(`${count} produto${count !== 1 ? 's' : ''} excluído${count !== 1 ? 's' : ''}`);
    },
    onError: () => toast('Erro ao excluir produtos. Tente novamente.', 'error'),
  });

  function openCreate() {
    setEditing(null);
    reset({ nome: '', descricao: '', preco: 0, precoCusto: 0, estoqueTotal: 0, estoqueMinimo: 0, referencia: '', categoriaId: 0, ativo: true });
    setModalOpen(true);
  }

  function openEdit(p: Produto) {
    setEditing(p);
    reset({ nome: p.nome, descricao: p.descricao, preco: p.preco, precoCusto: p.precoCusto, estoqueTotal: p.estoqueTotal, estoqueMinimo: p.estoqueMinimo, referencia: p.referencia ?? '', categoriaId: p.categoriaId, ativo: p.ativo });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset(); setSelectedFile(null); }

  function onSubmit(formData: FormData) {
    const payload = {
      ...formData,
      preco: Number(formData.preco),
      precoCusto: Number(formData.precoCusto),
      estoqueTotal: editing ? editing.estoqueTotal : Number(formData.estoqueTotal),
      estoqueMinimo: Number(formData.estoqueMinimo),
      categoriaId: Number(formData.categoriaId),
      ativo: Boolean(formData.ativo),
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...payload } });
    else createMutation.mutate({ ...payload, criadoEm: new Date().toISOString() } as Omit<Produto, 'id' | 'criadoEm' | 'categoria' | 'variantes'>);
  }

  const filtered = data
    .filter(p =>
      !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.referencia ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.categoria?.nome ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .filter(p => !catFilter || p.categoriaId === Number(catFilter))
    .filter(p => {
      if (!statusFilter) return true;
      return statusFilter === 'ativo' ? p.ativo : !p.ativo;
    })
;

  function exportarCSV() {
    const headers = ['Nome', 'Referência', 'Categoria', 'Preço (R$)', 'Custo (R$)', 'Estoque', 'Status'];
    const rows = filtered.map(p => [
      `"${p.nome.replace(/"/g, '""')}"`,
      `"${(p.referencia ?? '').replace(/"/g, '""')}"`,
      `"${(p.categoria?.nome ?? '').replace(/"/g, '""')}"`,
      p.preco?.toFixed(2) ?? '0.00',
      p.precoCusto?.toFixed(2) ?? '0.00',
      p.estoqueTotal ?? 0,
      p.ativo ? 'Ativo' : 'Inativo',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportarCSVSelecionados() {
    const selecionados = filtered.filter(p => selectedIds.includes(p.id));
    const headers = ['Nome', 'Referência', 'Categoria', 'Preço (R$)', 'Custo (R$)', 'Estoque', 'Status'];
    const rows = selecionados.map(p => [
      `"${p.nome.replace(/"/g, '""')}"`,
      `"${(p.referencia ?? '').replace(/"/g, '""')}"`,
      `"${(p.categoria?.nome ?? '').replace(/"/g, '""')}"`,
      p.preco?.toFixed(2) ?? '0.00',
      p.precoCusto?.toFixed(2) ?? '0.00',
      p.estoqueTotal ?? 0,
      p.ativo ? 'Ativo' : 'Inativo',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos-selecionados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function statusBadge(p: Produto) {
    if (p.estoqueTotal === 0) return <Badge color="red">Sem estoque</Badge>;
    if (p.estoqueTotal < 10) return <Badge color="yellow">Estoque baixo</Badge>;
    if (!p.ativo) return <Badge color="red">Inativo</Badge>;
    return <Badge color="green">Ativo</Badge>;
  }

  const columns = [
    {
      key: 'nome', header: 'Produto',
      render: (row: Produto) => (
        <div className="flex items-center gap-3">
          {row.imagemUrl
            ? <img src={row.imagemUrl} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
            : <div className="w-8 h-8 rounded-lg bg-(--bg-hover) flex items-center justify-center flex-shrink-0">
                <Package size={14} className="text-(--text-muted)" />
              </div>
          }
          <div>
            <p className="text-sm text-(--text-primary) font-medium">{row.nome}</p>
            {row.referencia && <p className="text-xs text-(--text-muted)">{row.referencia}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria', header: 'Categoria',
      render: (row: Produto) => row.categoria ? <Badge color="indigo">{row.categoria.nome}</Badge> : <span className="text-(--text-muted)">—</span>,
    },
    {
      key: 'preco', header: 'Preço Venda',
      render: (row: Produto) => <span className="text-(--c-green) font-medium">R$ {Number(row.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'precoCusto', header: 'Custo',
      render: (row: Produto) => <span className="text-(--text-muted)">R$ {Number(row.precoCusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'estoqueTotal', header: 'Estoque',
      render: (row: Produto) => (
        <div className="flex items-center gap-1.5">
          {row.estoqueTotal < 10 && <AlertTriangle size={12} className="text-(--c-yellow)" />}
          <span className={row.estoqueTotal < 10 ? 'text-(--c-yellow)' : 'text-(--text-primary)'}>{row.estoqueTotal} un</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (row: Produto) => statusBadge(row),
    },
    {
      key: 'acoes', header: 'Ações', width: '80px',
      render: (row: Produto) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewProduto(row)}
            aria-label="Visualizar produto"
            className="p-1.5 rounded hover:bg-(--bg-hover) text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            <Eye size={15} />
          </button>
          <DropdownMenu
            trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
            items={[
              { label: 'Editar', icon: <Pencil size={13} />, onClick: () => openEdit(row) },
              { label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(row.id), variant: 'danger' },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Produtos"
      subtitle="Gerencie seu catálogo de produtos"
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Produto</Button>}
    >

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [0, 1, 2, 3].map(i => (
            <div key={i} className="bg-(--bg-card) rounded-xl p-5 flex items-center gap-4 min-h-[88px] shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-xl shimmer flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-24 shimmer rounded" />
                <div className="h-6 w-16 shimmer rounded" />
                <div className="h-3 w-28 shimmer rounded" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-(--bg-card) rounded-xl p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-indigo-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wide">Total de Produtos</p>
                <p className="text-2xl font-semibold text-(--text-primary)">{totalProdutos}</p>
                <p className="text-xs text-(--text-secondary)">
                  {novosEsteMes > 0 ? `+${novosEsteMes} este mês` : 'Nenhum novo este mês'}
                </p>
              </div>
            </div>
            <div className="bg-(--bg-card) rounded-xl p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <Layers size={20} className="text-violet-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wide">Estoque Total</p>
                <p className="text-2xl font-semibold text-(--text-primary)">{totalEstoque.toLocaleString('pt-BR')} un</p>
                <p className="text-xs text-(--text-secondary)">{produtosAtivos} produtos ativos</p>
              </div>
            </div>
            <div className="bg-(--bg-card) rounded-xl p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Wallet size={20} className="text-green-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wide">Valor do Estoque</p>
                <p className="text-2xl font-semibold text-(--text-primary)">
                  {valorEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-(--text-secondary)">Valor total em estoque</p>
              </div>
            </div>
            <div className="bg-(--bg-card) rounded-xl p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                <Tag size={20} className="text-orange-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-(--text-muted) uppercase tracking-wide">Categorias</p>
                <p className="text-2xl font-semibold text-(--text-primary)">{categoriasAtivas}</p>
                <p className="text-xs text-(--text-secondary)">Categorias ativas</p>
              </div>
            </div>
          </>
        )}
      </div>

      <FilterBar
        actions={(
          <>
            {(catFilter || statusFilter) && (
              <span className="text-xs text-(--text-muted)">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            )}
            <Button
              variant={selectionMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggleSelectionMode}
            >
              {selectionMode ? `${selectedIds.length} selecionado${selectedIds.length !== 1 ? 's' : ''}` : 'Selecionar'}
            </Button>
            <DropdownMenu
              trigger={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={13} />}
                  disabled={filtered.length === 0}
                >
                  Exportar
                </Button>
              }
              items={[
                { label: 'Exportar todos', icon: <Download size={13} />, onClick: exportarCSV },
                { label: 'Exportar selecionados', icon: <Download size={13} />, onClick: exportarCSVSelecionados, disabled: selectedIds.length === 0 },
              ]}
            />
          </>
        )}
      >
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto, ref, categoria..." />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="h-9 px-3 min-w-[160px] bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) outline-none focus:border-(--accent) cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 min-w-[160px] bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) outline-none focus:border-(--accent) cursor-pointer"
        >
          <option value="">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setView('list')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-(--accent) text-white'
                : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)'
            }`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              view === 'grid'
                ? 'bg-(--accent) text-white'
                : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </FilterBar>

      {selectionMode && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-(--bg-elevated) border border-(--border-input) rounded-xl">
          <span className="text-sm text-(--text-secondary)">
            {selectedIds.length} produto{selectedIds.length !== 1 ? 's' : ''} selecionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => setBulkDeleteOpen(true)}>
            Excluir selecionados
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleSelectionMode}>Cancelar</Button>
        </div>
      )}

      {view === 'list' ? (
        <Table
          columns={columns} data={filtered} keyField="id" loading={isLoading} noPagination
          selectable={selectionMode} selectedIds={selectionMode ? selectedIds : []} onSelectionChange={selectionMode ? ids => setSelectedIds(ids as number[]) : undefined}
          emptyState={(search || catFilter || statusFilter)
            ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description="Tente ajustar os filtros ou limpar a busca." action={{ label: 'Limpar busca', onClick: () => { setSearch(''); setCatFilter(''); setStatusFilter(''); } }} />
            : <EmptyState icon={Package} title="Nenhum produto cadastrado" description="Adicione o primeiro produto para começar." action={{ label: 'Adicionar produto', onClick: openCreate }} />
          }
        />
      ) : (
        filtered.length === 0 ? (
          <p className="text-center text-(--text-muted) text-sm py-12">Nenhum produto encontrado</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-(--bg-card) border border-(--border) rounded-xl p-4 flex flex-col gap-3 group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-(--bg-hover) flex items-center justify-center">
                  {p.imagemUrl
                    ? <img src={p.imagemUrl} className="w-full h-full object-cover" alt="" />
                    : <Package size={28} className="text-(--text-muted)" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-(--text-primary) leading-snug line-clamp-2">{p.nome}</p>
                  {p.referencia && <p className="text-xs text-(--text-muted) mt-0.5">{p.referencia}</p>}
                  {p.categoria && <span className="inline-block mt-1.5"><Badge color="indigo">{p.categoria.nome}</Badge></span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-(--c-green)">
                    {p.preco?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {statusBadge(p)}
                </div>
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => setViewProduto(p)}
                    aria-label="Visualizar produto"
                    className="p-1.5 rounded bg-(--bg-elevated) hover:bg-(--bg-hover) text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <DropdownMenu
                    trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
                    items={[
                      { label: 'Editar', icon: <Pencil size={13} />, onClick: () => openEdit(p) },
                      { label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(p.id), variant: 'danger' },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Produto' : 'Novo Produto'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nome do Produto" placeholder="Ex: Camiseta Básica Branca" {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} isValid={!!dirtyFields.nome && !errors.nome} />
          </div>
          <div className="col-span-2">
            <Textarea label="Descrição" placeholder="Descrição do produto..." rows={2} {...register('descricao')} />
          </div>
          <ImagemUploadField currentUrl={editing?.imagemUrl} selectedFile={selectedFile} onFileChange={setSelectedFile} />
          <Input label="Preço de Venda (R$)" type="number" step="0.01" placeholder="99.90" {...register('preco', { required: 'Obrigatório' })} error={errors.preco?.message} isValid={!!dirtyFields.preco && !errors.preco} />
          <Input label="Custo (R$)" type="number" step="0.01" placeholder="45.00" {...register('precoCusto')} />
          <Input
            label="Estoque Total"
            type="number"
            placeholder="0"
            {...register('estoqueTotal')}
            readOnly={!!editing}
            className={editing ? 'opacity-60 cursor-not-allowed' : ''}
          />
          <Input label="Estoque Mínimo" type="number" placeholder="0" {...register('estoqueMinimo')} />
          <Input label="Referência/SKU" placeholder="CAM-001-BR" {...register('referencia')} />
          <Select label="Categoria" {...register('categoriaId', { required: 'Obrigatório' })} error={errors.categoriaId?.message}>
            <option value="">Selecione...</option>
            {categorias.filter(c => c.ativa).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
          <Select label="Status" {...register('ativo')}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-(--border)">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={viewProduto !== null} onClose={() => setViewProduto(null)} title="Detalhes do Produto" size="md">
        {viewProduto && (
          <div className="flex flex-col gap-4">
            {viewProduto.imagemUrl && (
              <img src={viewProduto.imagemUrl} className="w-full h-48 object-cover rounded-lg" alt={viewProduto.nome} />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Nome</p>
                <p className="text-(--text-primary)">{viewProduto.nome}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Referência</p>
                <p className="text-(--text-secondary)">{viewProduto.referencia ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Categoria</p>
                <p className="text-(--text-secondary)">{viewProduto.categoria?.nome ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Status</p>
                {statusBadge(viewProduto)}
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Preço de venda</p>
                <p className="text-(--c-green) font-medium">
                  {viewProduto.preco?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Custo</p>
                <p className="text-(--text-secondary)">
                  {viewProduto.precoCusto?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Estoque total</p>
                <p className="text-(--text-primary)">{viewProduto.estoqueTotal} unidades</p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Criado em</p>
                <p className="text-(--text-secondary)">{new Date(viewProduto.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {viewProduto.descricao && (
              <div>
                <p className="text-xs text-(--text-muted) mb-0.5">Descrição</p>
                <p className="text-sm text-(--text-secondary) leading-relaxed">{viewProduto.descricao}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setViewProduto(null)}>Fechar</Button>
              <Button variant="primary" icon={<Pencil size={13} />} onClick={() => { setViewProduto(null); openEdit(viewProduto); }}>
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        loading={bulkDeleteMutation.isPending}
        title="Excluir produtos selecionados"
        message={`Tem certeza que deseja excluir ${selectedIds.length} produto${selectedIds.length !== 1 ? 's' : ''}? Esta ação não pode ser desfeita.`}
      />
    </PageShell>
  );
}

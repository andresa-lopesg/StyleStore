import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, AlertTriangle, MoreVertical, Download, LayoutGrid, List, Eye, SearchX } from 'lucide-react';
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
  estoqueTotal: number; referencia: string; categoriaId: number; ativo: boolean;
};

export default function Produtos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [estoqueFilter, setEstoqueFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [viewProduto, setViewProduto] = useState<Produto | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const { data = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });
  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: produtosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); closeModal(); toast('Produto criado com sucesso'); },
    onError: () => toast('Erro ao criar produto. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Produto }) => produtosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); closeModal(); toast('Produto atualizado com sucesso'); },
    onError: () => toast('Erro ao atualizar produto. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: produtosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); setDeleteId(null); toast('Produto excluído com sucesso'); },
    onError: () => toast('Erro ao excluir produto. Tente novamente.', 'error'),
  });

  function openCreate() {
    setEditing(null);
    reset({ nome: '', descricao: '', preco: 0, precoCusto: 0, estoqueTotal: 0, referencia: '', categoriaId: 0, ativo: true });
    setModalOpen(true);
  }

  function openEdit(p: Produto) {
    setEditing(p);
    reset({ nome: p.nome, descricao: p.descricao, preco: p.preco, precoCusto: p.precoCusto, estoqueTotal: p.estoqueTotal, referencia: p.referencia ?? '', categoriaId: p.categoriaId, ativo: p.ativo });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    const payload = { ...formData, preco: Number(formData.preco), precoCusto: Number(formData.precoCusto), estoqueTotal: Number(formData.estoqueTotal), categoriaId: Number(formData.categoriaId), ativo: Boolean(formData.ativo) };
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
    .filter(p => {
      if (estoqueFilter === 'baixo') return p.estoqueTotal > 0 && p.estoqueTotal < 10;
      if (estoqueFilter === 'zerado') return p.estoqueTotal === 0;
      return true;
    });

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
            <p className="text-sm text-white font-medium">{row.nome}</p>
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
      render: (row: Produto) => <span className="text-green-400 font-medium">R$ {Number(row.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'precoCusto', header: 'Custo',
      render: (row: Produto) => <span className="text-(--text-muted)">R$ {Number(row.precoCusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'estoqueTotal', header: 'Estoque',
      render: (row: Produto) => (
        <div className="flex items-center gap-1.5">
          {row.estoqueTotal < 10 && <AlertTriangle size={12} className="text-yellow-400" />}
          <span className={row.estoqueTotal < 10 ? 'text-yellow-400' : 'text-white'}>{row.estoqueTotal} un</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (row: Produto) => statusBadge(row),
    },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Produto) => (
        <DropdownMenu
          trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
          items={[
            { label: 'Visualizar', icon: <Eye size={13} />, onClick: () => setViewProduto(row) },
            { label: 'Editar', icon: <Pencil size={13} />, onClick: () => openEdit(row) },
            { label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(row.id), variant: 'danger' },
          ]}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Produtos"
      subtitle={<>{data.filter(p => p.ativo).length} ativos{data.filter(p => p.estoqueTotal < 10).length > 0 && <span className="text-yellow-400 ml-2">· {data.filter(p => p.estoqueTotal < 10).length} com estoque baixo</span>}</>}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Produto</Button>}
    >

      <FilterBar
        actions={(
          <>
            {(catFilter || statusFilter || estoqueFilter) && (
              <span className="text-xs text-(--text-muted)">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={exportarCSV}
              disabled={filtered.length === 0}
            >
              Exportar ({filtered.length})
            </Button>
          </>
        )}
      >
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto, ref, categoria..." />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="h-9 px-3 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) outline-none focus:border-(--accent)"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) outline-none focus:border-(--accent)"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <select
          value={estoqueFilter}
          onChange={e => setEstoqueFilter(e.target.value)}
          className="h-9 px-3 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) outline-none focus:border-(--accent)"
        >
          <option value="">Todos os estoques</option>
          <option value="baixo">Estoque baixo (&lt;10)</option>
          <option value="zerado">Sem estoque</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setView('list')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-(--accent) text-white'
                : 'text-(--text-muted) hover:text-white hover:bg-(--bg-elevated)'
            }`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              view === 'grid'
                ? 'bg-(--accent) text-white'
                : 'text-(--text-muted) hover:text-white hover:bg-(--bg-elevated)'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </FilterBar>

      {view === 'list' ? (
        <Table
          columns={columns} data={filtered} keyField="id" loading={isLoading} pageSize={20}
          emptyState={(search || catFilter || statusFilter || estoqueFilter)
            ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description="Tente ajustar os filtros ou limpar a busca." action={{ label: 'Limpar busca', onClick: () => { setSearch(''); setCatFilter(''); setStatusFilter(''); setEstoqueFilter(''); } }} />
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
                  <p className="text-sm font-medium text-white leading-snug line-clamp-2">{p.nome}</p>
                  {p.referencia && <p className="text-xs text-(--text-muted) mt-0.5">{p.referencia}</p>}
                  {p.categoria && <span className="inline-block mt-1.5"><Badge color="indigo">{p.categoria.nome}</Badge></span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-400">
                    {p.preco?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {statusBadge(p)}
                </div>
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu
                    trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
                    items={[
                      { label: 'Visualizar', icon: <Eye size={13} />, onClick: () => setViewProduto(p) },
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
          <Input label="Preço de Venda (R$)" type="number" step="0.01" placeholder="99.90" {...register('preco', { required: 'Obrigatório' })} error={errors.preco?.message} isValid={!!dirtyFields.preco && !errors.preco} />
          <Input label="Custo (R$)" type="number" step="0.01" placeholder="45.00" {...register('precoCusto')} />
          <Input label="Estoque Total" type="number" placeholder="0" {...register('estoqueTotal')} />
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
            <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
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
                <p className="text-white">{viewProduto.nome}</p>
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
                <p className="text-green-400 font-medium">
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
                <p className="text-white">{viewProduto.estoqueTotal} unidades</p>
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
    </PageShell>
  );
}

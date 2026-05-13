import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { produtosService } from '../services/produtos';
import { categoriasService } from '../services/categorias';
import type { Produto } from '../types';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

type FormData = {
  nome: string; descricao: string; preco: number; precoCusto: number;
  estoqueTotal: number; referencia: string; categoriaId: number; ativo: boolean;
};

export default function Produtos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Produto | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

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

  const filtered = data.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.referencia ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.categoria?.nome ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'nome', header: 'Produto',
      render: (row: Produto) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <Package size={14} className="text-[#555]" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{row.nome}</p>
            {row.referencia && <p className="text-[10px] text-[#555]">Ref: {row.referencia}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria', header: 'Categoria',
      render: (row: Produto) => row.categoria ? <Badge color="indigo">{row.categoria.nome}</Badge> : <span className="text-[#555]">—</span>,
    },
    {
      key: 'preco', header: 'Preço Venda',
      render: (row: Produto) => <span className="text-green-400 font-medium">R$ {Number(row.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'precoCusto', header: 'Custo',
      render: (row: Produto) => <span className="text-[#666]">R$ {Number(row.precoCusto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
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
      key: 'ativo', header: 'Status',
      render: (row: Produto) => <Badge color={row.ativo ? 'green' : 'red'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '100px',
      render: (row: Produto) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => openEdit(row)} />
          <Button size="sm" variant="danger" icon={<Trash2 size={12} />} onClick={() => setDeleteId(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Produtos</h2>
          <p className="text-xs text-[#666] mt-0.5">
            {data.filter(p => p.ativo).length} ativos
            {data.filter(p => p.estoqueTotal < 10).length > 0 && (
              <span className="text-yellow-400 ml-2">· {data.filter(p => p.estoqueTotal < 10).length} com estoque baixo</span>
            )}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Produto</Button>
      </div>

      <div className="relative w-72">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-[#ccc] placeholder-[#444] outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" loading={isLoading} />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Produto' : 'Novo Produto'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nome do Produto" placeholder="Ex: Camiseta Básica Branca" {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Descrição</label>
            <textarea
              {...register('descricao')}
              placeholder="Descrição do produto..."
              rows={2}
              className="px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#444] outline-none focus:border-indigo-600 transition-colors resize-none"
            />
          </div>
          <Input label="Preço de Venda (R$)" type="number" step="0.01" placeholder="99.90" {...register('preco', { required: 'Obrigatório' })} error={errors.preco?.message} />
          <Input label="Custo (R$)" type="number" step="0.01" placeholder="45.00" {...register('precoCusto')} />
          <Input label="Estoque Total" type="number" placeholder="0" {...register('estoqueTotal')} />
          <Input label="Referência/SKU" placeholder="CAM-001-BR" {...register('referencia')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Categoria</label>
            <select
              {...register('categoriaId', { required: 'Obrigatório' })}
              className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="">Selecione...</option>
              {categorias.filter(c => c.ativa).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {errors.categoriaId && <span className="text-xs text-red-400">{errors.categoriaId.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Status</label>
            <select {...register('ativo')} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-[#1e1e1e]">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </div>
  );
}

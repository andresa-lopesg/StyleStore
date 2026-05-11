import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Factory } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { producaoService } from '../services/producao';
import { produtosService } from '../services/produtos';
import type { Producao, StatusProducao as StatusProducaoEnum } from '../types';
import { StatusProducaoLabel } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

type FormData = {
  produtoId: number; quantidadePlanejada: number; quantidadeProduzida: number;
  status: StatusProducaoEnum; responsavel: string; dataInicio: string; dataFim: string; observacao: string;
};

const statusColors: Record<number, 'yellow' | 'blue' | 'gray' | 'green' | 'red'> = {
  0: 'yellow', 1: 'blue', 2: 'gray', 3: 'green', 4: 'red',
};

export default function Producao() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Producao | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['producao'], queryFn: producaoService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: producaoService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Producao }) => producaoService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: producaoService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); setDeleteId(null); },
  });

  function openCreate() {
    setEditing(null);
    reset({ produtoId: 0, quantidadePlanejada: 0, quantidadeProduzida: 0, status: 0, responsavel: '', dataInicio: '', dataFim: '', observacao: '' });
    setModalOpen(true);
  }

  function openEdit(p: Producao) {
    setEditing(p);
    reset({ produtoId: p.produtoId, quantidadePlanejada: p.quantidadePlanejada, quantidadeProduzida: p.quantidadeProduzida, status: p.status, responsavel: p.responsavel, dataInicio: p.dataInicio.split('T')[0], dataFim: p.dataFim ? p.dataFim.split('T')[0] : '', observacao: p.observacao ?? '' });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    const payload = {
      ...formData,
      produtoId: Number(formData.produtoId),
      quantidadePlanejada: Number(formData.quantidadePlanejada),
      quantidadeProduzida: Number(formData.quantidadeProduzida),
      status: Number(formData.status) as StatusProducaoEnum,
      dataInicio: new Date(formData.dataInicio).toISOString(),
      dataFim: formData.dataFim ? new Date(formData.dataFim).toISOString() : undefined,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...payload } });
    else createMutation.mutate(payload);
  }

  const filtered = data.filter(p =>
    (p.produto?.nome ?? '').toLowerCase().includes(search.toLowerCase()) ||
    p.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'produto', header: 'Produto',
      render: (row: Producao) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600/20 flex items-center justify-center">
            <Factory size={12} className="text-indigo-400" />
          </div>
          <span className="text-white">{row.produto?.nome ?? `#${row.produtoId}`}</span>
        </div>
      ),
    },
    {
      key: 'quantidade', header: 'Qtd Planejada/Produzida',
      render: (row: Producao) => (
        <div className="flex items-center gap-2">
          <span className="text-white">{row.quantidadeProduzida}</span>
          <span className="text-[#444]">/</span>
          <span className="text-[#666]">{row.quantidadePlanejada}</span>
          <div className="w-16 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (row.quantidadeProduzida / row.quantidadePlanejada) * 100)}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (row: Producao) => <Badge color={statusColors[row.status]}>{StatusProducaoLabel[row.status]}</Badge>,
    },
    { key: 'responsavel', header: 'Responsável' },
    {
      key: 'dataInicio', header: 'Início',
      render: (row: Producao) => <span className="text-[#666]">{new Date(row.dataInicio).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'dataFim', header: 'Fim',
      render: (row: Producao) => row.dataFim ? <span className="text-[#666]">{new Date(row.dataFim).toLocaleDateString('pt-BR')}</span> : <span className="text-[#444]">—</span>,
    },
    {
      key: 'acoes', header: 'Ações', width: '100px',
      render: (row: Producao) => (
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
          <h2 className="text-lg font-semibold text-white">Produção</h2>
          <p className="text-xs text-[#666] mt-0.5">
            {data.filter(p => p.status === 1).length} em andamento · {data.length} total
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Nova Ordem</Button>
      </div>

      <div className="relative w-72">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por produto ou responsável..."
          className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-[#ccc] placeholder-[#444] outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" loading={isLoading} />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Produto *</label>
            <select {...register('produtoId', { required: 'Obrigatório' })} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              <option value="">Selecione...</option>
              {produtos.filter(p => p.ativo).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            {errors.produtoId && <span className="text-xs text-red-400">{errors.produtoId.message}</span>}
          </div>
          <Input label="Qtd. Planejada" type="number" placeholder="100" {...register('quantidadePlanejada', { required: 'Obrigatório' })} error={errors.quantidadePlanejada?.message} />
          <Input label="Qtd. Produzida" type="number" placeholder="0" {...register('quantidadeProduzida')} />
          <Input label="Responsável" placeholder="Nome do responsável" {...register('responsavel', { required: 'Obrigatório' })} error={errors.responsavel?.message} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Status</label>
            <select {...register('status')} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              {Object.entries(StatusProducaoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <Input label="Data de Início" type="date" {...register('dataInicio', { required: 'Obrigatório' })} error={errors.dataInicio?.message} />
          <Input label="Data de Fim (prevista)" type="date" {...register('dataFim')} />
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Observação</label>
            <textarea {...register('observacao')} placeholder="Detalhes da produção..." rows={2} className="px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#444] outline-none focus:border-indigo-600 transition-colors resize-none" />
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

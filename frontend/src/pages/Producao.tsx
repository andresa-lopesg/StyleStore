import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Factory, MoreVertical, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { producaoService } from '../services/producao';
import { produtosService } from '../services/produtos';
import type { Producao, StatusProducao as StatusProducaoEnum } from '../types';
import { useToast } from '../context/ToastContext';
import { StatusProducaoLabel } from '../types';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import DropdownMenu from '../components/ui/DropdownMenu';
import EmptyState from '../components/ui/EmptyState';

type FormData = {
  produtoId: number; quantidadePlanejada: number; quantidadeProduzida: number;
  status: StatusProducaoEnum; responsavel: string; dataInicio: string; dataFim: string; observacao: string;
};

const statusColors: Record<number, 'yellow' | 'blue' | 'gray' | 'green' | 'red'> = {
  0: 'yellow', 1: 'blue', 2: 'gray', 3: 'green', 4: 'red',
};

export default function Producao() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Producao | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['producao'], queryFn: producaoService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: producaoService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); closeModal(); toast('Ordem de produção criada com sucesso'); },
    onError: () => toast('Erro ao criar ordem de produção. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Producao }) => producaoService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); closeModal(); toast('Ordem de produção atualizada com sucesso'); },
    onError: () => toast('Erro ao atualizar ordem de produção. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: producaoService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['producao'] }); setDeleteId(null); toast('Ordem de produção excluída com sucesso'); },
    onError: () => toast('Erro ao excluir ordem de produção. Tente novamente.', 'error'),
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
          <span className="text-(--text-muted)">/</span>
          <span className="text-(--text-muted)">{row.quantidadePlanejada}</span>
          <div className="w-16 h-1.5 bg-(--bg-hover) rounded-full overflow-hidden">
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
      render: (row: Producao) => <span className="text-(--text-muted)">{new Date(row.dataInicio).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'dataFim', header: 'Fim',
      render: (row: Producao) => row.dataFim ? <span className="text-(--text-muted)">{new Date(row.dataFim).toLocaleDateString('pt-BR')}</span> : <span className="text-(--text-muted)">—</span>,
    },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Producao) => (
        <DropdownMenu
          trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
          items={[
            { label: 'Editar', icon: <Pencil size={13} />, onClick: () => openEdit(row) },
            { label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(row.id), variant: 'danger' },
          ]}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Produção"
      subtitle={`${data.filter(p => p.status === 1).length} em andamento · ${data.length} total`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Nova Ordem</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por produto ou responsável..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} pageSize={20}
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhuma produção encontrada para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={Factory} title="Nenhuma produção em andamento" description="Inicie a primeira ordem de produção." action={{ label: 'Iniciar produção', onClick: openCreate }} />
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Select label="Produto *" {...register('produtoId', { required: 'Obrigatório' })} error={errors.produtoId?.message}>
              <option value="">Selecione...</option>
              {produtos.filter(p => p.ativo).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </div>
          <Input label="Qtd. Planejada" type="number" placeholder="100" {...register('quantidadePlanejada', { required: 'Obrigatório' })} error={errors.quantidadePlanejada?.message} isValid={!!dirtyFields.quantidadePlanejada && !errors.quantidadePlanejada} />
          <Input label="Qtd. Produzida" type="number" placeholder="0" {...register('quantidadeProduzida')} />
          <Input label="Responsável" placeholder="Nome do responsável" {...register('responsavel', { required: 'Obrigatório' })} error={errors.responsavel?.message} isValid={!!dirtyFields.responsavel && !errors.responsavel} />
          <Select label="Status" {...register('status')}>
            {Object.entries(StatusProducaoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Input label="Data de Início" type="date" {...register('dataInicio', { required: 'Obrigatório' })} error={errors.dataInicio?.message} isValid={!!dirtyFields.dataInicio && !errors.dataInicio} />
          <Input label="Data de Fim (prevista)" type="date" {...register('dataFim')} />
          <div className="col-span-2">
            <Textarea label="Observação" placeholder="Detalhes da produção..." rows={2} {...register('observacao')} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-(--border)">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </PageShell>
  );
}

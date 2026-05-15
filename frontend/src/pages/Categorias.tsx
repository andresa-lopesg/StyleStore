import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag, MoreVertical, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { categoriasService } from '../services/categorias';
import type { Categoria } from '../types';
import { useToast } from '../context/ToastContext';
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

type FormData = { nome: string; descricao: string; ativa: boolean };

export default function Categorias() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Categoria | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });
  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: categoriasService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); toast('Categoria criada com sucesso'); },
    onError: () => toast('Erro ao criar categoria. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Categoria }) => categoriasService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); toast('Categoria atualizada com sucesso'); },
    onError: () => toast('Erro ao atualizar categoria. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); setDeleteId(null); toast('Categoria excluída com sucesso'); },
    onError: () => toast('Erro ao excluir categoria. Tente novamente.', 'error'),
  });

  function openCreate() { setEditing(null); reset({ nome: '', descricao: '', ativa: true }); setModalOpen(true); }
  function openEdit(c: Categoria) { setEditing(c); reset(c); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    const payload = { ...formData, ativa: Boolean(formData.ativa) };
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...payload } });
    else createMutation.mutate(payload);
  }

  const filtered = data.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.descricao.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'nome', header: 'Nome',
      render: (row: Categoria) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600/20 flex items-center justify-center">
            <Tag size={12} className="text-indigo-400" />
          </div>
          <span className="text-white font-medium">{row.nome}</span>
        </div>
      ),
    },
    { key: 'descricao', header: 'Descrição' },
    {
      key: 'criadoEm', header: 'Criada em',
      render: (row: Categoria) => <span className="text-(--text-muted)">{new Date(row.criadoEm).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'ativa', header: 'Status',
      render: (row: Categoria) => <Badge color={row.ativa ? 'green' : 'red'}>{row.ativa ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Categoria) => (
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
      title="Categorias"
      subtitle={`${data.filter(c => c.ativa).length} ativas de ${data.length} total`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Nova Categoria</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar categoria..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} pageSize={20}
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhuma categoria encontrada para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={Tag} title="Nenhuma categoria criada" description="Crie a primeira categoria para organizar os produtos." action={{ label: 'Criar categoria', onClick: openCreate }} />
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Categoria' : 'Nova Categoria'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" placeholder="Ex: Camisetas, Vestidos..." {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} isValid={!!dirtyFields.nome && !errors.nome} />
          <Textarea label="Descrição" placeholder="Descrição da categoria..." rows={3} {...register('descricao')} />
          <Select label="Status" {...register('ativa')}>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
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

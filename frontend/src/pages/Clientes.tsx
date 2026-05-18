import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MoreVertical, Users, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { clientesService } from '../services/clientes';
import type { Cliente } from '../types';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DropdownMenu from '../components/ui/DropdownMenu';
import EmptyState from '../components/ui/EmptyState';

type FormData = Omit<Cliente, 'id'>;

export default function Clientes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Cliente | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });

  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: clientesService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); closeModal(); toast('Cliente criado com sucesso'); },
    onError: () => toast('Erro ao criar cliente. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Cliente }) => clientesService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); closeModal(); toast('Cliente atualizado com sucesso'); },
    onError: () => toast('Erro ao atualizar cliente. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: clientesService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setDeleteId(null); toast('Cliente excluído com sucesso'); },
    onError: () => toast('Erro ao excluir cliente. Tente novamente.', 'error'),
  });

  function openCreate() { setEditing(null); reset({ nome: '', email: '', telefone: '' }); setModalOpen(true); }
  function openEdit(c: Cliente) { setEditing(c); reset(c); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(data: FormData) {
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...data, id: editing.id } });
    else createMutation.mutate(data);
  }

  const filtered = data.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Cliente) => (
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
      title="Clientes"
      subtitle={`${data.length} cliente${data.length !== 1 ? 's' : ''} cadastrado${data.length !== 1 ? 's' : ''}`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Cliente</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} noPagination
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhum cliente encontrado para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={Users} title="Nenhum cliente cadastrado" description="Adicione o primeiro cliente para começar." action={{ label: 'Adicionar cliente', onClick: openCreate }} />
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" placeholder="Nome completo" {...register('nome', { required: 'Nome obrigatório' })} error={errors.nome?.message} isValid={!!dirtyFields.nome && !errors.nome} />
          <Input label="E-mail" type="email" placeholder="email@exemplo.com" {...register('email', { required: 'E-mail obrigatório' })} error={errors.email?.message} isValid={!!dirtyFields.email && !errors.email} />
          <Input label="Telefone" placeholder="(11) 99999-9999" {...register('telefone')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />
    </PageShell>
  );
}

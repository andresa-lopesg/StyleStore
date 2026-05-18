import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MoreVertical, Shield, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usuariosService } from '../services/usuarios';
import type { Usuario } from '../types';
import { useToast } from '../context/ToastContext';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import DropdownMenu from '../components/ui/DropdownMenu';
import EmptyState from '../components/ui/EmptyState';

type FormData = { nome: string; email: string; senhaHash: string };

export default function Usuarios() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Usuario | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosService.getAll });
  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: usuariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); closeModal(); toast('Usuário criado com sucesso'); },
    onError: () => toast('Erro ao criar usuário. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Usuario }) => usuariosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); closeModal(); toast('Usuário atualizado com sucesso'); },
    onError: () => toast('Erro ao atualizar usuário. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: usuariosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); setDeleteId(null); toast('Usuário excluído com sucesso'); },
    onError: () => toast('Erro ao excluir usuário. Tente novamente.', 'error'),
  });

  function openCreate() { setEditing(null); reset({ nome: '', email: '', senhaHash: '' }); setModalOpen(true); }
  function openEdit(u: Usuario) { setEditing(u); reset({ nome: u.nome, email: u.email, senhaHash: '' }); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { ...editing, ...formData } });
    } else {
      createMutation.mutate(formData);
    }
  }

  const filtered = data.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'criadoEm', header: 'Criado em',
      render: (row: Usuario) => (
        <span className="text-(--text-muted)">{new Date(row.criadoEm).toLocaleDateString('pt-BR')}</span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: () => <Badge color="green">Ativo</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Usuario) => (
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
      title="Usuários"
      subtitle={`${data.length} usuário${data.length !== 1 ? 's' : ''}`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Usuário</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} noPagination
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhum usuário encontrado para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={Shield} title="Nenhum usuário cadastrado" description="Crie o primeiro usuário do sistema." action={{ label: 'Criar usuário', onClick: openCreate }} />
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" placeholder="Nome completo" {...register('nome', { required: 'Nome obrigatório' })} error={errors.nome?.message} isValid={!!dirtyFields.nome && !errors.nome} />
          <Input label="E-mail" type="email" placeholder="email@exemplo.com" {...register('email', { required: 'E-mail obrigatório' })} error={errors.email?.message} isValid={!!dirtyFields.email && !errors.email} />
          <Input label="Senha" type="password" placeholder={editing ? 'Deixe em branco para não alterar' : 'Senha'} {...register('senhaHash', { required: !editing && 'Senha obrigatória' })} error={errors.senhaHash?.message} />
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

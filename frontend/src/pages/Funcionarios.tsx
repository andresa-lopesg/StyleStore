import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MoreVertical, UserCheck, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { funcionariosService } from '../services/funcionarios';
import type { Funcionario } from '../types';
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
import DropdownMenu from '../components/ui/DropdownMenu';
import EmptyState from '../components/ui/EmptyState';

type FormData = Omit<Funcionario, 'id' | 'criadoEm'>;

const cargos = ['Gerente', 'Vendedor', 'Caixa', 'Estoquista', 'Costureiro', 'Designer', 'Auxiliar'];

export default function Funcionarios() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Funcionario | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const createMutation = useMutation({
    mutationFn: funcionariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); toast('Funcionário criado com sucesso'); },
    onError: () => toast('Erro ao criar funcionário. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Funcionario }) => funcionariosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); toast('Funcionário atualizado com sucesso'); },
    onError: () => toast('Erro ao atualizar funcionário. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: funcionariosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); setDeleteId(null); toast('Funcionário excluído com sucesso'); },
    onError: () => toast('Erro ao excluir funcionário. Tente novamente.', 'error'),
  });

  function openCreate() {
    setEditing(null);
    reset({ nome: '', email: '', telefone: '', cargo: '', salario: 0, cpf: '', dataAdmissao: '', ativo: true });
    setModalOpen(true);
  }

  function openEdit(f: Funcionario) {
    setEditing(f);
    reset({ ...f, dataAdmissao: f.dataAdmissao.split('T')[0] });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    const payload = { ...formData, salario: Number(formData.salario) };
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...payload } });
    else createMutation.mutate(payload);
  }

  const filtered = data.filter(f =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cargo.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'nome', header: 'Nome' },
    {
      key: 'cargo', header: 'Cargo',
      render: (row: Funcionario) => <Badge color="indigo">{row.cargo}</Badge>,
    },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    {
      key: 'salario', header: 'Salário',
      render: (row: Funcionario) => (
        <span className="text-(--c-green) font-medium">R$ {Number(row.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'ativo', header: 'Status',
      render: (row: Funcionario) => <Badge color={row.ativo ? 'green' : 'red'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Funcionario) => (
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
      title="Funcionários"
      subtitle={`${data.filter(f => f.ativo).length} ativos de ${data.length} total`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Funcionário</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar funcionário..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} noPagination
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhum funcionário encontrado para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={UserCheck} title="Nenhum funcionário cadastrado" description="Cadastre o primeiro funcionário para começar." action={{ label: 'Adicionar funcionário', onClick: openCreate }} />
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Funcionário' : 'Novo Funcionário'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" placeholder="Nome completo" {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} isValid={!!dirtyFields.nome && !errors.nome} />
          <Input label="CPF" placeholder="000.000.000-00" {...register('cpf', { required: 'Obrigatório' })} error={errors.cpf?.message} isValid={!!dirtyFields.cpf && !errors.cpf} />
          <Input label="E-mail" type="email" placeholder="email@loja.com" {...register('email', { required: 'Obrigatório' })} error={errors.email?.message} isValid={!!dirtyFields.email && !errors.email} />
          <Input label="Telefone" placeholder="(11) 99999-9999" {...register('telefone')} />
          <Select label="Cargo" {...register('cargo', { required: 'Obrigatório' })} error={errors.cargo?.message}>
            <option value="">Selecione...</option>
            {cargos.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Salário (R$)" type="number" step="0.01" placeholder="2500.00" {...register('salario', { required: 'Obrigatório' })} error={errors.salario?.message} isValid={!!dirtyFields.salario && !errors.salario} />
          <Input label="Data de Admissão" type="date" {...register('dataAdmissao', { required: 'Obrigatório' })} error={errors.dataAdmissao?.message} isValid={!!dirtyFields.dataAdmissao && !errors.dataAdmissao} />
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

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </PageShell>
  );
}

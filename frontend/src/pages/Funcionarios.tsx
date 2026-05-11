import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { funcionariosService } from '../services/funcionarios';
import type { Funcionario } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

type FormData = Omit<Funcionario, 'id' | 'criadoEm'>;

const cargos = ['Gerente', 'Vendedor', 'Caixa', 'Estoquista', 'Costureiro', 'Designer', 'Auxiliar'];

export default function Funcionarios() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Funcionario | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: funcionariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Funcionario }) => funcionariosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: funcionariosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funcionarios'] }); setDeleteId(null); },
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
        <span className="text-green-400 font-medium">R$ {Number(row.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'ativo', header: 'Status',
      render: (row: Funcionario) => <Badge color={row.ativo ? 'green' : 'red'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '100px',
      render: (row: Funcionario) => (
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
          <h2 className="text-lg font-semibold text-white">Funcionários</h2>
          <p className="text-xs text-[#666] mt-0.5">{data.filter(f => f.ativo).length} ativos de {data.length} total</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Funcionário</Button>
      </div>

      <div className="relative w-72">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar funcionário..."
          className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-[#ccc] placeholder-[#444] outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" loading={isLoading} />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Funcionário' : 'Novo Funcionário'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Input label="Nome" placeholder="Nome completo" {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} />
          <Input label="CPF" placeholder="000.000.000-00" {...register('cpf', { required: 'Obrigatório' })} error={errors.cpf?.message} />
          <Input label="E-mail" type="email" placeholder="email@loja.com" {...register('email', { required: 'Obrigatório' })} error={errors.email?.message} />
          <Input label="Telefone" placeholder="(11) 99999-9999" {...register('telefone')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Cargo</label>
            <select
              {...register('cargo', { required: 'Obrigatório' })}
              className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="">Selecione...</option>
              {cargos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Salário (R$)" type="number" step="0.01" placeholder="2500.00" {...register('salario', { required: 'Obrigatório' })} error={errors.salario?.message} />
          <Input label="Data de Admissão" type="date" {...register('dataAdmissao', { required: 'Obrigatório' })} error={errors.dataAdmissao?.message} />
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

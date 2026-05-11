import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { categoriasService } from '../services/categorias';
import type { Categoria } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

type FormData = { nome: string; descricao: string; ativa: boolean };

export default function Categorias() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Categoria | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: categoriasService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Categoria }) => categoriasService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); setDeleteId(null); },
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
      render: (row: Categoria) => <span className="text-[#666]">{new Date(row.criadoEm).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'ativa', header: 'Status',
      render: (row: Categoria) => <Badge color={row.ativa ? 'green' : 'red'}>{row.ativa ? 'Ativa' : 'Inativa'}</Badge>,
    },
    {
      key: 'acoes', header: 'Ações', width: '100px',
      render: (row: Categoria) => (
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
          <h2 className="text-lg font-semibold text-white">Categorias</h2>
          <p className="text-xs text-[#666] mt-0.5">{data.filter(c => c.ativa).length} ativas de {data.length} total</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Nova Categoria</Button>
      </div>

      <div className="relative w-72">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-[#ccc] placeholder-[#444] outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" loading={isLoading} />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Categoria' : 'Nova Categoria'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" placeholder="Ex: Camisetas, Vestidos..." {...register('nome', { required: 'Obrigatório' })} error={errors.nome?.message} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Descrição</label>
            <textarea
              {...register('descricao')}
              placeholder="Descrição da categoria..."
              rows={3}
              className="px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#444] outline-none focus:border-indigo-600 transition-colors resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Status</label>
            <select {...register('ativa')} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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

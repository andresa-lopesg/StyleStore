import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { pedidosService } from '../services/pedidos';
import { clientesService } from '../services/clientes';
import { funcionariosService } from '../services/funcionarios';
import type { Pedido, StatusPedido } from '../types';
import { StatusPedidoLabel } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';

type FormData = {
  clienteId: number; funcionarioId: number; total: number; desconto: number;
  status: StatusPedido; observacao: string; enderecoEntrega: string; dataEntregaPrevista: string;
};

const statusColors: Record<number, 'yellow' | 'blue' | 'purple' | 'indigo' | 'gray' | 'green' | 'red'> = {
  0: 'yellow', 1: 'blue', 2: 'purple', 3: 'indigo', 4: 'gray', 5: 'green', 6: 'red',
};

export default function Pedidos() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Pedido | null>(null);
  const [viewPedido, setViewPedido] = useState<Pedido | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });
  const { data: funcionarios = [] } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: pedidosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Pedido }) => pedidosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: pedidosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); setDeleteId(null); },
  });

  function openCreate() {
    setEditing(null);
    reset({ clienteId: 0, funcionarioId: 0, total: 0, desconto: 0, status: 0, observacao: '', enderecoEntrega: '', dataEntregaPrevista: '' });
    setModalOpen(true);
  }

  function openEdit(p: Pedido) {
    setEditing(p);
    reset({ clienteId: p.clienteId, funcionarioId: p.funcionarioId ?? 0, total: p.total, desconto: p.desconto, status: p.status, observacao: p.observacao ?? '', enderecoEntrega: p.enderecoEntrega ?? '', dataEntregaPrevista: p.dataEntregaPrevista ? p.dataEntregaPrevista.split('T')[0] : '' });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset(); }

  function onSubmit(formData: FormData) {
    const payload = {
      ...formData,
      clienteId: Number(formData.clienteId), funcionarioId: Number(formData.funcionarioId) || undefined,
      total: Number(formData.total), desconto: Number(formData.desconto),
      status: Number(formData.status) as StatusPedido,
      dataPedido: editing?.dataPedido ?? new Date().toISOString(),
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...payload } });
    else createMutation.mutate(payload);
  }

  const filtered = data.filter(p =>
    String(p.id).includes(search) ||
    (p.cliente?.nome ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id', header: 'Pedido',
      render: (row: Pedido) => <span className="font-mono text-indigo-400 font-medium">#{String(row.id).padStart(4, '0')}</span>,
    },
    {
      key: 'cliente', header: 'Cliente',
      render: (row: Pedido) => <span className="text-white">{row.cliente?.nome ?? `#${row.clienteId}`}</span>,
    },
    {
      key: 'dataPedido', header: 'Data',
      render: (row: Pedido) => <span className="text-[#666]">{new Date(row.dataPedido).toLocaleDateString('pt-BR')}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (row: Pedido) => <Badge color={statusColors[row.status]}>{StatusPedidoLabel[row.status]}</Badge>,
    },
    {
      key: 'total', header: 'Total',
      render: (row: Pedido) => <span className="text-green-400 font-medium">R$ {Number(row.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'acoes', header: 'Ações', width: '120px',
      render: (row: Pedido) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" icon={<Eye size={12} />} onClick={() => setViewPedido(row)} />
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
          <h2 className="text-lg font-semibold text-white">Pedidos</h2>
          <p className="text-xs text-[#666] mt-0.5">
            {data.filter(p => p.status === 0).length} pendentes · {data.length} total
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Pedido</Button>
      </div>

      <div className="relative w-72">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por ID ou cliente..."
          className="w-full h-9 pl-8 pr-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-[#ccc] placeholder-[#444] outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      <Table columns={columns} data={filtered} keyField="id" loading={isLoading} />

      {/* Visualizar pedido */}
      <Modal open={viewPedido !== null} onClose={() => setViewPedido(null)} title={`Pedido #${String(viewPedido?.id ?? '').padStart(4, '0')}`} size="lg">
        {viewPedido && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#161616] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase">Cliente</p>
                <p className="text-sm text-white mt-0.5">{viewPedido.cliente?.nome ?? `#${viewPedido.clienteId}`}</p>
              </div>
              <div className="bg-[#161616] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase">Status</p>
                <div className="mt-0.5"><Badge color={statusColors[viewPedido.status]}>{StatusPedidoLabel[viewPedido.status]}</Badge></div>
              </div>
              <div className="bg-[#161616] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase">Total</p>
                <p className="text-sm text-green-400 font-medium mt-0.5">R$ {Number(viewPedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-[#161616] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase">Data</p>
                <p className="text-sm text-white mt-0.5">{new Date(viewPedido.dataPedido).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {viewPedido.observacao && (
              <div className="bg-[#161616] rounded-lg p-3">
                <p className="text-[10px] text-[#555] uppercase mb-1">Observação</p>
                <p className="text-sm text-[#ccc]">{viewPedido.observacao}</p>
              </div>
            )}
            {viewPedido.itens && viewPedido.itens.length > 0 && (
              <div>
                <p className="text-xs text-[#555] uppercase mb-2">Itens</p>
                <div className="flex flex-col gap-2">
                  {viewPedido.itens.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-[#161616] rounded-lg p-3">
                      <div>
                        <p className="text-sm text-white">{item.produto?.nome ?? `Produto #${item.produtoId}`}</p>
                        {item.tamanho && <p className="text-[10px] text-[#555]">Tam: {item.tamanho} {item.cor && `· Cor: ${item.cor}`}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">{item.quantidade}x</p>
                        <p className="text-xs text-green-400">R$ {Number(item.precoUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Pedido' : 'Novo Pedido'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Cliente *</label>
            <select {...register('clienteId', { required: 'Obrigatório' })} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {errors.clienteId && <span className="text-xs text-red-400">{errors.clienteId.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Funcionário</label>
            <select {...register('funcionarioId')} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              <option value="">Nenhum</option>
              {funcionarios.filter(f => f.ativo).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <Input label="Total (R$)" type="number" step="0.01" placeholder="0.00" {...register('total', { required: 'Obrigatório' })} error={errors.total?.message} />
          <Input label="Desconto (R$)" type="number" step="0.01" placeholder="0.00" {...register('desconto')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Status</label>
            <select {...register('status')} className="h-9 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-indigo-600 transition-colors">
              {Object.entries(StatusPedidoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <Input label="Entrega Prevista" type="date" {...register('dataEntregaPrevista')} />
          <div className="col-span-2">
            <Input label="Endereço de Entrega" placeholder="Rua, número, bairro..." {...register('enderecoEntrega')} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#888]">Observação</label>
            <textarea {...register('observacao')} placeholder="Observações do pedido..." rows={2} className="px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#444] outline-none focus:border-indigo-600 transition-colors resize-none" />
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

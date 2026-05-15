import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, ChevronRight, ChevronLeft, MoreVertical, ShoppingBag, SearchX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { pedidosService } from '../services/pedidos';
import { clientesService } from '../services/clientes';
import { funcionariosService } from '../services/funcionarios';
import { produtosService } from '../services/produtos';
import type { Pedido, StatusPedido } from '../types';
import { useToast } from '../context/ToastContext';
import { StatusPedidoLabel } from '../types';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DropdownMenu from '../components/ui/DropdownMenu';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';

type ItemForm = { produtoId: number; quantidade: number; precoUnitario: number };

type FormData = {
  clienteId: number; funcionarioId: number; desconto: number;
  status: StatusPedido; observacao: string; enderecoEntrega: string; dataEntregaPrevista: string;
};

const statusColors: Record<number, 'yellow' | 'blue' | 'purple' | 'indigo' | 'gray' | 'green' | 'red'> = {
  0: 'yellow', 1: 'blue', 2: 'purple', 3: 'indigo', 4: 'gray', 5: 'green', 6: 'red',
};

export default function Pedidos() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Pedido | null>(null);
  const [viewPedido, setViewPedido] = useState<Pedido | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [itensError, setItensError] = useState('');

  const { data = [], isLoading } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });
  const { data: funcionarios = [] } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { register, handleSubmit, reset, trigger, watch, formState: { errors } } = useForm<FormData>({ mode: 'onBlur', reValidateMode: 'onChange' });

  const desconto = Number(watch('desconto') || 0);
  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0);
  const totalCalculado = Math.max(0, subtotal - desconto);

  const createMutation = useMutation({
    mutationFn: pedidosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); closeModal(); toast('Pedido criado com sucesso'); },
    onError: () => toast('Erro ao criar pedido. Tente novamente.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Pedido }) => pedidosService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); closeModal(); toast('Pedido atualizado com sucesso'); },
    onError: () => toast('Erro ao atualizar pedido. Tente novamente.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: pedidosService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); setDeleteId(null); toast('Pedido excluído com sucesso'); },
    onError: () => toast('Erro ao excluir pedido. Tente novamente.', 'error'),
  });

  function openCreate() {
    setEditing(null);
    setStep(1);
    setItens([]);
    setItensError('');
    reset({ clienteId: 0, funcionarioId: 0, desconto: 0, status: 0, observacao: '', enderecoEntrega: '', dataEntregaPrevista: '' });
    setModalOpen(true);
  }

  function openEdit(p: Pedido) {
    setEditing(p);
    setStep(1);
    setItens(p.itens?.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario })) ?? []);
    setItensError('');
    reset({ clienteId: p.clienteId, funcionarioId: p.funcionarioId ?? 0, desconto: p.desconto, status: p.status, observacao: p.observacao ?? '', enderecoEntrega: p.enderecoEntrega ?? '', dataEntregaPrevista: p.dataEntregaPrevista ? p.dataEntregaPrevista.split('T')[0] : '' });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); setStep(1); setItens([]); setItensError(''); reset(); }

  async function goToStep2() {
    const valid = await trigger(['clienteId']);
    if (valid) { setStep(2); setItensError(''); }
  }

  function addItem() {
    setItens(prev => [...prev, { produtoId: 0, quantidade: 1, precoUnitario: 0 }]);
  }

  function removeItem(index: number) {
    setItens(prev => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemForm, value: number) {
    setItens(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'produtoId') {
        const produto = produtos.find(p => p.id === value);
        if (produto) updated.precoUnitario = produto.preco;
      }
      return updated;
    }));
  }

  function onSubmit(formData: FormData) {
    if (itens.length === 0) { setItensError('Adicione pelo menos 1 item ao pedido'); return; }
    if (itens.some(i => i.produtoId === 0)) { setItensError('Selecione o produto de cada item'); return; }
    if (itens.some(i => i.quantidade < 1)) { setItensError('Quantidade mínima é 1'); return; }
    if (itens.some(i => i.precoUnitario <= 0)) { setItensError('Preço unitário não pode ser zero'); return; }

    const itensMapped = itens.map(i => ({
      produtoId: Number(i.produtoId),
      quantidade: Number(i.quantidade),
      precoUnitario: Number(i.precoUnitario),
    }));

    const base = {
      clienteId: Number(formData.clienteId),
      funcionarioId: Number(formData.funcionarioId) || undefined,
      desconto: Number(formData.desconto),
      status: Number(formData.status) as StatusPedido,
      observacao: formData.observacao,
      enderecoEntrega: formData.enderecoEntrega,
      dataEntregaPrevista: formData.dataEntregaPrevista,
      dataPedido: editing?.dataPedido ?? new Date().toISOString(),
      total: totalCalculado,
      itens: itensMapped,
    };

    if (editing) updateMutation.mutate({ id: editing.id, data: { ...editing, ...base } as Pedido });
    else createMutation.mutate(base);
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
      render: (row: Pedido) => <span className="text-(--text-muted)">{new Date(row.dataPedido).toLocaleDateString('pt-BR')}</span>,
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
      key: 'acoes', header: 'Ações', width: '60px',
      render: (row: Pedido) => (
        <DropdownMenu
          trigger={<Button size="sm" variant="ghost" icon={<MoreVertical size={14} />} ariaLabel="Ações" />}
          items={[
            { label: 'Visualizar', icon: <Eye size={13} />, onClick: () => setViewPedido(row) },
            { label: 'Editar', icon: <Pencil size={13} />, onClick: () => openEdit(row) },
            { label: 'Excluir', icon: <Trash2 size={13} />, onClick: () => setDeleteId(row.id), variant: 'danger' },
          ]}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Pedidos"
      subtitle={`${data.filter(p => p.status === 0).length} pendentes · ${data.length} total`}
      action={<Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Novo Pedido</Button>}
    >

      <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por ID ou cliente..." />

      <Table
        columns={columns} data={filtered} keyField="id" loading={isLoading} pageSize={20}
        emptyState={search
          ? <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={`Nenhum pedido encontrado para "${search}".`} action={{ label: 'Limpar busca', onClick: () => setSearch('') }} />
          : <EmptyState icon={ShoppingBag} title="Nenhum pedido registrado" description="Registre o primeiro pedido para começar." action={{ label: 'Criar pedido', onClick: openCreate }} />
        }
      />

      {/* Visualizar pedido */}
      <Modal open={viewPedido !== null} onClose={() => setViewPedido(null)} title={`Pedido #${String(viewPedido?.id ?? '').padStart(4, '0')}`} size="lg">
        {viewPedido && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-(--bg-elevated) rounded-lg p-3">
                <p className="text-xs text-(--text-muted) uppercase">Cliente</p>
                <p className="text-sm text-white mt-0.5">{viewPedido.cliente?.nome ?? `#${viewPedido.clienteId}`}</p>
              </div>
              <div className="bg-(--bg-elevated) rounded-lg p-3">
                <p className="text-xs text-(--text-muted) uppercase">Status</p>
                <div className="mt-0.5"><Badge color={statusColors[viewPedido.status]}>{StatusPedidoLabel[viewPedido.status]}</Badge></div>
              </div>
              <div className="bg-(--bg-elevated) rounded-lg p-3">
                <p className="text-xs text-(--text-muted) uppercase">Total</p>
                <p className="text-sm text-green-400 font-medium mt-0.5">R$ {Number(viewPedido.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-(--bg-elevated) rounded-lg p-3">
                <p className="text-xs text-(--text-muted) uppercase">Data</p>
                <p className="text-sm text-white mt-0.5">{new Date(viewPedido.dataPedido).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {viewPedido.observacao && (
              <div className="bg-(--bg-elevated) rounded-lg p-3">
                <p className="text-xs text-(--text-muted) uppercase mb-1">Observação</p>
                <p className="text-sm text-(--text-secondary)">{viewPedido.observacao}</p>
              </div>
            )}
            {viewPedido.itens && viewPedido.itens.length > 0 && (
              <div>
                <p className="text-xs text-(--text-muted) uppercase mb-2">Itens</p>
                <div className="flex flex-col gap-2">
                  {viewPedido.itens.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-(--bg-elevated) rounded-lg p-3">
                      <div>
                        <p className="text-sm text-white">{item.produto?.nome ?? `Produto #${item.produtoId}`}</p>
                        {item.tamanho && <p className="text-xs text-(--text-muted)">Tam: {item.tamanho} {item.cor && `· Cor: ${item.cor}`}</p>}
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
        {/* Stepper header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-(--text-muted)'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-(--bg-hover) text-(--text-muted)'}`}>1</span>
            <span className="text-sm font-medium">Dados do Pedido</span>
          </div>
          <div className="flex-1 h-px bg-(--border)" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-(--text-muted)'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-(--bg-hover) text-(--text-muted)'}`}>2</span>
            <span className="text-sm font-medium">Itens</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1 — Dados do Pedido */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Cliente *" {...register('clienteId', { required: 'Obrigatório' })} error={errors.clienteId?.message}>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
              <Select label="Funcionário" {...register('funcionarioId')}>
                <option value="">Nenhum</option>
                {funcionarios.filter(f => f.ativo).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </Select>
              <Input label="Desconto (R$)" type="number" step="0.01" placeholder="0.00" {...register('desconto')} />
              <Select label="Status" {...register('status')}>
                {Object.entries(StatusPedidoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Input label="Entrega Prevista" type="date" {...register('dataEntregaPrevista')} />
              <div className="col-span-2">
                <Input label="Endereço de Entrega" placeholder="Rua, número, bairro..." {...register('enderecoEntrega')} />
              </div>
              <div className="col-span-2">
                <Textarea label="Observação" placeholder="Observações do pedido..." rows={2} {...register('observacao')} />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-(--border)">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="button" variant="primary" icon={<ChevronRight size={14} />} onClick={goToStep2}>Próximo</Button>
              </div>
            </div>
          )}

          {/* Step 2 — Itens */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {itens.length === 0 ? (
                <div className="text-center py-8 text-(--text-muted) text-sm bg-(--bg-elevated) rounded-lg">
                  Nenhum item adicionado ainda
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {itens.map((item, index) => (
                    <div key={index} className="grid gap-2 items-end" style={{ gridTemplateColumns: '1fr 72px 100px 32px' }}>
                      <div>
                        <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">Produto</label>
                        <select
                          value={item.produtoId}
                          onChange={e => updateItem(index, 'produtoId', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-primary) outline-none focus:border-(--accent) transition-colors"
                        >
                          <option value={0}>Selecione...</option>
                          {produtos.filter(p => p.ativo).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">Qtd</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={e => updateItem(index, 'quantidade', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-primary) outline-none focus:border-(--accent) transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-(--text-secondary) block mb-1.5">Preço (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min={0.01}
                          value={item.precoUnitario}
                          onChange={e => updateItem(index, 'precoUnitario', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-primary) outline-none focus:border-(--accent) transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="h-9 w-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="secondary" icon={<Plus size={14} />} onClick={addItem}>
                Adicionar Item
              </Button>

              {itensError && <p className="text-xs text-red-400">{itensError}</p>}

              {itens.length > 0 && (
                <div className="bg-(--bg-elevated) rounded-lg p-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-(--text-muted)">Subtotal</span>
                    <span className="text-white">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-muted)">Desconto</span>
                    <span className="text-red-400">- R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-(--border) pt-1.5 font-medium">
                    <span className="text-white">Total</span>
                    <span className="text-green-400">R$ {totalCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2 border-t border-(--border)">
                <Button type="button" variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setStep(1)}>Voltar</Button>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                  <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
                    {editing ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </PageShell>
  );
}

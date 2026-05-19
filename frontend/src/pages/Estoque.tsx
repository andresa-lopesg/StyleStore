import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Package, PackagePlus, TrendingDown, CheckCircle, Boxes, History, ArrowDownCircle, ArrowUpCircle, MinusCircle, RotateCcw } from 'lucide-react';
import { produtosService } from '../services/produtos';
import { categoriasService } from '../services/categorias';
import Badge from '../components/ui/Badge';
import Surface from '../components/ui/Surface';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import type { Produto } from '../types';
import { TipoMovimentacaoLabel } from '../types';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

type AjusteFormData = { tipo: '0' | '1'; quantidade: number; motivo: string };

function AjusteEstoqueForm({
  produto,
  onSubmit,
  onCancel,
  loading,
}: {
  produto: Produto;
  onSubmit: (data: { tipo: 0 | 1; quantidade: number; motivo?: string }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AjusteFormData>({
    mode: 'onBlur',
    defaultValues: { tipo: '0', quantidade: 1, motivo: '' },
  });

  const tipo = watch('tipo');

  function submit(data: AjusteFormData) {
    onSubmit({
      tipo: Number(data.tipo) as 0 | 1,
      quantidade: Number(data.quantidade),
      motivo: data.motivo || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 p-3 bg-(--bg-elevated) rounded-lg">
        <Package size={16} className="text-(--text-muted) shrink-0" />
        <div>
          <p className="text-sm font-medium text-(--text-primary)">{produto.nome}</p>
          <p className="text-xs text-(--text-muted)">Estoque atual: {produto.estoqueTotal} un</p>
        </div>
      </div>

      <Select label="Tipo de movimentação" {...register('tipo')}>
        <option value="0">Entrada — aumentar estoque</option>
        <option value="1">Saída — diminuir estoque</option>
      </Select>

      <Input
        label="Quantidade"
        type="number"
        min={1}
        max={tipo === '1' ? produto.estoqueTotal : undefined}
        placeholder="0"
        {...register('quantidade', {
          required: 'Obrigatório',
          min: { value: 1, message: 'Mínimo 1 unidade' },
          validate: (val) =>
            tipo === '1' && Number(val) > produto.estoqueTotal
              ? `Máximo ${produto.estoqueTotal} un (estoque atual)`
              : true,
        })}
        error={errors.quantidade?.message}
      />

      <Input
        label="Motivo (opcional)"
        placeholder="Ex: recebimento de mercadoria, correção de inventário..."
        {...register('motivo')}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-(--border)">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={loading}>Confirmar</Button>
      </div>
    </form>
  );
}

const tipoIcon: Record<number, React.ReactNode> = {
  0: <ArrowUpCircle size={14} className="text-(--c-green)" />,
  1: <ArrowDownCircle size={14} className="text-(--c-red)" />,
  2: <MinusCircle size={14} className="text-(--c-yellow)" />,
  3: <RotateCcw size={14} className="text-(--c-indigo)" />,
};

export default function Estoque() {
  const [historicoProduto, setHistoricoProduto] = useState<Produto | null>(null);
  const [ajustandoProduto, setAjustandoProduto] = useState<Produto | null>(null);
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<'sem' | 'baixo' | 'ok' | null>(null);

  const { toast } = useToast();
  const qc = useQueryClient();

  const ajusteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { tipo: 0 | 1; quantidade: number; motivo?: string } }) =>
      produtosService.ajustarEstoque(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
      qc.invalidateQueries({ queryKey: ['estoque-historico', vars.id] });
      setAjustandoProduto(null);
      toast('Estoque atualizado com sucesso');
    },
    onError: () => toast('Erro ao ajustar estoque. Verifique a quantidade.', 'error'),
  });

  const { data: produtos = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });
  const { data: historico = [], isLoading: isLoadingHistorico } = useQuery({
    queryKey: ['estoque-historico', historicoProduto?.id],
    queryFn: () => produtosService.getHistoricoEstoque(historicoProduto!.id),
    enabled: historicoProduto !== null,
  });

  const max = Math.max(...produtos.map(p => p.estoqueTotal), 1);

  const semEstoque = produtos.filter(p => p.estoqueTotal === 0);
  const estoqueBaixo = produtos.filter(p => p.estoqueTotal > 0 && (p.estoqueTotal / max) * 100 <= 50);
  const estoqueOk = produtos.filter(p => (p.estoqueTotal / max) * 100 > 50);

  const produtosFiltrados = produtos
    .filter(p => catFilter === null || p.categoriaId === catFilter)
    .filter(p => {
      if (stockFilter === 'sem') return p.estoqueTotal === 0;
      if (stockFilter === 'baixo') return p.estoqueTotal > 0 && (p.estoqueTotal / max) * 100 <= 50;
      if (stockFilter === 'ok') return (p.estoqueTotal / max) * 100 > 50;
      return true;
    });

  function getStockColor(qtd: number): 'red' | 'yellow' | 'green' {
    if (qtd === 0) return 'red';
    if (qtd < 10) return 'yellow';
    return 'green';
  }

  const columns = [
    {
      key: 'nome', header: 'Produto',
      render: (row: Produto) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-(--bg-hover) border border-(--border-input) flex items-center justify-center">
            <Package size={13} className="text-(--text-muted)" />
          </div>
          <div>
            <p className="text-(--text-primary) text-sm font-medium">{row.nome}</p>
            {row.referencia && <p className="text-xs text-(--text-muted)">{row.referencia}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria', header: 'Categoria',
      render: (row: Produto) => row.categoria ? <Badge color="indigo">{row.categoria.nome}</Badge> : <span className="text-(--text-muted)">—</span>,
    },
    {
      key: 'estoqueTotal', header: 'Estoque',
      render: (row: Produto) => (
        <div className="flex items-center gap-2">
          <Badge color={getStockColor(row.estoqueTotal)}>
            {row.estoqueTotal === 0 ? 'Sem estoque' : `${row.estoqueTotal} un`}
          </Badge>
          {row.estoqueTotal > 0 && row.estoqueTotal < 10 && <AlertTriangle size={13} className="text-(--c-yellow)" />}
        </div>
      ),
    },
    {
      key: 'barra', header: 'Nível',
      render: (row: Produto) => {
        const pct = (row.estoqueTotal / max) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-(--bg-hover) rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${row.estoqueTotal === 0 ? 'bg-red-500' : row.estoqueTotal < 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-(--text-muted)">{Math.round(pct)}%</span>
          </div>
        );
      },
    },
    {
      key: 'preco', header: 'Preço Venda',
      render: (row: Produto) => <span className="text-(--c-green)">R$ {Number(row.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'historico', header: '', width: '80px',
      render: (row: Produto) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={<PackagePlus size={14} />} ariaLabel="Ajustar estoque" onClick={() => setAjustandoProduto(row)} />
          <Button size="sm" variant="ghost" icon={<History size={14} />} ariaLabel="Ver histórico" onClick={() => setHistoricoProduto(row)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell title="Estoque" subtitle={(catFilter !== null || stockFilter !== null) ? `${produtosFiltrados.length} de ${produtos.length} produtos` : `${produtos.length} produtos`}>
      {/* KPIs de estoque */}
      <div className="grid grid-cols-3 gap-4">
        <Surface
          padding="sm"
          className={`cursor-pointer transition-all ${stockFilter === 'sem' ? 'ring-2 ring-(--accent)' : 'hover:ring-1 hover:ring-(--border-input)'}`}
        >
          <button
            onClick={() => setStockFilter(prev => prev === 'sem' ? null : 'sem')}
            className="w-full flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
              <TrendingDown size={18} className="text-(--c-red)" />
            </div>
            <div className="text-left">
              <p className="text-xl font-semibold text-(--text-primary)">{semEstoque.length}</p>
              <p className="text-xs text-(--text-muted)">Sem estoque</p>
            </div>
          </button>
        </Surface>
        <Surface
          padding="sm"
          className={`cursor-pointer transition-all ${stockFilter === 'baixo' ? 'ring-2 ring-(--accent)' : 'hover:ring-1 hover:ring-(--border-input)'}`}
        >
          <button
            onClick={() => setStockFilter(prev => prev === 'baixo' ? null : 'baixo')}
            className="w-full flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-(--c-yellow)" />
            </div>
            <div className="text-left">
              <p className="text-xl font-semibold text-(--text-primary)">{estoqueBaixo.length}</p>
              <p className="text-xs text-(--text-muted)">Estoque baixo</p>
            </div>
          </button>
        </Surface>
        <Surface
          padding="sm"
          className={`cursor-pointer transition-all ${stockFilter === 'ok' ? 'ring-2 ring-(--accent)' : 'hover:ring-1 hover:ring-(--border-input)'}`}
        >
          <button
            onClick={() => setStockFilter(prev => prev === 'ok' ? null : 'ok')}
            className="w-full flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-(--c-green)" />
            </div>
            <div className="text-left">
              <p className="text-xl font-semibold text-(--text-primary)">{estoqueOk.length}</p>
              <p className="text-xs text-(--text-muted)">Estoque OK</p>
            </div>
          </button>
        </Surface>
      </div>

      {/* Filtros por categoria */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-medium text-(--text-muted)">Categorias:</span>
        <button
          onClick={() => setCatFilter(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            catFilter === null
              ? 'bg-(--accent) text-white'
              : 'bg-(--bg-elevated) border border-(--border-input) text-(--text-secondary) hover:border-(--accent) hover:text-(--text-primary)'
          }`}
        >
          Todas
        </button>
        {categorias.map(cat => {
          const count = produtos.filter(p => p.categoriaId === cat.id).length;
          const isActive = catFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCatFilter(isActive ? null : cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-(--accent) text-white'
                  : 'bg-(--bg-elevated) border border-(--border-input) text-(--text-secondary) hover:border-(--accent) hover:text-(--text-primary)'
              }`}
            >
              {cat.nome}
              <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-(--c-indigo)'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alertas críticos */}
      {(semEstoque.length > 0 || estoqueBaixo.length > 0) && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-(--c-yellow)" />
            <p className="text-sm font-medium text-(--c-yellow)">Atenção necessária</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...semEstoque, ...estoqueBaixo].slice(0, 6).map(p => (
              <span key={p.id} className="px-2 py-0.5 rounded bg-yellow-500/10 text-xs text-(--c-yellow)">{p.nome}</span>
            ))}
            {(semEstoque.length + estoqueBaixo.length) > 6 && (
              <span className="text-xs text-(--text-muted)">+{(semEstoque.length + estoqueBaixo.length) - 6} mais</span>
            )}
          </div>
        </div>
      )}

      <Table
        columns={columns} data={produtosFiltrados} keyField="id" loading={isLoading} noPagination
        emptyState={<EmptyState icon={Boxes} title="Nenhum produto no estoque" description="Nenhum produto foi cadastrado ainda." />}
      />

      <Modal
        open={historicoProduto !== null}
        onClose={() => setHistoricoProduto(null)}
        title={`Histórico de Estoque — ${historicoProduto?.nome ?? ''}`}
        size="lg"
      >
        {isLoadingHistorico ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-12 shimmer rounded-lg" />)}
          </div>
        ) : historico.length === 0 ? (
          <div className="text-center py-8 text-(--text-muted) text-sm">Nenhuma movimentação registrada.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {historico.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-(--bg-elevated) rounded-lg p-3">
                <div className="shrink-0">{tipoIcon[m.tipo]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--text-primary) font-medium">{TipoMovimentacaoLabel[m.tipo]}</p>
                  {m.motivo && <p className="text-xs text-(--text-muted) truncate">{m.motivo}</p>}
                  {m.variante && <p className="text-xs text-(--text-muted)">{m.variante.tamanho} · {m.variante.cor}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-(--text-primary)">{m.tipo === 0 || m.tipo === 3 ? '+' : '-'}{m.quantidade} un</p>
                  <p className="text-xs text-(--text-muted)">{m.estoqueAnterior} → {m.estoqueAtual}</p>
                </div>
                <p className="text-xs text-(--text-muted) shrink-0 w-24 text-right">
                  {new Date(m.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <Modal
        open={ajustandoProduto !== null}
        onClose={() => setAjustandoProduto(null)}
        title="Ajustar Estoque"
        size="sm"
      >
        {ajustandoProduto && (
          <AjusteEstoqueForm
            produto={ajustandoProduto}
            onSubmit={(data) => ajusteMutation.mutate({ id: ajustandoProduto.id, data })}
            onCancel={() => setAjustandoProduto(null)}
            loading={ajusteMutation.isPending}
          />
        )}
      </Modal>
    </PageShell>
  );
}

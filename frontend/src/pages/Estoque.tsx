import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, TrendingDown, CheckCircle } from 'lucide-react';
import { produtosService } from '../services/produtos';
import { categoriasService } from '../services/categorias';
import Badge from '../components/ui/Badge';
import PageShell from '../components/layout/PageShell';
import Table from '../components/ui/Table';
import type { Produto } from '../types';

export default function Estoque() {
  const { data: produtos = [], isLoading } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriasService.getAll });

  const semEstoque = produtos.filter(p => p.estoqueTotal === 0);
  const estoqueBaixo = produtos.filter(p => p.estoqueTotal > 0 && p.estoqueTotal < 10);
  const estoqueOk = produtos.filter(p => p.estoqueTotal >= 10);

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
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <Package size={13} className="text-[#555]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{row.nome}</p>
            {row.referencia && <p className="text-[10px] text-[#555]">{row.referencia}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria', header: 'Categoria',
      render: (row: Produto) => row.categoria ? <Badge color="indigo">{row.categoria.nome}</Badge> : <span className="text-[#555]">—</span>,
    },
    {
      key: 'estoqueTotal', header: 'Estoque',
      render: (row: Produto) => (
        <div className="flex items-center gap-2">
          <Badge color={getStockColor(row.estoqueTotal)}>
            {row.estoqueTotal === 0 ? 'Sem estoque' : `${row.estoqueTotal} un`}
          </Badge>
          {row.estoqueTotal < 10 && row.estoqueTotal > 0 && <AlertTriangle size={13} className="text-yellow-400" />}
        </div>
      ),
    },
    {
      key: 'barra', header: 'Nível',
      render: (row: Produto) => {
        const max = Math.max(...produtos.map(p => p.estoqueTotal), 1);
        const pct = (row.estoqueTotal / max) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${row.estoqueTotal === 0 ? 'bg-red-500' : row.estoqueTotal < 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-[#555]">{Math.round(pct)}%</span>
          </div>
        );
      },
    },
    {
      key: 'preco', header: 'Preço Venda',
      render: (row: Produto) => <span className="text-green-400">R$ {Number(row.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>,
    },
  ];

  return (
    <PageShell title="Estoque" subtitle={`${produtos.length} produtos`}>
      {/* KPIs de estoque */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{semEstoque.length}</p>
            <p className="text-xs text-[#666]">Sem estoque</p>
          </div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{estoqueBaixo.length}</p>
            <p className="text-xs text-[#666]">Estoque baixo (&lt;10)</p>
          </div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{estoqueOk.length}</p>
            <p className="text-xs text-[#666]">Estoque OK</p>
          </div>
        </div>
      </div>

      {/* Filtros por categoria */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-medium text-white">Categorias:</span>
        {categorias.map(cat => {
          const count = produtos.filter(p => p.categoriaId === cat.id).length;
          return (
            <span key={cat.id} className="px-2.5 py-1 rounded-lg bg-[#161616] border border-[#2a2a2a] text-xs text-[#888]">
              {cat.nome} <span className="text-indigo-400 ml-1">{count}</span>
            </span>
          );
        })}
      </div>

      {/* Alertas críticos */}
      {(semEstoque.length > 0 || estoqueBaixo.length > 0) && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-yellow-400" />
            <p className="text-sm font-medium text-yellow-400">Atenção necessária</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...semEstoque, ...estoqueBaixo].slice(0, 6).map(p => (
              <span key={p.id} className="px-2 py-0.5 rounded bg-yellow-500/10 text-xs text-yellow-400">{p.nome}</span>
            ))}
            {(semEstoque.length + estoqueBaixo.length) > 6 && (
              <span className="text-xs text-[#666]">+{(semEstoque.length + estoqueBaixo.length) - 6} mais</span>
            )}
          </div>
        </div>
      )}

      <Table columns={columns} data={produtos} keyField="id" loading={isLoading} emptyMessage="Nenhum produto cadastrado." />
    </PageShell>
  );
}

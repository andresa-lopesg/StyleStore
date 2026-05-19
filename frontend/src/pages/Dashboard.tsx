import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShoppingCart, Users, Package, TrendingUp, Factory, UserCheck } from 'lucide-react';
import { clientesService } from '../services/clientes';
import { produtosService } from '../services/produtos';
import { pedidosService } from '../services/pedidos';
import { funcionariosService } from '../services/funcionarios';
import { producaoService } from '../services/producao';
import { StatusPedidoLabel } from '../types';
import Surface from '../components/ui/Surface';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';

const vendasMock = [
  { mes: 'Jan', valor: 4200 }, { mes: 'Fev', valor: 5800 }, { mes: 'Mar', valor: 4900 },
  { mes: 'Abr', valor: 7200 }, { mes: 'Mai', valor: 6100 }, { mes: 'Jun', valor: 8400 },
  { mes: 'Jul', valor: 7900 }, { mes: 'Ago', valor: 9200 }, { mes: 'Set', valor: 8600 },
  { mes: 'Out', valor: 10100 }, { mes: 'Nov', valor: 12400 }, { mes: 'Dez', valor: 15200 },
];

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const PERIODS: { label: string; value: 1 | 7 | 30 | 90 }[] = [
  { label: 'Hoje', value: 1 },
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '3 meses', value: 90 },
];

function calcDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function Dashboard() {
  const [period, setPeriod] = useState<1 | 7 | 30 | 90>(30);

  const q1 = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });
  const q2 = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const q3 = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const q4 = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const q5 = useQuery({ queryKey: ['producao'], queryFn: producaoService.getAll });

  const clientes = q1.data ?? [];
  const produtos = q2.data ?? [];
  const pedidos = q3.data ?? [];
  const funcionarios = q4.data ?? [];
  const producoes = q5.data ?? [];

  const isLoading = q1.isLoading || q2.isLoading || q3.isLoading || q4.isLoading || q5.isLoading;
  const isError = q1.isError || q2.isError || q3.isError || q4.isError || q5.isError;
  function refetch() { q1.refetch(); q2.refetch(); q3.refetch(); q4.refetch(); q5.refetch(); }

  // Period date ranges
  const now = new Date();
  const currentStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
  const previousStart = new Date(currentStart.getTime() - period * 24 * 60 * 60 * 1000);

  const pedidosAtuais = pedidos.filter(p => new Date(p.criadoEm) >= currentStart);
  const pedidosAnteriores = pedidos.filter(p => {
    const d = new Date(p.criadoEm);
    return d >= previousStart && d < currentStart;
  });

  const receitaAtual = pedidosAtuais.reduce((sum, p) => sum + p.total, 0);
  const receitaAnterior = pedidosAnteriores.reduce((sum, p) => sum + p.total, 0);

  const pendentesAtuais = pedidosAtuais.filter(p => p.status === 0).length;
  const pendentesAnteriores = pedidosAnteriores.filter(p => p.status === 0).length;

  const producaoAtualCount = producoes.filter(p => new Date(p.criadoEm) >= currentStart && p.status === 1).length;
  const producaoAnteriorCount = producoes.filter(p => {
    const d = new Date(p.criadoEm);
    return d >= previousStart && d < currentStart && p.status === 1;
  }).length;

  const producaoAtiva = producoes.filter(p => p.status === 1).length;

  // Sparkline data (last min(period, 14) days, chronological)
  const sparklineLength = Math.min(period, 14);

  function buildSparkline(fn: (day: Date, nextDay: Date) => number) {
    return Array.from({ length: sparklineLength }, (_, i) => {
      const day = new Date(now.getTime() - (sparklineLength - 1 - i) * 24 * 60 * 60 * 1000);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      return { v: fn(day, nextDay) };
    });
  }

  const receitaSparkData = buildSparkline((day, nextDay) =>
    pedidos
      .filter(p => { const d = new Date(p.criadoEm); return d >= day && d < nextDay; })
      .reduce((sum, p) => sum + p.total, 0)
  );

  const pedidosSparkData = buildSparkline((day, nextDay) =>
    pedidos.filter(p => { const d = new Date(p.criadoEm); return d >= day && d < nextDay; }).length
  );

  // Clientes: Cliente type has no criadoEm, so proxy via unique clienteIds in pedidos per day
  const clientesSparkData = buildSparkline((day, nextDay) => {
    const ids = new Set(
      pedidos
        .filter(p => { const d = new Date(p.criadoEm); return d >= day && d < nextDay; })
        .map(p => p.clienteId)
    );
    return ids.size;
  });

  // Chart data
  const statusPedidos = Object.entries(
    pedidos.reduce<Record<number, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: StatusPedidoLabel[Number(status)], value: count }));

  const ultimosPedidos = [...pedidos].sort((a, b) =>
    new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime()
  ).slice(0, 5);

  const statusColors: Record<number, string> = {
    0: 'text-(--c-yellow)', 1: 'text-(--c-blue)', 2: 'text-(--c-purple)',
    3: 'text-(--c-indigo)', 4: 'text-(--c-cyan)', 5: 'text-(--c-green)', 6: 'text-(--c-red)',
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-(--text-muted)">
        <p className="text-sm">Erro ao carregar dados</p>
        <Button variant="secondary" size="sm" onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Seletor de período */}
      <div className="flex items-center justify-end">
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={isLoading}
          title="Receita Total"
          value={`R$ ${receitaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><TrendingUp size={16} /></div>}
          delta={calcDelta(receitaAtual, receitaAnterior)}
          sparklineData={receitaSparkData}
        />
        <StatCard
          loading={isLoading}
          title="Pedidos"
          value={pedidosAtuais.length}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><ShoppingCart size={16} /></div>}
          delta={calcDelta(pedidosAtuais.length, pedidosAnteriores.length)}
          sparklineData={pedidosSparkData}
        />
        <StatCard
          loading={isLoading}
          title="Clientes"
          value={clientes.length}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><Users size={16} /></div>}
          sparklineData={clientesSparkData}
          subtitle="total cadastrado"
        />
        <StatCard
          loading={isLoading}
          title="Produtos"
          value={produtos.length}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><Package size={16} /></div>}
          subtitle="no catálogo"
        />
        <StatCard
          loading={isLoading}
          title="Funcionários"
          value={funcionarios.length}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><UserCheck size={16} /></div>}
          subtitle="ativos"
        />
        <StatCard
          loading={isLoading}
          title="Pedidos Pendentes"
          value={pendentesAtuais}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><ShoppingCart size={16} /></div>}
          delta={calcDelta(pendentesAtuais, pendentesAnteriores)}
        />
        <StatCard
          loading={isLoading}
          title="Em Produção"
          value={producaoAtiva}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><Factory size={16} /></div>}
          delta={calcDelta(producaoAtualCount, producaoAnteriorCount)}
        />
        <StatCard
          loading={isLoading}
          title="Estoque Baixo"
          value={produtos.filter(p => p.estoqueTotal < 10).length}
          icon={<div className="w-8 h-8 rounded-lg bg-(--bg-hover) text-(--text-muted) flex items-center justify-center"><Package size={16} /></div>}
          subtitle="produtos < 10 un"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Surface className="xl:col-span-2">
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Receita Mensal</h3>
          {isLoading ? (
            <div className="h-[220px] w-full shimmer rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={vendasMock}>
                <defs>
                  <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }}
                  formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Area type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={2} fill="url(#gradIndigo)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Surface>

        <Surface>
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Status dos Pedidos</h3>
          {isLoading ? (
            <div className="w-40 h-40 shimmer rounded-full mx-auto mt-4" />
          ) : statusPedidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPedidos} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPedidos.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-55 flex items-center justify-center text-(--text-muted) text-sm">Sem pedidos ainda</div>
          )}
        </Surface>
      </div>

      {/* Últimos pedidos + Top produtos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Surface>
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Últimos Pedidos</h3>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-(--border) last:border-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-20 shimmer rounded" />
                    <div className="h-3 w-28 shimmer rounded" />
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <div className="h-3 w-16 shimmer rounded" />
                    <div className="h-3 w-12 shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : ultimosPedidos.length === 0 ? (
            <p className="text-(--text-muted) text-sm text-center py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {ultimosPedidos.map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between py-2.5 border-b border-(--border) last:border-0">
                  <div>
                    <p className="text-xs font-medium text-(--text-primary)">Pedido #{pedido.id}</p>
                    <p className="text-xs text-(--text-muted)">{pedido.cliente?.nome ?? `Cliente #${pedido.clienteId}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-(--text-primary)">R$ {pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs ${statusColors[pedido.status]}`}>{StatusPedidoLabel[pedido.status]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>

        <Surface>
          <h3 className="text-sm font-semibold text-(--text-primary) mb-4">Estoque por Categoria</h3>
          {isLoading ? (
            <div className="h-[200px] w-full shimmer rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={produtos.slice(0, 6).map(p => ({ nome: p.nome.substring(0, 12), estoque: p.estoqueTotal }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="nome" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-input)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Bar dataKey="estoque" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Surface>
      </div>
    </div>
  );
}

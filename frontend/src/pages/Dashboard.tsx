import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ShoppingCart, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Factory, UserCheck } from 'lucide-react';
import { clientesService } from '../services/clientes';
import { produtosService } from '../services/produtos';
import { pedidosService } from '../services/pedidos';
import { funcionariosService } from '../services/funcionarios';
import { producaoService } from '../services/producao';
import { StatusPedidoLabel } from '../types';

const vendasMock = [
  { mes: 'Jan', valor: 4200 }, { mes: 'Fev', valor: 5800 }, { mes: 'Mar', valor: 4900 },
  { mes: 'Abr', valor: 7200 }, { mes: 'Mai', valor: 6100 }, { mes: 'Jun', valor: 8400 },
  { mes: 'Jul', valor: 7900 }, { mes: 'Ago', valor: 9200 }, { mes: 'Set', valor: 8600 },
  { mes: 'Out', valor: 10100 }, { mes: 'Nov', valor: 12400 }, { mes: 'Dez', valor: 15200 },
];

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function KpiCard({ title, value, icon: Icon, color, delta, deltaLabel }: {
  title: string; value: string | number; icon: React.ElementType;
  color: string; delta?: number; deltaLabel?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#666] font-medium uppercase tracking-wide">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(delta)}% {deltaLabel ?? 'vs mês passado'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const { data: funcionarios = [] } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });
  const { data: producoes = [] } = useQuery({ queryKey: ['producao'], queryFn: producaoService.getAll });

  const totalVendas = pedidos.reduce((sum, p) => sum + p.total, 0);
  const pedidosPendentes = pedidos.filter(p => p.status === 0).length;
  const producaoAtiva = producoes.filter(p => p.status === 1).length;

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
    0: 'text-yellow-400', 1: 'text-blue-400', 2: 'text-purple-400',
    3: 'text-indigo-400', 4: 'text-cyan-400', 5: 'text-green-400', 6: 'text-red-400',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Receita Total" value={`R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="bg-indigo-600/20 text-indigo-400" delta={12.4} />
        <KpiCard title="Pedidos" value={pedidos.length} icon={ShoppingCart} color="bg-blue-600/20 text-blue-400" delta={8.1} />
        <KpiCard title="Clientes" value={clientes.length} icon={Users} color="bg-green-600/20 text-green-400" delta={5.3} />
        <KpiCard title="Produtos" value={produtos.length} icon={Package} color="bg-purple-600/20 text-purple-400" delta={-2.1} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Funcionários" value={funcionarios.length} icon={UserCheck} color="bg-yellow-600/20 text-yellow-400" />
        <KpiCard title="Pedidos Pendentes" value={pedidosPendentes} icon={ShoppingCart} color="bg-orange-600/20 text-orange-400" />
        <KpiCard title="Em Produção" value={producaoAtiva} icon={Factory} color="bg-cyan-600/20 text-cyan-400" />
        <KpiCard title="Estoque Baixo" value={produtos.filter(p => p.estoqueTotal < 10).length} icon={Package} color="bg-red-600/20 text-red-400" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vendasMock}>
              <defs>
                <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="mes" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Area type="monotone" dataKey="valor" stroke="#6366f1" strokeWidth={2} fill="url(#gradIndigo)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Status dos Pedidos</h3>
          {statusPedidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPedidos} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPedidos.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#888' }} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-55 flex items-center justify-center text-[#555] text-sm">Sem pedidos ainda</div>
          )}
        </div>
      </div>

      {/* Últimos pedidos + Top produtos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Últimos Pedidos</h3>
          {ultimosPedidos.length === 0 ? (
            <p className="text-[#555] text-sm text-center py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="flex flex-col gap-2">
              {ultimosPedidos.map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between py-2.5 border-b border-[#1a1a1a] last:border-0">
                  <div>
                    <p className="text-xs font-medium text-white">Pedido #{pedido.id}</p>
                    <p className="text-[10px] text-[#555]">{pedido.cliente?.nome ?? `Cliente #${pedido.clienteId}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-white">R$ {pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className={`text-[10px] ${statusColors[pedido.status]}`}>{StatusPedidoLabel[pedido.status]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Estoque por Categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={produtos.slice(0, 6).map(p => ({ nome: p.nome.substring(0, 12), estoque: p.estoqueTotal }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="nome" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="estoque" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

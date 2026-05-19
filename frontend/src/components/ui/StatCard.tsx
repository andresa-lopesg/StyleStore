import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LineChart, Line } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  delta?: number;
  sparklineData?: { v: number }[];
  loading?: boolean;
}

export default function StatCard({ title, value, subtitle, icon, delta, sparklineData, loading }: StatCardProps) {
  const base = 'bg-(--bg-card) rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] flex flex-col gap-3';

  if (loading) {
    return (
      <div className={base}>
        <div className="flex items-center justify-between">
          <div className="h-3 shimmer rounded w-24" />
          <div className="w-8 h-8 shimmer rounded-lg" />
        </div>
        <div className="h-8 shimmer rounded w-28 mt-1" />
        <div className="h-3 shimmer rounded w-20 mt-1" />
      </div>
    );
  }

  const sparkColor = (delta ?? 0) >= 0 ? 'var(--c-green)' : 'var(--c-red)';

  return (
    <div className={base}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--text-muted) font-medium uppercase tracking-wide">{title}</span>
        {icon}
      </div>

      <p className="text-2xl font-bold text-(--text-primary) leading-none">{value}</p>

      <div className="flex items-center justify-between gap-2">
        <div>
          {delta !== undefined ? (
            <div className={`flex items-center gap-1 text-xs ${delta > 0 ? 'text-(--c-green)' : delta < 0 ? 'text-(--c-red)' : 'text-(--text-muted)'}`}>
              {delta > 0 ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
              <span>{Math.abs(delta)}% vs período anterior</span>
            </div>
          ) : subtitle ? (
            <p className="text-xs text-(--text-muted)">{subtitle}</p>
          ) : null}
        </div>
        {sparklineData && (
          <LineChart width={72} height={28} data={sparklineData}>
            <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        )}
      </div>
    </div>
  );
}

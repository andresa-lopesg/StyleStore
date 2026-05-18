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
  const base = 'bg-(--bg-card) rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.35)] flex flex-col justify-between min-h-[120px]';

  if (loading) {
    return (
      <div className={base}>
        <div className="h-3 shimmer rounded w-24" />
        <div className="h-7 shimmer rounded w-20" />
        <div className="h-3 shimmer rounded w-16" />
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
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold text-(--text-primary)">{value}</p>
        {sparklineData && (
          <LineChart width={80} height={32} data={sparklineData}>
            <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        )}
      </div>
      <div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${delta > 0 ? 'text-(--c-green)' : delta < 0 ? 'text-(--c-red)' : 'text-(--text-muted)'}`}>
            {delta > 0 ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
        {subtitle && <p className="text-xs text-(--text-muted)">{subtitle}</p>}
      </div>
    </div>
  );
}

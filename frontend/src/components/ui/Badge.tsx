type Color = 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
}

const colors: Record<Color, string> = {
  gray:   'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-input)]',
  green:  'bg-green-500/10 text-(--c-green) border-green-500/20',
  yellow: 'bg-yellow-500/10 text-(--c-yellow) border-yellow-500/20',
  red:    'bg-red-500/10 text-(--c-red) border-red-500/20',
  blue:   'bg-blue-500/10 text-(--c-blue) border-blue-500/20',
  purple: 'bg-purple-500/10 text-(--c-purple) border-purple-500/20',
  indigo: 'bg-indigo-500/10 text-(--c-indigo) border-indigo-500/20',
};

export default function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

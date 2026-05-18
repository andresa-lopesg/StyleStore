import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

const variants: Record<Variant, string> = {
  primary: 'bg-(--accent) hover:opacity-90 text-white border-transparent',
  secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-input)]',
  danger: 'bg-red-600/10 hover:bg-red-600/20 text-(--c-red) border-red-600/30',
  ghost: 'bg-transparent hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-(--text-primary) border-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export default function Button({ variant = 'secondary', size = 'md', loading, icon, children, className = '', disabled, ariaLabel, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

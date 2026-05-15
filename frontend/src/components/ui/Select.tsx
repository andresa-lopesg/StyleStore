interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  options?: { value: string | number; label: string }[];
  children?: React.ReactNode;
}

export default function Select({ label, error, isValid, options, children, className, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-(--text-muted)">{label}</label>}
      <select
        className={`w-full h-9 px-3 bg-(--bg-elevated) border rounded-lg text-sm text-(--text-secondary)
          outline-none transition-colors appearance-none
          ${error
            ? 'border-red-500 focus:border-red-400'
            : isValid
              ? 'border-green-500/40 focus:border-green-500/60'
              : 'border-(--border-input) focus:border-(--accent)'
          } ${className ?? ''}`}
        {...rest}
      >
        {children ?? options?.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export default function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <select
        {...props}
        className={`
          h-9 px-3 bg-[var(--bg-elevated)] border rounded-lg text-sm text-white
          outline-none transition-colors appearance-none
          ${error ? 'border-red-500 focus:border-red-400' : 'border-[var(--border-input)] focus:border-[var(--accent)]'}
          ${className}
        `}
      >
        <option value="">Selecione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <input
        {...props}
        className={`
          h-9 px-3 bg-[var(--bg-elevated)] border rounded-lg text-sm text-white placeholder-[var(--text-placeholder)]
          outline-none transition-colors
          ${error ? 'border-red-500 focus:border-red-400' : 'border-[var(--border-input)] focus:border-[var(--accent)]'}
          ${className}
        `}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

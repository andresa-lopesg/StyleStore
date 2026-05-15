interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
}

export default function Textarea({ label, error, isValid, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-(--text-secondary)">{label}</label>
      )}
      <textarea
        {...props}
        className={`
          px-3 py-2 bg-(--bg-elevated) border rounded-lg text-sm text-(--text-primary)
          placeholder:text-(--text-placeholder) outline-none transition-colors resize-none w-full
          ${error
            ? 'border-red-500 focus:border-red-400'
            : isValid
              ? 'border-green-500/40 focus:border-green-500/60'
              : 'border-(--border-input) focus:border-(--accent)'}
          ${className}
        `}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

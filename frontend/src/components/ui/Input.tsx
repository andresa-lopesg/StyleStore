interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[#888]">{label}</label>}
      <input
        {...props}
        className={`
          h-9 px-3 bg-[#161616] border rounded-lg text-sm text-white placeholder-[#444]
          outline-none transition-colors
          ${error ? 'border-red-500 focus:border-red-400' : 'border-[#2a2a2a] focus:border-indigo-600'}
          ${className}
        `}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

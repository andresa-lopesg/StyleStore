import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
}

export default function Input({ label, error, isValid, className = '', type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const hasRightIcon = isPassword || !!error || isValid;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <div className="relative">
        <input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            h-9 px-3 bg-[var(--bg-elevated)] border rounded-lg text-sm text-white
            placeholder-[var(--text-placeholder)] outline-none transition-colors w-full
            ${hasRightIcon ? 'pr-8' : ''}
            ${error
              ? 'border-red-500 focus:border-red-400'
              : isValid
                ? 'border-green-500/40 focus:border-green-500/60'
                : 'border-[var(--border-input)] focus:border-[var(--accent)]'}
            ${className}
          `}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        {!isPassword && error && (
          <XCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" />
        )}
        {!isPassword && isValid && !error && (
          <CheckCircle2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

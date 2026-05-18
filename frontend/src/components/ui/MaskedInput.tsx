import { IMaskInput } from 'react-imask';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MaskedInputProps {
  label?: string;
  mask: string;
  value?: string;
  onChange?: (digits: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  isValid?: boolean;
  name?: string;
}

export default function MaskedInput({ label, mask, value = '', onChange, onBlur, placeholder, error, isValid, name }: MaskedInputProps) {
  const hasRightIcon = !!error || isValid;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <div className="relative">
        <IMaskInput
          mask={mask}
          value={value}
          onAccept={(_value, maskRef) => onChange?.(maskRef.unmaskedValue)}
          onBlur={onBlur}
          name={name}
          placeholder={placeholder}
          className={`
            h-9 px-3 bg-[var(--bg-elevated)] border rounded-lg text-sm text-(--text-primary)
            placeholder-[var(--text-placeholder)] outline-none transition-colors w-full
            ${hasRightIcon ? 'pr-8' : ''}
            ${error
              ? 'border-red-500 focus:border-red-400'
              : isValid
                ? 'border-green-500/40 focus:border-green-500/60'
                : 'border-[var(--border-input)] focus:border-[var(--accent)]'}
          `}
        />
        {error && (
          <XCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--c-red) pointer-events-none" />
        )}
        {isValid && !error && (
          <CheckCircle2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--c-green) pointer-events-none" />
        )}
      </div>
      {error && <span className="text-xs text-(--c-red)">{error}</span>}
    </div>
  );
}

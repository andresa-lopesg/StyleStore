import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative w-72 ${className}`}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-3 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-sm text-(--text-secondary) placeholder-(--text-placeholder) outline-none focus:border-(--accent) transition-colors"
      />
    </div>
  );
}

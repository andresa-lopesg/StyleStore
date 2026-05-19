import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
}

export default function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 bg-(--bg-elevated) border border-(--border-input) rounded-xl shadow-2xl overflow-hidden">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { if (!item.disabled) { item.onClick(); setOpen(false); } }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                item.disabled
                  ? 'text-(--text-muted) cursor-not-allowed opacity-50'
                  : item.variant === 'danger'
                    ? 'text-(--c-red) hover:text-(--c-red) hover:bg-(--bg-hover)'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover)'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

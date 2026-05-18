import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { ToastItem, ToastType } from '../../context/ToastContext';

const styles: Record<ToastType, { border: string; iconClass: string }> = {
  success: { border: 'border-green-500/30',  iconClass: 'text-(--c-green)' },
  error:   { border: 'border-red-500/30',    iconClass: 'text-(--c-red)' },
  warning: { border: 'border-yellow-500/30', iconClass: 'text-(--c-yellow)' },
};

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
};

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const { border, iconClass } = styles[toast.type];
  const Icon = icons[toast.type];

  return (
    <div className={`toast-animate flex items-start gap-3 px-4 py-3 rounded-xl border bg-[var(--bg-card)] ${border} shadow-2xl min-w-[280px] max-w-[360px]`}>
      <Icon size={16} className={`${iconClass} shrink-0 mt-0.5`} />
      <p className="text-sm text-(--text-primary) flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-[var(--text-muted)] hover:text-(--text-primary) transition-colors shrink-0 ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

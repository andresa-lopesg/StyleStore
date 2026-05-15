import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const mouseDownOnOverlay = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay-animate absolute inset-0 bg-black/70 backdrop-blur-sm"
        onMouseDown={() => { mouseDownOnOverlay.current = true; }}
        onMouseUp={() => {
          if (mouseDownOnOverlay.current) onClose();
          mouseDownOnOverlay.current = false;
        }}
      />
      <div
        className={`modal-panel-animate relative w-full ${sizes[size]} bg-(--bg-card) border border-(--border-input) rounded-xl shadow-2xl`}
        onMouseDown={e => { e.stopPropagation(); mouseDownOnOverlay.current = false; }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-(--text-muted) hover:text-white hover:bg-(--bg-elevated) transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-72px)]">{children}</div>
      </div>
    </div>
  );
}

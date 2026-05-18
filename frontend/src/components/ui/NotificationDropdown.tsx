import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Produto, Pedido } from '../../types';

interface NotificationDropdownProps {
  semEstoque: Produto[];
  estoqueBaixo: Produto[];
  pedidosPendentes: Pedido[];
}

export default function NotificationDropdown({ semEstoque, estoqueBaixo, pedidosPendentes }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalAlertas = semEstoque.length + estoqueBaixo.length + pedidosPendentes.length;

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-lg bg-(--bg-elevated) border border-(--border-input) flex items-center justify-center text-(--text-secondary) hover:text-(--text-primary) transition-colors"
      >
        <Bell size={14} />
        {totalAlertas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-xs font-bold text-white flex items-center justify-center px-1">
            {totalAlertas > 9 ? '9+' : totalAlertas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-(--bg-card) border border-(--border-input) rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
            <span className="text-sm font-semibold text-(--text-primary)">Notificações</span>
            <span className="text-xs text-(--text-muted)">{totalAlertas}</span>
          </div>

          {totalAlertas === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-(--text-muted)">Sem alertas no momento</p>
          ) : (
            <div className="flex flex-col divide-y divide-(--border)">
              {semEstoque.length > 0 && (
                <button onClick={() => go('/produtos')} className="flex items-start gap-3 px-4 py-3 text-left hover:bg-(--bg-hover) transition-colors w-full">
                  <span className="text-base mt-0.5">🔴</span>
                  <div>
                    <p className="text-sm text-(--text-primary) font-medium">{semEstoque.length} produto{semEstoque.length > 1 ? 's' : ''} sem estoque</p>
                    <p className="text-xs text-(--text-muted) mt-0.5">
                      {semEstoque[0].nome}{semEstoque.length > 1 ? ` e +${semEstoque.length - 1}` : ''} →
                    </p>
                  </div>
                </button>
              )}
              {estoqueBaixo.length > 0 && (
                <button onClick={() => go('/estoque')} className="flex items-start gap-3 px-4 py-3 text-left hover:bg-(--bg-hover) transition-colors w-full">
                  <span className="text-base mt-0.5">🟡</span>
                  <div>
                    <p className="text-sm text-(--text-primary) font-medium">{estoqueBaixo.length} com estoque baixo</p>
                    <p className="text-xs text-(--text-muted) mt-0.5">Ver todos no Estoque →</p>
                  </div>
                </button>
              )}
              {pedidosPendentes.length > 0 && (
                <button onClick={() => go('/pedidos')} className="flex items-start gap-3 px-4 py-3 text-left hover:bg-(--bg-hover) transition-colors w-full">
                  <span className="text-base mt-0.5">🟠</span>
                  <div>
                    <p className="text-sm text-(--text-primary) font-medium">{pedidosPendentes.length} pedido{pedidosPendentes.length > 1 ? 's' : ''} pendente{pedidosPendentes.length > 1 ? 's' : ''}</p>
                    <p className="text-xs text-(--text-muted) mt-0.5">Ver todos em Pedidos →</p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

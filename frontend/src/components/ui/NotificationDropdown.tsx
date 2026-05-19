import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, XCircle, X, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Produto, Pedido } from '../../types';

type NotifType = 'estoque-baixo' | 'pedido-pendente' | 'pedido-cancelado';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  href: string;
  date?: string;
}

interface NotificationDropdownProps {
  estoqueBaixo: Produto[];
  pedidosPendentes: Pedido[];
  pedidosCancelados: Pedido[];
}

const tipoConfig: Record<NotifType, { icon: React.ReactNode; bg: string; badge: string; badgeText: string }> = {
  'estoque-baixo': {
    icon: <AlertTriangle size={14} className="text-yellow-400" />,
    bg: 'bg-yellow-500/15',
    badge: 'bg-yellow-500/15 text-yellow-400',
    badgeText: 'Estoque baixo',
  },
  'pedido-pendente': {
    icon: <Clock size={14} className="text-orange-400" />,
    bg: 'bg-orange-500/15',
    badge: 'bg-orange-500/15 text-orange-400',
    badgeText: 'Pendente',
  },
  'pedido-cancelado': {
    icon: <XCircle size={14} className="text-red-400" />,
    bg: 'bg-red-500/15',
    badge: 'bg-red-500/15 text-red-400',
    badgeText: 'Cancelado',
  },
};

const STORAGE_KEY = 'stylestore:notifs-read';

function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function persistRead(ids: string[]) {
  const current = getReadIds();
  ids.forEach(id => current.add(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
}

export default function NotificationDropdown({ estoqueBaixo, pedidosPendentes, pedidosCancelados }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'todas' | 'nao-lidas'>('todas');
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifs: Notif[] = [
    ...estoqueBaixo.map(p => ({
      id: `estoque-baixo-${p.id}`,
      type: 'estoque-baixo' as NotifType,
      title: 'Estoque baixo',
      description: `${p.nome} está com ${p.estoqueTotal} unidade${p.estoqueTotal !== 1 ? 's' : ''} (abaixo do mínimo de ${p.estoqueMinimo} un)`,
      href: '/estoque',
    })),
    ...pedidosPendentes.map(p => ({
      id: `pedido-pendente-${p.id}`,
      type: 'pedido-pendente' as NotifType,
      title: 'Pedido pendente',
      description: `Pedido #${p.id}${p.cliente ? ` — ${p.cliente.nome}` : ''} aguarda confirmação`,
      href: '/pedidos',
      date: p.dataPedido,
    })),
    ...pedidosCancelados.map(p => ({
      id: `pedido-cancelado-${p.id}`,
      type: 'pedido-cancelado' as NotifType,
      title: 'Pedido cancelado',
      description: `Pedido #${p.id}${p.cliente ? ` — ${p.cliente.nome}` : ''} foi cancelado`,
      href: '/pedidos',
      date: p.dataPedido,
    })),
  ];

  const naoLidasCount = notifs.filter(n => !readIds.has(n.id)).length;
  const visiveis = tab === 'nao-lidas' ? notifs.filter(n => !readIds.has(n.id)) : notifs;

  function markAllRead() {
    persistRead(notifs.map(n => n.id));
    setReadIds(getReadIds());
  }

  function markOneRead(id: string) {
    persistRead([id]);
    setReadIds(getReadIds());
  }

  function go(href: string) {
    navigate(href);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-lg bg-(--bg-elevated) border border-(--border-input) flex items-center justify-center text-(--text-secondary) hover:text-(--text-primary) transition-colors"
      >
        <Bell size={14} />
        {naoLidasCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-(--accent) text-[10px] font-bold text-white flex items-center justify-center px-1">
            {naoLidasCount > 9 ? '9+' : naoLidasCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-96 bg-(--bg-card) rounded-xl shadow-2xl border border-(--border-input) flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-(--text-primary)">Notificações</span>
              {naoLidasCount > 0 && (
                <span className="text-[10px] font-bold bg-(--accent) text-white px-1.5 py-0.5 rounded-full">
                  {naoLidasCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Abas + marcar lidas */}
          <div className="flex items-center justify-between px-4 pb-2 shrink-0 border-b border-(--border)">
            <div className="flex gap-1">
              {(['todas', 'nao-lidas'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    tab === t
                      ? 'bg-(--bg-elevated) text-(--text-primary)'
                      : 'text-(--text-muted) hover:text-(--text-primary)'
                  }`}
                >
                  {t === 'todas' ? 'Todas' : 'Não lidas'}
                  {t === 'nao-lidas' && naoLidasCount > 0 && (
                    <span className="ml-1 text-(--accent)">{naoLidasCount}</span>
                  )}
                </button>
              ))}
            </div>
            {notifs.length > 0 && (
              <button
                onClick={markAllRead}
                title="Marcar todas como lidas"
                className="text-(--text-muted) hover:text-(--accent) transition-colors"
              >
                <CheckCheck size={13} />
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1 divide-y divide-(--border)">
            {visiveis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCheck size={24} className="text-(--text-muted)" />
                <p className="text-sm text-(--text-muted)">
                  {tab === 'nao-lidas' ? 'Tudo lido por aqui' : 'Sem alertas no momento'}
                </p>
              </div>
            ) : (
              visiveis.map(n => {
                const config = tipoConfig[n.type];
                const isRead = readIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => { markOneRead(n.id); go(n.href); }}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-(--bg-hover) ${!isRead ? 'bg-(--bg-elevated)/50' : ''}`}
                  >
                    <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full">
                      {!isRead && <div className="w-2 h-2 rounded-full bg-(--accent)" />}
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${isRead ? 'text-(--text-secondary)' : 'text-(--text-primary)'}`}>
                          {n.title}
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${config.badge}`}>
                          {config.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-(--text-muted) mt-0.5 line-clamp-2">{n.description}</p>
                      {n.date && (
                        <p className="text-xs text-(--text-muted) mt-1 opacity-60">
                          {new Date(n.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Rodapé */}
          {notifs.length > 0 && (
            <div className="px-4 py-3 border-t border-(--border) shrink-0">
              <button
                onClick={() => go('/estoque')}
                className="w-full text-xs text-(--accent) hover:underline text-center transition-colors"
              >
                Ver todos os alertas →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

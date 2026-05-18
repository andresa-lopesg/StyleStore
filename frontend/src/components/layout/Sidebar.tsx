import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Tag, UserCheck,
  ClipboardList, Factory, ShoppingCart, ChevronLeft, ChevronRight,
  Store, Layers, ArrowLeftRight, Settings, ChevronUp, LogOut
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pedidosService } from '../../services/pedidos';
import { produtosService } from '../../services/produtos';

type BadgeKey = 'pendentes' | 'semEstoque';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: BadgeKey;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [{ path: '/', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'CATÁLOGO',
    items: [
      { path: '/produtos', icon: ShoppingBag, label: 'Produtos' },
      { path: '/categorias', icon: Tag, label: 'Categorias' },
      { path: '/colecoes', icon: Layers, label: 'Coleções' },
    ],
  },
  {
    label: 'VENDAS',
    items: [
      { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos', badge: 'pendentes' },
      { path: '/clientes', icon: Users, label: 'Clientes' },
    ],
  },
  {
    label: 'ESTOQUE',
    items: [
      { path: '/estoque', icon: Package, label: 'Estoque', badge: 'semEstoque' },
      { path: '/movimentacoes', icon: ArrowLeftRight, label: 'Movimentações' },
      { path: '/producao', icon: Factory, label: 'Produção' },
    ],
  },
  {
    label: 'ADMINISTRAÇÃO',
    items: [
      { path: '/funcionarios', icon: UserCheck, label: 'Funcionários' },
      { path: '/usuarios', icon: ClipboardList, label: 'Usuários' },
      { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
];

const badgeStyles: Record<BadgeKey, { bg: string; text: string; dot: string }> = {
  pendentes: { bg: 'bg-yellow-500/20', text: 'text-(--c-yellow)', dot: 'bg-yellow-400' },
  semEstoque: { bg: 'bg-red-500/20', text: 'text-(--c-red)', dot: 'bg-red-400' },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });

  const badgeCounts: Record<BadgeKey, number> = {
    pendentes: pedidos.filter(p => p.status === 0).length,
    semEstoque: produtos.filter(p => p.estoqueTotal === 0).length,
  };

  return (
    <aside
      style={{ width: collapsed ? 72 : 256 }}
      className="relative flex flex-col h-screen bg-(--bg-card) border-r border-(--border) shadow-[2px_0_32px_rgba(0,0,0,0.15)] transition-all duration-300 shrink-0"
    >
      {/* Header — logo */}
      <div
        className={`flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}
        style={{ height: '64px' }}
      >
        <div className="w-9 h-9 rounded-xl bg-(--accent) flex items-center justify-center shrink-0">
          <Store size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-(--text-primary) tracking-wide">StyleStore</span>
        )}
      </div>

      <div className="h-px bg-(--border)" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        {navSections.map((section, si) => (
          <div key={si} className="flex flex-col gap-1">
            {!collapsed && section.label && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-(--text-muted) px-2 pb-1.5 select-none">
                {section.label}
              </p>
            )}
            {collapsed && si > 0 && (
              <div className="my-1 mx-2 h-px bg-(--border) opacity-30" />
            )}
              {section.items.map(({ path, icon: Icon, label, badge }) => {
                const active = path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(path);
                const count = badge ? badgeCounts[badge] : 0;
                const styles = badge ? badgeStyles[badge] : null;

                return (
                  <NavLink
                    key={path}
                    to={path}
                    title={collapsed ? label : undefined}
                    className={`
                      relative flex items-center rounded-xl text-[13px] transition-colors duration-150
                      ${collapsed ? 'justify-center py-3.5' : 'gap-3 px-4 py-3'}
                      ${active
                        ? 'bg-(--accent) text-white font-medium'
                        : 'text-(--text-secondary) hover:bg-(--bg-hover) hover:text-(--text-primary)'
                      }
                    `}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="flex-1 text-sm">{label}</span>}
                    {badge && count > 0 && (
                      collapsed
                        ? <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${styles!.dot}`} />
                        : <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${styles!.bg} ${styles!.text}`}>
                            {count}
                          </span>
                    )}
                  </NavLink>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[4rem] w-7 h-7 rounded-full bg-(--bg-card) border border-(--border-input) flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) transition-colors z-10 shadow-sm"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Footer — perfil */}
      <div ref={profileRef} className="relative mt-auto border-t border-(--border)">
        {profileOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-(--bg-elevated) border border-(--border-input) rounded-xl shadow-2xl overflow-hidden z-10">
            <button
              onClick={() => { setProfileOpen(false); navigate('/configuracoes'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors"
            >
              <Settings size={14} /> Configurações
            </button>
            <div className="border-t border-(--border)" />
            <button
              onClick={() => { setProfileOpen(false); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-(--c-red) hover:text-(--c-red) hover:bg-(--bg-hover) transition-colors"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        )}

        <button
          onClick={() => setProfileOpen(v => !v)}
          className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-(--bg-elevated) transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-(--accent)/20 flex items-center justify-center text-xs font-semibold text-(--accent) flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-(--text-primary)">Admin</p>
                <p className="text-[11px] text-(--text-muted) mt-1.5 leading-none">Administrador</p>
              </div>
              <ChevronUp size={13} className={`text-(--text-muted) transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

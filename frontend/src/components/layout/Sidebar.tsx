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
  pendentes: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  semEstoque: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1280);
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
      style={{ width: collapsed ? 80 : 260 }}
      className="relative flex flex-col h-screen bg-(--bg-card) shadow-[2px_0_16px_rgba(0,0,0,0.4)] transition-all duration-300 shrink-0"
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-(--border) shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}
        style={{ height: '72px' }}
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
          <Store size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-base text-white tracking-wide">StyleStore</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 pb-4 px-3 flex flex-col overflow-y-auto" style={{ paddingTop: '0.5rem' }}>
        {navSections.map((section, si) => (
          <div key={si}>
            {!collapsed && section.label && (
              <span className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) px-4 pt-5 pb-1 block">
                {section.label}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
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
                      relative flex items-center rounded-xl text-sm transition-all duration-150
                      ${collapsed ? 'justify-center px-0 py-4' : 'gap-3.5 px-4 py-3'}
                      ${active
                        ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-600/30'
                        : 'text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {badge && count > 0 && (
                      collapsed
                        ? <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${styles!.dot}`} />
                        : <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${styles!.bg} ${styles!.text}`}>
                            {count}
                          </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[4.5rem] w-7 h-7 rounded-full bg-(--bg-elevated) border border-(--border-input) flex items-center justify-center text-(--text-muted) hover:text-white transition-colors z-10 shadow-sm"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Footer */}
      <div ref={profileRef} className="relative mt-auto border-t border-(--border)">
        {profileOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-(--bg-elevated) border border-(--border-input) rounded-xl shadow-2xl overflow-hidden z-10">
            <button
              onClick={() => { setProfileOpen(false); navigate('/configuracoes'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-(--text-secondary) hover:text-white hover:bg-(--bg-hover) transition-colors"
            >
              <Settings size={14} /> Configurações
            </button>
            <div className="border-t border-(--border)" />
            <button
              onClick={() => { setProfileOpen(false); navigate('/login'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-(--bg-hover) transition-colors"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        )}

        <button
          onClick={() => setProfileOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-(--bg-elevated) transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-semibold text-indigo-300 flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-white">Admin</p>
                <p className="text-xs text-(--text-muted)">Administrador</p>
              </div>
              <ChevronUp size={12} className={`text-(--text-muted) transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

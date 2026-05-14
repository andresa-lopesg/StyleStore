import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Tag, UserCheck,
  ClipboardList, Factory, ShoppingCart, ChevronLeft, ChevronRight, Store
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/produtos', icon: ShoppingBag, label: 'Produtos' },
  { path: '/categorias', icon: Tag, label: 'Categorias' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/funcionarios', icon: UserCheck, label: 'Funcionários' },
  { path: '/producao', icon: Factory, label: 'Produção' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/usuarios', icon: ClipboardList, label: 'Usuários' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      style={{ width: collapsed ? 80 : 260 }}
      className="relative flex flex-col h-screen bg-(--bg-card) shadow-[2px_0_16px_rgba(0,0,0,0.4)] transition-all duration-300 shrink-0"
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[var(--border)] shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`} style={{ height: '72px' }}>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
          <Store size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-base text-white tracking-wide">StyleStore</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 pb-4 px-3 flex flex-col gap-3 overflow-y-auto" style={{ paddingTop: '0.5rem' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`
                flex items-center rounded-xl text-sm transition-all duration-150
                ${collapsed ? 'justify-center px-0 py-5' : 'gap-3.5 px-4 py-4'}
                ${active
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white'
                }
              `}
            >
              <Icon size={22} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[4.5rem] w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-input)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors z-10 shadow-sm"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Footer */}
      <div className={`py-5 border-t border-[var(--border)] ${collapsed ? 'flex justify-center px-0' : 'px-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-[var(--text-muted)] truncate">stylestore.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

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
      style={{ width: collapsed ? 64 : 224 }}
      className="relative flex flex-col h-screen bg-[#111111] border-r border-[#1e1e1e] transition-all duration-200 shrink-0"
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[#1e1e1e] py-5 ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Store size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-white tracking-wide">StyleStore</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              title={label}
              className={`
                flex items-center rounded-lg text-sm transition-all duration-150
                ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
                ${active
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                  : 'text-[#888] hover:bg-[#1a1a1a] hover:text-[#ccc]'
                }
              `}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-[#666] hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Footer */}
      <div className={`py-4 border-t border-[#1e1e1e] ${collapsed ? 'flex justify-center px-0' : 'px-3'}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">Admin</p>
              <p className="text-[10px] text-[#555] truncate">stylestore.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

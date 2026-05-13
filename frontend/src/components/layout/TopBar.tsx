import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/produtos': 'Produtos',
  '/categorias': 'Categorias',
  '/clientes': 'Clientes',
  '/funcionarios': 'Funcionários',
  '/producao': 'Produção',
  '/estoque': 'Estoque',
  '/usuarios': 'Usuários',
};

export default function TopBar() {
  const location = useLocation();
  const title = Object.entries(titles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] ?? 'StyleStore';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-[var(--bg-elevated)] border border-[var(--border-input)] rounded-lg pl-8 pr-4 py-1.5 text-xs text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors w-48"
          />
        </div>
        <button className="relative w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-input)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
}

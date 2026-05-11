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
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1e1e1e] bg-[#0a0a0a] shrink-0">
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-[#161616] border border-[#2a2a2a] rounded-lg pl-8 pr-4 py-1.5 text-xs text-[#ccc] placeholder-[#555] outline-none focus:border-indigo-600 transition-colors w-48"
          />
        </div>
        <button className="relative w-8 h-8 rounded-lg bg-[#161616] border border-[#2a2a2a] flex items-center justify-center text-[#888] hover:text-white transition-colors">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
}

import { Search, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { produtosService } from '../../services/produtos';
import { pedidosService } from '../../services/pedidos';
import NotificationDropdown from '../ui/NotificationDropdown';
import CommandPalette from '../ui/CommandPalette';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { useTheme } from '../../context/ThemeContext';

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

const NO_SEARCH_PATHS = new Set(['/', '/movimentacoes', '/configuracoes']);

export default function TopBar() {
  const location = useLocation();
  const { isOpen, open, close } = useCommandPalette();
  const { theme, toggleTheme } = useTheme();
  const title = Object.entries(titles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] ?? 'StyleStore';
  const showSearch = !NO_SEARCH_PATHS.has(location.pathname);

  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll, staleTime: 30_000 });
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll, staleTime: 30_000 });

  const semEstoque = produtos.filter(p => p.estoqueTotal === 0);
  const estoqueBaixo = produtos.filter(p => p.estoqueTotal > 0 && p.estoqueTotal < 10);
  const pedidosPendentes = pedidos.filter(p => p.status === 0);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-(--border) bg-(--bg-base) shrink-0">
      <h1 className="text-sm font-semibold text-(--text-primary)">{title}</h1>
      <div className="flex items-center gap-3">
        {showSearch && (
          <button
            onClick={open}
            className="flex items-center gap-2 bg-(--bg-elevated) border border-(--border-input) rounded-lg px-3 py-1.5 text-xs text-(--text-muted) hover:border-(--accent) transition-colors w-48"
          >
            <Search size={13} className="shrink-0" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="text-[10px] bg-(--bg-hover) px-1.5 py-0.5 rounded border border-(--border) shrink-0">⌘K</kbd>
          </button>
        )}
        <NotificationDropdown semEstoque={semEstoque} estoqueBaixo={estoqueBaixo} pedidosPendentes={pedidosPendentes} />
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-hover) transition-colors"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
      <CommandPalette open={isOpen} onClose={close} />
    </header>
  );
}

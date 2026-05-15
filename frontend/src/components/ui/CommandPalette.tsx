import { useEffect, useRef, useState, useMemo } from 'react';
import { Search, User, Package, ShoppingBag, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clientesService } from '../../services/clientes';
import { produtosService } from '../../services/produtos';
import { pedidosService } from '../../services/pedidos';
import { funcionariosService } from '../../services/funcionarios';
import { StatusPedidoLabel } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos'], queryFn: produtosService.getAll });
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosService.getAll });
  const { data: funcionarios = [] } = useQuery({ queryKey: ['funcionarios'], queryFn: funcionariosService.getAll });

  const term = debouncedQuery.toLowerCase();
  const active = term.length >= 2;

  const results = useMemo(() => {
    if (!active) return { clientes: [], produtos: [], pedidos: [], funcionarios: [] };
    return {
      clientes: clientes
        .filter(c => c.nome.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term))
        .slice(0, 5),
      produtos: produtos
        .filter(p => p.nome.toLowerCase().includes(term) || p.referencia?.toLowerCase().includes(term))
        .slice(0, 5),
      pedidos: pedidos
        .filter(p => String(p.id).includes(term) || p.cliente?.nome?.toLowerCase().includes(term))
        .slice(0, 5),
      funcionarios: funcionarios
        .filter(f => f.nome.toLowerCase().includes(term))
        .slice(0, 5),
    };
  }, [active, term, clientes, produtos, pedidos, funcionarios]);

  const clienteStart = 0;
  const produtoStart = results.clientes.length;
  const pedidoStart = produtoStart + results.produtos.length;
  const funcionarioStart = pedidoStart + results.pedidos.length;
  const totalResults = funcionarioStart + results.funcionarios.length;

  const hasResults = active && totalResults > 0;
  const noResults = active && totalResults === 0;

  useEffect(() => { setSelectedIndex(0); }, [debouncedQuery]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, totalResults - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const routes = [
          ...results.clientes.map(() => '/clientes'),
          ...results.produtos.map(() => '/produtos'),
          ...results.pedidos.map(() => '/pedidos'),
          ...results.funcionarios.map(() => '/funcionarios'),
        ];
        if (routes[selectedIndex]) { navigate(routes[selectedIndex]); onClose(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex, totalResults, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-(--bg-card) border border-(--border-input) rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border)">
          <Search size={15} className="text-(--text-muted) shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar clientes, produtos, pedidos..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[var(--text-muted)] outline-none"
          />
          <kbd className="text-xs text-(--text-muted) bg-(--bg-elevated) px-1.5 py-0.5 rounded border border-(--border) shrink-0">Esc</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!active && (
            <div className="py-10 text-center text-(--text-muted) text-sm">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}

          {noResults && (
            <div className="py-10 text-center text-(--text-muted) text-sm">
              Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {hasResults && (
            <>
              {results.clientes.length > 0 && (
                <Group title="Clientes">
                  {results.clientes.map((c, i) => (
                    <ResultRow
                      key={c.id}
                      icon={<User size={13} />}
                      selected={selectedIndex === clienteStart + i}
                      onClick={() => { navigate('/clientes'); onClose(); }}
                      onHover={() => setSelectedIndex(clienteStart + i)}
                    >
                      <span className="text-white truncate">{c.nome}</span>
                      <span className="text-(--text-muted) text-xs ml-auto shrink-0">{c.email}</span>
                    </ResultRow>
                  ))}
                </Group>
              )}

              {results.produtos.length > 0 && (
                <Group title="Produtos">
                  {results.produtos.map((p, i) => (
                    <ResultRow
                      key={p.id}
                      icon={<Package size={13} />}
                      selected={selectedIndex === produtoStart + i}
                      onClick={() => { navigate('/produtos'); onClose(); }}
                      onHover={() => setSelectedIndex(produtoStart + i)}
                    >
                      <span className="text-white truncate">{p.nome}</span>
                      {p.referencia && <span className="text-(--text-muted) text-xs">{p.referencia}</span>}
                      <span className="text-(--text-muted) text-xs ml-auto shrink-0">
                        R$ {p.preco.toFixed(2).replace('.', ',')}
                      </span>
                    </ResultRow>
                  ))}
                </Group>
              )}

              {results.pedidos.length > 0 && (
                <Group title="Pedidos">
                  {results.pedidos.map((p, i) => (
                    <ResultRow
                      key={p.id}
                      icon={<ShoppingBag size={13} />}
                      selected={selectedIndex === pedidoStart + i}
                      onClick={() => { navigate('/pedidos'); onClose(); }}
                      onHover={() => setSelectedIndex(pedidoStart + i)}
                    >
                      <span className="text-white">Pedido #{String(p.id).padStart(4, '0')}</span>
                      {p.cliente && (
                        <span className="text-(--text-muted) text-xs">
                          {p.cliente.nome} · {StatusPedidoLabel[p.status]}
                        </span>
                      )}
                    </ResultRow>
                  ))}
                </Group>
              )}

              {results.funcionarios.length > 0 && (
                <Group title="Funcionários">
                  {results.funcionarios.map((f, i) => (
                    <ResultRow
                      key={f.id}
                      icon={<UserCheck size={13} />}
                      selected={selectedIndex === funcionarioStart + i}
                      onClick={() => { navigate('/funcionarios'); onClose(); }}
                      onHover={() => setSelectedIndex(funcionarioStart + i)}
                    >
                      <span className="text-white truncate">{f.nome}</span>
                      <span className="text-(--text-muted) text-xs ml-auto shrink-0">{f.cargo}</span>
                    </ResultRow>
                  ))}
                </Group>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-1.5 text-xs font-semibold text-(--text-muted) uppercase tracking-wider bg-(--bg-base)">
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  icon, selected, onClick, onHover, children,
}: {
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  onHover: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${selected ? 'bg-(--bg-elevated)' : 'hover:bg-(--bg-hover)'}`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <span className="text-(--text-muted) shrink-0">{icon}</span>
      <span className="flex items-center gap-2 flex-1 min-w-0">{children}</span>
    </button>
  );
}

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  pageSize?: number;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
}

type SortDir = 'asc' | 'desc' | null;

const PAGE_SIZES = [10, 20, 25, 50];

function IndeterminateCheckbox({ checked, indeterminate, onChange }: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 cursor-pointer accent-(--accent)"
    />
  );
}

export default function Table<T>({
  columns, data, keyField, loading,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyState,
  pageSize,
  selectable,
  selectedIds = [],
  onSelectionChange,
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(pageSize ?? 20);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  useEffect(() => { setPage(0); }, [data]);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(0);
  }

  function handlePerPageChange(val: number) {
    setPerPage(val);
    setPage(0);
  }

  const sorted = sortKey && sortDir
    ? [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), 'pt-BR', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const displayed = sorted.slice(page * perPage, (page + 1) * perPage);

  const pageNumbers = (): number[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  const pageIds = displayed.map(row => (row as Record<string, unknown>)[String(keyField)] as string | number);
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
  const someSelected = !allSelected && pageIds.some(id => selectedIds.includes(id));

  function handleSelectAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      const next = [...selectedIds];
      pageIds.forEach(id => { if (!next.includes(id)) next.push(id); });
      onSelectionChange(next);
    }
  }

  function handleSelectRow(id: string | number) {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id]
    );
  }

  const colCount = selectable ? columns.length + 1 : columns.length;

  return (
    <div className="w-full rounded-xl border border-(--border) overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-(--border)">
              {selectable && (
                <th className="px-4 py-3 bg-(--bg-card) w-10">
                  <IndeterminateCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={`px-4 py-3 text-left text-xs font-medium text-(--text-muted) uppercase tracking-wider bg-(--bg-card) ${col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp size={12} className="text-(--accent)" />
                          : <ChevronDown size={12} className="text-(--accent)" />
                        : <ChevronsUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-(--border)">
                  {selectable && <td className="px-4 py-3.5" />}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 shimmer rounded" style={{ width: i % 2 === 0 ? '70%' : '50%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-14 text-center bg-(--bg-card)">
                  {emptyState ?? <span className="text-(--text-muted) text-sm">{emptyMessage}</span>}
                </td>
              </tr>
            ) : (
              displayed.map((row, i) => {
                const id = (row as Record<string, unknown>)[String(keyField)] as string | number;
                const isSelected = !!selectable && selectedIds.includes(id);
                return (
                  <tr
                    key={String(row[keyField])}
                    className={`group border-b border-(--border) last:border-0 transition-colors duration-150 hover:bg-(--bg-elevated) hover:border-l-2 hover:border-l-indigo-500/60 ${
                      isSelected ? 'bg-(--accent)/5' : i % 2 === 0 ? 'bg-(--bg-card)' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          className="w-3.5 h-3.5 cursor-pointer accent-(--accent)"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3.5 text-(--text-secondary)">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-(--border) bg-(--bg-card)">
          <div className="flex items-center gap-3">
            <span className="text-xs text-(--text-muted)">
              Exibindo {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} de {sorted.length} registros
            </span>
            <select
              value={perPage}
              onChange={e => handlePerPageChange(Number(e.target.value))}
              className="h-7 px-2 bg-(--bg-elevated) border border-(--border-input) rounded-lg text-xs text-(--text-secondary) outline-none"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} por página</option>)}
            </select>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-white hover:bg-(--bg-elevated) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {pageNumbers().map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    n === page ? 'bg-(--accent) text-white' : 'text-(--text-muted) hover:text-white hover:bg-(--bg-elevated)'
                  }`}
                >
                  {n + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:text-white hover:bg-(--bg-elevated) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  pageSize?: number;
}

export default function Table<T>({
  columns, data, keyField, loading,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyState,
  pageSize,
}: TableProps<T>) {
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [data]);

  const totalPages = pageSize ? Math.ceil(data.length / pageSize) : 1;
  const displayed = pageSize ? data.slice(page * pageSize, (page + 1) * pageSize) : data;

  const pageNumbers = (): number[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  return (
    <div className="w-full rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-card)]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 shimmer rounded" style={{ width: i % 2 === 0 ? '70%' : '50%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center bg-[var(--bg-card)]">
                  {emptyState ?? <span className="text-[var(--text-muted)] text-sm">{emptyMessage}</span>}
                </td>
              </tr>
            ) : (
              displayed.map(row => (
                <tr
                  key={String(row[keyField])}
                  className="group border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 last:border-0"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-[var(--text-secondary)]">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize && !loading && data.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
          <span className="text-xs text-[var(--text-muted)]">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {pageNumbers().map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  n === page
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {n + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

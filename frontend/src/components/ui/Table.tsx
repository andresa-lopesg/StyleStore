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
}

export default function Table<T>({ columns, data, keyField, loading, emptyMessage = 'Nenhum registro encontrado.' }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#1e1e1e]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e1e1e]">
            {columns.map(col => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className="px-4 py-3 text-left text-xs font-medium text-[#666] uppercase tracking-wider bg-[#111]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#1a1a1a]">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-[#1a1a1a] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[#555] bg-[#0d0d0d]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={String(row[keyField])} className="border-b border-[#1a1a1a] hover:bg-[#141414] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-[#ccc]">
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

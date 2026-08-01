import type { ReactNode } from 'react';

export default function DataTable({
  columns,
  data,
  loading,
}: {
  columns: Array<{ label: string; key: string; render?: (row: Record<string, unknown>) => ReactNode }>;
  data: Array<Record<string, unknown>>;
  loading?: boolean;
}) {
  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  if (data.length === 0) {
    return <div className="empty">No records available.</div>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : String(row[column.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

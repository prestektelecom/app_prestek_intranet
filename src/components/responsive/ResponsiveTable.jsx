import { useBentoTheme } from '../../hooks/useBentoTheme';

/**
 * Tabela responsiva.
 * - >= lg: tabela completa
 * - md .. lg: tabela com scroll horizontal
 * - < md: cards
 *
 * Props:
 *  - columns: [{ key, header, render?, priority? }]
 *  - rows: array de objetos
 *  - keyExtractor: (row) => string|number
 *  - cardTitle: (row) => string (usado no modo mobile)
 *  - actions: (row) => ReactNode
 */
export default function ResponsiveTable({
  columns,
  rows,
  keyExtractor,
  cardTitle,
  actions,
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  const C = useBentoTheme();

  const visibleColumns = columns.filter((c) => c.priority !== false);

  return (
    <div className="w-full">
      {/* Desktop/Tablet tabela */}
      <div className="hidden md:block overflow-x-auto rounded-xl border" style={{ borderColor: C.line }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: C.surfaceSoft, borderBottom: `1px solid ${C.line}` }}>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: C.muted }}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3" style={{ width: 1 }}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: C.ink2 }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-black/5"
                style={{ borderBottom: `1px solid ${C.line}` }}
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm"
                    style={{ color: C.ink, whiteSpace: col.nowrap ? 'nowrap' : 'normal' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.length === 0 && (
          <div
            className="text-center text-sm py-8 rounded-xl border"
            style={{ color: C.ink2, borderColor: C.line, background: C.surface }}
          >
            {emptyMessage}
          </div>
        )}
        {rows.map((row) => (
          <div
            key={keyExtractor(row)}
            className="rounded-xl border p-4"
            style={{ background: C.surface, borderColor: C.line }}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="font-semibold text-sm truncate"
                style={{ color: C.ink }}
              >
                {cardTitle ? cardTitle(row) : visibleColumns[0] && (visibleColumns[0].render ? visibleColumns[0].render(row[visibleColumns[0].key], row) : row[visibleColumns[0].key])}
              </div>
              {actions && (
                <div className="flex items-center gap-2 shrink-0">
                  {actions(row)}
                </div>
              )}
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {visibleColumns.slice(1).map((col) => (
                <div key={col.key} className={col.fullWidth ? 'col-span-2' : ''}>
                  <dt className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.muted }}>
                    {col.header}
                  </dt>
                  <dd className="text-sm mt-0.5" style={{ color: C.ink }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

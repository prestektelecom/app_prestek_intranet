import { useState } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { Icons } from '../common/Icons';

/**
 * Barra de filtros responsiva.
 * - desktop: todos os filtros lado a lado
 * - tablet/mobile: empilhados ou colapsados em painel
 */
export default function FilterBar({ children, activeFilters = [], onClear }) {
  const C = useBentoTheme();
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="w-full" style={{ color: C.ink }}>
      {/* Desktop: inline */}
      <div className="hidden md:flex flex-wrap items-end gap-3">
        {children}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="text-xs font-semibold underline-offset-2 hover:underline"
            style={{ color: C.danger }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Mobile: colapsável */}
      <div className="flex md:hidden flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border"
            style={{ background: C.surface, borderColor: C.line, color: C.ink }}
          >
            <Icons.Settings />
            Filtros
            {hasActiveFilters && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: C.accent, color: C.surface }}
              >
                {activeFilters.length}
              </span>
            )}
          </button>

          {hasActiveFilters && onClear && (
            <button
              onClick={onClear}
              className="text-xs font-semibold"
              style={{ color: C.danger }}
            >
              Limpar
            </button>
          )}

          {/* Chips de filtros ativos compactos */}
          <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
            {activeFilters.slice(0, 2).map((filter, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
                style={{ background: C.accentSoft, color: C.accentDeep }}
              >
                {filter}
              </span>
            ))}
            {activeFilters.length > 2 && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
                style={{ background: C.surfaceSoft, color: C.ink2 }}
              >
                +{activeFilters.length - 2}
              </span>
            )}
          </div>
        </div>

        {expanded && (
          <div
            className="flex flex-col gap-3 p-3 rounded-xl border"
            style={{ background: C.surface, borderColor: C.line }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

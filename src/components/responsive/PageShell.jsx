import { useBentoTheme } from '../../hooks/useBentoTheme';

/**
 * Estrutura comum de página responsiva.
 * Recebe título, breadcrumb, filtros, ações e conteúdo.
 */
export default function PageShell({
  title,
  subtitle,
  breadcrumb,
  filters,
  actions,
  children,
  className = '',
}) {
  const C = useBentoTheme();

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${className}`}
      style={{ background: C.bg }}
    >
      {/* Header area */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-4 shrink-0">
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h1
                className="text-xl sm:text-2xl font-extrabold tracking-tight truncate"
                style={{ color: C.ink }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm mt-1 truncate" style={{ color: C.ink2 }}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
              {actions}
            </div>
          )}
        </div>

        {filters && (
          <div className="mt-4">
            {filters}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pb-6">
        {children}
      </div>
    </div>
  );
}

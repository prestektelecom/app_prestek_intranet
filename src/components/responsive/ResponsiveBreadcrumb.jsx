import { useBentoTheme } from '../../hooks/useBentoTheme';

/**
 * Breadcrumb responsivo.
 * - desktop: exibe todos os níveis
 * - tablet: trunca intermediários
 * - mobile: mostra apenas o anterior e o atual
 */
export default function ResponsiveBreadcrumb({ items = [], onNavigate }) {
  const C = useBentoTheme();

  if (!items || items.length === 0) return null;

  const handleClick = (item, index) => {
    if (item.view && onNavigate) onNavigate(item.view);
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm w-full min-w-0"
      style={{ color: C.ink2 }}
    >
      <ol className="flex items-center gap-1 min-w-0">
        {/* Mobile: só primeiro e último */}
        <li className="md:hidden flex items-center gap-1 min-w-0">
          {items.length > 1 && (
            <>
              <button
                onClick={() => handleClick(items[0], 0)}
                className="truncate hover:underline"
                style={{ color: C.accent, maxWidth: '40vw' }}
              >
                {items[0].label}
              </button>
              <span style={{ color: C.muted }}>/</span>
            </>
          )}
          <span className="truncate font-medium" style={{ color: C.ink, maxWidth: '45vw' }}>
            {items[items.length - 1].label}
          </span>
        </li>

        {/* Tablet: primeiro, reticências, últimos dois */}
        <li className="hidden md:flex lg:hidden items-center gap-1 min-w-0">
          <button
            onClick={() => handleClick(items[0], 0)}
            className="truncate hover:underline"
            style={{ color: C.accent, maxWidth: '20vw' }}
          >
            {items[0].label}
          </button>
          {items.length > 3 && <span style={{ color: C.muted }}>…</span>}
          {items.slice(-2).map((item, idx) => {
            const realIndex = items.length - 2 + idx;
            const isLast = realIndex === items.length - 1;
            return (
              <span key={realIndex} className="flex items-center gap-1 min-w-0">
                <span style={{ color: C.muted }}>/</span>
                {isLast ? (
                  <span className="truncate font-medium" style={{ color: C.ink, maxWidth: '30vw' }}>
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => handleClick(item, realIndex)}
                    className="truncate hover:underline"
                    style={{ color: C.accent, maxWidth: '20vw' }}
                  >
                    {item.label}
                  </button>
                )}
              </span>
            );
          })}
        </li>

        {/* Desktop: todos os níveis */}
        <li className="hidden lg:flex items-center gap-1 min-w-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <span key={index} className="flex items-center gap-1 min-w-0">
                {index > 0 && <span style={{ color: C.muted }}>/</span>}
                {isLast ? (
                  <span className="truncate font-medium" style={{ color: C.ink, maxWidth: '24vw' }}>
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => handleClick(item, index)}
                    className="truncate hover:underline"
                    style={{ color: C.accent, maxWidth: '18vw' }}
                  >
                    {item.label}
                  </button>
                )}
              </span>
            );
          })}
        </li>
      </ol>
    </nav>
  );
}

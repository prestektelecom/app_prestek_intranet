import { useState } from 'react';
import { useTouchOnly } from '../../hooks/useTouchOnly';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { Icons } from '../common/Icons';

/**
 * Container de ações em cards.
 * - Em dispositivos com mouse: pode usar hover para revelar (se revealHover=true)
 * - Em touchscreen: sempre visível ou agrupado em menu
 */
export default function TouchFriendlyActions({
  children,
  revealHover = false,
  className = '',
}) {
  const C = useBentoTheme();
  const touchOnly = useTouchOnly();
  const [showMenu, setShowMenu] = useState(false);

  const actions = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);

  // Touch e poucas ações: mostra tudo
  if (touchOnly && actions.length <= 2) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {actions}
      </div>
    );
  }

  // Touch e muitas ações: agrupa em menu
  if (touchOnly && actions.length > 2) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowMenu(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border"
          style={{ background: C.surface, borderColor: C.line, color: C.ink }}
          aria-label="Ações"
        >
          <Icons.More />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div
              className="absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-lg p-1 min-w-[140px]"
              style={{ background: C.surface, borderColor: C.line }}
            >
              <div className="flex flex-col gap-1">
                {actions.map((action, idx) => (
                  <div key={idx} className="w-full">{action}</div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop: hover reveal opcional
  return (
    <div
      className={`flex items-center gap-2 ${revealHover ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''} ${className}`}
    >
      {actions}
    </div>
  );
}

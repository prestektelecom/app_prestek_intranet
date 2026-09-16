import { useRef } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../../hooks/useDismissable';

// Sheet inferior do chrome mobile (usado por "Mais opções" e "Sua conta").
// Diálogo de verdade: Escape fecha, foco entra e NÃO SAI (Tab dá a volta
// dentro do painel; `aria-modal` sem isso deixava o foco cair atrás do
// scrim, no carrossel do Dashboard), fundo não rola, scrim fecha.
// Só existe abaixo de `lg`.

export default function BottomSheet({ open, onClose, label, children }) {
  const C = useBentoTheme();
  const panelRef = useRef(null);
  useDismissable(panelRef, { open, onClose, lockScroll: true, closeOnOutside: false });

  const trapTab = makeTrapTab(panelRef);

  if (!open) return null;

  return (
    <div className="block lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 1001, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: C.scrim, animation: 'sheet-fade-in 0.2s ease-out forwards' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={trapTab}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: C.popover, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: 'var(--shadow-xl)',
          padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          animation: 'sheet-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '0 auto 12px', flexShrink: 0 }} />
        {children}
      </div>
    </div>
  );
}

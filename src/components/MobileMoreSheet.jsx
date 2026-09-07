import { useRef } from 'react';
import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useDismissable } from '../hooks/useDismissable';
import { sheetItems } from '../navigation';
import { CloseIcon } from './common/CloseIcon';

// Sheet "Mais": tudo que não tem slot na barra inferior, vindo da fonte única.
// Diálogo de verdade: Escape fecha, foco entra, fundo não rola.

function SheetItem({ C, item, active, onClick }) {
  const IconComponent = Icons[item.icon];
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', minHeight: 44,
        borderRadius: 12, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
        background: active ? C.accentSoft : 'transparent',
        color: active ? C.ink : C.ink2, fontWeight: active ? 700 : 500, fontSize: 14,
        fontFamily: 'inherit', transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      <span aria-hidden="true" style={{ display: 'flex', color: active ? C.accent : C.ink2 }}>
        {IconComponent && <IconComponent />}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
    </button>
  );
}

export default function MobileMoreSheet({ isOpen, onClose, currentView, setCurrentView, user }) {
  const C = useBentoTheme();
  const panelRef = useRef(null);
  useDismissable(panelRef, { open: isOpen, onClose, lockScroll: true, closeOnOutside: false });

  if (!isOpen) return null;

  const { comuns, admin } = sheetItems(user);
  const handleItemClick = (id) => {
    setCurrentView(id);
    onClose();
  };

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
        aria-label="Mais opções"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: C.popover, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: 'var(--shadow-xl)',
          padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          animation: 'sheet-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 2, background: C.line, margin: '0 auto 12px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Mais opções</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.line}`,
              background: C.surfaceSoft, color: C.ink2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 4 }}>
          {comuns.map((item) => (
            <SheetItem key={item.id} C={C} item={item} active={currentView === item.id} onClick={handleItemClick} />
          ))}

          {admin.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 4px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.ink2 }}>
                  Administração
                </span>
                <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${C.line}`, margin: 0 }} />
              </div>
              {admin.map((item) => (
                <SheetItem key={item.id} C={C} item={item} active={currentView === item.id} onClick={handleItemClick} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

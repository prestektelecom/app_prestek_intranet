import { useRef } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useDismissable } from '../hooks/useDismissable';
import ProfileMenu from './ProfileMenu';
import { CloseIcon } from './common/CloseIcon';

// Sheet de perfil do celular: quem está logado, tema e sair. No desktop o
// mesmo conteúdo vive no popup da Sidebar; no celular não existia nada disso.

export default function MobileProfileSheet({ isOpen, onClose, user, setCurrentView, avatarUrl, nome, cargo }) {
  const C = useBentoTheme();
  const panelRef = useRef(null);
  useDismissable(panelRef, { open: isOpen, onClose, lockScroll: true, closeOnOutside: false });

  if (!isOpen) return null;

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
        aria-label="Sua conta"
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px 12px' }}>
          <img
            src={avatarUrl}
            alt=""
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: C.surfaceSoft, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nome}
            </div>
            {cargo && (
              <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cargo}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: 44, height: 44, borderRadius: 12, border: `1px solid ${C.line}`,
              background: C.surfaceSoft, color: C.ink2, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '0 0 8px' }} />

        <ProfileMenu user={user} setCurrentView={setCurrentView} onClose={onClose} />
      </div>
    </div>
  );
}

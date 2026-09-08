import { useBentoTheme } from '../hooks/useBentoTheme';
import ProfileMenu from './ProfileMenu';
import BottomSheet from './common/BottomSheet';
import { CloseIcon } from './common/CloseIcon';

// Sheet de perfil do celular: quem está logado, tema e sair. No desktop o
// mesmo conteúdo vive no popup da Sidebar; no celular não existia nada disso.

export default function MobileProfileSheet({ isOpen, onClose, user, setCurrentView, profile }) {
  const C = useBentoTheme();

  return (
    <BottomSheet open={isOpen} onClose={onClose} label="Sua conta">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px 12px' }}>
        <img
          src={profile.avatarUrl}
          alt=""
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: C.surfaceSoft, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.displayName}
          </div>
          {profile.cargoName && (
            <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.cargoName}
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
    </BottomSheet>
  );
}

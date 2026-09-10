import { useState } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useHeaderActionsSlot } from '../contexts/HeaderActionsContext';
import { viewTitleFor } from '../navigation';
import NotificationBell from './notifications/NotificationBell';
import MobileProfileSheet from './MobileProfileSheet';

// Header: diz onde o usuário está, carrega as ações da página e o sino.
// No celular também é a única porta para a conta (avatar → sheet de perfil).
// `profile` (nome, cargo, avatar) vem calculado do App, uma vez para todo o chrome.

export default function Header({ currentView, setCurrentView, user, profile }) {
  const C = useBentoTheme();
  const actions = useHeaderActionsSlot();
  const title = viewTitleFor(currentView, user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-[1000] flex items-center gap-3 sm:gap-4 px-3 sm:px-5 lg:px-6 shrink-0"
        style={{
          height: 'var(--header-h)',
          background: `${C.bg}E0`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${C.line}`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        {/* Conta (só celular) */}
        {user && profile && (
          <div className="lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label={`Sua conta, ${profile.displayName}`}
              aria-haspopup="dialog"
              aria-expanded={isProfileOpen}
              style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={profile.avatarUrl} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', background: C.surface }} />
            </button>
          </div>
        )}

        {/* Onde estou (headline: 18px no celular, 20px no desktop) */}
        <div className="min-w-0 flex-1">
          {title && (
            <div
              className="font-display truncate text-lg lg:text-xl"
              style={{ fontWeight: 700, letterSpacing: '-0.01em', color: C.ink, lineHeight: 1.25 }}
            >
              {title}
            </div>
          )}
        </div>

        {/* Ações da página + sino */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <NotificationBell user={user} setCurrentView={setCurrentView} />
        </div>
      </header>

      {user && profile && (
        <MobileProfileSheet
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          setCurrentView={setCurrentView}
          profile={profile}
        />
      )}
    </>
  );
}

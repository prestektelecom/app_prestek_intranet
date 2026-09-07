import { useState, useEffect } from 'react';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useHeaderActionsSlot } from '../contexts/HeaderActionsContext';
import { viewTitle } from '../navigation';
import { nomeCurto } from '../utils/nomeExibicao';
import NotificationBell from './notifications/NotificationBell';
import MobileProfileSheet from './MobileProfileSheet';

const defaultAvatar = AVATAR_PNGS[7];

// Header: diz onde o usuário está, carrega as ações da página e o sino.
// No celular também é a única porta para a conta (avatar → sheet de perfil).

export default function Header({ currentView, setCurrentView, user }) {
  const C = useBentoTheme();
  const actions = useHeaderActionsSlot();
  const title = viewTitle(currentView);

  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;
  const displayName = nomeCurto(safeName) || 'Usuário';

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(func.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
      .then(setCargoName)
      .catch((err) => console.error('Erro ao resolver setor no header', err));
  }, [safeDepto, safeRole, user?.nome_grupo]);

  useEffect(() => {
    const sync = () => {
      let resolved = resolveAvatarUrl(func.foto_perfil) || defaultAvatar;
      if (safeId) {
        try {
          const saved = JSON.parse(localStorage.getItem(`stitch_profile_${safeId}`) || 'null');
          if (saved?.avatarUrl) resolved = resolveAvatarUrl(saved.avatarUrl) || resolved;
        } catch (_) { /* ignora perfil local corrompido */ }
      }
      setAvatarUrl(resolved);
    };
    sync();
    window.addEventListener('stitch:avatar', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('stitch:avatar', sync);
      window.removeEventListener('storage', sync);
    };
  }, [safeId, func.foto_perfil]);

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
        {user && (
          <div className="lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label={`Sua conta, ${displayName}`}
              aria-haspopup="dialog"
              aria-expanded={isProfileOpen}
              style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={avatarUrl} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', background: C.surface }} />
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

      {user && (
        <MobileProfileSheet
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          setCurrentView={setCurrentView}
          avatarUrl={avatarUrl}
          nome={displayName}
          cargo={cargoName}
        />
      )}
    </>
  );
}

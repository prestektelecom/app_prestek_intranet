import { useState, useEffect, useRef } from 'react';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';
import NotificationBell from './notifications/NotificationBell';

const defaultAvatar = AVATAR_PNGS[7];

export default function Header({ currentView, setCurrentView, user, searchQuery, setSearchQuery, onMenuClick }) {
  const C = useBentoTheme();
  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;

  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);
  const avatarUrlRef = useRef(avatarUrl);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setAvatarUrl(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  }, [user?.funcionario?.foto_perfil]);

  useEffect(() => { avatarUrlRef.current = avatarUrl; }, [avatarUrl]);

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
      .then(setCargoName)
      .catch(err => console.error('Erro ao resolver setor no header', err));
  }, [safeDepto, safeRole, user?.nome_grupo]);

  useEffect(() => {
    if (!safeId) return;
    const syncAvatar = () => {
      const saved = localStorage.getItem(`stitch_profile_${safeId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.avatarUrl) {
            const resolved = resolveAvatarUrl(parsed.avatarUrl) || defaultAvatar;
            if (JSON.stringify(avatarUrlRef.current) !== JSON.stringify(resolved)) setAvatarUrl(resolved);
          }
        } catch (_) {}
      }
    };
    syncAvatar();
    const id = setInterval(syncAvatar, 1500);
    return () => clearInterval(id);
  }, [safeId]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const nameParts = safeName.split(' ');
  const displayName = nameParts.length > 2
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    : safeName;

  return (
    <header
      className="sticky top-0 z-[1000] flex items-center gap-3 sm:gap-5 px-3 sm:px-5 lg:px-6 h-16 lg:h-[72px] shrink-0"
      style={{
        background: C.bg + 'E0', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.line}`,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >

      {/* Search box */}
      <div className={`
        lg:hidden flex items-center gap-2 sm:gap-[10px] h-[42px] px-3 sm:px-[14px] rounded-xl shrink-0
        ${currentView === 'dashboard' ? 'flex-1 max-w-[540px]' : 'w-full max-w-[540px] sm:flex-1'}
      `}
        style={{
          background: C.surface, border: `1px solid ${C.line}`,
          boxShadow: `0 1px 2px ${C.accentDeep}0A`,
        }}
      >
        <span style={{ color: C.muted, display: 'flex' }}><Icons.Search /></span>
        <input
          ref={searchInputRef}
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchQuery('');
              if (searchInputRef.current) {
                searchInputRef.current.blur();
              }
            }
          }}
          placeholder={currentView === 'services' ? "Buscar planos por nome, valor ou ID..." : "Buscar serviços, pessoas ou documentos..."}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm"
          style={{
            fontFamily: 'inherit', color: C.ink,
          }}
        />
        <span className="hidden sm:inline-flex font-mono text-[10.5px] px-[7px] py-[3px] rounded"
          style={{
            border: `1px solid ${C.line}`, color: C.muted, background: C.surfaceSoft,
          }}>⌘K</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Notifications */}
        <NotificationBell user={user} setCurrentView={setCurrentView} />

      </div>

    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { Icons } from './common/Icons';
import { useBentoTheme } from '../hooks/useBentoTheme';

const defaultAvatar = AVATAR_PNGS[7];

function iconBtn(C) {
  return {
    width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.line}`, cursor: 'pointer',
    background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .12s', boxShadow: `0 1px 2px ${C.accentDeep}0A`,
  };
}

export default function Header({ currentView, setCurrentView, user, searchQuery, setSearchQuery, onMenuClick }) {
  const C = useBentoTheme();
  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;

  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);
  const [urgentAnnouncements, setUrgentAnnouncements] = useState([]);
  const [importantAnnouncements, setImportantAnnouncements] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const avatarUrlRef = useRef(avatarUrl);
  const searchInputRef = useRef(null);

  const getSeenKey = (userId) => `notif_seen_${userId || 'anonymous'}`;
  const getSeenIdsFromStorage = (userId) => {
    try {
      const data = localStorage.getItem(getSeenKey(userId));
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  };

  useEffect(() => {
    setSeenIds(getSeenIdsFromStorage(safeId));
  }, [safeId]);


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
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/comunicados');
        if (res.ok) {
          const data = await res.json();
          if (data.sucesso && data.comunicados) {
            const urgents = data.comunicados.filter(c => c.tipo === 'Urgente');
            const importants = data.comunicados.filter(c => c.tipo === 'Importante');
            setUrgentAnnouncements(urgents);
            setImportantAnnouncements(importants);
          }
        }
      } catch (err) { console.error('Erro ao buscar comunicados no header', err); }
    };
    fetchAnnouncements();
    const id = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setIsNotificationsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const unseenUrgents = urgentAnnouncements.filter(c => !seenIds.includes(String(c.id)));
  const unseenImportants = importantAnnouncements.filter(c => !seenIds.includes(String(c.id)));
  const badgeColor = unseenUrgents.length > 0 ? C.danger : (unseenImportants.length > 0 ? C.warning : null);
  const allNotifications = [...urgentAnnouncements, ...importantAnnouncements].sort(
    (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
  );

  const handleBellClick = () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);
    if (nextOpen) {
      const allCurrentIds = [...urgentAnnouncements, ...importantAnnouncements].map(c => String(c.id));
      if (allCurrentIds.length > 0) {
        try {
          const updated = Array.from(new Set([...seenIds, ...allCurrentIds]));
          localStorage.setItem(getSeenKey(safeId), JSON.stringify(updated));
          setSeenIds(updated);
        } catch (_) {}
      }
    }
  };

  const getTypeMetaLocal = (theme, tipo) => {
    if (tipo === 'Urgente') {
      return { color: theme.danger, soft: theme.dangerSoft, icon: 'priority_high' };
    }
    return { color: theme.warning, soft: theme.warningSoft, icon: 'notification_important' };
  };

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
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={handleBellClick}
            style={iconBtn(C)}
          >
            <span style={{ position: 'relative', display: 'flex', color: C.ink2 }}>
              <Icons.Bell />
              {badgeColor && (
                <span style={{
                  position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                  borderRadius: 4, background: badgeColor, border: '2px solid #F5F9FF',
                }} />
              )}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className={`
              absolute right-0 mt-2 rounded-2xl z-50 overflow-hidden
              w-[calc(100vw-32px)] max-w-[320px] sm:w-80
            `}
              style={{
                background: C.surface, border: `1px solid ${C.line}`,
                boxShadow: `0 12px 32px ${C.ink}1F`,
                animation: 'notif-dropdown-in 160ms cubic-bezier(0.4, 0, 0.2, 1) both',
                transformOrigin: 'top right',
              }}
            >
              <div style={{
                background: C.surfaceSoft, padding: '12px 16px',
                borderBottom: `1px solid ${C.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 6,
              }}>
                <span style={{ fontWeight: 700, color: C.ink }}>Notificações</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {urgentAnnouncements.length > 0 && (
                    <span style={{
                      background: C.dangerSoft, color: C.danger,
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    }}>
                      {urgentAnnouncements.length} Urgente(s)
                    </span>
                  )}
                  {importantAnnouncements.length > 0 && (
                    <span style={{
                      background: C.warningSoft, color: C.warning,
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    }}>
                      {importantAnnouncements.length} Importante(s)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {allNotifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: C.successSoft, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>task_alt</span>
                    </div>
                    <div style={{ fontWeight: 600, color: C.ink }}>Tudo tranquilo!</div>
                    <div style={{ fontSize: 12, color: C.ink2 }}>Nenhum comunicado recente.</div>
                  </div>
                ) : allNotifications.map(a => {
                  let dateFormatted = a.criado_em;
                  try { dateFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(a.criado_em)); } catch (_) {}
                  const meta = getTypeMetaLocal(C, a.tipo);
                  return (
                    <div key={a.id} style={{ padding: '12px 16px', display: 'flex', gap: 12, cursor: 'pointer', borderBottom: `1px solid ${C.line}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: meta.soft, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{meta.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</div>
                        <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>{a.descricao}</div>
                        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: C.accent }}>{a.departamento_autor}</span>
                          <span style={{ fontSize: 10.5, color: C.muted }}>{dateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: 8, background: C.surfaceSoft, borderTop: `1px solid ${C.line}` }}>
                <button
                  onClick={() => { setIsNotificationsOpen(false); setCurrentView('announcements'); }}
                  style={{ width: '100%', padding: '8px 0', fontSize: 12, fontWeight: 700, color: C.accent, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Ver todos os comunicados
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes notif-dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
}

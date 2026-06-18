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

export default function Header({ currentView, setCurrentView, user, searchQuery, setSearchQuery }) {
  const C = useBentoTheme();
  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;

  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);
  const [hasUrgent, setHasUrgent] = useState(false);
  const [urgentAnnouncements, setUrgentAnnouncements] = useState([]);
  const [hasViewedUrgent, setHasViewedUrgent] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
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
    const fetchUrgents = async () => {
      try {
        const res = await fetch('/api/comunicados');
        if (res.ok) {
          const data = await res.json();
          if (data.sucesso && data.comunicados) {
            const urgentOnly = data.comunicados.filter(c => c.tipo === 'Urgente');
            setHasUrgent(urgentOnly.length > 0);
            setUrgentAnnouncements(prev => {
              if (urgentOnly.length > prev.length) setHasViewedUrgent(false);
              return urgentOnly;
            });
          }
        }
      } catch (err) { console.error('Erro ao buscar comunicados no header', err); }
    };
    fetchUrgents();
    const id = setInterval(fetchUrgents, 30000);
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

  const nameParts = safeName.split(' ');
  const displayName = nameParts.length > 2
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    : safeName;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1000,
      height: 72, background: C.bg + 'E0', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 20,
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    }}>

      {/* Spacer para centralizar a busca quando o menu estiver oculto (Dashboard) */}
      {currentView === 'dashboard' && <div style={{ flex: 1 }} className="hidden lg:block" />}

      {/* Search box */}
      <div style={{
        flex: '1 1 0%', maxWidth: 540, display: 'flex', alignItems: 'center', gap: 10,
        height: 42, padding: '0 14px',
        background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12,
        boxShadow: `0 1px 2px ${C.accentDeep}0A`,
      }}>
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
          style={{
            flex: '1 1 0%', border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: C.ink,
          }}
        />
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
          padding: '3px 7px', border: `1px solid ${C.line}`, borderRadius: 5,
          color: C.muted, background: C.surfaceSoft, flexShrink: 0,
        }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => { setIsNotificationsOpen(v => !v); if (!isNotificationsOpen) setHasViewedUrgent(true); }}
            style={iconBtn(C)}
          >
            <span style={{ position: 'relative', display: 'flex', color: C.ink2 }}>
              <Icons.Bell />
              {hasUrgent && !hasViewedUrgent && (
                <span style={{
                  position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                  borderRadius: 4, background: C.danger, border: '2px solid #F5F9FF',
                }} />
              )}
            </span>
          </button>

          {isNotificationsOpen && (
            <div style={{
              position: 'absolute', right: 0, marginTop: 8, width: 320,
              background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16,
              boxShadow: `0 12px 32px ${C.ink}1F`, zIndex: 50, overflow: 'hidden',
            }}>
              <div style={{
                background: C.surfaceSoft, padding: '12px 16px',
                borderBottom: `1px solid ${C.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, color: C.ink }}>Notificações</span>
                {hasUrgent && (
                  <span style={{
                    background: C.dangerSoft, color: C.danger,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  }}>
                    {urgentAnnouncements.length} Urgente(s)
                  </span>
                )}
              </div>

              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {!hasUrgent ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: C.successSoft, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>task_alt</span>
                    </div>
                    <div style={{ fontWeight: 600, color: C.ink }}>Tudo tranquilo!</div>
                    <div style={{ fontSize: 12, color: C.ink2 }}>Nenhum comunicado urgente.</div>
                  </div>
                ) : urgentAnnouncements.map(a => {
                  let dateFormatted = a.criado_em;
                  try { dateFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(a.criado_em)); } catch (_) {}
                  return (
                    <div key={a.id} style={{ padding: '12px 16px', display: 'flex', gap: 12, cursor: 'pointer', borderBottom: `1px solid ${C.line}` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: C.dangerSoft, color: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>priority_high</span>
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

        {/* Admin */}
        {user?.is_admin && (
          <button onClick={() => setCurrentView('admin')} title="Painel Administrativo" style={iconBtn(C)}>
            <span style={{ color: C.accent, display: 'flex' }}><Icons.Admin /></span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={async () => {
            if (user?.id) {
              try { await fetch(`/api/presenca/${user.id}/logout`, { method: 'POST' }); } catch (_) {}
            }
            localStorage.removeItem('@Stitch:user');
            localStorage.removeItem('@Stitch:currentView');
            sessionStorage.removeItem('@Stitch:user');
            sessionStorage.removeItem('@Stitch:currentView');
            setCurrentView('login');
          }}
          title="Sair da Conta"
          style={iconBtn(C)}
        >
          <span style={{ color: C.ink2, display: 'flex' }}><Icons.Logout /></span>
        </button>

        {/* Profile pill */}
        <div
          onClick={() => setCurrentView('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4,
            padding: '5px 14px 5px 5px', borderRadius: 999,
            background: C.surface, border: `1px solid ${C.line}`,
            boxShadow: `0 1px 2px ${C.accentDeep}0A`,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <img
            src={avatarUrl || defaultAvatar}
            alt={safeName}
            style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover', flexShrink: 0, background: C.surfaceSoft }}
          />
          <div className="hidden lg:flex flex-col" style={{ lineHeight: 1.15 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, letterSpacing: '0.02em', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName.toUpperCase()}
            </span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, color: C.muted, letterSpacing: '0.15em', marginTop: 2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
              {cargoName}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}

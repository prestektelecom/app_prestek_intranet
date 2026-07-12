import { useState, useEffect, useRef } from 'react';
import { Icons } from './common/Icons';
import logoP from '../image/logos/Logo_P.webp';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { useTheme } from '../hooks/useTheme';

const defaultAvatar = AVATAR_PNGS[7];

const menuItems = [
  { id: 'services',  icon: 'Tools',    label: 'Serviços',      group: 'menu' },
  { id: 'coverage',  icon: 'Shield',   label: 'Cobertura',     group: 'menu' },
  { id: 'directory', icon: 'People',   label: 'Colaboradores', group: 'menu' },
  { id: 'sectors',   icon: 'Pie',      label: 'Setores',       group: 'menu' },
  { id: 'schedule',  icon: 'Clock',    label: 'Plantão',       group: 'menu' },
  { id: 'offices',   icon: 'Building', label: 'Escritórios',   group: 'menu' },
  { id: 'processes', icon: 'Doc',      label: 'Processos',     group: 'menu' },
  { id: 'tickets',   icon: 'Ticket',   label: 'Meus Chamados', group: 'menu' },
];

const CollapseIcon = ({ collapsed }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'flex' }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ChevronUpDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'flex' }}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </svg>
);

function ToggleSwitch({ checked, C }) {
  return (
    <div style={{
      width: 32, height: 18, borderRadius: 9,
      background: checked ? C.accent : C.line,
      position: 'relative', transition: 'background 0.2s',
      cursor: 'pointer', flexShrink: 0,
    }}>
      <div style={{
        width: 12, height: 12, borderRadius: '50%',
        background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 17 : 3,
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

export default function Sidebar({ currentView, setCurrentView, user, searchQuery, setSearchQuery }) {
  const C = useBentoTheme();
  const { theme, setTheme, darkVariant, setDarkVariant } = useTheme();
  
  const [profileHover, setProfileHover] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('@PrestekIntranet:sidebarCollapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('@PrestekIntranet:sidebarCollapsed', String(next));
      return next;
    });
  };

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;

  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setAvatarUrl(resolveAvatarUrl(user?.funcionario?.foto_perfil) || defaultAvatar);
  }, [user?.funcionario?.foto_perfil]);

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
      .then(setCargoName)
      .catch(err => console.error('Erro ao resolver setor no sidebar:', err));
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
            setAvatarUrl(resolved);
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
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          localStorage.setItem('@PrestekIntranet:sidebarCollapsed', 'false');
        }
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nameParts = safeName.split(' ');
  const displayName = nameParts.length > 2
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    : safeName;

  function GroupLabel({ children, showSeparator = true }) {
    if (isSidebarCollapsed) {
      return showSeparator ? (
        <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '14px 4px 10px', opacity: 0.7 }} />
      ) : <div style={{ height: 10 }} />;
    }
    return (
      <>
        {showSeparator && (
          <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '14px 4px 10px', opacity: 0.7 }} />
        )}
        <div style={{
          marginTop: showSeparator ? 0 : 12, marginBottom: 6, padding: '0 12px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
          letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
        }}>
          {children}
        </div>
      </>
    );
  }

  function NavRow({ id, icon, label, active, badge, onClick }) {
    const [hover, setHover] = useState(false);
    const IconComponent = Icons[icon];

    const isActive = active;
    const bgStyle = isActive 
      ? C.surface 
      : (hover ? C.surfaceSoft : 'transparent');
    const colorStyle = isActive 
      ? C.ink 
      : (hover ? C.ink : C.ink2);
    const shadowStyle = isActive 
      ? '0 1px 3px rgba(11, 27, 46, 0.06), 0 1px 2px rgba(11, 27, 46, 0.04)' 
      : 'none';
    const borderLeftStyle = isActive
      ? `3px solid ${C.accent}`
      : '3px solid transparent';

    return (
      <button
        onClick={() => onClick(id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={isSidebarCollapsed ? label : undefined}
        style={{
          position: 'relative',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          gap: isSidebarCollapsed ? 0 : 12,
          padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
          background: bgStyle,
          color: colorStyle,
          boxShadow: shadowStyle,
          border: 'none',
          borderLeft: borderLeftStyle,
          fontWeight: isActive ? 600 : 500, fontSize: 13.5,
          transition: 'all .12s',
          width: '100%', textAlign: 'left',
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        <span style={{ display: 'flex', color: isActive ? C.accent : (hover ? C.accent : C.muted) }}>
          {IconComponent && <IconComponent />}
        </span>
        {!isSidebarCollapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!isSidebarCollapsed && badge != null && (
          <span style={{
            background: isActive ? C.accent : C.dangerSoft,
            color: isActive ? C.surface : C.danger,
            fontSize: 10.5, fontWeight: 700,
            minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {badge}
          </span>
        )}
        {isSidebarCollapsed && badge != null && (
          <span style={{
            position: 'absolute',
            top: 6, right: 6,
            width: 8, height: 8,
            borderRadius: 4,
            background: isActive ? C.accent : C.danger,
          }} />
        )}
      </button>
    );
  }

  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    const fetchUrgents = async () => {
      try {
        const res = await fetch('/api/comunicados');
        const data = await res.json();
        if (data.sucesso) {
          setUrgentCount(data.comunicados.filter(item => item.tipo === 'Urgente').length);
        }
      } catch (error) {
        console.error('Erro ao carregar urgentes no sidebar:', error);
      }
    };
    fetchUrgents();
    const id = setInterval(fetchUrgents, 30000);
    return () => clearInterval(id);
  }, []);

  const systemItems = [
    { id: 'announcements', icon: 'Megaphone', label: 'Comunicados', badge: urgentCount > 0 ? String(urgentCount) : null, group: 'sistema' },
    { id: 'settings',      icon: 'Settings',  label: 'Configurações', group: 'sistema' },
    { id: 'admin',         icon: 'Admin',     label: 'Painel Admin',  group: 'sistema' },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: isSidebarCollapsed ? 72 : 248, 
        flexShrink: 0,
        background: C.surfaceSoft,
        borderRight: `1px solid ${C.line}`,
        padding: isSidebarCollapsed ? '20px 8px 20px' : '20px 14px 20px',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
        gap: 2,
        transition: 'width 0.2s ease, padding 0.2s ease',
      }}
    >
      {/* Brand & Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isSidebarCollapsed ? 'center' : 'space-between', 
        padding: isSidebarCollapsed ? '6px 0 16px' : '6px 4px 16px',
        flexDirection: isSidebarCollapsed ? 'column' : 'row',
        gap: isSidebarCollapsed ? 12 : 0,
      }}>
        {!isSidebarCollapsed ? (
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              padding: 0,
            }}
          >
            <img src={logoP} alt="Prestek" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: C.ink }}>
                Prestek
              </span>
              <span style={{
                fontFamily: '"JetBrains Mono", monospace', fontWeight: 500,
                fontSize: 9.5, letterSpacing: '0.22em', color: C.muted,
                marginTop: 3, textTransform: 'uppercase',
              }}>
                Intranet
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              display: 'flex', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <img src={logoP} alt="Prestek" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          </button>
        )}

        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: C.ink2, display: 'flex', padding: 6, borderRadius: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = C.surface}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <CollapseIcon collapsed={isSidebarCollapsed} />
        </button>
      </div>

      {/* Search box */}
      {isSidebarCollapsed ? (
        <button
          onClick={() => {
            setIsSidebarCollapsed(false);
            localStorage.setItem('@PrestekIntranet:sidebarCollapsed', 'false');
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }, 100);
          }}
          title="Buscar..."
          style={{
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 10,
            background: C.surface, border: `1px solid ${C.line}`,
            boxShadow: `0 1px 2px ${C.accentDeep}05`,
            cursor: 'pointer', color: C.muted,
          }}
        >
          <Icons.Search />
        </button>
      ) : (
        <div style={{
          margin: '0 4px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 10,
          background: C.surface, border: `1px solid ${C.line}`,
          boxShadow: `0 1px 2px ${C.accentDeep}05`,
        }}>
          <span style={{ color: C.muted, display: 'flex' }}>
            <Icons.Search />
          </span>
          <input
            ref={searchInputRef}
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            style={{
              flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: C.ink, fontFamily: 'inherit',
            }}
          />
          <span style={{
            fontSize: 9, padding: '2px 4px', borderRadius: 4,
            border: `1px solid ${C.line}`, color: C.muted, background: C.surfaceSoft,
            fontFamily: 'monospace',
          }}>⌘K</span>
        </div>
      )}

      {/* Dashboard link */}
      <NavRow
        id="dashboard"
        icon="Dashboard"
        label="Dashboard"
        active={currentView === 'dashboard'}
        onClick={setCurrentView}
      />

      <GroupLabel showSeparator={false}>Menu</GroupLabel>
      {menuItems.map(item => (
        <NavRow
          key={item.id}
          {...item}
          active={currentView === item.id}
          onClick={setCurrentView}
        />
      ))}

      <GroupLabel showSeparator={true}>Sistema</GroupLabel>
      {systemItems.map(item => (
        <NavRow
          key={item.id}
          {...item}
          active={currentView === item.id}
          onClick={setCurrentView}
        />
      ))}

      <div style={{ flex: 1 }} />

      {/* User profile card with Popup Dropdown */}
      {user && (
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          {/* Popup Dropdown Menu */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: isSidebarCollapsed ? 0 : 64,
                left: isSidebarCollapsed ? 64 : 4,
                width: 220,
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: 12,
                boxShadow: C.shadowLg || '0 10px 25px rgba(11,27,46,0.12)',
                padding: '6px',
                zIndex: 1000,
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                animation: 'popup-in 150ms cubic-bezier(0.4, 0, 0.2, 1) both',
              }}
            >
              {/* Preferences */}
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setIsProfileMenuOpen(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: C.ink, fontSize: 13,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceSoft}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: C.ink2, display: 'flex' }}><Icons.Settings /></span>
                <span style={{ flex: 1 }}>Configurações</span>
              </button>

              {/* Dark Mode Toggle Row */}
              <div
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: 'transparent', color: C.ink, fontSize: 13,
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceSoft}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: C.ink2, display: 'flex' }}><MoonIcon /></span>
                <span style={{ flex: 1 }}>Modo Escuro</span>
                <ToggleSwitch checked={isDark} C={C} />
              </div>

              {/* Dark variant colors (only shown if isDark) */}
              {isDark && (
                <div style={{
                  padding: '4px 10px 8px 38px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {/* Cyber (blue) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDarkVariant('cyber'); }}
                    title="Cyber-Obsidian"
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#00F2FE', border: darkVariant === 'cyber' ? `2px solid ${C.ink}` : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                  {/* Aurora (purple) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDarkVariant('aurora'); }}
                    title="Space Aurora"
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#8A2BE2', border: darkVariant === 'aurora' ? `2px solid ${C.ink}` : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                  {/* Amoled (black) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDarkVariant('amoled'); }}
                    title="AMOLED Pure"
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#222', border: darkVariant === 'amoled' ? `2px solid ${C.ink}` : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                </div>
              )}

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '4px 4px', opacity: 0.5 }} />

              {/* Logout Button */}
              <button
                onClick={async () => {
                  setIsProfileMenuOpen(false);
                  if (user?.id) {
                    try { await fetch(`/api/presenca/${user.id}/logout`, { method: 'POST' }); } catch (_) {}
                  }
                  localStorage.removeItem('@Stitch:user');
                  localStorage.removeItem('@Stitch:currentView');
                  sessionStorage.removeItem('@Stitch:user');
                  sessionStorage.removeItem('@Stitch:currentView');
                  setCurrentView('login');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: C.danger || '#ef4444', fontSize: 13,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all 0.12s',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.dangerSoft || 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = C.dangerDeep || '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.danger || '#ef4444';
                }}
              >
                <span style={{ color: 'inherit', display: 'flex' }}><Icons.Logout /></span>
                <span style={{ flex: 1 }}>Sair da Conta</span>
              </button>
            </div>
          )}

          {/* Separator above profile */}
          <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '12px 4px 12px', opacity: 0.7 }} />

          {/* Profile pill button */}
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            onMouseEnter={() => setProfileHover(true)}
            onMouseLeave={() => setProfileHover(false)}
            title={isSidebarCollapsed ? displayName : undefined}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '8px 0' : '8px 10px', 
              borderRadius: 12, 
              cursor: 'pointer',
              background: profileHover || isProfileMenuOpen ? C.surface : 'transparent',
              boxShadow: profileHover || isProfileMenuOpen ? '0 1px 3px rgba(11, 27, 46, 0.05)' : 'none',
              transition: 'all .12s',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              border: 'none', width: '100%',
            }}
          >
            <img
              src={avatarUrl || defaultAvatar}
              alt={safeName}
              style={{
                width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                background: C.surface, flexShrink: 0,
              }}
            />
            {!isSidebarCollapsed && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, lineHeight: 1.2, marginLeft: 10 }}>
                  <span style={{
                    fontWeight: 700, fontSize: 13, color: C.ink,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {displayName}
                  </span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace', fontWeight: 500,
                    fontSize: 9.5, color: C.muted, textTransform: 'uppercase',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginTop: 2,
                  }}>
                    {cargoName}
                  </span>
                </div>
                <span style={{ color: C.muted, display: 'flex', flexShrink: 0 }}>
                  <ChevronUpDownIcon />
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Popup animation styles */}
      <style>{`
        @keyframes popup-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </aside>
  );
}

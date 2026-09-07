import { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from './common/Icons';
import logoP from '../image/logos/Logo_P.webp';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { resolveNomeSetor } from '../utils/resolveSetor';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';
import { useNotificacoes } from '../hooks/useComunicados';
import { useDismissable } from '../hooks/useDismissable';
import { visibleNav } from '../navigation';
import { nomeCurto } from '../utils/nomeExibicao';
import ProfileMenu from './ProfileMenu';

const defaultAvatar = AVATAR_PNGS[7];
const FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

const CollapseIcon = ({ collapsed }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

const ChevronUpDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'flex' }}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </svg>
);

// Componentes de linha no escopo do módulo: definidos dentro do render da
// Sidebar, cada estado (hover do perfil, poll do badge) recriava o tipo e o
// React remontava os 12 botões da nav, perdendo hover e foco.

function GroupLabel({ C, collapsed, children, showSeparator = true }) {
  if (collapsed) {
    return showSeparator
      ? <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '14px 4px 10px', opacity: 0.7 }} />
      : <div style={{ height: 10 }} />;
  }
  return (
    <>
      {showSeparator && <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '14px 4px 10px', opacity: 0.7 }} />}
      <div style={{
        marginTop: showSeparator ? 0 : 12, marginBottom: 6, padding: '0 12px',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.ink2,
      }}>
        {children}
      </div>
    </>
  );
}

function NavRow({ C, collapsed, id, icon, label, active, badge, onClick }) {
  const [hover, setHover] = useState(false);
  const IconComponent = Icons[icon];
  const badgeLabel = badge > 9 ? '9+' : badge;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? (badge ? `${label}, ${badge} não lidos` : label) : undefined}
      title={collapsed ? label : undefined}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 12,
        padding: '9px 12px', borderRadius: 8, cursor: 'pointer', width: '100%', textAlign: 'left',
        // Item ativo como o DESIGN.md documenta (nav-item-active): fundo
        // Laranja Suave, texto no laranja de texto, ícone no accent.
        background: active ? C.accentSoft : (hover ? C.surface : 'transparent'),
        color: active ? C.accentDark : (hover ? C.ink : C.ink2),
        border: 'none',
        fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: FONT,
        transition: 'background .12s, color .12s',
      }}
    >
      <span style={{ display: 'flex', color: active || hover ? C.accent : C.ink2 }} aria-hidden="true">
        {IconComponent && <IconComponent />}
      </span>
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge > 0 && (
        <span
          aria-label={`${badge} não lidos`}
          style={{
            background: active ? C.accent : C.dangerSoft,
            color: active ? C.surface : C.dangerStrong,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
            minWidth: 18, height: 18, padding: '0 6px', borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {badgeLabel}
        </span>
      )}
      {collapsed && badge > 0 && (
        <span aria-hidden="true" style={{
          position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4,
          background: active ? C.accent : C.danger,
        }} />
      )}
    </button>
  );
}

export default function Sidebar({ currentView, setCurrentView, user, searchQuery, setSearchQuery }) {
  const C = useBentoTheme();
  const { naoLidos } = useNotificacoes(user);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const profileRef = useRef(null);
  const closeProfile = useCallback(() => setIsProfileMenuOpen(false), []);
  useDismissable(profileRef, { open: isProfileMenuOpen, onClose: closeProfile });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('@PrestekIntranet:sidebarCollapsed') === 'true'
  );
  const setCollapsed = useCallback((next) => {
    setIsSidebarCollapsed(next);
    localStorage.setItem('@PrestekIntranet:sidebarCollapsed', String(next));
  }, []);

  const func = user?.funcionario ?? {};
  const safeName = func.funcionario || user?.nome || 'Usuário';
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const safeId = func.id ?? user?.id ?? null;
  const displayName = nomeCurto(safeName) || 'Usuário';

  const [avatarUrl, setAvatarUrl] = useState(resolveAvatarUrl(func.foto_perfil) || defaultAvatar);
  const [cargoName, setCargoName] = useState(safeRole);
  const searchInputRef = useRef(null);

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
      .then(setCargoName)
      .catch((err) => console.error('Erro ao resolver setor no sidebar:', err));
  }, [safeDepto, safeRole, user?.nome_grupo]);

  // Avatar: foto do IXC, sobrescrita pelo que Configurações salvou localmente.
  // Sem polling: Configurações dispara `stitch:avatar` ao salvar.
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

  // Busca só existe em Serviços (é o único consumidor de `searchQuery`).
  const showSearch = currentView === 'services';

  useEffect(() => {
    if (!showSearch) return undefined;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSidebarCollapsed) setCollapsed(false);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSearch, isSidebarCollapsed, setCollapsed]);

  // Overlays `fixed` (comparador de planos) leem a largura publicada aqui.
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', isSidebarCollapsed ? '72px' : '248px');
  }, [isSidebarCollapsed]);

  const nav = visibleNav(user);
  const inicio = nav.filter((i) => i.group === 'inicio');
  const menu = nav.filter((i) => i.group === 'menu');
  const sistema = nav.filter((i) => i.group === 'sistema');
  const badgeFor = (item) => (item.badge === 'comunicados' ? naoLidos : undefined);

  const renderRow = (item) => (
    <NavRow
      key={item.id}
      C={C}
      collapsed={isSidebarCollapsed}
      id={item.id}
      icon={item.icon}
      label={item.label}
      active={currentView === item.id}
      badge={badgeFor(item)}
      onClick={setCurrentView}
    />
  );

  return (
    <aside
      className="hidden lg:flex flex-col"
      aria-label="Barra lateral"
      style={{
        width: isSidebarCollapsed ? 72 : 248, flexShrink: 0,
        background: C.surfaceSoft, borderRight: `1px solid ${C.line}`,
        padding: isSidebarCollapsed ? '20px 8px 20px' : '20px 14px 20px',
        position: 'sticky', top: 0, height: '100dvh',
        // `visible` para o popup do perfil poder sair da coluna no modo
        // colapsado; a rolagem fica no <nav>.
        overflow: 'visible', zIndex: 1000,
        gap: 2, transition: 'width 0.2s ease, padding 0.2s ease',
      }}
    >
      {/* Marca e colapsar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
        padding: isSidebarCollapsed ? '6px 0 16px' : '6px 4px 16px',
        flexDirection: isSidebarCollapsed ? 'column' : 'row', gap: isSidebarCollapsed ? 12 : 0,
      }}>
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          aria-label="Prestek Intranet, ir para o Início"
          style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 8, fontFamily: FONT }}
        >
          <img src={logoP} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          {!isSidebarCollapsed && (
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: C.ink }}>Prestek</span>
              <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: C.ink2, marginTop: 3, textTransform: 'uppercase' }}>Intranet</span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!isSidebarCollapsed}
          title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.ink2, display: 'flex', padding: 6, borderRadius: 8, transition: 'background 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.surface; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <CollapseIcon collapsed={isSidebarCollapsed} />
        </button>
      </div>

      {/* Busca de planos (só em Serviços) */}
      {showSearch && (isSidebarCollapsed ? (
        <button
          type="button"
          onClick={() => { setCollapsed(false); setTimeout(() => searchInputRef.current?.focus(), 50); }}
          aria-label="Buscar planos"
          title="Buscar planos"
          style={{
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 8, background: C.surface, border: `1px solid ${C.line}`,
            boxShadow: 'var(--shadow-sm)', cursor: 'pointer', color: C.ink2,
          }}
        >
          <Icons.Search />
        </button>
      ) : (
        <div style={{
          margin: '0 4px 16px', display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 12, background: C.surface, border: `1px solid ${C.line}`, boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ color: C.ink2, display: 'flex' }} aria-hidden="true"><Icons.Search /></span>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); e.currentTarget.blur(); } }}
            placeholder="Buscar planos por nome, valor ou ID"
            aria-label="Buscar planos por nome, valor ou ID"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', fontSize: 13, color: C.ink, fontFamily: 'inherit' }}
          />
          <kbd style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
            border: `1px solid ${C.line}`, color: C.ink2, background: C.surfaceSoft,
          }}>Ctrl+K</kbd>
        </div>
      ))}

      {/* Navegação (rola sozinha em telas baixas) */}
      <nav aria-label="Navegação principal" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 2, margin: '0 -2px', padding: '0 2px' }}>
        {inicio.map(renderRow)}
        <GroupLabel C={C} collapsed={isSidebarCollapsed} showSeparator={false}>Menu</GroupLabel>
        {menu.map(renderRow)}
        <GroupLabel C={C} collapsed={isSidebarCollapsed}>Sistema</GroupLabel>
        {sistema.map(renderRow)}
      </nav>

      {/* Perfil */}
      {user && (
        <div style={{ position: 'relative' }} ref={profileRef}>
          {isProfileMenuOpen && (
            <div
              role="menu"
              aria-label="Sua conta"
              style={{
                position: 'absolute',
                bottom: isSidebarCollapsed ? 0 : 64,
                left: isSidebarCollapsed ? 64 : 4,
                width: 232, background: C.popover, border: `1px solid ${C.line}`,
                borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 50,
                animation: 'popup-in 150ms cubic-bezier(0.4, 0, 0.2, 1) both',
              }}
            >
              <ProfileMenu user={user} setCurrentView={setCurrentView} onClose={closeProfile} dense />
            </div>
          )}

          <hr style={{ border: 'none', borderTop: `1px solid ${C.line}`, margin: '12px 4px 12px', opacity: 0.7 }} />

          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((v) => !v)}
            onMouseEnter={() => setProfileHover(true)}
            onMouseLeave={() => setProfileHover(false)}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            aria-label={isSidebarCollapsed ? `Conta de ${displayName}` : undefined}
            title={isSidebarCollapsed ? displayName : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '8px 0' : '8px 10px', borderRadius: 12, cursor: 'pointer',
              background: profileHover || isProfileMenuOpen ? C.surface : 'transparent',
              boxShadow: profileHover || isProfileMenuOpen ? 'var(--shadow-sm)' : 'none',
              transition: 'background .12s', fontFamily: FONT, border: 'none', width: '100%', textAlign: 'left',
            }}
          >
            <img
              src={avatarUrl || defaultAvatar}
              alt=""
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', background: C.surface, flexShrink: 0 }}
            />
            {!isSidebarCollapsed && (
              <>
                <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, lineHeight: 1.2, marginLeft: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: C.ink2, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {cargoName}
                  </span>
                </span>
                <span style={{ color: C.ink2, display: 'flex', flexShrink: 0 }}><ChevronUpDownIcon /></span>
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </aside>
  );
}

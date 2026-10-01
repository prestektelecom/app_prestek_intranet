// Prestek Intranet · Dashboard v2 — Modern bento layout.
// Mesma DNA visual do login (azul #4A9EF5, Plus Jakarta + JetBrains Mono),
// mas com hierarquia mais expressiva, grid assimétrico, e micro-detalhes
// modernos (sparkline real, status pills animados, atividade ao vivo,
// sidebar com glow).

const C = {
  bg: '#F5F9FF',
  bgDeep: '#EEF4FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  accent: '#4A9EF5',
  accentDark: '#2D7BD4',
  accentDeep: '#1F5BA8',
  accentSoft: '#EAF4FF',
  cyan: '#7FD4E8',
  mint: '#7FD8B8',
  ink: '#0B1B2E',
  ink2: '#475467',
  muted: '#8896A8',
  line: '#E4ECF5',
  lineSoft: '#EFF4FA',
  success: '#1F8A5B',
  successSoft: '#E6F4EC',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#E84545',
  dangerSoft: '#FDEDED',
};

function tone(hex, a) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

// ─── Brand mark ─────────────────────────────────────────────────────────
function PrestekMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill={C.accent} />
      <rect x="11" y="11" width="18" height="18" rx="4" fill={C.accent} opacity="0.45" />
      <rect x="11" y="11" width="10" height="10" rx="2" fill={C.accent} />
    </svg>
  );
}

// ─── Icons (compact) ────────────────────────────────────────────────────
const sk = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
const I = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  Tools: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M14.7 6.3a4 4 0 1 0 5 5l-3-3 1-1-2-2-1 1-3-3-2 2 2 2-7 7v3h3l7-7 2 2 1-1z" /></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /></svg>,
  People: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><circle cx="9" cy="9" r="3.5" /><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" /><circle cx="17" cy="8" r="2.5" /><path d="M16 14c3 0 5 1.8 5 4.5" /></svg>,
  Pie: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><circle cx="12" cy="12" r="9" /><path d="M12 3v9h9" /></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2" /></svg>,
  Doc: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 14h8M8 18h5" /></svg>,
  Ticket: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /></svg>,
  Megaphone: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M3 11v2l13 5V6L3 11zM16 8v8" /></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></svg>,
  Admin: () => <svg width="20" height="20" viewBox="0 0 24 24" {...sk}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><circle cx="12" cy="10" r="2" /><path d="M8 17c.5-2 2-3 4-3s3.5 1 4 3" /></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" {...sk}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" {...sk}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" {...sk}><path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" /><path d="M18 8l4 4-4 4M22 12H10" /></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" {...sk}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  Room: () => <svg width="22" height="22" viewBox="0 0 24 24" {...sk}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 6l9-3 9 3M8 12h8M8 16h5" /></svg>,
  Headset: () => <svg width="22" height="22" viewBox="0 0 24 24" {...sk}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="2" /><rect x="17" y="14" width="4" height="6" rx="2" /></svg>,
  Badge: () => <svg width="22" height="22" viewBox="0 0 24 24" {...sk}><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="10" r="2.5" /><path d="M8 17c.5-2 2-3 4-3s3.5 1 4 3" /><path d="M10 3h4v3h-4z" /></svg>,
  Lightning: () => <svg width="22" height="22" viewBox="0 0 24 24" {...sk}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>,
  ArrowUR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>,
  ArrowR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  TrendDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l7 7 4-4 7 7M21 17v-4h-4" /></svg>,
  TrendUp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l7-7 4 4 7-7M21 7v4h-4" /></svg>,
  More: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" {...sk}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
};

// ─── Sidebar (icon rail + flyout label on hover, more modern) ───────────
function SideRail() {
  const items = [
    { id: 'dashboard', icon: <I.Dashboard />, label: 'Dashboard', active: true, group: 'main' },
    { id: 'servicos', icon: <I.Tools />, label: 'Serviços', group: 'menu' },
    { id: 'cobertura', icon: <I.Shield />, label: 'Cobertura', group: 'menu' },
    { id: 'colaboradores', icon: <I.People />, label: 'Colaboradores', group: 'menu' },
    { id: 'setores', icon: <I.Pie />, label: 'Setores', group: 'menu' },
    { id: 'plantao', icon: <I.Clock />, label: 'Plantão', group: 'menu' },
    { id: 'escritorios', icon: <I.Building />, label: 'Escritórios', group: 'menu' },
    { id: 'processos', icon: <I.Doc />, label: 'Processos', group: 'menu' },
    { id: 'chamados', icon: <I.Ticket />, label: 'Meus Chamados', badge: '2', group: 'menu' },
    { id: 'comunicados', icon: <I.Megaphone />, label: 'Comunicados', group: 'sistema' },
    { id: 'config', icon: <I.Settings />, label: 'Configurações', group: 'sistema' },
    { id: 'admin', icon: <I.Admin />, label: 'Painel Admin', group: 'sistema' },
  ];

  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: 'white',
      borderRight: `1px solid ${C.line}`,
      padding: '20px 14px 20px',
      position: 'sticky', top: 0, height: '100vh',
      display: 'flex', flexDirection: 'column', gap: 2,
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 10px 22px' }}>
        <PrestekMark size={30} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: C.ink }}>
            Prestek
          </span>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontWeight: 500,
            fontSize: 9.5, letterSpacing: '0.22em', color: C.muted,
            marginTop: 3, textTransform: 'uppercase',
          }}>Intranet</span>
        </div>
      </div>

      {items.filter(i => i.group === 'main').map(it => <NavRow key={it.id} {...it} />)}

      <GroupLabel>Menu</GroupLabel>
      {items.filter(i => i.group === 'menu').map(it => <NavRow key={it.id} {...it} />)}

      <GroupLabel>Sistema</GroupLabel>
      {items.filter(i => i.group === 'sistema').map(it => <NavRow key={it.id} {...it} />)}

      <div style={{ flex: 1 }} />

      {/* Help card — more modern, slimmer */}
      <div style={{
        marginTop: 16, padding: 14, borderRadius: 14,
        background: `linear-gradient(140deg, ${C.accent} 0%, ${C.accentDeep} 100%)`,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: 55,
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -20, width: 90, height: 90, borderRadius: 45,
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}><I.Headset /></div>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Precisa de Ajuda?</div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>
            Suporte de TI disponível.
          </div>
          <button style={{
            marginTop: 11, width: '100%', height: 32, border: 'none', borderRadius: 8,
            background: 'white', color: C.accentDeep, fontFamily: 'inherit',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>Contatar <I.ArrowR /></button>
        </div>
      </div>
    </aside>
  );
}

function GroupLabel({ children }) {
  return (
    <div style={{
      marginTop: 18, marginBottom: 4, padding: '0 12px',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
      letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
    }}>{children}</div>
  );
}

function NavRow({ icon, label, active, badge }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
        background: active ? C.accentSoft : (hover ? C.surfaceSoft : 'transparent'),
        color: active ? C.accentDeep : (hover ? C.ink : C.ink2),
        fontWeight: active ? 600 : 500, fontSize: 13.5,
        transition: 'all .12s',
      }}>
      <span style={{ display: 'flex', color: active ? C.accent : (hover ? C.accent : C.muted) }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          background: active ? C.accent : '#FFE6E0', color: active ? 'white' : C.danger,
          fontSize: 10.5, fontWeight: 700,
          minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{badge}</span>
      )}
    </div>
  );
}

// ─── Top Bar ────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      height: 72, background: 'rgba(245,249,255,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24,
    }}>
      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 540, display: 'flex', alignItems: 'center', gap: 10,
        height: 42, padding: '0 14px',
        background: 'white', border: `1px solid ${C.line}`, borderRadius: 12,
        boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
      }}>
        <span style={{ color: C.muted, display: 'flex' }}><I.Search /></span>
        <input placeholder="Buscar serviços, pessoas ou documentos..."
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: C.ink,
          }} />
        <span style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
          padding: '3px 7px', border: `1px solid ${C.line}`, borderRadius: 5,
          color: C.muted, background: C.surfaceSoft,
        }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={iconBtn}>
          <span style={{ position: 'relative', display: 'flex', color: C.ink2 }}>
            <I.Bell />
            <span style={{
              position: 'absolute', top: -3, right: -3, width: 8, height: 8,
              borderRadius: 4, background: C.danger, border: '2px solid #F5F9FF',
            }} />
          </span>
        </button>
        <button style={iconBtn}><span style={{ color: C.ink2, display: 'flex' }}><I.Logout /></span></button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6,
          padding: '5px 14px 5px 5px', borderRadius: 999,
          background: 'white', border: `1px solid ${C.line}`,
          boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
        }}>
          <Avatar name="Kleanne Lins" size={34} color={['#FFB259', '#5C3A12']} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, letterSpacing: '0.02em' }}>
              KLEANNE LINS CAMILO
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5,
              color: C.muted, letterSpacing: '0.15em', marginTop: 2,
            }}>COMERCIAL</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const iconBtn = {
  width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.line}`, cursor: 'pointer',
  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all .12s', boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
};

// ─── Avatar ─────────────────────────────────────────────────────────────
function Avatar({ name, size = 32, color }) {
  const initials = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
  const palette = color || [C.accent, '#fff'];
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: palette[0], color: palette[1],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: '0.02em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────
function Sparkline({ data, color = C.accent, height = 56, fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = ((max - v) / range) * (height - 4) + 2;
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${path} L ${w} ${height} L 0 ${height} Z`;
  const gid = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {/* Last point dot */}
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]}
        r="2" fill={color} stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── Hero card (Welcome + integrated meta) ──────────────────────────────
function HeroCard() {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
      borderRadius: 24, padding: '32px 36px', color: 'white',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
    }}>
      {/* Decorative grid + orbs */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="100%" height="100%">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 360, height: 360,
        borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: 80, width: 220, height: 220,
        borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)'
      }} />

      <div style={{
        position: 'relative', display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 24, flexWrap: 'wrap'
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            fontSize: 11.5, fontWeight: 600,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: C.mint }} />
            Dom · 17 Mai 2026 · 11:36
          </div>
          <h1 style={{
            margin: '16px 0 8px', fontSize: 38, fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.08,
          }}>
            Bom dia, <span style={{
              background: `linear-gradient(135deg, #FFFFFF 0%, ${C.cyan} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Kleanne</span> 👋
          </h1>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5 }}>
            Aqui está o resumo do setor <strong>Comercial</strong> — tudo
            operando dentro do esperado.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 18px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
            color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer',
          }}>
            <I.Sparkle /> Assistente
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 18px', borderRadius: 11, border: 'none',
            background: 'white', color: C.accentDeep,
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            boxShadow: `0 8px 20px ${tone('#000', 0.18)}`,
          }}>
            <I.Plus /> Novo Chamado
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KPI card with sparkline ────────────────────────────────────────────
function KpiCard({ label, value, sub, subTone, sparkData, sparkColor, accent = C.accent }) {
  const subColor = { success: C.success, danger: C.danger, muted: C.ink2, warning: C.warning }[subTone] || C.ink2;
  const subBg = { success: C.successSoft, danger: C.dangerSoft, warning: C.warningSoft, muted: C.surfaceSoft }[subTone] || C.surfaceSoft;
  return (
    <div style={{
      background: 'white', borderRadius: 18, border: `1px solid ${C.line}`,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
          letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
        }}>{label}</div>
        {sub && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 999,
            background: subBg, color: subColor,
            fontSize: 11, fontWeight: 700,
          }}>
            {subTone === 'danger' && <I.TrendDown />}
            {subTone === 'success' && <I.Check />}
            {sub}
          </div>
        )}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 800, color: C.ink,
        letterSpacing: '-0.03em', lineHeight: 1,
      }}>{value}</div>
      {sparkData && (
        <div style={{ marginTop: 'auto' }}>
          <Sparkline data={sparkData} color={sparkColor || accent} height={48} />
        </div>
      )}
    </div>
  );
}

// ─── Bento large cards ──────────────────────────────────────────────────
function SetorBento() {
  // Cluster of 3 KPI mini-cards (replaces the previous bar-chart bento)
  return (
    <div style={{
      gridColumn: 'span 6',
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
      alignContent: 'stretch',
    }}>
      <KpiCard
        label="Chamados resolvidos"
        value="47"
        sub="+12%"
        subTone="success"
        sparkData={[20, 28, 22, 32, 30, 38, 42, 47]}
        sparkColor={C.success}
      />
      <KpiCard
        label="Tempo médio · resposta"
        value="12m"
        sub="-3min"
        subTone="success"
        sparkData={[18, 17, 16, 15, 15, 14, 13, 12]}
        sparkColor={C.accent}
      />
      <KpiCard
        label="Cobertura ativa"
        value="86%"
        sub="estável"
        subTone="muted"
        sparkData={[82, 84, 86, 85, 87, 86, 86, 86]}
        sparkColor={C.accent}
      />
    </div>
  );
}

function _SetorBento_unused() {
  return (
    <div style={{
      gridColumn: 'span 6',
      background: 'white', borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
      boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
            letterSpacing: '0.18em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
          }}>Meu Setor</div>
          <div style={{
            marginTop: 6, fontSize: 28, fontWeight: 800, color: C.ink,
            letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            Comercial
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 999,
              background: C.dangerSoft, color: C.danger,
              fontSize: 12, fontWeight: 700,
            }}>
              <I.TrendDown /> -14%
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 6 }}>
            Performance dos últimos 7 dias · vs. mês anterior
          </div>
        </div>
        <button style={{
          padding: '8px 14px', border: `1px solid ${C.line}`, borderRadius: 10,
          background: 'white', color: C.ink2, fontFamily: 'inherit',
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>Detalhes <I.ArrowUR /></button>
      </div>

      {/* Mini bar chart */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, height: 110, marginTop: 4 }}>
        {[62, 78, 54, 88, 70, 45, 58].map((h, i) => {
          const isLast = i === 6;
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6
            }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${h}%`, minHeight: 6, borderRadius: 6,
                  background: isLast
                    ? `linear-gradient(180deg, ${C.accent} 0%, ${C.accentDeep} 100%)`
                    : tone(C.accent, 0.22),
                  boxShadow: isLast ? `0 4px 12px ${tone(C.accent, 0.35)}` : 'none',
                }} />
              </div>
              <div style={{
                fontSize: 10.5, fontFamily: '"JetBrains Mono", monospace',
                color: isLast ? C.accent : C.muted, fontWeight: isLast ? 700 : 500,
              }}>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 24, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
        {[
          ['12', 'Negociações'],
          ['R$ 184k', 'Pipeline'],
          ['7d', 'Ciclo médio'],
        ].map(([n, l]) => (
          <div key={l}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>{n}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlantaoBento() {
  return (
    <div style={{
      gridColumn: 'span 3',
      background: `linear-gradient(160deg, white 0%, ${C.accentSoft} 100%)`,
      borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 130, height: 130,
        borderRadius: '50%', background: tone(C.accent, 0.10), filter: 'blur(20px)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
          letterSpacing: '0.18em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
        }}>Próximo Plantão</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'white', color: C.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${tone(C.accent, 0.20)}`,
          }}><I.Clock /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>
              Nenhum agendado
            </div>
            <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>Sem cobertura ativa</div>
          </div>
        </div>
        <button style={{
          marginTop: 16, padding: '8px 12px', borderRadius: 9,
          border: `1px solid ${tone(C.accent, 0.3)}`, background: 'white',
          color: C.accent, fontFamily: 'inherit', fontWeight: 600, fontSize: 12.5,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>Agendar plantão <I.ArrowR /></button>
      </div>
    </div>
  );
}

function OsBento() {
  return (
    <div style={{
      gridColumn: 'span 3',
      background: `linear-gradient(160deg, ${C.successSoft} 0%, white 100%)`,
      borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
          letterSpacing: '0.18em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
        }}>OS no meu nome</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 999,
          background: 'white', color: C.success,
          fontSize: 11, fontWeight: 700,
          border: `1px solid ${tone(C.success, 0.2)}`,
        }}><I.Check /> Tudo em dia</span>
      </div>
      <div style={{
        fontSize: 64, fontWeight: 800, color: C.ink,
        letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4,
      }}>0</div>
      <div style={{ fontSize: 12.5, color: C.ink2 }}>
        Nenhuma ordem de serviço pendente atribuída a você.
      </div>
    </div>
  );
}

// ─── Comunicados list (still empty, but more modern empty state) ────────
function ComunicadosCard() {
  return (
    <div style={{
      gridColumn: 'span 8',
      background: 'white', borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 24, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 17, fontWeight: 700, color: C.ink,
            letterSpacing: '-0.015em'
          }}>Comunicados Urgentes</h2>
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3 }}>
            Atualizações importantes do setor
          </div>
        </div>
        <a href="#" style={{
          fontSize: 13, fontWeight: 600, color: C.accent,
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4
        }}>
          Ver todos <I.ArrowR />
        </a>
      </div>

      {/* Activity feed — 3 calm items so it doesn't feel empty */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          {
            tag: 'INFO', tagBg: C.accentSoft, tagColor: C.accentDeep, title: 'Janela de manutenção · ERP',
            sub: 'Sábado, 22 Mai · 02:00 às 04:00', time: 'há 2h', who: 'Infra'
          },
          {
            tag: 'AVISO', tagBg: C.warningSoft, tagColor: C.warning, title: 'Nova política de senhas em vigor',
            sub: 'Renovação obrigatória a cada 90 dias', time: 'ontem', who: 'Segurança'
          },
          {
            tag: 'OK', tagBg: C.successSoft, tagColor: C.success, title: 'Sistema de chamados estável',
            sub: 'Incidente de quinta resolvido', time: '2d', who: 'NOC'
          },
        ].map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 12px', borderRadius: 12,
            transition: 'background .12s', cursor: 'pointer',
          }} onMouseEnter={e => e.currentTarget.style.background = C.surfaceSoft}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              letterSpacing: '0.12em', fontWeight: 700,
              padding: '4px 8px', borderRadius: 6,
              background: it.tagBg, color: it.tagColor, flexShrink: 0,
            }}>{it.tag}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, color: C.ink,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {it.title}
              </div>
              <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>
                {it.sub}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
                color: C.muted, letterSpacing: '0.05em',
              }}>{it.time}</div>
              <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 2 }}>{it.who}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortcutCard({ icon, label, accent = C.accent, hint }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'white', borderRadius: 14, border: `1px solid ${C.line}`,
        padding: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'all .15s',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? `0 10px 24px ${tone(C.accentDeep, 0.10)}` : 'none',
        borderColor: hover ? tone(accent, 0.4) : C.line,
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: tone(accent, 0.12), color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{hint}</div>}
      </div>
      <span style={{ color: C.muted, display: 'flex' }}><I.ArrowR /></span>
    </div>
  );
}

function AtalhosCard() {
  return (
    <div style={{
      gridColumn: 'span 4',
      background: 'white', borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 22, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14
      }}>
        <h2 style={{
          margin: 0, fontSize: 17, fontWeight: 700, color: C.ink,
          letterSpacing: '-0.015em'
        }}>Atalhos Rápidos</h2>
        <button style={{
          width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`,
          background: 'white', color: C.ink2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Plus /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ShortcutCard icon={<I.Room />} label="Reservar Sala" hint="Confluence 2A · livre" />
        <ShortcutCard icon={<I.Headset />} label="Suporte de TI" hint="Tempo médio: 12 min" />
        <ShortcutCard icon={<I.Badge />} label="Meu Perfil" hint="Dados e segurança" />
        <ShortcutCard icon={<I.Lightning />} label="Solicitar Acesso" hint="Sistemas e VPN" accent={C.warning} />
      </div>
    </div>
  );
}

// ─── Team availability ──────────────────────────────────────────────────
function TeamBento() {
  const team = [
    { name: 'Ana Souza', role: 'Vendas', online: true, color: ['#FFB259', '#5C3A12'] },
    { name: 'Bruno Lima', role: 'CS', online: true, color: ['#7FD4E8', C.accentDeep] },
    { name: 'Carla Reis', role: 'Vendas', online: true, color: ['#7FD8B8', '#0B4A2D'] },
    { name: 'Diego Pinto', role: 'CS', online: false, color: ['#C7B8FF', '#2E1B6E'] },
    { name: 'Eva Mendes', role: 'Vendas', online: false, color: ['#FFB8D1', '#7A1B45'] },
  ];
  return (
    <div style={{
      gridColumn: 'span 4',
      background: 'white', borderRadius: 20, border: `1px solid ${C.line}`,
      padding: 22, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 16
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 17, fontWeight: 700, color: C.ink,
            letterSpacing: '-0.015em'
          }}>Disponibilidade</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ position: 'relative', width: 8, height: 8 }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 4, background: C.success,
              }} />
              <span style={{
                position: 'absolute', inset: -3, borderRadius: 7,
                background: C.success, opacity: 0.3,
                animation: 'pulse 1.8s ease-out infinite',
              }} />
            </span>
            <span style={{ fontSize: 12.5, color: C.ink2 }}>
              <strong style={{ color: C.ink }}>3 online</strong> de 5 membros
            </span>
          </div>
        </div>
        <button style={{
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'transparent', color: C.muted, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.More /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {team.map(m => (
          <div key={m.name} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 4px', borderRadius: 8,
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={m.name} size={32} color={m.color} />
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: 5,
                background: m.online ? C.success : C.muted,
                border: '2px solid white',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: C.ink,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {m.name}
              </div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{m.role}</div>
            </div>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              color: m.online ? C.success : C.muted,
            }}>{m.online ? 'Online' : 'Ausente'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      color: C.ink,
      display: 'flex', alignItems: 'flex-start',
    }}>
      <SideRail />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />

        <main style={{
          padding: '28px 36px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}>
          <HeroCard />

          <SetorBento />
          <PlantaoBento />
          <OsBento />

          <ComunicadosCard />
          <AtalhosCard />

          <TeamBento />

          {/* Footer */}
          <div style={{
            gridColumn: '1 / -1',
            marginTop: 12, paddingTop: 18, borderTop: `1px solid ${C.line}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 11.5, color: C.muted,
            fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em',
          }}>
            <span>© 2026 Prestek Inc. · Portal Interno · Confidencial.</span>
            <div style={{ display: 'flex', gap: 22 }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Política de Privacidade</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Diretrizes Internas</a>
              <span style={{ color: C.success }}>● v1.0.0</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });

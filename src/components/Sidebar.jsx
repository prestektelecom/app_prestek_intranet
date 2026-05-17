import { useState, useEffect } from 'react';
import { Icons } from './common/Icons';
import logoP from '../image/logos/Logo_P.webp';

const C = {
  accent: '#4A9EF5',
  accentDeep: '#1F5BA8',
  accentSoft: '#EAF4FF',
  surfaceSoft: '#F7FAFD',
  ink: '#0B1B2E',
  ink2: '#475467',
  muted: '#8896A8',
  line: '#E4ECF5',
};

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

function GroupLabel({ children }) {
  return (
    <div style={{
      marginTop: 18, marginBottom: 4, padding: '0 12px',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
      letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function NavRow({ id, icon, label, active, badge, onClick }) {
  const [hover, setHover] = useState(false);
  const IconComponent = Icons[icon];

  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
        background: active ? C.accentSoft : (hover ? C.surfaceSoft : 'transparent'),
        color: active ? C.accentDeep : (hover ? C.ink : C.ink2),
        fontWeight: active ? 600 : 500, fontSize: 13.5,
        transition: 'all .12s',
        border: 'none', width: '100%', textAlign: 'left',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <span style={{ display: 'flex', color: active ? C.accent : (hover ? C.accent : C.muted) }}>
        {IconComponent && <IconComponent />}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          background: active ? C.accent : '#FFE6E0',
          color: active ? 'white' : '#E84545',
          fontSize: 10.5, fontWeight: 700,
          minWidth: 18, height: 18, padding: '0 6px', borderRadius: 9,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ currentView, setCurrentView }) {
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
        width: 248, flexShrink: 0,
        background: 'white',
        borderRight: `1px solid ${C.line}`,
        padding: '20px 14px 20px',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
        gap: 2,
      }}
    >
      {/* Brand */}
      <button
        onClick={() => setCurrentView('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '6px 10px 22px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
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

      {/* Dashboard link */}
      <NavRow
        id="dashboard"
        icon="Dashboard"
        label="Dashboard"
        active={currentView === 'dashboard'}
        onClick={setCurrentView}
      />

      <GroupLabel>Menu</GroupLabel>
      {menuItems.map(item => (
        <NavRow
          key={item.id}
          {...item}
          active={currentView === item.id}
          onClick={setCurrentView}
        />
      ))}

      <GroupLabel>Sistema</GroupLabel>
      {systemItems.map(item => (
        <NavRow
          key={item.id}
          {...item}
          active={currentView === item.id}
          onClick={setCurrentView}
        />
      ))}

      <div style={{ flex: 1 }} />

      {/* Help card */}
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
          }}>
            <Icons.Headset />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Precisa de Ajuda?</div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4, lineHeight: 1.4 }}>
            Suporte de TI disponível.
          </div>
          <button style={{
            marginTop: 11, width: '100%', height: 32, border: 'none', borderRadius: 8,
            background: 'white', color: C.accentDeep,
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            Contatar <Icons.ArrowR />
          </button>
        </div>
      </div>
    </aside>
  );
}

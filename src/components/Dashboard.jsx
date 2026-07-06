import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { resolveNomeSetor } from '../utils/resolveSetor'
import Sparkline from './common/Sparkline'
import BentoAvatar from './common/Avatar'
import { Icons } from './common/Icons'
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs'
import TiSupportModal from './TiSupportModal'
import { useBentoTheme } from '../hooks/useBentoTheme'
import { tone } from '../utils/tone'
import BentoCard from './common/BentoCard'

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function KpiCard({ C, label, value, sub, subTone, sparkData, sparkColor }) {
  const subColor = { success: C.success, danger: C.danger, muted: C.ink2, warning: C.warning }[subTone] || C.ink2;
  const subBg = { success: C.successSoft, danger: C.dangerSoft, warning: C.warningSoft, muted: C.surfaceSoft }[subTone] || C.surfaceSoft;

  return (
    <div style={{
      background: C.surface, borderRadius: 18, border: `1px solid ${C.line}`,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        {sub && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: subBg, color: subColor, fontSize: 11, fontWeight: 700 }}>
            {subTone === 'danger' && <Icons.TrendDown />}
            {subTone === 'success' && <Icons.Check />}
            {sub}
          </div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sparkData && (
        <div style={{ marginTop: 'auto' }}>
          <Sparkline data={sparkData} color={sparkColor || C.accent} height={44} />
        </div>
      )}
    </div>
  );
}

function HeroCard({ C, firstName, cargoName, currentDateTime, setCurrentView }) {
  return (
    <div style={{
      background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
      borderRadius: 24, padding: '32px 36px', color: 'white',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
    }}>
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="100%" height="100%">
        <defs><pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -100, right: 80, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            fontSize: 11.5, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7FD8B8' }} />
            {currentDateTime || '...'}
          </div>
          <h1 style={{ margin: '16px 0 8px', fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Olá,{' '}
            <span style={{ background: `linear-gradient(135deg, #FFFFFF 0%, ${C.cyan} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {firstName}
            </span>{' '}👋
          </h1>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5 }}>
            Bem-vindo ao seu painel, setor <strong>{cargoName || '...'}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 18px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
            color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          }}><Icons.Sparkle /> Assistente</button>

        </div>
      </div>
    </div>
  );
}

function SetorBento({ C, eficiencia, eficienciaLoading }) {
  const efVal = eficienciaLoading ? '...' : eficiencia?.sem_dados ? 'N/A' : `${eficiencia?.eficiencia_atual ?? '–'}%`;
  const efSub = !eficienciaLoading && eficiencia && !eficiencia.sem_dados && eficiencia.variacao !== null
    ? { text: `${eficiencia.variacao >= 0 ? '+' : ''}${eficiencia.variacao}%`, tone: eficiencia.variacao >= 0 ? 'success' : 'danger' }
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, height: '100%' }}>
      <KpiCard
        C={C}
        label="Eficiência"
        value={efVal}
        sub={efSub?.text}
        subTone={efSub?.tone}
        sparkData={[72, 68, 75, 80, 78, 82, 85, eficiencia?.eficiencia_atual || 80]}
        sparkColor={C.success}
      />
      <KpiCard
        C={C}
        label="OS Fechadas"
        value={eficienciaLoading ? '...' : (eficiencia?.total_os_mes ?? '–')}
        sub={eficiencia?.no_prazo_mes != null ? `${eficiencia.no_prazo_mes} no prazo` : null}
        subTone="success"
        sparkData={[8, 12, 9, 14, 11, 15, 13, eficiencia?.total_os_mes || 12]}
        sparkColor={C.accent}
      />
      <KpiCard
        C={C}
        label="Sem SLA"
        value={eficienciaLoading ? '...' : (eficiencia?.os_sem_prazo ?? 0)}
        sub={eficiencia?.os_sem_prazo > 0 ? 'Atenção' : 'Ok'}
        subTone={eficiencia?.os_sem_prazo > 0 ? 'warning' : 'success'}
        sparkData={[2, 1, 3, 2, 1, 0, 1, eficiencia?.os_sem_prazo || 0]}
        sparkColor={C.warning}
      />
    </div>
  );
}

function PlantaoBento({ C, proximoPlantao, plantaoLoading, setCurrentView }) {
  const dateStr = plantaoLoading ? '...' : (proximoPlantao
    ? new Date(proximoPlantao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Nenhum agendado');
  const timeStr = proximoPlantao
    ? `${(proximoPlantao.horario_inicio || '09:00').slice(0, 5)} – ${(proximoPlantao.horario_fim || '17:00').slice(0, 5)}`
    : 'Sem cobertura ativa';

  return (
    <BentoCard C={C} accent="accent" glow>
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', fontWeight: 600 }}>Próximo Plantão</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentSoft, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Clock />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>{dateStr}</div>
            <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{timeStr}</div>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('schedule')}
          style={{
            marginTop: 16, padding: '8px 12px', borderRadius: 9,
            border: `1px solid ${tone(C.accent, 0.3)}`, background: C.surface,
            color: C.accent, fontFamily: 'inherit', fontWeight: 600, fontSize: 12.5,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.accentSoft; e.currentTarget.style.borderColor = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = tone(C.accent, 0.3); }}
        >Ver plantões <Icons.ArrowR /></button>
      </div>
    </BentoCard>
  );
}

function OsBento({ C, osCount, osLoading, setCurrentView }) {
  const allGood = !osLoading && osCount === 0;
  const accent = allGood ? 'success' : 'warning';
  const accentColor = allGood ? C.success : C.warning;

  return (
    <BentoCard C={C} accent={accent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase', fontWeight: 600 }}>OS no meu nome</div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: allGood ? C.successSoft : C.warningSoft, color: accentColor, fontSize: 11, fontWeight: 700, border: `1px solid ${tone(accentColor, 0.2)}` }}>
          {allGood ? <><Icons.Check /> Tudo em dia</> : `${osCount} pendente${osCount !== 1 ? 's' : ''}`}
        </span>
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 4 }}>
        {osLoading ? '...' : osCount}
      </div>
      <div style={{ fontSize: 12.5, color: C.ink2 }}>
        {allGood ? 'Nenhuma ordem de serviço pendente atribuída a você.' : 'Ordens de serviço aguardando ação.'}
      </div>
      {osCount > 0 && (
        <button
          onClick={() => setCurrentView('tickets')}
          style={{
            padding: '8px 12px', borderRadius: 9, border: `1px solid ${tone(C.warning, 0.3)}`,
            background: C.surface, color: C.warning, fontFamily: 'inherit', fontWeight: 600,
            fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
            gap: 4, alignSelf: 'flex-start', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.warningSoft; e.currentTarget.style.borderColor = C.warning; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = tone(C.warning, 0.3); }}
        >Ver OS <Icons.ArrowR /></button>
      )}
    </BentoCard>
  );
}

function ComunicadosCard({ C, setCurrentView }) {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comunicados')
      .then(r => r.json())
      .then(d => {
        if (d.sucesso) setComunicados(d.comunicados.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 4));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  function tagStyle(tipo) {
    const map = {
      Urgente: { bg: C.dangerSoft, color: C.danger, label: 'URGENTE' },
      Aviso: { bg: C.warningSoft, color: C.warning, label: 'AVISO' },
      Info: { bg: C.accentSoft, color: C.accentDeep, label: 'INFO' },
    };
    return map[tipo] || { bg: C.surfaceSoft, color: C.ink2, label: (tipo || 'OK').toUpperCase() };
  }

  function relativeTime(dateStr) {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const h = Math.floor(diff / 3600000);
      if (h < 1) return 'agora';
      if (h < 24) return `há ${h}h`;
      const d = Math.floor(h / 24);
      if (d < 7) return `${d}d`;
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(dateStr));
    } catch (_) { return ''; }
  }

  return (
    <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.line}`, padding: 24, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>Comunicados</h2>
          <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3 }}>Atualizações do setor</div>
        </div>
        <button onClick={() => setCurrentView('announcements')} style={{ fontSize: 13, fontWeight: 600, color: C.accent, background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
          Ver todos <Icons.ArrowR />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? [1, 2, 3].map(i => <div key={i} style={{ height: 56, borderRadius: 12, background: C.surfaceSoft }} />) :
          comunicados.length === 0 ? <div style={{ padding: '24px 0', textAlign: 'center', color: C.muted, fontSize: 13 }}>Nenhum comunicado recente.</div> :
            comunicados.map((it, i) => {
              const tag = tagStyle(it.tipo);
              return (
                <div key={it.id || i}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surfaceSoft}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: tag.bg, color: tag.color, flexShrink: 0 }}>{tag.label}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.titulo}</div>
                    <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.descricao}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: C.muted }}>{relativeTime(it.criado_em)}</div>
                    <div style={{ fontSize: 11.5, color: C.ink2, marginTop: 2 }}>{it.departamento_autor || ''}</div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

function AtalhosCard({ C, setCurrentView, onSuporteTIClick }) {
  const atalhos = [
    { icon: 'Room', label: 'Reservar Sala', hint: 'Sala de treinamento', id: 'services', url: 'https://wa.me/5582999220181?text=Ol%C3%A1%2C%20gostaria%20de%20reservar%20a%20sala%20de%20treinamento', accent: C.accent },
    { icon: 'Headset', label: 'Suporte TI', hint: 'Tempo médio: ~12 min', id: 'tickets', accent: C.accent },
    { icon: 'Badge', label: 'Meu Perfil', hint: 'Dados e segurança', id: 'settings', accent: C.accentDeep },
    { icon: 'Lightning', label: 'Comunicados', hint: 'Avisos e urgentes', id: 'announcements', accent: C.warning },
  ];

  return (
    <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.line}`, padding: 22, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>Atalhos Rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
        {atalhos.map(a => {
          const IconC = Icons[a.icon];
          return (
            <button key={a.id} onClick={() => {
              if (a.url) {
                window.open(a.url, '_blank');
              } else if (a.id === 'tickets') {
                onSuporteTIClick();
              } else {
                setCurrentView(a.id);
              }
            }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 14, border: `1px solid ${C.line}`, background: C.surface, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${tone(C.accentDeep, 0.10)}`; e.currentTarget.style.borderColor = tone(a.accent, 0.4); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.line; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: tone(a.accent, 0.12), color: a.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {IconC && <IconC />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.hint}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TeamBento({ C }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptoMap, setDeptoMap] = useState({});

  useEffect(() => {
    fetch('/api/departamentos-empresa')
      .then(r => r.json())
      .then(d => {
        if (d.sucesso) {
          const map = {};
          (d.departamentos || []).forEach(dep => { map[String(dep.id)] = dep.departamento; });
          setDeptoMap(map);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch('/api/colaboradores/online');
        const data = await res.json();
        if (data.sucesso) {
          setMembers(
            (data.colaboradores || []).slice(0, 7).map(m => ({
              id: m.id,
              name: m.nome || m.funcionario || 'Colaborador',
              role: deptoMap[String(m.id_departamento)] || m.id_funcao || '',
              foto: resolveAvatarUrl(m.foto_perfil) || AVATAR_PNGS[(m.id || 0) % AVATAR_PNGS.length],
            }))
          );
        }
      } catch (_) { }
      finally { setLoading(false); }
    };
    fetchOnline();
    const id = setInterval(fetchOnline, 30000);
    return () => clearInterval(id);
  }, [deptoMap]);

  return (
    <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.line}`, padding: 22, boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: '-0.015em' }}>Disponibilidade</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: C.success, display: 'inline-block' }} />
            <span style={{ fontSize: 12.5, color: C.ink2 }}>
              <strong style={{ color: C.ink }}>{members.length}</strong> online agora
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? [1, 2, 3, 4].map(i => <div key={i} style={{ height: 44, borderRadius: 8, background: C.surfaceSoft }} />) :
          members.length === 0 ? <div style={{ padding: '16px 0', textAlign: 'center', color: C.muted, fontSize: 13 }}>Nenhum colaborador online.</div> :
            members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', borderRadius: 8 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={m.foto} alt={m.name}
                    style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover', background: C.surfaceSoft, display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 5, background: C.success, border: '2px solid white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{m.role}</div>
                </div>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: C.success }}>Online</span>
              </div>
            ))
        }
      </div>
    </div>
  );
}

const DEFAULT_LAYOUT_LG = [
  { i: 'hero', x: 0, y: 0, w: 12, h: 2, static: true },
  { i: 'setor', x: 0, y: 2, w: 6, h: 2 },
  { i: 'plantao', x: 6, y: 2, w: 3, h: 2 },
  { i: 'os', x: 9, y: 2, w: 3, h: 2 },
  { i: 'comunicados', x: 0, y: 4, w: 8, h: 3 },
  { i: 'atalhos', x: 8, y: 4, w: 4, h: 2 },
  { i: 'team', x: 8, y: 6, w: 4, h: 2 }
];

// Layouts por breakpoint para react-grid-layout
const DEFAULT_LAYOUTS = {
  lg: DEFAULT_LAYOUT_LG,
  md: [
    { i: 'hero', x: 0, y: 0, w: 12, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 6, h: 2 },
    { i: 'plantao', x: 6, y: 2, w: 3, h: 2 },
    { i: 'os', x: 9, y: 2, w: 3, h: 2 },
    { i: 'comunicados', x: 0, y: 4, w: 7, h: 3 },
    { i: 'atalhos', x: 7, y: 4, w: 5, h: 2 },
    { i: 'team', x: 7, y: 6, w: 5, h: 2 }
  ],
  sm: [
    { i: 'hero', x: 0, y: 0, w: 6, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 6, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 3, h: 2 },
    { i: 'os', x: 3, y: 4, w: 3, h: 2 },
    { i: 'comunicados', x: 0, y: 6, w: 6, h: 3 },
    { i: 'atalhos', x: 0, y: 9, w: 3, h: 2 },
    { i: 'team', x: 3, y: 9, w: 3, h: 2 }
  ],
  xs: [
    { i: 'hero', x: 0, y: 0, w: 4, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 4, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 4, h: 2 },
    { i: 'os', x: 0, y: 6, w: 4, h: 2 },
    { i: 'comunicados', x: 0, y: 8, w: 4, h: 3 },
    { i: 'atalhos', x: 0, y: 11, w: 4, h: 2 },
    { i: 'team', x: 0, y: 13, w: 4, h: 2 }
  ],
  xxs: [
    { i: 'hero', x: 0, y: 0, w: 2, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 2, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 2, h: 2 },
    { i: 'os', x: 0, y: 6, w: 2, h: 2 },
    { i: 'comunicados', x: 0, y: 8, w: 2, h: 3 },
    { i: 'atalhos', x: 0, y: 11, w: 2, h: 2 },
    { i: 'team', x: 0, y: 13, w: 2, h: 2 }
  ]
};

export default function Dashboard({ setCurrentView, user }) {
  const C = useBentoTheme();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [cargoName, setCargoName] = useState('');
  const [osCount, setOsCount] = useState(0);
  const [osStatusCount, setOsStatusCount] = useState(null);
  const [osLoading, setOsLoading] = useState(true);
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [plantaoLoading, setPlantaoLoading] = useState(true);
  const [eficiencia, setEficiencia] = useState(null);
  const [eficienciaLoading, setEficienciaLoading] = useState(true);

  // Estados do react-grid-layout
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTiModalOpen, setIsTiModalOpen] = useState(false);

  const func = user?.funcionario ?? {};
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const funcId = func.id || user?.id;

  // Carrega o layout salvo do usuário (suporta formato legado array e novo objeto por breakpoint)
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/user/dashboard-layout?userId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.sucesso || !d.layout) return;

        let userLayouts;
        if (Array.isArray(d.layout)) {
          // Formato legado: array único usado como lg
          const normalized = d.layout.map(item => item.i === 'hero' ? { ...item, static: true } : item);
          userLayouts = { ...DEFAULT_LAYOUTS, lg: normalized };
        } else if (typeof d.layout === 'object') {
          // Novo formato: objeto com layouts por breakpoint
          userLayouts = { ...DEFAULT_LAYOUTS };
          Object.keys(d.layout).forEach(bp => {
            if (Array.isArray(d.layout[bp])) {
              userLayouts[bp] = d.layout[bp].map(item => item.i === 'hero' ? { ...item, static: true } : item);
            }
          });
        }
        if (userLayouts) setLayouts(userLayouts);
      })
      .catch(err => console.error('Erro ao carregar layout:', err));
  }, [user?.id]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/user/dashboard-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, layout: layouts })
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar layout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo).then(setCargoName).catch(() => { });
  }, [safeDepto, safeRole, user?.nome_grupo]);

  useEffect(() => {
    if (!funcId) { setOsLoading(false); return; }
    setOsLoading(true);
    fetch(`/api/os-chamados/${funcId}`)
      .then(r => r.json())
      .then(d => { if (d.sucesso) { setOsCount(d.quantidade); setOsStatusCount(d.statusCount); } })
      .catch(() => { })
      .finally(() => setOsLoading(false));
  }, [funcId]);

  useEffect(() => {
    if (!user?.id) return;
    setPlantaoLoading(true);
    fetch(`/api/plantoes/meu-proximo/${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.sucesso && d.proximo) setProximoPlantao(d.proximo); })
      .catch(() => { })
      .finally(() => setPlantaoLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!funcId) { setEficienciaLoading(false); return; }
    setEficienciaLoading(true);
    fetch(`/api/eficiencia/${funcId}`)
      .then(r => r.json())
      .then(d => { if (d.sucesso) setEficiencia(d); })
      .catch(() => { })
      .finally(() => setEficienciaLoading(false));
  }, [funcId]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(now);
      const data = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric' }).format(now).replace(/ de /g, ' ').replace(/\./g, '');
      const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(now);
      setCurrentDateTime(`${dia.charAt(0).toUpperCase() + dia.slice(1).replace('.', '')} · ${data} · ${hora}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const safeName = func.funcionario || user?.nome || 'Usuário';
  const firstName = safeName.split(' ')[0] || 'Usuário';

  return (
    <main style={{ flex: 1, overflowY: 'auto', background: C.bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: C.ink }}>
      <div style={{
        padding: '28px 32px 40px',
        maxWidth: 1400,
        margin: '0 auto',
      }}>

        {/* Cabeçalho da Dashboard (Personalizar) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink2, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}
              >Cancelar</button>
              <button
                onClick={handleSaveLayout}
                disabled={isSaving}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.accent, color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {isSaving ? 'Salvando...' : <><Icons.Check /> Salvar Layout</>}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface, color: C.ink2, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.surfaceSoft}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <Icons.Sparkle /> Personalizar Dashboard
            </button>
          )}
        </div>

        {/* Grid Interativa */}
        <ResponsiveReactGridLayout
          className={`layout ${isEditing ? 'is-editing' : ''}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          containerPadding={[0, 0]}
          margin={[18, 18]}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
          useCSSTransforms={true}
        >
          <div key="hero" className={isEditing ? 'widget-editable' : ''}>
            <HeroCard C={C} firstName={firstName} cargoName={cargoName} currentDateTime={currentDateTime} setCurrentView={setCurrentView} />
          </div>
          <div key="setor" className={isEditing ? 'widget-editable' : ''}>
            <SetorBento C={C} eficiencia={eficiencia} eficienciaLoading={eficienciaLoading} />
          </div>
          <div key="plantao" className={isEditing ? 'widget-editable' : ''}>
            <PlantaoBento C={C} proximoPlantao={proximoPlantao} plantaoLoading={plantaoLoading} setCurrentView={setCurrentView} />
          </div>
          <div key="os" className={isEditing ? 'widget-editable' : ''}>
            <OsBento C={C} osCount={osCount} osLoading={osLoading} osStatusCount={osStatusCount} setCurrentView={setCurrentView} />
          </div>
          <div key="comunicados" className={isEditing ? 'widget-editable' : ''}>
            <ComunicadosCard C={C} setCurrentView={setCurrentView} />
          </div>
          <div key="atalhos" className={isEditing ? 'widget-editable' : ''}>
            <AtalhosCard C={C} setCurrentView={setCurrentView} onSuporteTIClick={() => setIsTiModalOpen(true)} />
          </div>
          <div key="team" className={isEditing ? 'widget-editable' : ''}>
            <TeamBento C={C} />
          </div>
        </ResponsiveReactGridLayout>

        {/* Rodapé */}
        <div style={{
          marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11.5, color: C.muted,
          fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span>© 2026 Prestek Inc. · Portal Interno · Confidencial.</span>
          <div style={{ display: 'flex', gap: 22 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Política de Privacidade</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Diretrizes Internas</a>
            <span style={{ color: C.success }}>● v1.1.0</span>
          </div>
        </div>
      </div>

      <TiSupportModal isOpen={isTiModalOpen} onClose={() => setIsTiModalOpen(false)} user={user} />
    </main>
  );
}

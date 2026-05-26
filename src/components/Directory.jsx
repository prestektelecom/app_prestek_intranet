import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs';

// ── Paleta idêntica ao Dashboard ──────────────────────────────────────────────
const C = {
  bg:          '#F5F9FF',
  surface:     '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  accent:      '#4A9EF5',
  accentDark:  '#2D7BD4',
  accentDeep:  '#1F5BA8',
  accentSoft:  '#EAF4FF',
  cyan:        '#7FD4E8',
  ink:         '#0B1B2E',
  ink2:        '#475467',
  muted:       '#8896A8',
  line:        '#E4ECF5',
  success:     '#1F8A5B',
  successSoft: '#E6F4EC',
  warning:     '#D97706',
  warningSoft: '#FEF3E2',
  danger:      '#E84545',
  dangerSoft:  '#FDEDED',
};

// ── Sistema de cores por departamento ────────────────────────────────────────
const DEPT_COLORS = [
  { keys: ['atendimento', 'suporte', 'relacionamento', 'helpdesk', 'client'],    color: C.accent      },
  { keys: ['ti', ' t.i', 't.i.', 'tecnologia', 'noc', 'sistema', 'infraestr'],   color: C.cyan        },
  { keys: ['comercial', 'venda', 'marketing', 'passivo', 'mkt'],                  color: C.warning     },
  { keys: ['financeiro', 'financ', 'cobrança', 'cobranc', 'jurídico', 'fiscal'],  color: C.success     },
  { keys: ['rh', 'recursos humanos', 'gestão de pessoas', 'gente'],               color: '#8B5CF6'     },
  { keys: ['instalação', 'instalacao', 'campo', 'tecnico', 'tecnic', 'correcao'], color: C.danger      },
  { keys: ['frota', 'estoque', 'patrimonio', 'logist'],                           color: '#0B3D6B'     },
  { keys: ['diretoria', 'gerencia', 'gerência', 'auditoria'],                     color: '#374151'     },
];

function getDeptColor(deptName) {
  if (!deptName) return C.muted;
  const lower = deptName.toLowerCase();
  for (const entry of DEPT_COLORS) {
    if (entry.keys.some(k => lower.includes(k))) return entry.color;
  }
  return C.muted;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `${parseInt(x.slice(0,2),16)}, ${parseInt(x.slice(2,4),16)}, ${parseInt(x.slice(4,6),16)}`;
}

// ── Quantidade por lote de scroll infinito ────────────────────────────────────
const LOTE = 16;

// ── Componente Principal ──────────────────────────────────────────────────────
export default function Directory({ user, setCurrentView }) {
  const isAdmin = user?.is_admin;
  const [colaboradores, setColaboradores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [deptosEmpresa, setDeptosEmpresa] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const savedFilter = sessionStorage.getItem('@Stitch:directoryFilter');
  const [deptoFiltro, setDeptoFiltro] = useState(savedFilter || '');
  const [visibleCount, setVisibleCount] = useState(LOTE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (savedFilter) sessionStorage.removeItem('@Stitch:directoryFilter');
  }, [savedFilter]);

  // Reseta scroll infinito ao filtrar
  useEffect(() => { setVisibleCount(LOTE); }, [busca, deptoFiltro]);

  // Carrega dados em paralelo
  useEffect(() => {
    const carregar = async () => {
      try {
        const [resColab, resDept, resCargo, resDeptTicket] = await Promise.all([
          fetch(`/api/colaboradores${isAdmin ? '?all=true' : ''}`).catch(() => null),
          fetch('/api/departamentos-empresa').catch(() => null),
          fetch('/api/cargos').catch(() => null),
          fetch('/api/departamentos').catch(() => null)
        ]);
        if (resColab?.ok) { const d = await resColab.json(); if (d.sucesso) setColaboradores(d.colaboradores || []); }
        if (resDept?.ok)  { const d = await resDept.json();  if (d.sucesso) setDepartamentos(d.departamentos || []); }
        if (resCargo?.ok) { const d = await resCargo.json(); if (d.sucesso) setCargos(d.cargos || []); }
        if (resDeptTicket?.ok) { const d = await resDeptTicket.json(); if (d.sucesso) setDeptosEmpresa(d.departamentos || []); }
      } catch (err) {
        console.error('Erro ao carregar diretório:', err);
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, []);

  // Resolve nome do departamento
  const resolverDepartamento = useCallback((idDepto) => {
    if (!idDepto) return 'N/D';
    const id = String(idDepto).trim();
    const foundDeptEmp = departamentos.find(d => String(d.id).trim() === id);
    if (foundDeptEmp?.departamento) return foundDeptEmp.departamento;
    const foundCargo = cargos.find(c => String(c.id).trim() === id);
    if (foundCargo?.setor) return foundCargo.setor;
    const foundTicket = deptosEmpresa.find(d => String(d.id).trim() === id);
    if (foundTicket?.setor) return foundTicket.setor;
    return 'N/D';
  }, [departamentos, cargos, deptosEmpresa]);

  // Filtro de busca (sem filtro de depto, para calcular chips)
  const colaboradoresPorBusca = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return colaboradores.filter(c =>
      !termo
      || (c.funcionario_nome || '').toLowerCase().includes(termo)
      || (c.usuario_email || '').toLowerCase().includes(termo)
      || (c.ramal || '').toLowerCase().includes(termo)
    );
  }, [colaboradores, busca]);

  // Filtro completo (busca + departamento)
  const colaboradoresFiltrados = useMemo(() => {
    return colaboradoresPorBusca.filter(c => {
      let idDep = String(c.id_departamento).trim();
      let matchDepto = !deptoFiltro || idDep === deptoFiltro;
      if (deptoFiltro === '13' && (idDep === '15' || idDep === '68')) matchDepto = true;
      return matchDepto;
    });
  }, [colaboradoresPorBusca, deptoFiltro]);

  // Chips de departamento com contagem
  const deptChips = useMemo(() => {
    const map = new Map();
    colaboradoresPorBusca.forEach(c => {
      const id = String(c.id_departamento || '').trim();
      if (!id) return;
      if (!map.has(id)) map.set(id, { id, nome: resolverDepartamento(id), count: 0 });
      map.get(id).count++;
    });
    return [...map.values()]
      .filter(d => isAdmin || !d.nome.toUpperCase().includes('(INATIVO)'))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [colaboradoresPorBusca, resolverDepartamento, isAdmin]);

  // KPIs do hero
  const kpiTotal  = colaboradores.length;
  const kpiAtivos = colaboradores.filter(c => c.ativo === 'S').length;
  const kpiDeptos = useMemo(() => new Set(colaboradores.map(c => c.id_departamento).filter(Boolean)).size, [colaboradores]);

  // Colaboradores visíveis (scroll infinito)
  const colaboradoresVisiveis = colaboradoresFiltrados.slice(0, visibleCount);
  const temMais = visibleCount < colaboradoresFiltrados.length;

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    if (!sentinelRef.current || !temMais) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisibleCount(v => v + LOTE); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [temMais, colaboradoresFiltrados.length]);

  return (
    <main style={{ flex: 1, overflowY: 'auto', background: C.bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: C.ink }}>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <HeroBanner
        busca={busca}
        setBusca={setBusca}
        kpiTotal={kpiTotal}
        kpiAtivos={kpiAtivos}
        kpiDeptos={kpiDeptos}
        isLoading={isLoading}
        setCurrentView={setCurrentView}
      />

      <div style={{ padding: '0 32px 48px', maxWidth: 1440, margin: '0 auto' }}>

        {/* ── Chips de Departamento ─────────────────────────────────────────── */}
        <DeptChips
          chips={deptChips}
          deptoFiltro={deptoFiltro}
          setDeptoFiltro={val => { setDeptoFiltro(val); setVisibleCount(LOTE); }}
          totalColabs={colaboradoresPorBusca.length}
        />

        {/* ── Contador de resultados ────────────────────────────────────────── */}
        {!isLoading && (
          <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 20, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.05em' }}>
            {colaboradoresFiltrados.length === 0
              ? 'Nenhum colaborador encontrado'
              : `Exibindo ${Math.min(visibleCount, colaboradoresFiltrados.length)} de ${colaboradoresFiltrados.length} colaborador${colaboradoresFiltrados.length !== 1 ? 'es' : ''}`
            }
          </p>
        )}

        {/* ── Grid de Cards ────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : colaboradoresFiltrados.length === 0 ? (
          <EmptyState busca={busca} deptoFiltro={deptoFiltro} onClear={() => { setBusca(''); setDeptoFiltro(''); }} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {colaboradoresVisiveis.map((colab, idx) => (
                <EmployeeCardV2
                  key={colab.usuario_id || colab.funcionario_id}
                  colab={colab}
                  departamentoNome={resolverDepartamento(colab.id_departamento)}
                  animDelay={idx % LOTE * 30}
                />
              ))}
            </div>

            {/* Sentinel de scroll infinito */}
            {temMais && (
              <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '32px 0', color: C.muted }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${C.line}`,
                  borderTopColor: C.accent,
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace' }}>carregando mais...</span>
              </div>
            )}

            {!temMais && colaboradoresFiltrados.length > LOTE && (
              <p style={{ textAlign: 'center', padding: '24px 0', fontSize: 12.5, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>
                ✓ Todos os {colaboradoresFiltrados.length} colaboradores exibidos
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(31, 138, 91, 0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(31, 138, 91, 0); }
          100% { box-shadow: 0 0 0 0 rgba(31, 138, 91, 0); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .emp-card-actions { opacity: 0; transform: translateY(6px); transition: opacity 0.2s, transform 0.2s; }
        .emp-card:hover .emp-card-actions { opacity: 1; transform: translateY(0); }
      `}</style>
    </main>
  );
}

// ── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ busca, setBusca, kpiTotal, kpiAtivos, kpiDeptos, isLoading, setCurrentView }) {
  return (
    <div style={{
      background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
      padding: '40px 32px 36px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 28,
    }}>
      {/* Grid pattern SVG */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="dir-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dir-grid)" />
      </svg>
      {/* Blur orbs */}
      <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, right: 160, width: 220, height: 220, borderRadius: '50%', background: `rgba(${hexToRgb(C.cyan)}, 0.25)`, filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontFamily: '"JetBrains Mono", monospace' }}>
          <button onClick={() => setCurrentView?.('dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>
            Dashboard
          </button>
          <span>/</span>
          <span style={{ color: 'white', fontWeight: 600 }}>Colaboradores</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Título */}
          <div>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              👥 Colaboradores
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>
              Conecte-se com sua equipe — busque, encontre e contate qualquer colaborador.
            </p>
          </div>

          {/* Busca inline glassmorphism */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.7)', fontSize: 20, fontFamily: '"Material Symbols Outlined"',
              pointerEvents: 'none', lineHeight: 1,
            }}>search</span>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, ramal ou e-mail..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '14px 48px 14px 50px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 14,
                color: 'white',
                fontSize: 15, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.22)'; e.target.style.borderColor = 'rgba(255,255,255,0.6)'; }}
              onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            />
            {busca && (
              <button onClick={() => setBusca('')} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
                color: 'white', cursor: 'pointer', padding: '2px 6px', fontSize: 12, lineHeight: 1.5,
              }}>✕</button>
            )}
          </div>

          {/* KPI Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: isLoading ? '···' : kpiTotal, icon: 'groups' },
              { label: 'Ativos', value: isLoading ? '···' : kpiAtivos, icon: 'check_circle' },
              { label: 'Departamentos', value: isLoading ? '···' : kpiDeptos, icon: 'corporate_fare' },
            ].map(kpi => (
              <div key={kpi.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.25)', color: 'white',
              }}>
                <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 18, lineHeight: 1 }}>{kpi.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{kpi.value}</span>
                <span style={{ fontSize: 12.5, opacity: 0.8, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em' }}>{kpi.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chips de Departamento ────────────────────────────────────────────────────
function DeptChips({ chips, deptoFiltro, setDeptoFiltro, totalColabs }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className="scrollbar-hide"
        style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingTop: 4 }}
      >
        {/* Chip "Todos" */}
        <ChipButton
          label="Todos"
          count={totalColabs}
          active={!deptoFiltro}
          onClick={() => setDeptoFiltro('')}
          color={C.accent}
        />
        {chips.map(chip => (
          <ChipButton
            key={chip.id}
            label={chip.nome}
            count={chip.count}
            active={deptoFiltro === String(chip.id)}
            onClick={() => setDeptoFiltro(String(chip.id))}
            color={getDeptColor(chip.nome)}
          />
        ))}
      </div>
    </div>
  );
}

function ChipButton({ label, count, active, onClick, color }) {
  const [hover, setHover] = useState(false);
  const rgb = hexToRgb(color);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
        border: active ? `1.5px solid ${color}` : `1.5px solid ${C.line}`,
        background: active ? `rgba(${rgb}, 0.12)` : (hover ? C.surfaceSoft : C.surface),
        color: active ? color : (hover ? C.ink : C.ink2),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        fontWeight: active ? 700 : 500, fontSize: 13,
        transition: 'all 0.15s',
        boxShadow: active ? `0 0 0 3px rgba(${rgb}, 0.12)` : 'none',
      }}
    >
      <span>{label}</span>
      <span style={{
        background: active ? color : C.surfaceSoft,
        color: active ? 'white' : C.muted,
        fontSize: 11, fontWeight: 700,
        padding: '1px 7px', borderRadius: 999,
        fontFamily: '"JetBrains Mono", monospace',
        transition: 'all 0.15s',
      }}>{count}</span>
    </button>
  );
}

// ── Helper para formatar o link do WhatsApp ──────────────────────────────────
function getWhatsAppUrl(phoneStr) {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length < 10) return ''; // Número inválido para WhatsApp
  if (digits.length === 10 || digits.length === 11) {
    return `https://wa.me/55${digits}`;
  }
  return `https://wa.me/${digits}`;
}

// ── Card de Colaborador v2 ───────────────────────────────────────────────────
function EmployeeCardV2({ colab, departamentoNome, animDelay }) {
  const [hover, setHover] = useState(false);
  const nome = colab.funcionario_nome || 'Colaborador';
  const email = colab.usuario_email || '';
  const ramal = colab.ramal && colab.ramal !== '0' ? colab.ramal : '';
  const celular = colab.fone_celular || '';
  const whatsAppUrl = celular ? getWhatsAppUrl(celular) : '';
  const hasWhatsApp = !!whatsAppUrl;
  const hasContact = hasWhatsApp || !!ramal;
  const isAtivo = colab.ativo === 'S';
  const resolvedFoto = resolveAvatarUrl(colab.foto_perfil);
  const avatarSrc = resolvedFoto || AVATAR_PNGS[(colab.funcionario_id || colab.usuario_id || 0) % AVATAR_PNGS.length];
  const deptColor = getDeptColor(departamentoNome);
  const deptRgb = hexToRgb(deptColor);

  return (
    <div
      className="emp-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.surface,
        borderRadius: 18,
        border: `1px solid ${hover ? deptColor : C.line}`,
        borderLeft: `4px solid ${deptColor}`,
        boxShadow: hover
          ? `0 12px 32px rgba(${deptRgb}, 0.15), 0 2px 8px rgba(0,0,0,0.06)`
          : `0 1px 3px rgba(0,0,0,0.06)`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-4px)' : 'none',
        animation: `card-in 0.35s ease both`,
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* Topo colorido sutil */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${deptColor}, rgba(${deptRgb}, 0.3))`,
      }} />

      <div style={{ padding: '20px 20px 0' }}>
        {/* Avatar + Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarSrc}
              alt={nome}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${C.surface}`,
                boxShadow: `0 0 0 3px ${isAtivo ? deptColor : C.muted}`,
                display: 'block',
              }}
              onError={e => { e.target.src = AVATAR_PNGS[0]; }}
            />
            {/* Indicador de presença */}
            <span style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 13, height: 13, borderRadius: '50%',
              background: isAtivo ? C.success : C.muted,
              border: `2px solid ${C.surface}`,
              animation: isAtivo ? 'pulse-ring 2s ease-out infinite' : 'none',
              display: 'block',
            }} />
          </div>

          {/* Badge de status */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 999,
            background: isAtivo ? C.successSoft : C.surfaceSoft,
            color: isAtivo ? C.success : C.muted,
            fontSize: 10.5, fontWeight: 700,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.06em',
            border: `1px solid ${isAtivo ? 'rgba(31,138,91,0.2)' : C.line}`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {isAtivo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Nome e Departamento */}
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {nome}
          </h3>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px', borderRadius: 6,
            background: `rgba(${deptRgb}, 0.10)`,
            color: deptColor, fontSize: 11.5, fontWeight: 600,
            letterSpacing: '0.02em', maxWidth: '100%',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{departamentoNome}</span>
          </span>
        </div>

        {/* Infos de contato resumidas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
          {ramal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.ink2 }}>
              <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 16, color: C.muted, lineHeight: 1 }}>call</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.05em' }}>Ramal {ramal}</span>
            </div>
          )}
          {email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.ink2 }}>
              <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 16, color: C.muted, lineHeight: 1 }}>mail</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ações hover reveal */}
      <div className="emp-card-actions" style={{ padding: '0 20px 18px', display: 'flex', gap: 8 }}>
        <a
          href={email ? `mailto:${email}` : undefined}
          onClick={email ? undefined : e => e.preventDefault()}
          style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 12px', borderRadius: 10,
            background: email ? `rgba(${deptRgb}, 0.10)` : C.surfaceSoft,
            color: email ? deptColor : C.muted,
            border: `1px solid ${email ? `rgba(${deptRgb}, 0.25)` : C.line}`,
            textDecoration: 'none', fontSize: 12.5, fontWeight: 600,
            cursor: email ? 'pointer' : 'not-allowed',
            opacity: email ? 1 : 0.5,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (email) { e.currentTarget.style.background = `rgba(${deptRgb}, 0.18)`; } }}
          onMouseLeave={e => { e.currentTarget.style.background = email ? `rgba(${deptRgb}, 0.10)` : C.surfaceSoft; }}
        >
          <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 16, lineHeight: 1 }}>mail</span>
          E-mail
        </a>

        <a
          href={hasWhatsApp ? whatsAppUrl : ramal ? `tel:${ramal}` : undefined}
          onClick={hasContact ? undefined : e => e.preventDefault()}
          target={hasWhatsApp ? "_blank" : undefined}
          rel={hasWhatsApp ? "noopener noreferrer" : undefined}
          style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 12px', borderRadius: 10,
            background: C.surfaceSoft,
            color: hasContact ? C.ink2 : C.muted,
            border: `1px solid ${C.line}`,
            textDecoration: 'none', fontSize: 12.5, fontWeight: 600,
            cursor: hasContact ? 'pointer' : 'not-allowed',
            opacity: hasContact ? 1 : 0.5,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (hasContact) {
              e.currentTarget.style.background = hasWhatsApp ? 'rgba(37, 211, 102, 0.12)' : C.line;
              e.currentTarget.style.color = hasWhatsApp ? '#128C7E' : C.ink2;
              e.currentTarget.style.borderColor = hasWhatsApp ? 'rgba(37, 211, 102, 0.3)' : C.line;
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = C.surfaceSoft;
            e.currentTarget.style.color = hasContact ? C.ink2 : C.muted;
            e.currentTarget.style.borderColor = C.line;
          }}
        >
          {hasWhatsApp ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ display: 'block' }}>
              <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.854.507 3.593 1.39 5.093L2 22l5.09-1.336a9.96 9.96 0 0 0 4.914 1.34c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm0 1.796c4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208-1.637 0-3.155-.483-4.437-1.31l-.317-.208-3.003.787.801-2.92-.228-.363a8.167 8.167 0 0 1-1.228-4.194c0-4.526 3.682-8.208 8.208-8.208zm-1.895 2.873c-.237 0-.462.1-.634.27-.37.369-.748 1.077-.748 1.91 0 1.547 1.127 3.037 1.285 3.25 0 0 2.213 3.376 5.361 4.734.75.324 1.332.518 1.788.663.754.24 1.442.206 1.986.125.606-.09 1.862-.761 2.124-1.46.262-.697.262-1.296.184-1.42-.078-.125-.288-.2-.596-.356-.308-.156-1.821-.898-2.103-1.002-.281-.103-.487-.156-.693.156-.205.311-.8 1.002-.98 1.21-.18.206-.359.231-.667.076-.308-.155-1.303-.48-2.483-1.533-.918-.818-1.537-1.83-1.717-2.138-.18-.309-.02-.476.135-.63.139-.14.308-.36.462-.54.154-.18.205-.309.308-.515.103-.206.051-.386-.026-.54-.077-.155-.693-1.67-.95-2.288-.25-.6-.548-.515-.748-.525-.193-.01-.41-.01-.628-.01z"/>
            </svg>
          ) : (
            <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 16, lineHeight: 1 }}>phone</span>
          )}
          {hasWhatsApp ? 'WhatsApp' : 'Ligar'}
        </a>
      </div>
    </div>
  );
}

// ── Skeleton de carregamento ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: C.surface, borderRadius: 18, border: `1px solid ${C.line}`,
      borderLeft: `4px solid ${C.line}`, overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      <div style={{ height: 4, background: C.line }} />
      <div style={{ padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.line, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <div style={{ height: 12, background: C.line, borderRadius: 6, width: '70%' }} />
            <div style={{ height: 10, background: C.surfaceSoft, borderRadius: 6, width: '50%' }} />
          </div>
        </div>
        <div style={{ height: 10, background: C.line, borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 10, background: C.surfaceSoft, borderRadius: 6, width: '80%', marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 36, background: C.line, borderRadius: 10 }} />
          <div style={{ flex: 1, height: 36, background: C.line, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

// ── Estado vazio ─────────────────────────────────────────────────────────────
function EmptyState({ busca, deptoFiltro, onClear }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 36, color: C.accent, lineHeight: 1 }}>person_search</span>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: C.ink }}>Nenhum resultado</p>
        <p style={{ margin: 0, fontSize: 13.5, color: C.ink2 }}>
          {busca ? `Nenhum colaborador encontrado para "${busca}".` : 'Nenhum colaborador neste departamento.'}
        </p>
      </div>
      {(busca || deptoFiltro) && (
        <button onClick={onClear} style={{
          padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.line}`,
          background: C.surface, color: C.ink2, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 18, lineHeight: 1 }}>close</span>
          Limpar filtros
        </button>
      )}
    </div>
  );
}

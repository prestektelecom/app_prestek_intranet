import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { resolveNomeSetor } from '../utils/resolveSetor'
import Sparkline from './common/Sparkline'
import { Icons } from './common/Icons'
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs'
import TiSupportModal from './TiSupportModal'

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/* ── Tokens utilitários do design system semântico (vars em index.css) ── */
const LABEL_MONO = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted'
const CARD_TITLE = 'text-[17px] font-bold tracking-tight text-foreground'
const CARD = 'bento-hover-border flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm'
const ACTION_BTN = 'mt-5 inline-flex items-center gap-1 self-start rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-semibold transition'

function KpiCard({ label, value, sub, subTone, subTooltip, sparkData, sparkColor }) {
  const toneClasses = {
    success: 'bg-[var(--success-soft)] text-[var(--success-bento)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger-bento)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning-bento)]',
    muted: 'bg-surface-raised text-faint',
  };
  const subClass = toneClasses[subTone] || toneClasses.muted;

  return (
    <div className="bento-hover-border flex h-full flex-col gap-3.5 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={LABEL_MONO}>{label}</div>
        {sub && (
          <div title={subTooltip} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${subClass} ${subTooltip ? 'cursor-help' : ''}`}>
            {subTone === 'danger' && <Icons.TrendDown />}
            {subTone === 'success' && <Icons.Check />}
            {sub}
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold leading-none tracking-tight text-foreground">{value}</div>
      {sparkData && (
        <div className="mt-auto">
          <Sparkline data={sparkData} color={sparkColor || 'var(--accent)'} height={44} />
        </div>
      )}
    </div>
  );
}

function DashboardHeader({ firstName, cargoName, currentTime, currentDate, city }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Olá, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-faint">
          {cargoName
            ? <>Aqui está o resumo do seu dia · setor <strong className="font-semibold text-foreground">{cargoName}</strong></>
            : 'Aqui está o resumo do seu dia.'}
        </p>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icons.CloudSun />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-foreground">24°C</div>
            <div className="text-xs text-muted">{city}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="leading-tight">
          <div className="text-lg font-bold tabular-nums text-foreground">{currentTime || '--:--'}</div>
          <div className="text-xs text-muted">{currentDate || '...'}</div>
        </div>
      </div>
    </header>
  );
}

function HeroCard({ firstName, cargoName, currentDateTime }) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-deep)] via-[var(--accent-dark)] to-[var(--accent)] p-6 text-white shadow-lg md:p-8">
      <svg className="absolute inset-0 opacity-15" width="100%" height="100%">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex h-full flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {currentDateTime || '...'}
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            Olá, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-white/85">
            Bem-vindo ao seu painel, setor <strong>{cargoName || '...'}</strong>.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
          <Icons.Sparkle /> Assistente
        </button>
      </div>
    </div>
  );
}

function SetorBento({ eficiencia, eficienciaLoading }) {
  const efVal = eficienciaLoading ? '...' : eficiencia?.sem_dados ? 'N/A' : `${eficiencia?.eficiencia_atual ?? '–'}%`;
  const efSub = !eficienciaLoading && eficiencia && !eficiencia.sem_dados && eficiencia.variacao !== null
    ? { text: `${eficiencia.variacao >= 0 ? '+' : ''}${eficiencia.variacao}%`, tone: eficiencia.variacao >= 0 ? 'success' : 'danger' }
    : null;
  const efSubTooltip = efSub ? 'Variação calculada pela taxa diária de OS no prazo (mês atual vs mês anterior).' : null;
  const efSparkData = eficiencia?.historico_semanal?.length
    ? eficiencia.historico_semanal.map(s => s.eficiencia ?? 0)
    : (eficiencia?.eficiencia_atual != null ? Array(8).fill(eficiencia.eficiencia_atual) : []);

  return (
    <div className="grid h-full grid-cols-1 gap-3.5 md:grid-cols-3">
      <KpiCard
        label="Eficiência"
        value={efVal}
        sub={efSub?.text}
        subTone={efSub?.tone}
        subTooltip={efSubTooltip}
        sparkData={efSparkData}
        sparkColor="var(--success-bento)"
      />
      <KpiCard
        label="OS Fechadas"
        value={eficienciaLoading ? '...' : (eficiencia?.total_os_mes ?? '–')}
        sub={eficiencia?.no_prazo_mes != null ? `${eficiencia.no_prazo_mes} no prazo` : null}
        subTone="success"
        sparkData={[8, 12, 9, 14, 11, 15, 13, eficiencia?.total_os_mes || 12]}
        sparkColor="var(--accent)"
      />
      <KpiCard
        label="Sem SLA"
        value={eficienciaLoading ? '...' : (eficiencia?.os_sem_prazo ?? 0)}
        sub={eficiencia?.os_sem_prazo > 0 ? 'Atenção' : 'Ok'}
        subTone={eficiencia?.os_sem_prazo > 0 ? 'warning' : 'success'}
        sparkData={[2, 1, 3, 2, 1, 0, 1, eficiencia?.os_sem_prazo || 0]}
        sparkColor="var(--warning-bento)"
      />
    </div>
  );
}

function PlantaoBento({ proximoPlantao, plantaoLoading, setCurrentView }) {
  const dateStr = plantaoLoading ? '...' : (proximoPlantao
    ? new Date(proximoPlantao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Nenhum agendado');
  const timeStr = proximoPlantao
    ? `${(proximoPlantao.horario_inicio || '09:00').slice(0, 5)} – ${(proximoPlantao.horario_fim || '17:00').slice(0, 5)}`
    : 'Sem cobertura ativa';

  return (
    <div className={CARD}>
      <div className={LABEL_MONO}>Próximo Plantão</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icons.Clock />
        </div>
        <div>
          <div className="text-[17px] font-bold tracking-tight text-foreground">{dateStr}</div>
          <div className="mt-0.5 text-[12.5px] text-faint">{timeStr}</div>
        </div>
      </div>
      <button
        onClick={() => setCurrentView('schedule')}
        className={`${ACTION_BTN} text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]`}
      >
        Ver plantões <Icons.ArrowR />
      </button>
    </div>
  );
}

function OsBento({ osCount, osLoading, setCurrentView }) {
  const allGood = !osLoading && osCount === 0;

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-2">
        <div className={LABEL_MONO}>OS no meu nome</div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${allGood ? 'bg-[var(--success-soft)] text-[var(--success-bento)]' : 'bg-[var(--warning-soft)] text-[var(--warning-bento)]'}`}>
          {allGood ? <><Icons.Check /> Tudo em dia</> : `${osCount} pendente${osCount !== 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="mt-1 text-5xl font-extrabold leading-none tracking-tight text-foreground">
        {osLoading ? '...' : osCount}
      </div>
      <div className="mt-1 text-[12.5px] text-faint">
        {allGood ? 'Nenhuma ordem de serviço pendente atribuída a você.' : 'Ordens de serviço aguardando ação.'}
      </div>
      {osCount > 0 && (
        <button
          onClick={() => setCurrentView('tickets')}
          className={`${ACTION_BTN} text-[var(--warning-bento)] hover:border-[var(--warning-bento)] hover:bg-[var(--warning-soft)]`}
        >
          Ver OS <Icons.ArrowR />
        </button>
      )}
    </div>
  );
}

function ComunicadosCard({ setCurrentView }) {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comunicados')
      .then(r => r.json())
      .then(d => {
        if (d.sucesso) setComunicados(d.comunicados.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const TAG_STYLES = {
    Urgente:    { chip: 'bg-[var(--danger-soft)] text-[var(--danger-bento)]',   border: 'border-l-[var(--danger-bento)]' },
    Importante: { chip: 'bg-[var(--warning-soft)] text-[var(--warning-bento)]', border: 'border-l-[var(--warning-bento)]' },
    Aviso:      { chip: 'bg-[var(--warning-soft)] text-[var(--warning-bento)]', border: 'border-l-[var(--warning-bento)]' },
    Geral:      { chip: 'bg-[var(--success-soft)] text-[var(--success-bento)]', border: 'border-l-[var(--success-bento)]' },
    Info:       { chip: 'bg-[var(--accent-soft)] text-[var(--accent-deep)]',     border: 'border-l-[var(--accent)]' },
  };
  const TAG_FALLBACK = { chip: 'bg-surface-raised text-faint', border: 'border-l-[var(--border)]' };
  const TAG_LABELS = { Urgente: 'URGENTE', Importante: 'IMPORTANTE', Aviso: 'AVISO', Geral: 'GERAL', Info: 'INFO' };

  function tagFor(tipo) { return TAG_STYLES[tipo] || TAG_FALLBACK; }
  function tagLabel(tipo) { return TAG_LABELS[tipo] || (tipo || 'OK').toUpperCase(); }

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

  function formatFullDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) { return ''; }
  }

  function stripMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/[🔹🔸→←•➡️]/gu, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  const featured = comunicados[0] || null;
  const rest = comunicados.slice(1);

  return (
    <div className="bento-hover-border flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      {/* Featured announcement */}
      <div
        onClick={() => !loading && setCurrentView('announcements')}
        className={`relative shrink-0 bg-gradient-to-br from-[var(--accent-deep)] to-[var(--accent)] px-6 pt-5 pb-4 text-white ${!loading ? 'cursor-pointer' : ''}`}
      >
        {loading ? (
          <div className="h-14 animate-pulse rounded-lg bg-white/15" />
        ) : featured ? (
          <div className="relative z-10">
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${tagFor(featured.tipo).chip}`}>
              {tagLabel(featured.tipo)}
            </span>
            <div className="mt-1.5 truncate text-[15px] font-bold">{featured.titulo}</div>
            <div className="mt-0.5 text-[11px] text-white/75">{relativeTime(featured.criado_em)}</div>
          </div>
        ) : (
          <div className="relative z-10 flex items-center gap-2 text-sm text-white/85">
            <Icons.Megaphone /> Nenhum comunicado em destaque
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      {/* Header da lista */}
      <div className="flex items-center justify-between px-6 pt-4">
        <div>
          <h2 className={CARD_TITLE}>Comunicados</h2>
          <div className="mt-0.5 text-[12.5px] text-faint">Atualizações do setor</div>
        </div>
        <button onClick={() => setCurrentView('announcements')} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--accent)] hover:underline">
          Ver todos <Icons.ArrowR />
        </button>
      </div>

      {/* Lista */}
      <div className="relative mt-3 min-h-0 flex-1 px-6 pb-5">
        <div className="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
          {loading ? [1, 2, 3].map(i => (
            <div key={i} className="h-16 shrink-0 animate-pulse rounded-xl bg-surface-raised" />
          )) : rest.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-muted">
              {comunicados.length === 0 ? 'Nenhum comunicado recente.' : 'Nenhum outro comunicado.'}
            </div>
          ) : rest.map((it, i) => {
            const tag = tagFor(it.tipo);
            const preview = stripMarkdown(it.descricao);
            return (
              <div
                key={it.id || i}
                onClick={() => setCurrentView('announcements')}
                className={`flex min-h-16 max-h-16 shrink-0 cursor-pointer items-stretch overflow-hidden rounded-xl border-l-[3px] transition-colors hover:bg-surface-raised ${tag.border}`}
              >
                <div className="flex flex-1 flex-col justify-center gap-1 min-w-0 px-3 py-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest leading-relaxed ${tag.chip}`}>
                      {tagLabel(it.tipo)}
                    </span>
                    <span className="truncate text-[13.5px] font-semibold text-foreground">{it.titulo}</span>
                  </div>
                  <div className="truncate text-[12px] text-faint">{preview}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 px-3 py-2 text-right max-w-[88px]">
                  <div title={formatFullDate(it.criado_em)} className="cursor-help whitespace-nowrap font-mono text-[10.5px] text-muted">
                    {relativeTime(it.criado_em)}
                  </div>
                  <div className="truncate max-w-[88px] text-[11px] text-faint">{it.departamento_autor || ''}</div>
                </div>
              </div>
            );
          })}
        </div>
        {rest.length > 3 && (
          <div className="pointer-events-none absolute inset-x-6 bottom-5 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent" />
        )}
      </div>
    </div>
  );
}

function AtalhosCard({ setCurrentView, onSuporteTIClick }) {
  const atalhos = [
    { icon: 'Room', label: 'Reservar Sala', hint: 'Sala de treinamento', id: 'services', url: 'https://wa.me/5582999220181?text=Ol%C3%A1%2C%20gostaria%20de%20reservar%20a%20sala%20de%20treinamento' },
    { icon: 'Headset', label: 'Suporte TI', hint: 'Tempo médio: ~12 min', id: 'tickets' },
    { icon: 'Badge', label: 'Meu Perfil', hint: 'Dados e segurança', id: 'settings' },
    { icon: 'Lightning', label: 'Comunicados', hint: 'Avisos e urgentes', id: 'announcements' },
    { icon: 'Doc', label: 'Holerite', hint: 'Portal do colaborador', id: 'holerite', url: '#' },
    { icon: 'Clock', label: 'Ponto Eletrônico', hint: 'Registro de ponto', id: 'ponto', url: '#' },
    { icon: 'Calendar', label: 'Férias', hint: 'Solicitação e saldo', id: 'ferias', url: '#' },
  ];

  return (
    <div className={CARD}>
      <h2 className={`${CARD_TITLE} mb-3.5`}>Atalhos Rápidos</h2>
      <div className="custom-scrollbar flex flex-col gap-2 overflow-y-auto">
        {atalhos.map(a => {
          const IconC = Icons[a.icon];
          return (
            <button
              key={a.id}
              onClick={() => {
                if (a.url) window.open(a.url, '_blank');
                else if (a.id === 'tickets') onSuporteTIClick();
                else setCurrentView(a.id);
              }}
              className="flex min-h-[44px] w-full shrink-0 items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                {IconC && <IconC />}
              </div>
              <div className="min-w-0 flex-1 truncate text-[13px] font-bold text-foreground">{a.label}</div>
              <div className="shrink-0 truncate text-[11px] text-muted">{a.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function diasAteAniversario(dataNascimento) {
  if (!dataNascimento) return null;
  const iso = String(dataNascimento).slice(0, 10);
  const partes = iso.split('-').map(Number);
  if (partes.length !== 3 || !partes[1] || !partes[2]) return null;
  const [, mes, dia] = partes;
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  let proximo = new Date(hoje.getFullYear(), mes - 1, dia);
  if (proximo < inicioHoje) proximo = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  return Math.round((proximo - inicioHoje) / 86400000);
}

function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

function AniversariantesCard() {
  const [aniversariantes, setAniversariantes] = useState([]);
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
    fetch('/api/colaboradores')
      .then(r => r.json())
      .then(d => {
        if (!d.sucesso) return;
        const proximos = (d.colaboradores || [])
          .map(c => ({ ...c, dias: diasAteAniversario(c.data_nascimento) }))
          .filter(c => c.dias !== null && c.dias <= 7)
          .sort((a, b) => a.dias - b.dias);
        setAniversariantes(proximos);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const rotuloData = (c) => {
    if (c.dias === 0) return 'Hoje';
    if (c.dias === 1) return 'Amanhã';
    const [, mes, dia] = String(c.data_nascimento).slice(0, 10).split('-');
    return `${dia}/${mes}`;
  };

  return (
    <div className={CARD}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className={CARD_TITLE}>Aniversariantes</h2>
          <div className="mt-0.5 text-[12.5px] text-faint">Próximos 7 dias</div>
        </div>
        <span className="text-lg">🎂</span>
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {loading ? [1, 2, 3].map(i => (
          <div key={i} className="flex animate-pulse items-center gap-3 py-1.5">
            <div className="h-9 w-9 rounded-full bg-surface-raised" />
            <div className="flex-1">
              <div className="h-3 w-2/3 rounded bg-surface-raised" />
              <div className="mt-1.5 h-2.5 w-1/3 rounded bg-surface-raised" />
            </div>
            <div className="h-5 w-14 rounded bg-surface-raised" />
          </div>
        )) : aniversariantes.length === 0 ? (
          <div className="py-4 text-center text-[13px] text-muted">Nenhum aniversariante nos próximos 7 dias</div>
        ) : aniversariantes.map(c => (
          <div key={c.funcionario_id} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[13px] font-bold text-[var(--accent)]">
              {iniciais(c.funcionario_nome)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-foreground">{c.funcionario_nome}</div>
              <div className="truncate text-[11.5px] text-muted">{deptoMap[String(c.id_departamento)] || ''}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${c.dias === 0 ? 'bg-[var(--success-soft)] text-[var(--success-bento)]' : 'bg-surface-raised text-faint'}`}>
              {c.dias === 0 ? 'Hoje' : rotuloData(c)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamBento() {
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
    <div className={CARD}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className={CARD_TITLE}>Disponibilidade</h2>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--success-bento)]" />
            <span className="text-[12.5px] text-faint"><strong className="font-semibold text-foreground">{members.length}</strong> online agora</span>
          </div>
        </div>
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {loading ? [1, 2, 3, 4].map(i => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-surface-raised" />
        )) : members.length === 0 ? (
          <div className="py-4 text-center text-[13px] text-muted">Nenhum colaborador online.</div>
        ) : members.map(m => (
          <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
            <div className="relative shrink-0">
              <img src={m.foto} alt={m.name} className="block h-8 w-8 rounded-full bg-surface-raised object-cover" onError={e => { e.target.style.display = 'none'; }} />
              <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--success-bento)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-foreground">{m.name}</div>
              <div className="text-[11.5px] text-muted">{m.role}</div>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--success-bento)]">Online</span>
          </div>
        ))}
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
  { i: 'atalhos', x: 8, y: 4, w: 4, h: 4 },
  { i: 'aniversariantes', x: 0, y: 7, w: 8, h: 2 },
  { i: 'team', x: 8, y: 8, w: 4, h: 2 }
];

const DEFAULT_LAYOUTS = {
  lg: DEFAULT_LAYOUT_LG,
  md: [
    { i: 'hero', x: 0, y: 0, w: 12, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 6, h: 2 },
    { i: 'plantao', x: 6, y: 2, w: 3, h: 2 },
    { i: 'os', x: 9, y: 2, w: 3, h: 2 },
    { i: 'comunicados', x: 0, y: 4, w: 7, h: 3 },
    { i: 'atalhos', x: 7, y: 4, w: 5, h: 4 },
    { i: 'aniversariantes', x: 0, y: 7, w: 7, h: 2 },
    { i: 'team', x: 7, y: 8, w: 5, h: 2 }
  ],
  sm: [
    { i: 'hero', x: 0, y: 0, w: 6, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 6, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 3, h: 2 },
    { i: 'os', x: 3, y: 4, w: 3, h: 2 },
    { i: 'comunicados', x: 0, y: 6, w: 6, h: 3 },
    { i: 'atalhos', x: 0, y: 9, w: 3, h: 4 },
    { i: 'aniversariantes', x: 3, y: 9, w: 3, h: 3 },
    { i: 'team', x: 3, y: 12, w: 3, h: 2 }
  ],
  xs: [
    { i: 'hero', x: 0, y: 0, w: 4, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 4, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 4, h: 2 },
    { i: 'os', x: 0, y: 6, w: 4, h: 2 },
    { i: 'comunicados', x: 0, y: 8, w: 4, h: 3 },
    { i: 'atalhos', x: 0, y: 11, w: 4, h: 4 },
    { i: 'aniversariantes', x: 0, y: 15, w: 4, h: 2 },
    { i: 'team', x: 0, y: 17, w: 4, h: 2 }
  ],
  xxs: [
    { i: 'hero', x: 0, y: 0, w: 2, h: 2, static: true },
    { i: 'setor', x: 0, y: 2, w: 2, h: 2 },
    { i: 'plantao', x: 0, y: 4, w: 2, h: 2 },
    { i: 'os', x: 0, y: 6, w: 2, h: 2 },
    { i: 'comunicados', x: 0, y: 8, w: 2, h: 3 },
    { i: 'atalhos', x: 0, y: 11, w: 2, h: 4 },
    { i: 'aniversariantes', x: 0, y: 15, w: 2, h: 2 },
    { i: 'team', x: 0, y: 17, w: 2, h: 2 }
  ]
};

export default function Dashboard({ setCurrentView, user }) {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [location, setLocation] = useState({ city: 'São Paulo', temp: '24°C' });
  const [cargoName, setCargoName] = useState('');
  const [osCount, setOsCount] = useState(0);
  const [osStatusCount, setOsStatusCount] = useState(null);
  const [osLoading, setOsLoading] = useState(true);
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [plantaoLoading, setPlantaoLoading] = useState(true);
  const [eficiencia, setEficiencia] = useState(null);
  const [eficienciaLoading, setEficienciaLoading] = useState(true);

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
          const normalized = d.layout.map(item => item.i === 'hero' ? { ...item, static: true } : item);
          userLayouts = { ...DEFAULT_LAYOUTS, lg: normalized };
        } else if (typeof d.layout === 'object') {
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
      const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(now);
      const d = parts.find(p => p.type === 'day')?.value;
      let m = parts.find(p => p.type === 'month')?.value.replace('.', '');
      const y = parts.find(p => p.type === 'year')?.value;
      if (m) m = m.charAt(0).toUpperCase() + m.slice(1);
      setCurrentTime(hora);
      setCurrentDate(`${d} ${m}, ${y}`);
      setCurrentDateTime(`${dia.charAt(0).toUpperCase() + dia.slice(1).replace('.', '')} · ${data} · ${hora}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  // Detecta cidade aproximada pelo IP (fallback: São Paulo)
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.city) {
          setLocation(prev => ({ ...prev, city: `${data.city}${data.region_code ? `, ${data.region_code}` : ''}` }));
        }
      })
      .catch(() => { });
  }, []);

  const safeName = func.funcionario || user?.nome || 'Usuário';
  const firstName = safeName.split(' ')[0] || 'Usuário';

  return (
    <main className="flex-1 overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-7 md:px-8">

        <DashboardHeader firstName={firstName} cargoName={cargoName} currentTime={currentTime} currentDate={currentDate} city={location.city} />

        <div className="mb-4 flex justify-end">
          {isEditing ? (
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-faint transition hover:bg-surface-raised"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg border-none bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : <><Icons.Check /> Salvar Layout</>}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-faint transition hover:bg-surface-raised"
            >
              <Icons.Sparkle /> Personalizar Dashboard
            </button>
          )}
        </div>

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
            <HeroCard firstName={firstName} cargoName={cargoName} currentDateTime={currentDateTime} />
          </div>
          <div key="setor" className={isEditing ? 'widget-editable' : ''}>
            <SetorBento eficiencia={eficiencia} eficienciaLoading={eficienciaLoading} />
          </div>
          <div key="plantao" className={isEditing ? 'widget-editable' : ''}>
            <PlantaoBento proximoPlantao={proximoPlantao} plantaoLoading={plantaoLoading} setCurrentView={setCurrentView} />
          </div>
          <div key="os" className={isEditing ? 'widget-editable' : ''}>
            <OsBento osCount={osCount} osLoading={osLoading} setCurrentView={setCurrentView} />
          </div>
          <div key="comunicados" className={isEditing ? 'widget-editable' : ''}>
            <ComunicadosCard setCurrentView={setCurrentView} />
          </div>
          <div key="atalhos" className={isEditing ? 'widget-editable' : ''}>
            <AtalhosCard setCurrentView={setCurrentView} onSuporteTIClick={() => setIsTiModalOpen(true)} />
          </div>
          <div key="aniversariantes" className={isEditing ? 'widget-editable' : ''}>
            <AniversariantesCard />
          </div>
          <div key="team" className={isEditing ? 'widget-editable' : ''}>
            <TeamBento />
          </div>
        </ResponsiveReactGridLayout>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[11.5px] tracking-wide text-muted">
          <span>© 2026 Prestek Inc. · Portal Interno · Confidencial.</span>
          <div className="flex gap-5">
            <a href="#" className="text-inherit no-underline hover:text-foreground">Política de Privacidade</a>
            <a href="#" className="text-inherit no-underline hover:text-foreground">Diretrizes Internas</a>
            <span className="text-[var(--success-bento)]">● v1.1.0</span>
          </div>
        </div>
      </div>

      <TiSupportModal isOpen={isTiModalOpen} onClose={() => setIsTiModalOpen(false)} user={user} />
    </main>
  );
}

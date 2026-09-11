import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { resolveNomeSetor } from '../utils/resolveSetor'
import Sparkline from './common/Sparkline'
import { Icons } from './common/Icons'
import { resolveAvatarUrl, AVATAR_PNGS } from '../utils/avatarPngs'
import TiSupportModal from './TiSupportModal'
import { GlowingEffect } from './ui/glowing-effect'
import { useTouchOnly } from '../hooks/useTouchOnly'

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/* ── Tokens utilitários do design system semântico (vars em index.css) ── */
const LABEL_MONO = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted'
const CARD_TITLE = 'font-display text-xl font-bold tracking-tight text-foreground'
const CARD = 'bento-hover-border flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm'
const ACTION_BTN = 'mt-5 inline-flex items-center gap-1 self-start rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] font-semibold transition'
// Ação primária de um card (fundo sólido no accent): NÃO herda `bg-surface`/
// `border-border` de ACTION_BTN. As duas classes de fundo tinham a mesma
// especificidade CSS e `bg-surface` sempre vencia na folha gerada — o botão
// "Gerenciar Meus Chamados" ficava branco sobre branco no tema claro, embora
// continuasse clicável. Ver DESIGN.md, Buttons: primary sólido vs. secondary.
const ACTION_BTN_PRIMARY = 'mt-5 inline-flex items-center gap-1 self-start rounded-lg border-none bg-primary px-3 py-2 text-[12.5px] font-semibold text-white shadow-md transition hover:bg-[var(--primary-hover)]'

function KpiCard({ label, value, sub, subTone, subTooltip, sparkData, sparkColor }) {
  const isTouchOnly = useTouchOnly();
  // Texto sobre fundo "-soft": os tokens `-strong` (não os `-bento`, pensados
  // para preenchimento gráfico) são os únicos que passam 4,5:1 nos cinco
  // temas — o DESIGN.md já documenta essa distinção.
  const toneClasses = {
    success: 'bg-[var(--success-soft)] text-[var(--success-strong)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger-strong)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning-strong)]',
    muted: 'bg-surface-raised text-faint',
  };
  const subClass = toneClasses[subTone] || toneClasses.muted;

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 bg-surface shadow-sm">
      <GlowingEffect
        variant="brand"
        spread={40}
        glow={true}
        disabled={isTouchOnly}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <div className="relative z-10 flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className={LABEL_MONO}>{label}</div>
          {sub && (
            <div title={subTooltip} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${subClass} ${subTooltip ? 'cursor-help' : ''}`}>
              {subTone === 'danger' && <Icons.TrendDown />}
              {subTone === 'success' && <Icons.TrendUp />}
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
    </div>
  );
}

// "Hoje é aniversário de Ana Souza (Financeiro)" / "de Ana e Bruno" / "de Ana e mais 2 colegas".
// Setor entre parênteses só quando resolvido — sem placeholder.
function fraseAniversariantes(lista) {
  const nomes = lista.map(p => (p.setor ? `${p.nome} (${p.setor})` : p.nome));
  if (nomes.length === 1) return `Hoje é aniversário de ${nomes[0]}`;
  if (nomes.length === 2) return `Hoje é aniversário de ${nomes[0]} e ${nomes[1]}`;
  return `Hoje é aniversário de ${nomes[0]} e mais ${nomes.length - 1} colegas`;
}

function DashboardHeader({ firstName, cargoName, aniversariantesHoje = [] }) {
  // O relógio vive aqui, e não no pai: um tick por minuto no Dashboard
  // re-renderizava os 7 widgets do grid (e os 9 GlowingEffect) só pra
  // atualizar dois textos deste header.
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(now);
      const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(now);
      const d = parts.find(p => p.type === 'day')?.value;
      let m = parts.find(p => p.type === 'month')?.value.replace('.', '');
      const y = parts.find(p => p.type === 'year')?.value;
      if (m) m = m.charAt(0).toUpperCase() + m.slice(1);
      setCurrentTime(hora);
      setCurrentDate(`${d} ${m}, ${y}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Olá, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-faint">
          {cargoName
            ? <>Aqui está o resumo do seu dia · setor <strong className="font-semibold text-foreground">{cargoName}</strong></>
            : 'Aqui está o resumo do seu dia.'}
        </p>
        {/* Delight: aniversário de HOJE reconhecido antes dos números. Mesmo
            par de cor do pill "Hoje" no card, pra o olho ligar os dois; o
            clique rola até a pessoa em vez de ser só enfeite. */}
        {aniversariantesHoje.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('widget-aniversariantes');
              if (!el) return;
              const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
              el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
            }}
            className="mt-2.5 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-[13px] text-foreground transition-colors hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span className="shrink-0 text-[var(--success-bento)]" aria-hidden="true"><Icons.Cake /></span>
            <span className="truncate">{fraseAniversariantes(aniversariantesHoje)}</span>
            <span className="shrink-0 text-muted" aria-hidden="true"><Icons.ArrowR /></span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icons.Clock />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-bold tabular-nums text-foreground">{currentTime || '--:--'}</div>
          <div className="text-xs text-muted">{currentDate || '...'}</div>
        </div>
      </div>
    </header>
  );
}

function SetorBento({ eficiencia, eficienciaLoading, eficienciaError, onRetry }) {
  const efVal = eficienciaLoading ? '...' : eficiencia?.sem_dados ? 'N/A' : `${eficiencia?.eficiencia_atual ?? '–'}%`;
  const efSub = !eficienciaLoading && eficiencia && !eficiencia.sem_dados && eficiencia.variacao !== null
    ? { text: `${eficiencia.variacao >= 0 ? '+' : ''}${eficiencia.variacao}%`, tone: eficiencia.variacao >= 0 ? 'success' : 'danger' }
    : null;
  const efSubTooltip = efSub ? 'Variação calculada pela taxa diária de OS no prazo (mês atual vs mês anterior).' : null;
  const efSparkData = eficiencia?.historico_semanal?.length
    ? eficiencia.historico_semanal.map(s => s.eficiencia ?? 0)
    : [];
  // "OS Fechadas" usa o total real por semana que o backend já calcula.
  // "Sem SLA" não tem granularidade semanal na API (só o agregado do mês
  // atual) — mostrar sparkline pra ela seria inventar uma curva, então fica
  // sem gráfico em vez de fabricar pontos.
  const osFechadasSparkData = eficiencia?.historico_semanal?.length
    ? eficiencia.historico_semanal.map(s => s.total ?? 0)
    : [];

  if (eficienciaError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="m-0 text-[13px] leading-relaxed text-faint">
          Não foi possível carregar os dados do setor.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
        >
          <Icons.Refresh />
          Tentar novamente
        </button>
      </div>
    );
  }

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
        sparkData={osFechadasSparkData}
        sparkColor="var(--accent)"
      />
      <KpiCard
        label="Sem SLA"
        value={eficienciaLoading ? '...' : (eficiencia?.os_sem_prazo ?? 0)}
        sub={eficiencia?.os_sem_prazo > 0 ? 'Atenção' : 'Ok'}
        subTone={eficiencia?.os_sem_prazo > 0 ? 'warning' : 'success'}
        sparkData={null}
      />
    </div>
  );
}

function PlantaoBento({ proximoPlantao, plantaoLoading, plantaoError, onRetry, setCurrentView }) {
  const isTouchOnly = useTouchOnly();
  const dateStr = plantaoLoading ? '...' : (proximoPlantao
    ? new Date(proximoPlantao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Nenhum agendado');
  // Sem fallback inventado: o backend agora envia horario_inicio/horario_fim
  // (TIME, chega como "HH:MM:SS"). Se vier nulo, dizemos que não sabemos em
  // vez de fingir "09:00 – 17:00" com a mesma cara de dado real.
  const timeStr = proximoPlantao
    ? (proximoPlantao.horario_inicio && proximoPlantao.horario_fim
        ? `${String(proximoPlantao.horario_inicio).slice(0, 5)} – ${String(proximoPlantao.horario_fim).slice(0, 5)}`
        : 'Horário a confirmar')
    : 'Sem cobertura ativa';

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className={LABEL_MONO}>Próximo Plantão</div>
      {plantaoError ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="m-0 text-[13px] leading-relaxed text-faint">
            Não foi possível carregar seu plantão.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
          >
            <Icons.Refresh />
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icons.Clock />
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-tight text-foreground">{dateStr}</div>
            <div className="mt-0.5 text-[12.5px] text-faint">{timeStr}</div>
          </div>
        </div>
      )}
      <button
        onClick={() => setCurrentView('schedule')}
        className={`${ACTION_BTN} text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]`}
      >
        Ver plantões <Icons.ArrowR />
      </button>
      </div>
    </div>
  );
}

function OsBento({ osCount, osStatusCount, osLoading, osError, onRetry, setCurrentView }) {
  const isTouchOnly = useTouchOnly();
  const allGood = !osLoading && !osError && osCount === 0;

  const assumidas = osStatusCount ? (osStatusCount.AS || 0) : 0;
  const encaminhadas = osStatusCount ? ((osStatusCount.EN || 0) + (osStatusCount.EX || 0)) : 0;
  const agendadas = osStatusCount ? (osStatusCount.AG || 0) : 0;
  const abertas = osStatusCount ? ((osStatusCount.A || 0) + (osStatusCount.AN || 0)) : 0;

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className={LABEL_MONO}>Chamados no meu nome</div>
          {!osLoading && !osError && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${allGood ? 'bg-[var(--success-soft)] text-[var(--success-strong)]' : 'bg-[var(--warning-soft)] text-[var(--warning-strong)] animate-pulse'}`}>
              {allGood ? <><Icons.Check /> Tudo em dia</> : `⚠️ ${osCount} pendente${osCount !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {osError ? (
          <div className="mt-3 flex flex-col gap-2">
            <p className="m-0 text-[13px] leading-relaxed text-faint">
              Não foi possível carregar seus chamados.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
            >
              <Icons.Refresh />
              Tentar novamente
            </button>
          </div>
        ) : (
        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-5xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
            {osLoading ? '...' : osCount}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">Chamados</span>
            <span className="text-[11.5px] text-faint">sob sua responsabilidade direta</span>
          </div>
        </div>
        )}

        {/* Detalhamento por Status (4 Mini KPIs) */}
        {!osLoading && !osError && !allGood && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex flex-col rounded-xl border border-border/60 bg-surface-raised/60 p-2 transition-colors hover:bg-surface-raised">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[var(--accent-deep)] truncate" title="Assumidas">
                ⚡ Assumidas
              </span>
              <span className="mt-1 text-base font-extrabold text-foreground tabular-nums">
                {assumidas}
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-border/60 bg-surface-raised/60 p-2 transition-colors hover:bg-surface-raised">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 truncate" title="Encaminhadas">
                ➡️ Encaminhadas
              </span>
              <span className="mt-1 text-base font-extrabold text-foreground tabular-nums">
                {encaminhadas}
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-border/60 bg-surface-raised/60 p-2 transition-colors hover:bg-surface-raised">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[var(--warning-bento)] truncate" title="Agendadas">
                📅 Agendadas
              </span>
              <span className="mt-1 text-base font-extrabold text-foreground tabular-nums">
                {agendadas}
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-border/60 bg-surface-raised/60 p-2 transition-colors hover:bg-surface-raised">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted truncate" title="Abertas">
                📋 Abertas
              </span>
              <span className="mt-1 text-base font-extrabold text-foreground tabular-nums">
                {abertas}
              </span>
            </div>
          </div>
        )}

        {allGood && (
          <p className="mt-3 text-[12.5px] text-faint leading-relaxed">
            Nenhum chamado pendente atribuído a você no momento.
          </p>
        )}
      </div>

      <button
        onClick={() => setCurrentView('tickets')}
        className={`${ACTION_BTN_PRIMARY} hover:shadow-lg transition-transform active:scale-[0.98] mt-4`}
      >
        Gerenciar Meus Chamados <Icons.ArrowR />
      </button>
      </div>
    </div>
  );
}

// Intervalo do autoplay do carrossel. Vai inline para a barra de progresso
// (CSS) e para o setTimeout, então os dois contam o mesmo tempo.
const AUTOPLAY_MS = 6000;

function ComunicadoBanner({ setCurrentView }) {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const pausado = isHovered || isFocused;
  // Cronômetro com "tempo restante": pausar no hover/foco congela o relógio em
  // vez de zerá-lo, e a barra no dot ativo (animation-play-state) congela junto.
  const restanteRef = useRef(AUTOPLAY_MS);
  const inicioRef = useRef(0);

  const carregarComunicados = useCallback(() => {
    setLoading(true);
    setErro(false);
    fetch('/api/comunicados')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (d.sucesso && d.comunicados) {
          setComunicados(d.comunicados.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)));
        } else {
          setErro(true);
        }
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregarComunicados(); }, [carregarComunicados]);

  // Seleciona até 3 comunicados de alta prioridade (Urgente > Importante > recentes)
  const slides = useMemo(() => {
    if (!comunicados.length) return [];
    const urgentes = comunicados.filter(c => c.tipo === 'Urgente');
    const importantes = comunicados.filter(c => c.tipo === 'Importante');
    const outros = comunicados.filter(c => c.tipo !== 'Urgente' && c.tipo !== 'Importante');
    
    const unicos = [];
    [...urgentes, ...importantes, ...outros].forEach(c => {
      if (unicos.length < 3 && !unicos.some(item => item.id === c.id)) {
        unicos.push(c);
      }
    });
    return unicos;
  }, [comunicados]);

  // Troca de slide (automática ou por clique no dot) zera o relógio. Precisa
  // vir ANTES do cronômetro: a limpeza dele desconta o tempo decorrido
  // primeiro, e só depois este efeito repõe o valor cheio.
  useEffect(() => { restanteRef.current = AUTOPLAY_MS; }, [currentIndex]);

  // Auto-play. Pausa no hover E no foco: só pausar no mouse deixava o
  // carrossel girando sob o cursor de quem navega por teclado ou leitor de
  // tela (WCAG 2.2.2). Antes era setInterval fixo: clicar num dot não
  // reiniciava a contagem e o próximo avanço podia vir 1s depois.
  useEffect(() => {
    if (slides.length <= 1 || pausado) return;
    inicioRef.current = Date.now();
    const t = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, restanteRef.current);
    return () => {
      clearTimeout(t);
      restanteRef.current = Math.max(0, restanteRef.current - (Date.now() - inicioRef.current));
    };
  }, [slides.length, pausado, currentIndex]);

  const TAG_STYLES = {
    Urgente:    { chip: 'bg-red-500/90 text-white', label: 'URGENTE', bgFallback: 'bg-gradient-to-r from-red-950 via-rose-900 to-stone-900' },
    Importante: { chip: 'bg-amber-500/90 text-stone-950', label: 'IMPORTANTE', bgFallback: 'bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900' },
    Aviso:      { chip: 'bg-amber-500/90 text-stone-950', label: 'AVISO', bgFallback: 'bg-gradient-to-r from-amber-950 via-slate-900 to-stone-900' },
    Geral:      { chip: 'bg-emerald-500/90 text-white', label: 'GERAL', bgFallback: 'bg-gradient-to-r from-emerald-950 via-slate-900 to-stone-900' },
    Info:       { chip: 'bg-blue-500/90 text-white', label: 'INFO', bgFallback: 'bg-gradient-to-r from-blue-950 via-slate-900 to-stone-900' },
  };

  const TAG_DEFAULT = { chip: 'bg-primary text-white', label: 'AVISO', bgFallback: 'bg-gradient-to-r from-slate-900 via-slate-800 to-stone-900' };

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

  function stripMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/[🔹🔸→←•➡️]/gu, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  if (loading) {
    return (
      <div className="mb-6 h-48 md:h-56 lg:h-64 w-full animate-pulse rounded-2xl bg-surface-raised border border-border" />
    );
  }

  if (erro) {
    return (
      <div className="mb-6 flex h-48 md:h-56 lg:h-64 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface-raised text-center">
        <p className="m-0 text-[13px] leading-relaxed text-faint">
          Não foi possível carregar os comunicados.
        </p>
        <button
          type="button"
          onClick={carregarComunicados}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-background"
        >
          <Icons.Refresh />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!slides.length) return null;

  const activeSlide = slides[currentIndex % slides.length] || slides[0];
  const tagInfo = TAG_STYLES[activeSlide.tipo] || TAG_DEFAULT;
  const description = stripMarkdown(activeSlide.descricao);
  const slideKey = activeSlide.id ?? (currentIndex % slides.length);
  // Entrada desacelera (chegada confiante); saída é mais curta que a entrada.
  // Com movimento reduzido sobra só o fade: a opacidade carrega o "trocou",
  // o deslocamento não.
  const transicaoTexto = reduceMotion
    ? { duration: 0.2 }
    : { duration: 0.42, ease: [0.16, 1, 0.3, 1] };
  const transicaoSaida = { duration: reduceMotion ? 0.12 : 0.16, ease: [0.4, 0, 1, 1] };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Comunicado em destaque: ${activeSlide.titulo}. Abrir comunicados`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => setCurrentView && setCurrentView('announcements')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setCurrentView && setCurrentView('announcements');
        }
      }}
      className="group relative mb-6 h-48 md:h-56 lg:h-64 w-full cursor-pointer overflow-hidden rounded-2xl border border-border/40 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.002] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
    >
      {/* Background Image / Fallback Gradient com Fade suave */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === (currentIndex % slides.length);
        const sTag = TAG_STYLES[slide.tipo] || TAG_DEFAULT;
        const sImg = slide.imagem_url || slide.imagem || slide.foto || slide.capa || null;
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isCurrent ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'}`}
          >
            {sImg ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${sImg})` }}
              />
            ) : (
              <div className={`absolute inset-0 ${sTag.bgFallback}`} />
            )}
          </div>
        );
      })}

      {/* Dark Overlay para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/50" />

      {/* Conteúdo do Slide Ativo. O que muda por slide (chip, hora, título,
          texto) anima com continuidade; o que persiste (dots) fica parado. */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white md:p-8">
        {/* Top bar: meta do slide à esquerda, navegação à direita */}
        <div className="flex items-center justify-between gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slideKey}
              className="flex min-w-0 items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: transicaoSaida }}
              transition={{ duration: 0.24 }}
            >
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${tagInfo.chip}`}>
                {tagInfo.label}
              </span>
              {activeSlide.criado_em && (
                <span className="font-mono text-[11px] font-semibold text-white/70 backdrop-blur-sm bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
                  {relativeTime(activeSlide.criado_em)}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex shrink-0 items-center gap-3">
            
            {/* Dots de Navegação */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5 backdrop-blur-sm bg-black/40 px-2 py-1 rounded-full border border-white/10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Comunicado ${i + 1} de ${slides.length}`}
                    aria-current={i === (currentIndex % slides.length) ? 'true' : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      i === (currentIndex % slides.length) ? 'w-5 bg-white/35' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Comunicado ${i + 1}`}
                  >
                    {/* Barra de progresso do autoplay: o dot ativo enche em 6s e
                        congela junto com o relógio no hover/foco. Com movimento
                        reduzido (regra global do index.css) nasce cheio = o dot
                        branco sólido de antes. Remonta a cada troca de slide
                        porque muda de botão. */}
                    {i === (currentIndex % slides.length) && (
                      <span
                        aria-hidden="true"
                        className="comunicado-progresso absolute inset-0 origin-left rounded-full bg-white"
                        style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: pausado ? 'paused' : 'running' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Título e Subtítulo: o momento autoral da troca. Sobe 10px ao entrar
            e sai por cima, mais rápido — a leitura acompanha o fundo, que já
            faz crossfade de 700ms. mode="wait" segura a entrada até a saída
            terminar, então cliques rápidos nos dots não empilham textos. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slideKey}
            className="max-w-3xl"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6, transition: transicaoSaida }}
            transition={transicaoTexto}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white line-clamp-2 drop-shadow-md group-hover:text-white/95">
              {activeSlide.titulo}
            </h2>
            {description && (
              <p className="mt-2 text-xs md:text-sm font-medium text-white/80 line-clamp-2 drop-shadow">
                {description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ComunicadosCard({ setCurrentView }) {
  const isTouchOnly = useTouchOnly();
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarComunicados = useCallback(() => {
    setLoading(true);
    setErro(false);
    fetch('/api/comunicados')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (d.sucesso) setComunicados(d.comunicados.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)));
        else setErro(true);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregarComunicados(); }, [carregarComunicados]);

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

  const featured = comunicados.find(c => c.tipo === 'Urgente')
    || comunicados.find(c => c.tipo === 'Importante')
    || comunicados[0]
    || null;

  const rest = comunicados.filter(c => c.id !== featured?.id);

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {/* Header da lista */}
      <div className="flex items-center justify-between px-6 pt-5">
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
          )) : erro ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="m-0 text-[13px] text-muted">Não foi possível carregar os comunicados.</p>
              <button
                type="button"
                onClick={carregarComunicados}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
              >
                <Icons.Refresh />
                Tentar novamente
              </button>
            </div>
          ) : rest.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted">
              {comunicados.length === 0 ? 'Nenhum comunicado recente.' : 'Nenhum outro comunicado.'}
            </div>
          ) : rest.map((it, i) => {
            const tag = tagFor(it.tipo);
            const preview = stripMarkdown(it.descricao);
            return (
              <div
                key={it.id || i}
                role="button"
                tabIndex={0}
                aria-label={`${tagLabel(it.tipo)}: ${it.titulo}. Abrir comunicados`}
                onClick={() => setCurrentView('announcements')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentView('announcements');
                  }
                }}
                className={`flex min-h-16 max-h-16 shrink-0 cursor-pointer items-stretch overflow-hidden rounded-xl border-l-[3px] transition-colors hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${tag.border}`}
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
                <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 px-3 py-2 text-right max-w-[140px]">
                  <div title={formatFullDate(it.criado_em)} className="cursor-help whitespace-nowrap font-mono text-[10.5px] text-muted">
                    {relativeTime(it.criado_em)}
                  </div>
                  <div title={it.departamento_autor || ''} className="truncate max-w-[140px] text-[11px] text-faint">{it.departamento_autor || ''}</div>
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
    </div>
  );
}

function AtalhosCard({ setCurrentView, onSuporteTIClick }) {
  const isTouchOnly = useTouchOnly();
  const atalhos = [
    { icon: 'Room', label: 'Reservar Sala', hint: 'Sala de treinamento', id: 'services', url: 'https://wa.me/5582999220181?text=Ol%C3%A1%2C%20gostaria%20de%20reservar%20a%20sala%20de%20treinamento' },
    { icon: 'Headset', label: 'Suporte TI', hint: 'Abrir chamado', id: 'tickets' },
    { icon: 'Badge', label: 'Meu Perfil', hint: 'Dados e segurança', id: 'settings' },
    { icon: 'Lightning', label: 'Comunicados', hint: 'Avisos e urgentes', id: 'announcements' },
    // Sem destino ainda. Antes eram `url: '#'` e window.open('#') abria uma
    // aba em branco duplicando o dashboard — um atalho que parecia funcionar
    // e não levava a lugar nenhum. Desabilitado e rotulado até existir a URL.
    { icon: 'Doc', label: 'Holerite', hint: 'Portal do colaborador', id: 'holerite', emBreve: true },
    { icon: 'Clock', label: 'Ponto Eletrônico', hint: 'Registro de ponto', id: 'ponto', emBreve: true },
    { icon: 'Calendar', label: 'Férias', hint: 'Solicitação e saldo', id: 'ferias', emBreve: true },
  ];

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <h2 className={`${CARD_TITLE} mb-3.5`}>Atalhos Rápidos</h2>
      <div className="custom-scrollbar flex flex-col gap-2 overflow-y-auto pr-1.5 py-0.5">
        {atalhos.map(a => {
          const IconC = Icons[a.icon];
          return (
            <button
              key={a.id}
              type="button"
              disabled={a.emBreve}
              aria-disabled={a.emBreve || undefined}
              onClick={() => {
                if (a.emBreve) return;
                if (a.url) window.open(a.url, '_blank', 'noopener');
                else if (a.id === 'tickets') onSuporteTIClick();
                else setCurrentView(a.id);
              }}
              className={`flex min-h-[48px] w-full shrink-0 items-center gap-3.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                a.emBreve
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md'
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.emBreve ? 'bg-surface-raised text-muted' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
                {IconC && <IconC />}
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-foreground leading-tight">{a.label}</span>
                <span className="text-[11px] text-muted leading-tight">{a.emBreve ? 'Em breve' : a.hint}</span>
              </div>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function proximoAniversario(dataNascimento) {
  if (!dataNascimento) return null;
  const iso = String(dataNascimento).slice(0, 10);
  const partes = iso.split('-').map(Number);
  if (partes.length !== 3 || !partes[1] || !partes[2]) return null;
  const [, mes, dia] = partes;
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  let proximo = new Date(hoje.getFullYear(), mes - 1, dia);
  if (proximo < inicioHoje) proximo = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  return proximo;
}

function diasAteAniversario(dataNascimento) {
  const proximo = proximoAniversario(dataNascimento);
  if (!proximo) return null;
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((proximo - inicioHoje) / 86400000);
}

const DIAS_SEMANA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// Data do próximo aniversário por extenso, ex: "seg, 04/08"
function dataAniversarioExtenso(dataNascimento) {
  const proximo = proximoAniversario(dataNascimento);
  if (!proximo) return '';
  const dia = String(proximo.getDate()).padStart(2, '0');
  const mes = String(proximo.getMonth() + 1).padStart(2, '0');
  return `${DIAS_SEMANA_CURTO[proximo.getDay()]}, ${dia}/${mes}`;
}

// Partículas de ligação não contam como sobrenome ("Vitor Santos da Silva" -> "Vitor Silva")
const PARTICULAS_NOME = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

function palavrasNome(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  const significativas = partes.filter(p => !PARTICULAS_NOME.has(p.toLowerCase()));
  return significativas.length > 0 ? significativas : partes;
}

function capitalizar(palavra) {
  return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
}

// Nomes chegam do IXC em CAIXA ALTA
function nomeFormatado(nome) {
  return String(nome || '').trim().split(/\s+/).filter(Boolean)
    .map(p => (PARTICULAS_NOME.has(p.toLowerCase()) ? p.toLowerCase() : capitalizar(p)))
    .join(' ');
}

function nomeCurto(nome) {
  const partes = palavrasNome(nome);
  if (partes.length === 0) return '';
  if (partes.length === 1) return capitalizar(partes[0]);
  return `${capitalizar(partes[0])} ${capitalizar(partes[partes.length - 1])}`;
}

function iniciais(nome) {
  const partes = palavrasNome(nome);
  if (partes.length === 0) return '?';
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

// Foto real do colaborador; cai para as iniciais quando não há foto ou ela falha ao carregar
function AvatarAniversariante({ nome, foto }) {
  const [erro, setErro] = useState(false);
  const src = erro ? null : resolveAvatarUrl(foto);
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] text-[13px] font-bold text-[var(--accent)]">
      {src
        ? <img src={src} alt="" className="h-full w-full object-cover" onError={() => setErro(true)} />
        : iniciais(nome)}
    </div>
  );
}

function AniversariantesCard({ onAniversariantesHoje }) {
  const isTouchOnly = useTouchOnly();
  const [aniversariantes, setAniversariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
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

  const carregarAniversariantes = useCallback(() => {
    setLoading(true);
    setErro(false);
    fetch('/api/colaboradores')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (!d.sucesso) { setErro(true); return; }
        const proximos = (d.colaboradores || [])
          .map(c => ({ ...c, dias: diasAteAniversario(c.data_nascimento) }))
          .filter(c => c.dias !== null && c.dias <= 7)
          .sort((a, b) => a.dias - b.dias);
        setAniversariantes(proximos);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregarAniversariantes(); }, [carregarAniversariantes]);

  const rotuloData = (c) => {
    if (c.dias === 0) return 'Hoje';
    if (c.dias === 1) return 'Amanhã';
    return `em ${c.dias} dias`;
  };

  // Departamento é complementar: só aparece quando resolve, senão some sem deixar espaço
  const departamento = (c) => deptoMap[String(c.id_departamento)] || deptoMap[String(c.id_funcao)] || '';

  // Avisa o pai quando alguém faz aniversário HOJE, pra saudação reconhecer
  // a pessoa antes dos números. Nome já formatado (nomeCurto) e setor
  // resolvido; re-dispara quando deptoMap chega, pra o setor preencher.
  useEffect(() => {
    if (!onAniversariantesHoje) return;
    onAniversariantesHoje(
      aniversariantes
        .filter(c => c.dias === 0)
        .map(c => ({ nome: nomeCurto(c.funcionario_nome), setor: departamento(c) }))
    );
  }, [aniversariantes, deptoMap, onAniversariantesHoje]);

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className={CARD_TITLE}>Aniversariantes</h2>
          <div className="mt-0.5 text-[12.5px] text-faint">Próximos 7 dias</div>
        </div>
        <span className="text-lg">🎂</span>
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {loading ? [1, 2, 3].map(i => (
          <div key={i} className="flex animate-pulse items-center gap-3 border-l-2 border-l-transparent px-2 py-1.5">
            <div className="h-9 w-9 rounded-full bg-surface-raised" />
            <div className="flex-1">
              <div className="h-3 w-2/3 rounded bg-surface-raised" />
              <div className="mt-1.5 h-2.5 w-1/3 rounded bg-surface-raised" />
            </div>
            <div className="h-5 w-14 rounded bg-surface-raised" />
          </div>
        )) : erro ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="m-0 text-[13px] text-muted">Não foi possível carregar os aniversariantes.</p>
            <button
              type="button"
              onClick={carregarAniversariantes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
            >
              <Icons.Refresh />
              Tentar novamente
            </button>
          </div>
        ) : aniversariantes.length === 0 ? (
          <div className="py-4 text-center text-[13px] text-muted">Nenhum aniversariante nos próximos 7 dias</div>
        ) : aniversariantes.map(c => {
          const iminente = c.dias <= 1;
          const depto = departamento(c);
          return (
            <div
              key={c.funcionario_id}
              title={nomeFormatado(c.funcionario_nome)}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-2 py-1.5 transition-colors ${iminente ? 'border-l-[var(--success-bento)] bg-surface-raised' : 'border-l-transparent hover:bg-surface-raised'}`}
            >
              <AvatarAniversariante nome={c.funcionario_nome} foto={c.foto_perfil} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-foreground">{nomeCurto(c.funcionario_nome)}</div>
                <div className="truncate text-[11.5px] text-muted">
                  {dataAniversarioExtenso(c.data_nascimento)}{depto ? ` · ${depto}` : ''}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${iminente ? 'bg-[var(--success-soft)] text-[var(--success-bento)]' : 'bg-surface-raised text-faint'}`}>
                {rotuloData(c)}
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function TeamBento() {
  const isTouchOnly = useTouchOnly();
  const [members, setMembers] = useState([]);
  // Contagem real: `members` é cortado em 7 pra lista; o cabeçalho dizia
  // "7 online agora" com 12 pessoas online.
  const [totalOnline, setTotalOnline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
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

  const fetchOnline = useCallback(async () => {
    setErro(false);
    try {
      const res = await fetch('/api/colaboradores/online');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.sucesso) {
        const lista = data.colaboradores || [];
        setTotalOnline(lista.length);
        setMembers(
          lista.slice(0, 7).map(m => ({
            id: m.id,
            name: m.nome || m.funcionario || 'Colaborador',
            role: deptoMap[String(m.id_departamento)] || m.id_funcao || '',
            foto: resolveAvatarUrl(m.foto_perfil) || AVATAR_PNGS[(m.id || 0) % AVATAR_PNGS.length],
          }))
        );
      } else {
        setErro(true);
      }
    } catch (_) { setErro(true); }
    finally { setLoading(false); }
  }, [deptoMap]);

  useEffect(() => {
    fetchOnline();
    const id = setInterval(fetchOnline, 30000);
    return () => clearInterval(id);
  }, [fetchOnline]);

  return (
    <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
      <GlowingEffect variant="brand" spread={40} glow={true} disabled={isTouchOnly} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className={CARD_TITLE}>Disponibilidade</h2>
          {!loading && !erro && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--success-bento)]" />
              <span className="text-[12.5px] text-faint"><strong className="font-semibold text-foreground">{totalOnline}</strong> online agora</span>
            </div>
          )}
        </div>
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {loading ? [1, 2, 3, 4].map(i => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-surface-raised" />
        )) : erro ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="m-0 text-[13px] text-muted">Não foi possível carregar quem está online.</p>
            <button
              type="button"
              onClick={fetchOnline}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-raised"
            >
              <Icons.Refresh />
              Tentar novamente
            </button>
          </div>
        ) : members.length === 0 ? (
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
    </div>
  );
}

const DEFAULT_LAYOUT_LG = [
  { i: 'os', x: 0, y: 0, w: 6, h: 3 },
  { i: 'comunicados', x: 6, y: 0, w: 6, h: 3 },
  { i: 'setor', x: 0, y: 3, w: 6, h: 2 },
  { i: 'plantao', x: 6, y: 3, w: 3, h: 2 },
  { i: 'atalhos', x: 9, y: 3, w: 3, h: 4 },
  { i: 'aniversariantes', x: 0, y: 5, w: 5, h: 2 },
  { i: 'team', x: 5, y: 5, w: 4, h: 2 }
];

const DEFAULT_LAYOUTS = {
  lg: DEFAULT_LAYOUT_LG,
  md: [
    { i: 'os', x: 0, y: 0, w: 6, h: 3 },
    { i: 'comunicados', x: 6, y: 0, w: 6, h: 3 },
    { i: 'setor', x: 0, y: 3, w: 6, h: 2 },
    { i: 'plantao', x: 6, y: 3, w: 3, h: 2 },
    { i: 'atalhos', x: 9, y: 3, w: 3, h: 4 },
    { i: 'aniversariantes', x: 0, y: 5, w: 5, h: 2 },
    { i: 'team', x: 5, y: 5, w: 4, h: 2 }
  ],
  // Abaixo de md (768px) o SetorBento empilha os 3 KpiCards em coluna
  // (~172px cada + gaps ≈ 544px), e o grid tem altura fixa em pixels
  // (rowHeight 100 + margin 18): h:2 = 218px não cabe e, sem overflow,
  // os cards vazavam por cima do Plantão. h:5 = 572px. O OsBento em xs/xxs
  // quebra os mini-KPIs em 2 linhas e passa dos 336px de h:3 — sobe pra h:4.
  sm: [
    { i: 'os', x: 0, y: 0, w: 6, h: 3 },
    { i: 'comunicados', x: 0, y: 3, w: 6, h: 3 },
    { i: 'setor', x: 0, y: 6, w: 6, h: 5 },
    { i: 'plantao', x: 0, y: 11, w: 3, h: 2 },
    { i: 'atalhos', x: 3, y: 11, w: 3, h: 4 },
    { i: 'aniversariantes', x: 0, y: 13, w: 3, h: 2 },
    { i: 'team', x: 0, y: 15, w: 3, h: 2 }
  ],
  xs: [
    { i: 'os', x: 0, y: 0, w: 4, h: 4 },
    { i: 'comunicados', x: 0, y: 4, w: 4, h: 3 },
    { i: 'setor', x: 0, y: 7, w: 4, h: 5 },
    { i: 'plantao', x: 0, y: 12, w: 4, h: 2 },
    { i: 'atalhos', x: 0, y: 14, w: 4, h: 4 },
    { i: 'aniversariantes', x: 0, y: 18, w: 4, h: 2 },
    { i: 'team', x: 0, y: 20, w: 4, h: 2 }
  ],
  xxs: [
    { i: 'os', x: 0, y: 0, w: 2, h: 4 },
    { i: 'comunicados', x: 0, y: 4, w: 2, h: 3 },
    { i: 'setor', x: 0, y: 7, w: 2, h: 5 },
    { i: 'plantao', x: 0, y: 12, w: 2, h: 2 },
    { i: 'atalhos', x: 0, y: 14, w: 2, h: 4 },
    { i: 'aniversariantes', x: 0, y: 18, w: 2, h: 2 },
    { i: 'team', x: 0, y: 20, w: 2, h: 2 }
  ]
};

export default function Dashboard({ setCurrentView, user }) {
  const [cargoName, setCargoName] = useState('');
  const [aniversariantesHoje, setAniversariantesHoje] = useState([]);
  const [osCount, setOsCount] = useState(null);
  const [osStatusCount, setOsStatusCount] = useState(null);
  const [osLoading, setOsLoading] = useState(true);
  const [osError, setOsError] = useState(false);
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [plantaoLoading, setPlantaoLoading] = useState(true);
  const [plantaoError, setPlantaoError] = useState(false);
  const [eficiencia, setEficiencia] = useState(null);
  const [eficienciaLoading, setEficienciaLoading] = useState(true);
  const [eficienciaError, setEficienciaError] = useState(false);
  const [isTiModalOpen, setIsTiModalOpen] = useState(false);

  const func = user?.funcionario ?? {};
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const funcId = func.id || user?.id;

  useEffect(() => {
    resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo).then(setCargoName).catch(() => { });
  }, [safeDepto, safeRole, user?.nome_grupo]);

  const carregarOs = useCallback(() => {
    if (!funcId) { setOsLoading(false); return; }
    setOsLoading(true);
    setOsError(false);
    fetch(`/api/os-chamados/${funcId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (d.sucesso) { setOsCount(d.quantidade); setOsStatusCount(d.statusCount); }
        else { setOsError(true); }
      })
      .catch(() => setOsError(true))
      .finally(() => setOsLoading(false));
  }, [funcId]);

  useEffect(() => { carregarOs(); }, [carregarOs]);

  const carregarPlantao = useCallback(() => {
    if (!user?.id) { setPlantaoLoading(false); return; }
    setPlantaoLoading(true);
    setPlantaoError(false);
    fetch(`/api/plantoes/meu-proximo/${user.id}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        if (d.sucesso) { if (d.proximo) setProximoPlantao(d.proximo); }
        else { setPlantaoError(true); }
      })
      .catch(() => setPlantaoError(true))
      .finally(() => setPlantaoLoading(false));
  }, [user?.id]);

  useEffect(() => { carregarPlantao(); }, [carregarPlantao]);

  const carregarEficiencia = useCallback(() => {
    if (!funcId) { setEficienciaLoading(false); return; }
    setEficienciaLoading(true);
    setEficienciaError(false);
    fetch(`/api/eficiencia/${funcId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => {
        // sem_dados não é uma falha — é o backend dizendo "este colaborador
        // não é técnico cadastrado no IXC", o caso normal pra maior parte da
        // empresa. SetorBento já sabe renderizar isso como 'N/A'; só conta
        // como erro de verdade quando nem isso o backend conseguiu dizer.
        if (d.sucesso || d.sem_dados) setEficiencia(d);
        else setEficienciaError(true);
      })
      .catch(() => setEficienciaError(true))
      .finally(() => setEficienciaLoading(false));
  }, [funcId]);

  useEffect(() => { carregarEficiencia(); }, [carregarEficiencia]);

  const safeName = func.funcionario || user?.nome || 'Usuário';
  const firstName = safeName.split(' ')[0] || 'Usuário';

  return (
    <main className="flex-1 overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-7 md:px-8">

        <DashboardHeader firstName={firstName} cargoName={cargoName} aniversariantesHoje={aniversariantesHoje} />

        <ComunicadoBanner setCurrentView={setCurrentView} />

        <ResponsiveReactGridLayout
          className="layout"
          layouts={DEFAULT_LAYOUTS}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          containerPadding={[0, 0]}
          margin={[18, 18]}
          isDraggable={false}
          isResizable={false}
          useCSSTransforms={true}
        >
          <div key="os">
            <OsBento osCount={osCount} osStatusCount={osStatusCount} osLoading={osLoading} osError={osError} onRetry={carregarOs} setCurrentView={setCurrentView} />
          </div>
          <div key="comunicados">
            <ComunicadosCard setCurrentView={setCurrentView} />
          </div>
          <div key="setor">
            <SetorBento eficiencia={eficiencia} eficienciaLoading={eficienciaLoading} eficienciaError={eficienciaError} onRetry={carregarEficiencia} />
          </div>
          <div key="plantao">
            <PlantaoBento proximoPlantao={proximoPlantao} plantaoLoading={plantaoLoading} plantaoError={plantaoError} onRetry={carregarPlantao} setCurrentView={setCurrentView} />
          </div>
          <div key="atalhos">
            <AtalhosCard setCurrentView={setCurrentView} onSuporteTIClick={() => setIsTiModalOpen(true)} />
          </div>
          <div key="aniversariantes" id="widget-aniversariantes">
            <AniversariantesCard onAniversariantesHoje={setAniversariantesHoje} />
          </div>
          <div key="team">
            <TeamBento />
          </div>
        </ResponsiveReactGridLayout>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[11.5px] tracking-wide text-muted">
          <span>© 2026 Prestek Telecom · Portal Interno · Confidencial.</span>
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

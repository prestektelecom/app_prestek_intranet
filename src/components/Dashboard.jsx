import { useState, useEffect, useRef } from 'react'
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

const HERO_SLIDE_INTERVAL = 8000;
const HERO_MAX_PX = 1280;
const HERO_JPEG_QUALITY = 0.82;

// Redimensiona a imagem no browser (máx. HERO_MAX_PX na maior dimensão) e
// retorna um data URL JPEG base64 — protege o limite de ~5 MB do localStorage.
function resizeImageToDataUrl(file, maxPx = HERO_MAX_PX, quality = HERO_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

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

function HeroBgModal({ isOpen, images, onSave, onClose }) {
  const [draft, setDraft] = useState(images);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(images);
      cardRef.current?.focus();
    }
  }, [isOpen, images]);

  if (!isOpen) return null;

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setIsProcessing(true);
    const results = await Promise.allSettled(files.map(f => resizeImageToDataUrl(f)));
    const urls = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    setDraft(prev => [...prev, ...urls]);
    setIsProcessing(false);
  };

  const removeImage = (idx) => setDraft(prev => prev.filter((_, i) => i !== idx));

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Gerenciar imagens de fundo do banner"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="text-[15px] font-bold tracking-tight text-foreground">Imagens do banner</div>
            <div className="mt-0.5 text-xs text-muted">Elas passam automaticamente a cada 8 segundos</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:bg-surface-raised hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFiles}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-raised px-4 py-5 text-sm font-semibold text-muted transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
          >
            <Icons.Plus />
            {isProcessing ? 'Processando imagens...' : 'Adicionar imagens do dispositivo'}
          </button>

          {draft.length === 0 ? (
            <p className="mt-4 rounded-xl bg-surface-raised px-4 py-3 text-center text-[12.5px] text-muted">
              Nenhuma imagem adicionada. O banner exibirá o gradiente padrão.
            </p>
          ) : (
            <div className="mt-4 grid max-h-64 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {draft.map((src, idx) => (
                <div key={idx} className="group relative aspect-video overflow-hidden rounded-lg border border-border">
                  <img src={src} alt={`Imagem ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    aria-label={`Remover imagem ${idx + 1}`}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/80"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-faint transition hover:bg-surface-raised hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-none bg-primary px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            <Icons.Check /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ firstName, cargoName, currentDateTime, bgImages, onChangeBg, onAbrirChamadoTI }) {
  const count = bgImages.length;
  // Dois layers empilhados: o inativo recebe o próximo src e vai de opacity 0→1
  const [current, setCurrent] = useState({ index: 0, layer: 0 });
  const [layerSrc, setLayerSrc] = useState([bgImages[0], bgImages[0]]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    setCurrent({ index: 0, layer: 0 });
    setLayerSrc([bgImages[0], bgImages[0]]);
  }, [bgImages]);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => {
      const nextIndex = (current.index + 1) % count;
      const nextLayer = 1 - current.layer;
      setLayerSrc(srcs => {
        const s = [...srcs];
        s[nextLayer] = bgImages[nextIndex];
        return s;
      });
      setCurrent({ index: nextIndex, layer: nextLayer });
    }, HERO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [count, current, bgImages]);

  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-6 text-white shadow-lg md:p-8">
      {count === 0 ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-deep)] via-[var(--accent-dark)] to-[var(--accent)]" />
          <svg className="absolute inset-0 opacity-15" width="100%" height="100%">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        </>
      ) : count === 1 ? (
        <img src={bgImages[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        [0, 1].map(layer => (
          <img
            key={layer}
            src={layerSrc[layer]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{ opacity: current.layer === layer ? 1 : 0 }}
          />
        ))
      )}
      {count > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35 backdrop-blur-[1px]" />
      )}
      <button
        onClick={onChangeBg}
        title="Gerenciar imagens de fundo"
        aria-label="Gerenciar imagens de fundo do hero"
        className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
      >
        <Icons.Image />
      </button>

      <div className="relative z-10 flex h-full flex-col justify-between gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {currentDateTime || '...'}
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-[11.5px] font-bold text-amber-200 backdrop-blur-sm border border-amber-400/30">
            <span>⚠️ Central de Suporte Online</span>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
              {getGreeting()}, {firstName} 👋
            </h2>
            <p className="mt-1 text-sm text-white/85">
              Setor <strong className="font-semibold text-white">{cargoName || 'Colaborador'}</strong> · Prestek Telecom
            </p>
          </div>
          <button
            onClick={onAbrirChamadoTI}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--accent-deep)] shadow-lg transition hover:bg-amber-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icons.Plus /> Abrir Chamado TI
          </button>
        </div>
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
    <div className={`${CARD} justify-between backdrop-blur-md border border-border/70`}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className={LABEL_MONO}>OS no meu nome</div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${allGood ? 'bg-[var(--success-soft)] text-[var(--success-bento)]' : 'bg-[var(--warning-soft)] text-[var(--warning-bento)] animate-pulse'}`}>
            {allGood ? <><Icons.Check /> Tudo em dia</> : `⚠️ ${osCount} pendente${osCount !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-5xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
            {osLoading ? '...' : osCount}
          </div>
          <span className="text-xs font-semibold text-faint">
            Ordens de serviço sob sua resposta
          </span>
        </div>
        <p className="mt-2 text-[12.5px] text-faint leading-relaxed">
          {allGood
            ? 'Nenhuma ordem de serviço pendente atribuída a você no momento.'
            : 'Acesse o gerenciador para visualizar detalhes e registrar atualizações.'}
        </p>
      </div>
      <button
        onClick={() => setCurrentView('tickets')}
        className={`${ACTION_BTN} text-white bg-primary hover:bg-[var(--primary-hover)] border-none font-bold shadow-md hover:shadow-lg transition-transform active:scale-[0.98]`}
      >
        Gerenciar Minhas OS <Icons.ArrowR />
      </button>
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
  sm: [
    { i: 'os', x: 0, y: 0, w: 6, h: 3 },
    { i: 'comunicados', x: 0, y: 3, w: 6, h: 3 },
    { i: 'setor', x: 0, y: 6, w: 6, h: 2 },
    { i: 'plantao', x: 0, y: 8, w: 3, h: 2 },
    { i: 'atalhos', x: 3, y: 8, w: 3, h: 4 },
    { i: 'aniversariantes', x: 0, y: 10, w: 3, h: 2 },
    { i: 'team', x: 0, y: 12, w: 3, h: 2 }
  ],
  xs: [
    { i: 'os', x: 0, y: 0, w: 4, h: 3 },
    { i: 'comunicados', x: 0, y: 3, w: 4, h: 3 },
    { i: 'setor', x: 0, y: 6, w: 4, h: 2 },
    { i: 'plantao', x: 0, y: 8, w: 4, h: 2 },
    { i: 'atalhos', x: 0, y: 10, w: 4, h: 4 },
    { i: 'aniversariantes', x: 0, y: 14, w: 4, h: 2 },
    { i: 'team', x: 0, y: 16, w: 4, h: 2 }
  ],
  xxs: [
    { i: 'os', x: 0, y: 0, w: 2, h: 3 },
    { i: 'comunicados', x: 0, y: 3, w: 2, h: 3 },
    { i: 'setor', x: 0, y: 6, w: 2, h: 2 },
    { i: 'plantao', x: 0, y: 8, w: 2, h: 2 },
    { i: 'atalhos', x: 0, y: 10, w: 2, h: 4 },
    { i: 'aniversariantes', x: 0, y: 14, w: 2, h: 2 },
    { i: 'team', x: 0, y: 16, w: 2, h: 2 }
  ]
};

export default function Dashboard({ setCurrentView, user }) {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [location, setLocation] = useState({ city: 'São Paulo', temp: '24°C' });
  const [heroBgImages, setHeroBgImages] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardHeroBgImages');
      if (saved) return JSON.parse(saved);
      // Migração da chave legada (string única) para o formato array
      const legacy = localStorage.getItem('dashboardHeroBg');
      return legacy ? [legacy] : [];
    } catch {
      return [];
    }
  });
  const [isHeroBgModalOpen, setIsHeroBgModalOpen] = useState(false);
  const [cargoName, setCargoName] = useState('');
  const [osCount, setOsCount] = useState(0);
  const [osStatusCount, setOsStatusCount] = useState(null);
  const [osLoading, setOsLoading] = useState(true);
  const [proximoPlantao, setProximoPlantao] = useState(null);
  const [plantaoLoading, setPlantaoLoading] = useState(true);
  const [eficiencia, setEficiencia] = useState(null);
  const [eficienciaLoading, setEficienciaLoading] = useState(true);
  const [isTiModalOpen, setIsTiModalOpen] = useState(false);

  const func = user?.funcionario ?? {};
  const safeRole = func.id_funcao || 'Colaborador';
  const safeDepto = func.id_departamento || '';
  const funcId = func.id || user?.id;

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

  // Persiste as imagens de fundo do hero no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboardHeroBgImages', JSON.stringify(heroBgImages));
    } catch (err) {
      console.warn('Não foi possível salvar as imagens do hero (limite do localStorage):', err);
    }
  }, [heroBgImages]);

  const safeName = func.funcionario || user?.nome || 'Usuário';
  const firstName = safeName.split(' ')[0] || 'Usuário';

  return (
    <main className="flex-1 overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-7 md:px-8">

        <DashboardHeader firstName={firstName} cargoName={cargoName} currentTime={currentTime} currentDate={currentDate} city={location.city} />

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
            <OsBento osCount={osCount} osLoading={osLoading} setCurrentView={setCurrentView} />
          </div>
          <div key="comunicados">
            <ComunicadosCard setCurrentView={setCurrentView} />
          </div>
          <div key="setor">
            <SetorBento eficiencia={eficiencia} eficienciaLoading={eficienciaLoading} />
          </div>
          <div key="plantao">
            <PlantaoBento proximoPlantao={proximoPlantao} plantaoLoading={plantaoLoading} setCurrentView={setCurrentView} />
          </div>
          <div key="atalhos">
            <AtalhosCard setCurrentView={setCurrentView} onSuporteTIClick={() => setIsTiModalOpen(true)} />
          </div>
          <div key="aniversariantes">
            <AniversariantesCard />
          </div>
          <div key="team">
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

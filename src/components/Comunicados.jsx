import { useState, useEffect, useMemo, useRef } from 'react';
import { useBentoTheme, BENTO_LIGHT } from '../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../hooks/useDismissable';
import { fundoHero } from './ui/heroGradiente';
import HeroSearchInput from './ui/HeroSearchInput';

// Nenhum dos dois modais abaixo tinha role/aria-modal/gerenciamento de foco —
// Escape e clique fora não fechavam, e o foco nunca entrava no diálogo.
// Mesmo padrão do TiSupportModal (Fase 3) e ManagePlantaoModal (Fase 4):
// useDismissable cobre Escape/clique fora/foco de entrada e retorno; o trap
// de Tab vem de `makeTrapTab` (Fase 16, extraído de 15 cópias idênticas).

// ── Paleta Bento Blue ────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `${parseInt(x.slice(0,2),16)}, ${parseInt(x.slice(2,4),16)}, ${parseInt(x.slice(4,6),16)}`;
}

function tone(hex, a) {
  return `rgba(${hexToRgb(hex)}, ${a})`;
}

function relativeTime(dataStr) {
  if (!dataStr) return '';
  const now = new Date();
  const date = new Date(dataStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `há ${diffMin}min`;
  if (diffHr < 24) return `há ${diffHr}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').replace(' de ', ' ');
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
  } catch (_) {
    return '';
  }
}

// Comunicados chegam como texto colado de WhatsApp: `*negrito*` nunca é
// renderizado como negrito aqui, só aparece com os asteriscos crus na tela.
// Remove o caractere sem tentar recriar a formatação.
function limparAsteriscos(texto) {
  return (texto || '').replace(/\*(.*?)\*/g, '$1');
}

// Retorna as definições visuais por tipo de comunicado com base no tema atual
const getTypeMeta = (C) => ({
  Urgente: {
    color: C.danger,
    textColor: C.dangerStrong,
    soft: C.dangerSoft,
    icon: 'priority_high',
    label: 'URGENTE'
  },
  Importante: {
    color: C.warning,
    textColor: C.warningStrong,
    soft: C.warningSoft,
    icon: 'notification_important',
    label: 'IMPORTANTE'
  },
  Geral: {
    color: C.success,
    textColor: C.successStrong,
    soft: C.successSoft,
    icon: 'article',
    label: 'GERAL'
  }
});

export default function Comunicados({ user, setCurrentView }) {
    const C = useBentoTheme();
    const [comunicados, setComunicados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filtro, setFiltro] = useState('Todas');
    const [ordenacao, setOrdenacao] = useState('recentes');
    const [itemToDelete, setItemToDelete] = useState(null);
    const [busca, setBusca] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        tipo: 'Geral',
        departamento_autor: '',
        link_opcional: '',
        imagem_url: ''
    });

    const fetchComunicados = async () => {
        try {
            setLoading(true);
            setErro(false);
            const res = await fetch('/api/comunicados');
            const data = await res.json();
            if (data.sucesso) {
                setComunicados(data.comunicados);
            } else {
                setErro(true);
            }
        } catch (error) {
            console.error("Erro ao carregar comunicados:", error);
            setErro(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComunicados();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                titulo: item.titulo,
                descricao: item.descricao,
                tipo: item.tipo,
                departamento_autor: item.departamento_autor,
                link_opcional: item.link_opcional || '',
                imagem_url: item.imagem_url || ''
            });
            setEditingId(item.id);
        } else {
            setFormData({ titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '', imagem_url: '' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '', imagem_url: '' });
        setEditingId(null);
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const id = itemToDelete;
        setItemToDelete(null);
        try {
            const res = await fetch(`/api/comunicados/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.sucesso) {
                fetchComunicados();
            } else {
                alert('Erro ao excluir: ' + data.erro);
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir comunicado.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = {
                ...formData,
                criado_por: user?.nome || user?.funcionario?.funcionario || 'Admin'
            };

            const url = editingId ? `/api/comunicados/${editingId}` : '/api/comunicados';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.sucesso) {
                handleCloseModal();
                fetchComunicados();
            } else {
                alert('Erro ao salvar: ' + data.erro);
            }
        } catch (err) {
            alert('Erro ao salvar comunicado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Lógica de filtragem com busca textual
    const comunicadosPorBusca = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return comunicados.filter(item =>
            !termo ||
            (item.titulo || '').toLowerCase().includes(termo) ||
            (item.descricao || '').toLowerCase().includes(termo)
        );
    }, [comunicados, busca]);

    // Filtro por tipo e ordenação
    const comunicadosFiltrados = useMemo(() => {
        return comunicadosPorBusca
            .filter(item => filtro === 'Todas' ? true : item.tipo === filtro)
            .sort((a, b) => {
                if (ordenacao === 'recentes') return new Date(b.criado_em) - new Date(a.criado_em);
                if (ordenacao === 'antigos') return new Date(a.criado_em) - new Date(b.criado_em);
                if (ordenacao === 'autor') return (a.departamento_autor || '').localeCompare(b.departamento_autor || '');
                return 0;
            });
    }, [comunicadosPorBusca, filtro, ordenacao]);

    // Contagens por tipo baseadas no resultado da busca
    const countTotal = comunicadosPorBusca.length;
    const countUrgente = useMemo(() => comunicadosPorBusca.filter(c => c.tipo === 'Urgente').length, [comunicadosPorBusca]);
    const countImportante = useMemo(() => comunicadosPorBusca.filter(c => c.tipo === 'Importante').length, [comunicadosPorBusca]);
    const countGeral = useMemo(() => comunicadosPorBusca.filter(c => c.tipo === 'Geral').length, [comunicadosPorBusca]);

    // KPIs do Hero (totais absolutos da API)
    const kpiTotal = comunicados.length;
    const kpiUrgentes = useMemo(() => comunicados.filter(c => c.tipo === 'Urgente').length, [comunicados]);
    const kpiImportantes = useMemo(() => comunicados.filter(c => c.tipo === 'Importante').length, [comunicados]);
    const kpiGerais = useMemo(() => comunicados.filter(c => c.tipo === 'Geral').length, [comunicados]);

    return (
        <main style={{ flex: 1, overflowY: 'auto', background: C.bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: C.ink }}>

            <div style={{ padding: '24px 16px 40px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }} className="md:px-8 md:py-8 lg:pb-12">

                {/* ── Hero Banner ──────────────────────────────────────────────── */}
                <HeroBanner
                    busca={busca}
                    setBusca={setBusca}
                    kpiTotal={kpiTotal}
                    kpiUrgentes={kpiUrgentes}
                    kpiImportantes={kpiImportantes}
                    kpiGerais={kpiGerais}
                    isLoading={loading}
                    isAdmin={user?.is_admin}
                    onNewComunicado={() => handleOpenModal()}
                />
                
                {/* ── Filter Bar ────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    marginBottom: 24
                }}>
                    <div style={{ display: 'flex', gap: 8, paddingBottom: 4, paddingTop: 4, flexWrap: 'wrap' }}>
                        <ChipButton
                            label="Todas as Atualizações"
                            count={countTotal}
                            active={filtro === 'Todas'}
                            onClick={() => setFiltro('Todas')}
                            color={C.accent}
                        />
                        <ChipButton
                            label="Urgente"
                            count={countUrgente}
                            active={filtro === 'Urgente'}
                            onClick={() => setFiltro('Urgente')}
                            color={C.danger}
                        />
                        <ChipButton
                            label="Importante"
                            count={countImportante}
                            active={filtro === 'Importante'}
                            onClick={() => setFiltro('Importante')}
                            color={C.warning}
                        />
                        <ChipButton
                            label="Geral"
                            count={countGeral}
                            active={filtro === 'Geral'}
                            onClick={() => setFiltro('Geral')}
                            color={C.success}
                        />
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                            position: 'absolute',
                            left: 12,
                            color: C.accent,
                            fontSize: 20,
                            fontFamily: '"Material Symbols Outlined"',
                            pointerEvents: 'none'
                        }}>filter_list</span>
                        <select
                            value={ordenacao}
                            onChange={(e) => setOrdenacao(e.target.value)}
                            style={{
                                padding: '8px 32px 8px 38px',
                                background: C.surface,
                                border: `1px solid ${C.line}`,
                                borderRadius: 10,
                                fontSize: 13.5,
                                color: C.ink,
                                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.15s',
                                appearance: 'none',
                                WebkitAppearance: 'none'
                            }}
                        >
                            <option value="recentes">Mais recentes primeiro</option>
                            <option value="antigos">Mais antigos primeiro</option>
                            <option value="autor">Ordenar por Autor</option>
                        </select>
                        <span style={{
                            position: 'absolute',
                            right: 12,
                            color: C.muted,
                            fontSize: 16,
                            fontFamily: '"Material Symbols Outlined"',
                            pointerEvents: 'none'
                        }}>keyboard_arrow_down</span>
                    </div>
                </div>

                {/* ── Feed de Cards / Loading / Vazio ─────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 24 }}>
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : erro ? (
                    <ErrorState onRetry={fetchComunicados} />
                ) : comunicadosFiltrados.length === 0 ? (
                    <EmptyState busca={busca} filtro={filtro} onClear={() => { setBusca(''); setFiltro('Todas'); }} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 24 }}>
                        {comunicadosFiltrados.map((item, idx) => (
                            <ComunicadoCard
                                key={item.id}
                                item={item}
                                isAdmin={user?.is_admin}
                                onEdit={() => handleOpenModal(item)}
                                onDelete={() => confirmDelete(item.id)}
                                animDelay={idx * 30}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal CRUD (Criar/Editar) ─────────────────────────────────── */}
            {isModalOpen && (
                <CrudModal
                    editingId={editingId}
                    formData={formData}
                    setFormData={setFormData}
                    isSubmitting={isSubmitting}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                />
            )}

            {/* ── Modal de Confirmação de Exclusão ───────────────────────────── */}
            {itemToDelete && (
                <DeleteModal
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleDelete}
                />
            )}

            <style>{`
                @keyframes card-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </main>
    );
}

// ── Subcomponentes ───────────────────────────────────────────────────────────

const HERO_LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

function HeroKpiTile({ label, value, icon, color, title }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5" title={title}>
            <span className="material-symbols-outlined shrink-0 text-[18px]" style={{ color: color || 'rgba(255,255,255,0.7)' }} aria-hidden="true">{icon}</span>
            <div className="min-w-0">
                <div className={HERO_LABEL_MONO}>{label}</div>
                <div className="mt-0.5 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">{value}</div>
            </div>
        </div>
    );
}

function HeroBanner({ busca, setBusca, kpiTotal, kpiUrgentes, kpiImportantes, kpiGerais, isLoading, isAdmin, onNewComunicado }) {
    const C = useBentoTheme();
    const isDark = C.bg !== BENTO_LIGHT.bg;
    // Título explica por que este número pode divergir dos chips logo abaixo:
    // os KPIs do hero somam TODO o sistema, os chips somam só o resultado da
    // busca atual — achado de "divergência de contagem" da Fase 5, resolvido
    // deixando a diferença explícita em vez de forçar os dois a coincidir
    // (o hero perderia o total real do sistema durante uma busca).
    const kpis = [
        { label: 'Total', value: isLoading ? '···' : kpiTotal, icon: 'campaign', color: null, title: 'Total de comunicados no sistema (não considera a busca abaixo)' },
        { label: 'Urgentes', value: isLoading ? '···' : kpiUrgentes, icon: 'priority_high', color: C.danger, title: 'Urgentes no sistema (não considera a busca abaixo)' },
        { label: 'Importantes', value: isLoading ? '···' : kpiImportantes, icon: 'notification_important', color: C.warning, title: 'Importantes no sistema (não considera a busca abaixo)' },
        { label: 'Gerais', value: isLoading ? '···' : kpiGerais, icon: 'article', color: C.success, title: 'Gerais no sistema (não considera a busca abaixo)' },
    ];

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: fundoHero(C),
                marginBottom: 28,
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="com-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#com-grid)" />
            </svg>

            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={HERO_LABEL_MONO}>Intranet Prestek</div>
                        <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                            Comunicados da Empresa
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Fique atualizado com as últimas notícias, alertas urgentes e diretrizes importantes da Prestek.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={onNewComunicado}
                            className="inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold shadow-sm transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            style={{ background: C.surface, color: isDark ? C.accentDark : C.accentDeep }}
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Novo Comunicado
                        </button>
                    )}

                    <form role="search" onSubmit={e => e.preventDefault()}>
                        <HeroSearchInput
                            value={busca}
                            onChange={setBusca}
                            placeholder="Buscar por título ou conteúdo..."
                        />
                    </form>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={HERO_LABEL_MONO}>Comunicados</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {kpis.map(k => <HeroKpiTile key={k.label} {...k} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChipButton({ label, count, active, onClick, color }) {
    const C = useBentoTheme();
    const [hover, setHover] = useState(false);
    const rgb = hexToRgb(color);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                minHeight: 44,
                padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                border: active ? `1.5px solid ${color}` : `1.5px solid ${C.line}`,
                background: active ? `rgba(${rgb}, 0.12)` : (hover ? C.surfaceSoft : C.surface),
                color: active ? color : (hover ? C.ink : C.ink2),
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                fontWeight: active ? 700 : 500, fontSize: 13,
                transition: 'all 0.15s',
                boxShadow: active ? `0 0 0 3px rgba(${rgb}, 0.12)` : 'none',
                outline: 'none'
            }}
        >
            <span>{label}</span>
            <span style={{
                background: active ? color : C.surfaceSoft,
                color: active ? C.onAccent : C.ink2,
                fontSize: 11, fontWeight: 700,
                padding: '1px 7px', borderRadius: 999,
                fontFamily: '"JetBrains Mono", monospace',
                transition: 'all 0.15s',
            }}>{count}</span>
        </button>
    );
}

function ComunicadoCard({ item, isAdmin, onEdit, onDelete, animDelay }) {
    const C = useBentoTheme();
    const [hover, setHover] = useState(false);
    const [expandido, setExpandido] = useState(false);
    const typeMeta = getTypeMeta(C);
    const meta = typeMeta[item.tipo] || typeMeta.Geral;
    const rgb = hexToRgb(meta.color);
    const descricaoLimpa = limparAsteriscos(item.descricao);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: C.surface,
                borderRadius: 18,
                border: `1px solid ${hover ? tone(meta.color, 0.4) : C.line}`,
                boxShadow: hover
                    ? `0 12px 32px rgba(${rgb}, 0.15), 0 2px 8px rgba(0,0,0,0.06)`
                    : `0 1px 3px rgba(0,0,0,0.06)`,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'none',
                animation: `card-in 0.35s ease both`,
                animationDelay: `${animDelay}ms`,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ height: 4, background: meta.color }} />
            <div style={{ padding: '24px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Header do Card (Tipo + Metadata + Ações) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 999,
                            background: meta.soft,
                            color: meta.textColor,
                            fontSize: 10.5,
                            fontWeight: 700,
                            fontFamily: '"JetBrains Mono", monospace',
                            letterSpacing: '0.06em',
                            border: `1px solid rgba(${rgb}, 0.2)`
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{meta.icon}</span>
                            {meta.label}
                        </span>

                        <span 
                            title={formatFullDate(item.criado_em)}
                            style={{
                                fontSize: 11.5,
                                color: C.muted,
                                fontFamily: '"JetBrains Mono", monospace',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'help'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
                            {relativeTime(item.criado_em)}
                        </span>
                    </div>

                    {isAdmin && (
                        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    borderRadius: 6,
                                    color: C.muted,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s'
                                }}
                                className="min-w-[44px] min-h-[44px]"
                                onMouseEnter={e => { e.currentTarget.style.color = C.accent; e.currentTarget.style.background = C.accentSoft; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'none'; }}
                                title="Editar"
                                aria-label="Editar comunicado"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    borderRadius: 6,
                                    color: C.muted,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s'
                                }}
                                className="min-w-[44px] min-h-[44px]"
                                onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.background = C.dangerSoft; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'none'; }}
                                title="Excluir"
                                aria-label="Excluir comunicado"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Título — h2, não h3: o h1 é só o do hero, então cada card
                    de comunicado (mesmo nível, um por item do feed) é o
                    próximo nível real da página, sem h2 nenhum entre eles. */}
                <h2 style={{
                    margin: '0 0 10px 0',
                    fontSize: 17,
                    fontWeight: 800,
                    color: C.ink,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.4
                }}>
                    {item.titulo}
                </h2>

                {/* Descrição / Conteúdo — comunicados chegam como texto colado de
                    WhatsApp, às vezes com centenas de palavras; trunca por padrão
                    para não quebrar a escaneabilidade do feed. */}
                <p style={{
                    margin: '0 0 8px 0',
                    fontSize: 14,
                    color: C.ink2,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    flex: 1,
                    ...(expandido ? {} : {
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    })
                }}>
                    {descricaoLimpa}
                </p>
                {descricaoLimpa.length > 220 && (
                    <button
                        type="button"
                        onClick={() => setExpandido(v => !v)}
                        style={{
                            alignSelf: 'flex-start',
                            margin: '0 0 12px 0',
                            padding: 0,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.accentDark,
                        }}
                    >
                        {expandido ? 'Ler menos' : 'Ler mais'}
                    </button>
                )}

                {/* Footer (Departamento + Link Adicional) */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: 16,
                    borderTop: `1px solid ${C.line}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: C.muted,
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                    }}>
                        DEPTO. {item.departamento_autor || 'GERAL'}
                    </span>

                    {item.link_opcional && (
                        <a
                            href={item.link_opcional}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.accent,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.querySelector('.arrow-ico').style.transform = 'translateX(3px)'; }}
                            onMouseLeave={e => { e.currentTarget.querySelector('.arrow-ico').style.transform = 'none'; }}
                        >
                            Link adicional
                            <span className="material-symbols-outlined arrow-ico" style={{ fontSize: 16, transition: 'transform 0.15s' }}>arrow_forward</span>
                        </a>
                    )}
                </div>

            </div>
        </div>
    );
}

function SkeletonCard() {
    const C = useBentoTheme();
    return (
        <div style={{
            background: C.surface,
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            overflow: 'hidden',
            animation: 'pulse 1.5s ease-in-out infinite',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 220
        }}>
            <div style={{ height: 4, background: C.line }} />
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <div style={{ height: 22, width: 80, borderRadius: 12, background: C.line }} />
                    <div style={{ height: 16, width: 60, borderRadius: 6, background: C.line, marginTop: 3 }} />
                </div>
                <div style={{ height: 18, width: '75%', borderRadius: 6, background: C.line, marginBottom: 12 }} />
                <div style={{ height: 12, width: '90%', borderRadius: 6, background: C.surfaceSoft, marginBottom: 8 }} />
                <div style={{ height: 12, width: '60%', borderRadius: 6, background: C.surfaceSoft, marginBottom: 'auto' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
                    <div style={{ height: 12, width: 100, borderRadius: 6, background: C.line }} />
                    <div style={{ height: 12, width: 80, borderRadius: 6, background: C.line }} />
                </div>
            </div>
        </div>
    );
}

function ErrorState({ onRetry }) {
    const C = useBentoTheme();
    return (
        <div role="alert" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            gap: 16,
            textAlign: 'center',
            background: C.surface,
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 36, color: C.danger, lineHeight: 1 }}>cloud_off</span>
            </div>
            <div>
                <p style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 700, color: C.ink }}>Não foi possível carregar os comunicados</p>
                <p style={{ margin: 0, fontSize: 13.5, color: C.ink2, maxWidth: 360, lineHeight: 1.5 }}>
                    O servidor não respondeu. Isso costuma ser temporário — nada foi perdido.
                </p>
            </div>
            <button
                onClick={onRetry}
                style={{
                    padding: '9px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: C.accent,
                    color: 'white',
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    outline: 'none',
                    transition: 'all 0.15s',
                    boxShadow: `0 4px 12px rgba(${hexToRgb(C.accent)}, 0.2)`
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accent; }}
            >
                <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 18, lineHeight: 1 }}>refresh</span>
                Tentar novamente
            </button>
        </div>
    );
}

function EmptyState({ busca, filtro, onClear }) {
    const C = useBentoTheme();
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            gap: 16,
            textAlign: 'center',
            background: C.surface,
            borderRadius: 18,
            border: `1px solid ${C.line}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 36, color: C.accent, lineHeight: 1 }}>search_off</span>
            </div>
            <div>
                <p style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 700, color: C.ink }}>Nenhum comunicado encontrado</p>
                <p style={{ margin: 0, fontSize: 13.5, color: C.ink2, maxWidth: 360, lineHeight: 1.5 }}>
                    {busca ? `Nenhum aviso corresponde à busca "${busca}".` : 'Nenhum aviso corresponde ao tipo selecionado.'}
                </p>
            </div>
            {(busca || filtro !== 'Todas') && (
                <button
                    onClick={onClear}
                    style={{
                        padding: '9px 20px',
                        borderRadius: 10,
                        border: `1px solid ${C.line}`,
                        background: C.surface,
                        color: C.ink2,
                        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: 13.5,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        outline: 'none',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.surfaceSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
                >
                    <span style={{ fontFamily: '"Material Symbols Outlined"', fontSize: 18, lineHeight: 1 }}>close</span>
                    Limpar filtros
                </button>
            )}
        </div>
    );
}

const CRUD_MODAL_TITLE_ID = 'crud-comunicado-titulo';

function CrudModal({ editingId, formData, setFormData, isSubmitting, onClose, onSubmit }) {
    const C = useBentoTheme();
    const [focusedInput, setFocusedInput] = useState(null);
    const modalRef = useRef(null);

    useDismissable(modalRef, { open: true, onClose, lockScroll: true, closeOnOutside: true });

    const trapTab = makeTrapTab(modalRef);

    const getInputStyle = (name) => ({
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 14px',
        background: C.surfaceSoft,
        border: `1.5px solid ${focusedInput === name ? C.accent : C.line}`,
        borderRadius: 10,
        fontSize: 14,
        color: C.ink,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        outline: 'none',
        transition: 'all 0.15s',
        boxShadow: focusedInput === name ? `0 0 0 3px rgba(${hexToRgb(C.accent)}, 0.15)` : 'none'
    });

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(11, 27, 46, 0.60)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
        }}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={CRUD_MODAL_TITLE_ID}
                onKeyDown={trapTab}
                style={{
                background: C.surface,
                borderRadius: 20,
                boxShadow: '0 24px 64px rgba(11, 27, 46, 0.25)',
                width: '100%',
                maxWidth: 520,
                overflow: 'hidden',
                border: `1px solid ${C.line}`,
                animation: 'card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}>
                {/* Header do Modal com Gradiente */}
                <div style={{
                    background: `linear-gradient(120deg, ${C.accentDeep}, ${C.accent})`,
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 id={CRUD_MODAL_TITLE_ID} style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 800,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        letterSpacing: '-0.02em'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                            {editingId ? 'edit' : 'campaign'}
                        </span>
                        {editingId ? 'Editar Comunicado' : 'Novo Comunicado'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            color: 'white',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                        }}
                        className="min-w-[44px] min-h-[44px]"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                </div>

                {/* Form do Modal */}
                <form onSubmit={onSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                            Título do Aviso *
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.titulo}
                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                            onFocus={() => setFocusedInput('titulo')}
                            onBlur={() => setFocusedInput(null)}
                            style={getInputStyle('titulo')}
                            placeholder="Ex: Atualização do Sistema"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                                Tipo *
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <select
                                    required
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                    onFocus={() => setFocusedInput('tipo')}
                                    onBlur={() => setFocusedInput(null)}
                                    style={{
                                        ...getInputStyle('tipo'),
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        paddingRight: 32
                                    }}
                                >
                                    <option value="Geral">Geral — Verde</option>
                                    <option value="Importante">Importante — Amarelo</option>
                                    <option value="Urgente">Urgente — Vermelho</option>
                                </select>
                                <span style={{
                                    position: 'absolute',
                                    right: 12,
                                    color: C.muted,
                                    fontSize: 18,
                                    fontFamily: '"Material Symbols Outlined"',
                                    pointerEvents: 'none'
                                }}>keyboard_arrow_down</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                                Depto. Autor *
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.departamento_autor}
                                onChange={e => setFormData({ ...formData, departamento_autor: e.target.value })}
                                onFocus={() => setFocusedInput('depto')}
                                onBlur={() => setFocusedInput(null)}
                                style={getInputStyle('depto')}
                                placeholder="Ex: Diretoria"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                            Mensagem/Descrição *
                        </label>
                        <textarea
                            required
                            rows="4"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            onFocus={() => setFocusedInput('descricao')}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                                ...getInputStyle('descricao'),
                                resize: 'none',
                                lineHeight: 1.5
                            }}
                            placeholder="Detalhes completos do comunicado..."
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                            URL da Imagem de Capa (Opcional)
                        </label>
                        <input
                            type="url"
                            value={formData.imagem_url}
                            onChange={e => setFormData({ ...formData, imagem_url: e.target.value })}
                            onFocus={() => setFocusedInput('imagem_url')}
                            onBlur={() => setFocusedInput(null)}
                            style={getInputStyle('imagem_url')}
                            placeholder="https://exemplo.com/imagem-destaque.jpg"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 700, color: C.muted, marginBottom: 6, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.04em' }}>
                            Link Adicional (Opcional)
                        </label>
                        <input
                            type="url"
                            value={formData.link_opcional}
                            onChange={e => setFormData({ ...formData, link_opcional: e.target.value })}
                            onFocus={() => setFocusedInput('link')}
                            onBlur={() => setFocusedInput(null)}
                            style={getInputStyle('link')}
                            placeholder="https://exemplo.com"
                        />
                    </div>

                    {/* Botões do Rodapé */}
                    <div style={{
                        marginTop: 8,
                        paddingTop: 16,
                        borderTop: `1px solid ${C.line}`,
                        display: 'flex',
                        justifyContent: 'end',
                        gap: 12
                    }} className="flex-col sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '9px 18px',
                                borderRadius: 10,
                                border: `1.5px solid ${C.line}`,
                                background: C.surface,
                                color: C.ink2,
                                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                                fontWeight: 700,
                                fontSize: 13.5,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                outline: 'none'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.surfaceSoft; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '9px 22px',
                                borderRadius: 10,
                                border: 'none',
                                background: C.accent,
                                color: 'white',
                                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                                fontWeight: 700,
                                fontSize: 13.5,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                opacity: isSubmitting ? 0.7 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                outline: 'none',
                                boxShadow: `0 4px 12px rgba(${hexToRgb(C.accent)}, 0.2)`
                            }}
                            onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = C.accentDark; } }}
                            onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.background = C.accent; } }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                                    {editingId ? 'Salvar Aviso' : 'Publicar Aviso'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

const DELETE_MODAL_TITLE_ID = 'delete-comunicado-titulo';

function DeleteModal({ onClose, onConfirm }) {
    const C = useBentoTheme();
    const modalRef = useRef(null);

    useDismissable(modalRef, { open: true, onClose, lockScroll: true, closeOnOutside: true });

    const trapTab = makeTrapTab(modalRef);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(11, 27, 46, 0.60)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
        }}>
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={DELETE_MODAL_TITLE_ID}
                onKeyDown={trapTab}
                style={{
                background: C.surface,
                borderRadius: 20,
                boxShadow: '0 24px 64px rgba(11, 27, 46, 0.25)',
                width: '100%',
                maxWidth: 400,
                overflow: 'hidden',
                border: `1px solid rgba(${hexToRgb(C.danger)}, 0.3)`,
                padding: '24px',
                textAlign: 'center',
                animation: 'card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}>
                <div style={{
                    margin: '0 auto 16px',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: C.dangerSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: C.danger }}>warning</span>
                </div>

                <h3 id={DELETE_MODAL_TITLE_ID} style={{
                    margin: '0 0 8px 0',
                    fontSize: 20,
                    fontWeight: 800,
                    color: C.ink,
                    letterSpacing: '-0.02em'
                }}>
                    Excluir Comunicado?
                </h3>

                <p style={{
                    margin: '0 0 24px 0',
                    fontSize: 14,
                    color: C.ink2,
                    lineHeight: 1.5
                }}>
                    Esta ação não pode ser desfeita. O comunicado será removido permanentemente do feed da intranet.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            border: `1.5px solid ${C.line}`,
                            background: C.surface,
                            color: C.ink2,
                            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                            fontWeight: 700,
                            fontSize: 13.5,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            outline: 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.surfaceSoft; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.surface; }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 22px',
                            borderRadius: 10,
                            border: 'none',
                            background: C.danger,
                            color: 'white',
                            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                            fontWeight: 700,
                            fontSize: 13.5,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            outline: 'none',
                            boxShadow: `0 4px 12px rgba(${hexToRgb(C.danger)}, 0.2)`
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 69, 69, 0.85)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.danger; }}
                    >
                        Sim, excluir!
                    </button>
                </div>
            </div>
        </div>
    );
}
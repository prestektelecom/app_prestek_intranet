import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CreditCard, BarChart2, Star, Pencil } from 'lucide-react';
import {
    CATEGORIA,
    classificarPlano,
    parseVelocidade,
    formatarVelocidade,
    parseStreaming,
    isTopSeller as calcTopSeller,
    vendasRatio as calcVendasRatio,
} from '../../utils/planTaxonomy';
import { resolveIllustration } from '../../utils/serviceIllustrations';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { useCardGradient } from '../../hooks/useCardGradient';
import { tone } from '../../utils/tone';
import { makeTrapTab } from '../../hooks/useDismissable';

// taxa_instalacao é texto livre no backend — vem tanto como 'Grátis' quanto
// como '50'. Mesmo guard do PlanoBentoCard: formata só se for puramente numérico.
function formatarTaxa(valor, formatCurrency) {
    const raw = String(valor ?? '').trim();
    if (raw === '') return 'Grátis';
    return /^\d+([.,]\d+)?$/.test(raw) ? formatCurrency(raw.replace(',', '.')) : raw;
}

// O modal é o card em tamanho maior: deriva a mesma apresentação a partir dos
// mesmos helpers, senão card e detalhe passam a discordar de badge e de cor.
function derivarApresentacao(data, type, maxVendas, formatCurrency) {
    if (type === 'plan') {
        const categoria = classificarPlano(data.descricao);
        const isPJ = categoria === CATEGORIA.PJ;
        const isLink = categoria === CATEGORIA.LINK;
        const velocidade = parseVelocidade(data.descricao);
        const vendas = data.vendas_mes || 0;

        return {
            variant: isLink ? 'orange' : isPJ ? 'green' : 'blue',
            badgeText: isLink ? 'LINK DEDICADO' : isPJ ? 'INTERNET PJ' : 'INTERNET PF',
            badgeColor: isLink ? '#D97706' : isPJ ? '#059669' : '#2563EB',
            illustrationType: isLink ? 'link' : isPJ ? 'computer' : 'wifi',
            titulo: formatarVelocidade(velocidade) || data.descricao,
            subtitulo: velocidade ? data.descricao : null,
            valor: formatCurrency(data.valor_mensal),
            sufixoValor: '/mês',
            specs: [
                { icon: Clock, label: 'Prazo de Entrega', value: data.prazo_instalacao || 'A consultar' },
                { icon: CreditCard, label: 'Taxa de Instalação', value: formatarTaxa(data.taxa_instalacao, formatCurrency) },
            ],
            streamings: parseStreaming(data.descricao),
            temVendas: typeof data.vendas_mes !== 'undefined',
            vendas,
            ratio: calcVendasRatio(vendas, maxVendas),
            isTopSeller: calcTopSeller(vendas, maxVendas),
        };
    }

    const base = {
        titulo: data.service || 'Detalhes do Serviço',
        subtitulo: null,
        valor: data.value || 'R$ 0,00',
        sufixoValor: null,
        streamings: [],
        temVendas: false,
        vendas: 0,
        ratio: 0,
        isTopSeller: false,
        specs: [
            { icon: Clock, label: 'Prazo de Entrega', value: data.deadline || 'A consultar' },
            { icon: CreditCard, label: 'Pagamento', value: data.payment || 'À vista / Boleto' },
        ],
    };

    if (type === 'tech') {
        return {
            ...base,
            variant: 'purple',
            illustrationType: 'tool',
            badgeText: data.isFree ? 'GRÁTIS' : data.isSpecial ? 'INFORMATIVO' : 'SERVIÇO TÉCNICO',
            badgeColor: data.isFree ? '#10B981' : data.isSpecial ? '#8B5CF6' : '#6366F1',
            valor: data.isFree ? 'Isento de cobrança' : base.valor,
        };
    }

    return {
        ...base,
        variant: 'rose',
        illustrationType: 'play',
        badgeText: 'STREAMING & MÍDIA',
        badgeColor: '#E11D48',
    };
}

export default function ServiceDetailModal({ isOpen, onClose, data, type, formatCurrency, isAdmin, onEditClick, maxVendas = 0 }) {
    const C = useBentoTheme();
    const tituloId = useId();
    const fecharRef = useRef(null);
    const dialogRef = useRef(null);

    // Trap de Tab: sem isso, Tab/Shift+Tab escapavam do modal para a página
    // de trás mesmo com Escape e foco inicial já funcionando.
    const trapTab = makeTrapTab(dialogRef);

    // Hooks antes de qualquer return — a condição mora dentro do efeito.
    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        fecharRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = overflowAnterior;
        };
    }, [isOpen, onClose]);

    const isPlan = type === 'plan';
    // derivarApresentacao roda antes do early-return porque useCardGradient é hook
    // e precisa da variante; com data ausente cai no fallback vazio.
    const p = data ? derivarApresentacao(data, type, maxVendas, formatCurrency) : null;
    const { base } = useCardGradient(p ? p.variant : 'blue');

    if (!isOpen || !data) return null;
    const ilustracao = resolveIllustration(p.illustrationType);

    // Fundo opaco em accentDeep (escuro nos 5 temas) com a cor da variante por
    // cima como tinta: garante texto branco legível mesmo quando o token da
    // variante é claro (warning no AMOLED, success no Cyber).
    const heroStyle = {
        backgroundColor: C.accentDeep,
        backgroundImage: [
            'linear-gradient(160deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.04) 65%)',
            `linear-gradient(125deg, ${tone(base, 0.85)} 0%, ${tone(C.accentDark, 0.55)} 55%, ${tone(base, 0.35)} 100%)`,
        ].join(', '),
    };

    return (
        <AnimatePresence>
            <div
                // z-[1100] fica acima do Header e da Sidebar (ambos z-1000).
                className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={tituloId}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={trapTab}
                    className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-border bg-surface shadow-2xl"
                >
                    {/* Hero */}
                    <div className="relative shrink-0 overflow-hidden p-6 pb-7 text-white" style={heroStyle}>
                        <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                            <defs>
                                <pattern id="svc-detail-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#svc-detail-grid)" />
                        </svg>

                        <img
                            src={ilustracao}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-7 -right-5 h-32 w-32 object-contain opacity-40"
                        />

                        <button
                            onClick={onClose}
                            aria-label="Fechar"
                            className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="relative flex flex-col gap-3 pr-14">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md"
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.badgeColor }} />
                                    {p.badgeText}
                                </span>

                                {p.isTopSeller && (
                                    <span
                                        title="Entre os mais vendidos do mês"
                                        className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                                    >
                                        <Star className="h-3 w-3 fill-current" />
                                        Top
                                    </span>
                                )}

                                {data.id && (
                                    <span className="font-mono text-[10.5px] tracking-[0.15em] text-white/70">
                                        ID #{data.id}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 id={tituloId} className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                                    {p.titulo}
                                </h2>
                                {p.subtitulo && (
                                    <p className="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-snug text-white/80">
                                        {p.subtitulo}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Corpo */}
                    <div className="flex flex-col gap-4 overflow-y-auto p-6">
                        {/* Preço */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-raised p-4">
                            <div>
                                <span className="mb-1 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">
                                    {isPlan ? 'Valor / Mensalidade' : 'Valor'}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold tracking-tight text-[var(--accent-dark)]">
                                        {p.valor}
                                    </span>
                                    {p.sufixoValor && (
                                        <span className="text-sm font-semibold text-faint">{p.sufixoValor}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Especificações */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {p.specs.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="rounded-xl border border-border bg-surface-raised p-3.5">
                                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-faint">
                                        <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                                        <span>{label}</span>
                                    </div>
                                    <span className="block text-sm font-bold leading-snug text-foreground" title={value}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Streamings inclusos */}
                        {p.streamings.length > 0 && (
                            <div className="rounded-xl border border-border bg-surface-raised p-4">
                                <span className="mb-2 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">
                                    Streamings inclusos
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.streamings.map(s => (
                                        <span
                                            key={s}
                                            className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[10.5px] font-bold tracking-wide text-[var(--accent)]"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vendas */}
                        {p.temVendas && (
                            <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <BarChart2 className="h-4 w-4 text-[var(--accent)]" />
                                        Vendas no mês vigente
                                    </span>
                                    <span className="font-mono text-sm font-extrabold text-[var(--accent-dark)]">
                                        {p.vendas} {p.vendas === 1 ? 'contratação' : 'contratações'}
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${p.ratio}%` }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rodapé */}
                    <div className="flex shrink-0 items-center gap-3 border-t border-border bg-background p-6">
                        <button
                            type="button"
                            ref={fecharRef}
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-faint transition-all hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        >
                            Fechar
                        </button>

                        {isAdmin && onEditClick && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEditClick(data);
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C2D12] to-[#C2410C] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            >
                                <Pencil className="h-4 w-4" />
                                Editar
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

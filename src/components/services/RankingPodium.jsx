import React from 'react';

// Os três pódios (Planos, Colaboradoras, Ticket Médio) eram ~250 linhas
// quase idênticas, incluindo três cópias byte a byte deste mapa de cores.
// Diferem em quatro coisas: identidade, rótulo, formatação e denominador.
const RANK_STYLES = {
    1: { border: 'border border-[#4A9EF5]/50', label: '1º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] via-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-2xl shadow-[#4A9EF5]/30 animate-glow-gold', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/70', numBg: 'bg-white text-[#1F5BA8]', badgeColor: 'bg-white/20 text-white' },
    2: { border: 'border border-[#1F5BA8]/30', label: '2º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] to-[#2D7BD4]', glow: 'shadow-lg shadow-[#1F5BA8]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#1F5BA8]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
    3: { border: 'border border-[#2D7BD4]/30', label: '3º Lugar', bg: 'bg-gradient-to-br from-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-lg shadow-[#4A9EF5]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#2D7BD4]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
};

const LEGENDA = [
    { label: '1º Lugar', cls: 'text-[#1F5BA8] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8]' },
    { label: '2º Lugar', cls: 'text-[#2D7BD4] dark:bg-[#2D7BD4]/20 dark:text-[#E4ECF5]' },
    { label: '3º Lugar', cls: 'text-[#4A9EF5] dark:bg-[#4A9EF5]/20 dark:text-[#7FD4E8]' },
];

export default function RankingPodium({
    title,
    items = [],
    isLoading,
    emptyIcon = 'emoji_events',
    emptyText = 'Nenhum registro.',
    getKey,
    renderIdentity,
    metricLabel = 'Vendas',
    getMetric,
    formatMetric = (v) => v,
    metricFloor = 10,
}) {
    const max = Math.max(...items.map(getMetric).map(v => Number(v) || 0), metricFloor);

    // Pódio real: 2º à esquerda, 1º no centro, 3º à direita.
    const podiumOrder = items.length >= 3 ? [items[1], items[0], items[2]] : items;
    const displayRanks = items.length >= 3 ? [2, 1, 3] : items.map((_, i) => i + 1);

    return (
        <div className="flex w-full shrink-0 flex-col gap-5 px-1 py-2">
            <div className="flex items-center justify-center gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <div className="hidden items-center gap-1.5 sm:flex">
                    {LEGENDA.map(l => (
                        <span key={l.label} className={`inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] px-2.5 py-0.5 text-[10px] font-bold ${l.cls}`}>
                            <span className="material-symbols-outlined text-[12px]">workspace_premium</span> {l.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-center gap-3 sm:gap-5">
                {isLoading ? (
                    <div className="flex w-full justify-center py-10">
                        <span className="material-symbols-outlined animate-spin text-3xl text-[#4A9EF5]">autorenew</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex w-full flex-col items-center justify-center py-10 text-center">
                        <span className="material-symbols-outlined mb-1 text-3xl text-muted">{emptyIcon}</span>
                        <p className="text-sm text-muted">{emptyText}</p>
                    </div>
                ) : (
                    podiumOrder.map((item, i) => {
                        if (!item) return null;
                        const rank = displayRanks[i];
                        const rc = RANK_STYLES[rank];
                        const isGold = rank === 1;
                        const metric = Number(getMetric(item)) || 0;
                        const ratio = Math.min((metric / max) * 100, 100);

                        return (
                            <div
                                key={getKey(item)}
                                className={`relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${rc.bg} ${rc.border} ${rc.glow} ${
                                    isGold ? 'w-[180px] self-stretch p-4 sm:w-[220px] sm:p-5' : 'mt-6 w-[140px] p-3 sm:w-[180px] sm:p-4'
                                }`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div className={`flex items-center justify-center rounded-full font-black ${rc.numBg} ${isGold ? 'h-8 w-8 text-sm sm:h-9 sm:w-9 sm:text-base' : 'h-6 w-6 text-[10px] sm:h-7 sm:w-7 sm:text-xs'}`}>
                                        {rank}
                                    </div>
                                    <span className={`inline-flex items-center gap-0.5 rounded-full font-bold uppercase tracking-wider ${rc.badgeColor} ${isGold ? 'px-2 py-0.5 text-[9px] sm:px-2.5 sm:py-1 sm:text-[10px]' : 'px-1.5 py-0.5 text-[8px] sm:px-2 sm:py-0.5 sm:text-[9px]'}`}>
                                        <span className={`material-symbols-outlined ${isGold ? 'text-[12px]' : 'text-[10px]'}`}>workspace_premium</span>
                                        <span className="hidden sm:inline">{rc.label}</span>
                                    </span>
                                </div>

                                {isGold && (
                                    <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2">
                                        <div className="flex h-8 w-8 animate-float-crown items-center justify-center rounded-full bg-white text-[#1F5BA8] shadow-lg shadow-[#4A9EF5]/30">
                                            <span className="material-symbols-outlined text-xl">crown</span>
                                        </div>
                                    </div>
                                )}

                                {renderIdentity(item, isGold, rc)}

                                <div className={`flex flex-col border-t border-dashed border-white/10 ${isGold ? 'mt-3 gap-2 pt-2 sm:mt-4 sm:gap-2.5 sm:pt-3' : 'mt-2 gap-1.5 pt-2 sm:mt-3 sm:gap-2 sm:pt-3'}`}>
                                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                        <span className="text-[#E4ECF5]/80">{metricLabel}</span>
                                        <span className="font-bold text-white">{formatMetric(metric)}</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded-full bg-white/10 sm:h-1.5">
                                        <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(ratio, metric > 0 ? 10 : 0)}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

import React from 'react';
import ChipButton from '../ui/ChipButton';
import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';

const CATEGORIAS = [
    { value: 'All', label: 'Todos os Serviços', icon: null },
    { value: 'PF', label: 'Internet PF', icon: 'person' },
    { value: 'PJ', label: 'Internet PJ', icon: 'business' },
    { value: 'Link', label: 'Link Dedicado', icon: 'router' },
    { value: 'Technical', label: 'Serviços Técnicos', icon: 'build' },
    { value: 'Streaming', label: 'Streamings', icon: 'play_circle' },
];

// Planos tem campos próprios (vendas, valor mensal, velocidade); Serviços
// Técnicos e Streaming não têm nenhum desses — cada aba passa seu próprio
// conjunto de opções via prop `ordenacoes`, em vez de um único conjunto fixo
// que só fazia sentido pra Planos (por isso a ordenação nem existia nas
// outras duas abas antes).
export const ORDENACOES_PLANOS = [
    { key: 'vendas_mes', label: 'Vendas', icon: 'trending_up' },
    { key: 'valor_mensal', label: 'Preço', icon: 'payments' },
    { key: 'velocidade', label: 'Velocidade', icon: 'speed' },
];

export const ORDENACOES_SERVICO = [
    { key: 'service', label: 'Nome', icon: 'sort_by_alpha' },
    { key: 'value', label: 'Preço', icon: 'payments' },
];

export default function ServicesFilterBar({ filter, onFilterChange, counts, sortConfig, onSort, showSort, ordenacoes = ORDENACOES_PLANOS }) {
    const C = useBentoTheme();

    // O segmento ativo era `bg-[var(--accent)] text-white`: no Cyber isso é branco
    // sobre ciano quase-branco (1.4:1). Texto na cor do accent também não serve —
    // no Aurora seria violeta sobre violeta. A tinta tem que virar com o tema.
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const tintaAtiva = isDark ? C.ink : C.accentDeep;

    return (
        // Chips e ordenação em linhas separadas: lado a lado, os 6 chips ficavam
        // espremidos e os três últimos saíam da área visível em 1280px.
        <div className="flex flex-col gap-3">
            <div className="min-w-0 snap-x snap-mandatory scroll-px-1 overflow-x-auto scroll-smooth px-1 pb-1 pt-1 scrollbar-hide">
                <div className="inline-flex items-center gap-2">
                    {CATEGORIAS.map(cat => (
                        <ChipButton
                            key={cat.value}
                            label={cat.label}
                            icon={cat.icon}
                            count={counts[cat.value]}
                            active={filter === cat.value}
                            onClick={() => onFilterChange(cat.value)}
                        />
                    ))}
                </div>
            </div>

            {showSort && (
                <div className="flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
                    <span className="mr-1 hidden text-sm font-medium text-faint sm:block">Ordenar por:</span>
                    <div className="inline-flex items-center gap-1 rounded-2xl bg-surface-raised p-1">
                        {ordenacoes.map(opt => {
                            const active = sortConfig.key === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => onSort(opt.key)}
                                    aria-pressed={active}
                                    style={active ? { color: tintaAtiva } : undefined}
                                    className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition-all sm:text-sm ${
                                        active
                                            // No claro, --accent-soft e o tray --surface-raised
                                            // são quase iguais; o anel é o que marca o ativo.
                                            ? 'bg-[var(--accent-soft)] ring-1 ring-inset ring-[var(--accent)]/50'
                                            : 'bg-transparent text-faint hover:bg-background'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                                    {opt.label}
                                    {active && (
                                        <span className="material-symbols-outlined text-[16px]">
                                            {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

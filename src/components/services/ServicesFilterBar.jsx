import React from 'react';
import ChipButton from '../ui/ChipButton';

const CATEGORIAS = [
    { value: 'All', label: 'Todos os Serviços', icon: null },
    { value: 'PF', label: 'Internet PF', icon: 'person' },
    { value: 'PJ', label: 'Internet PJ', icon: 'business' },
    { value: 'Link', label: 'Link Dedicado', icon: 'router' },
    { value: 'Technical', label: 'Serviços Técnicos', icon: 'build' },
    { value: 'Streaming', label: 'Streamings', icon: 'play_circle' },
];

const ORDENACOES = [
    { key: 'vendas_mes', label: 'Vendas', icon: 'trending_up' },
    { key: 'valor_mensal', label: 'Preço', icon: 'payments' },
    { key: 'velocidade', label: 'Velocidade', icon: 'speed' },
];

export default function ServicesFilterBar({ filter, onFilterChange, counts, sortConfig, onSort, showSort }) {
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
                    <span className="mr-1 hidden text-sm font-medium text-muted sm:block">Ordenar por:</span>
                    <div className="inline-flex items-center gap-1 rounded-2xl bg-surface-raised p-1">
                        {ORDENACOES.map(opt => {
                            const active = sortConfig.key === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => onSort(opt.key)}
                                    aria-pressed={active}
                                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all sm:text-sm ${
                                        active
                                            ? 'bg-[var(--accent)] text-white shadow-sm'
                                            : 'bg-transparent text-muted hover:bg-background'
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

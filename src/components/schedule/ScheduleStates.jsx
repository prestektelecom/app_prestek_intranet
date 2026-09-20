import React from 'react';

/**
 * Esqueleto de linha desktop com as mesmas 5 colunas da tabela real
 * (Data/Dia/N1/N2/Supervisão) — um esqueleto que não prevê o layout final
 * não reduz espera percebida, produz um "snap" quando os dados chegam.
 */
export function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-border/60">
            <td className="p-4 pl-8"><div className="h-4 w-16 rounded bg-surface-raised" /></td>
            <td className="p-4"><div className="h-4 w-10 rounded bg-surface-raised" /></td>
            <td className="p-4"><div className="h-4 w-32 rounded bg-surface-raised" /></td>
            <td className="p-4"><div className="h-4 w-32 rounded bg-surface-raised" /></td>
            <td className="p-4 pr-8"><div className="ml-auto h-4 w-28 rounded bg-surface-raised sm:ml-0" /></td>
        </tr>
    );
}

/** Esqueleto do card mobile, mesmas seções (N1/N2/Supervisão) do card real. */
export function SkeletonCard() {
    return (
        <div className="animate-pulse space-y-3 rounded-2xl border border-border bg-surface p-4" aria-hidden="true">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-surface-raised" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-surface-raised" />
                    <div className="h-3 w-1/3 rounded bg-surface-raised" />
                </div>
            </div>
            <div className="h-3 w-3/4 rounded bg-surface-raised" />
            <div className="h-3 w-1/2 rounded bg-surface-raised" />
        </div>
    );
}

/**
 * Estado vazio único, usado na tabela desktop e na lista de cards mobile —
 * antes existiam dois blocos quase idênticos, um por breakpoint.
 */
export function EmptyState({ temFiltro, onClear }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-muted/60" aria-hidden="true">event_busy</span>
            <div>
                <p className="m-0 text-base font-extrabold text-foreground">Nenhum plantão encontrado</p>
                <p className="m-0 mt-1 text-sm text-faint">
                    {temFiltro
                        ? 'Não há plantões agendados para os filtros selecionados.'
                        : 'Ainda não há plantões cadastrados neste mês.'}
                </p>
            </div>
            {temFiltro && (
                <button
                    type="button"
                    onClick={onClear}
                    className="flex items-center gap-2 rounded-lg bg-[var(--accent-soft)] px-4 py-2 text-sm font-bold text-[var(--accent-dark)] transition-colors hover:bg-[var(--accent-soft)]/80"
                >
                    <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                    Limpar filtros
                </button>
            )}
        </div>
    );
}

/** Erro ao carregar plantões: antes um banner vermelho estático sem retry. */
export function ErrorState({ onRetry }) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center"
        >
            <span className="material-symbols-outlined text-4xl text-[var(--danger-bento)]" aria-hidden="true">cloud_off</span>
            <p className="m-0 text-base font-bold text-foreground">Não foi possível carregar a escala</p>
            <p className="m-0 max-w-sm text-[13px] leading-relaxed text-faint">
                O servidor não respondeu. Isso costuma ser temporário — tente novamente em instantes.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C2D12] to-[#C2410C] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
                Tentar novamente
            </button>
        </div>
    );
}

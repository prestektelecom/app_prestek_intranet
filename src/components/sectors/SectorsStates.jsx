import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { neumorfismo, relevo } from '../directory/neumorfismo';

/**
 * Esqueleto com o MESMO layout do SectorCard real: tile 48px + badge, título,
 * duas linhas de descrição, faixa do responsável com o círculo de 40px e os
 * dois botões. Um esqueleto que não prevê o layout final não reduz espera
 * percebida — produz um "snap" quando os dados chegam.
 *
 * O relevo é o mesmo do card real, pelo mesmo motivo do DirectoryStates: um
 * esqueleto plano sob um card em relevo estala na troca.
 */
export function SkeletonCard() {
    const C = useBentoTheme();
    const n = neumorfismo(C);
    // Massa em `line`, não `surfaceSoft`: sobre a face neumórfica do tema
    // claro os dois quase coincidem e o esqueleto ficaria invisível.
    const massa = { background: C.line, opacity: n.claro ? 1 : 0.6 };

    return (
        <li
            className="flex flex-col gap-4 rounded-3xl p-6"
            aria-hidden="true"
            style={{ background: n.face, boxShadow: relevo(n, 12, 24), border: '1px solid transparent' }}
        >
            <div className="flex items-start justify-between">
                <div className="h-12 w-12 animate-pulse rounded-2xl" style={massa} />
                <div className="h-[29px] w-20 animate-pulse rounded-lg" style={massa} />
            </div>
            <div>
                <div className="h-[22px] w-3/5 animate-pulse rounded" style={massa} />
                <div className="mt-3 h-3.5 w-full animate-pulse rounded" style={massa} />
                <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded" style={massa} />
            </div>
            <div className="flex items-center gap-3 py-4" style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full" style={massa} />
                <div className="h-4 w-2/5 animate-pulse rounded" style={massa} />
                <div className="ml-auto h-4 w-12 animate-pulse rounded" style={massa} />
            </div>
            <div className="flex gap-2">
                <div className="h-11 flex-1 rounded-full" style={{ background: n.face, boxShadow: relevo(n, 6, 12) }} />
                <div className="h-11 w-14 rounded-full" style={{ background: n.face, boxShadow: relevo(n, 6, 12) }} />
            </div>
        </li>
    );
}

export function SkeletonRow() {
    return (
        <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5" aria-hidden="true">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-surface-raised" />
            <div className="h-4 w-40 animate-pulse rounded bg-surface-raised" />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-surface-raised md:block" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-surface-raised" />
        </li>
    );
}

/**
 * Erro total: /api/setores não respondeu. Antes disso, queda de backend era
 * uma tela morta sem retry — recarregar a página inteira era o único caminho.
 */
export function ErrorState({ onRetry }) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center"
        >
            <span className="material-symbols-outlined text-4xl text-[var(--danger-bento)]" aria-hidden="true">
                cloud_off
            </span>
            <p className="m-0 text-[15px] font-bold text-foreground">Não foi possível carregar os setores</p>
            <p className="m-0 max-w-sm text-[13px] leading-relaxed text-faint">
                O servidor não respondeu. Isso costuma ser temporário — a lista não foi perdida.
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

export function EmptyState({ temFiltro, onClear }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-muted" aria-hidden="true">domain_disabled</span>
            <p className="m-0 text-[15px] font-bold text-foreground">
                {temFiltro ? 'Nenhum setor corresponde à busca' : 'Nenhum setor encontrado'}
            </p>
            <p className="m-0 max-w-sm text-[13px] leading-relaxed text-faint">
                {temFiltro
                    ? 'Tente outro termo — a busca cobre nome do setor e do responsável.'
                    : 'Ainda não há setores para exibir.'}
            </p>
            {temFiltro && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-faint transition-all hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">search_off</span>
                    Limpar busca
                </button>
            )}
        </div>
    );
}

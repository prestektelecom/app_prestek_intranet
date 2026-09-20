import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { neumorfismo, relevo, reentrancia } from './neumorfismo';

/**
 * Esqueleto do card, com o MESMO layout do card real.
 *
 * O anterior punha avatar e texto lado a lado enquanto o card real põe o
 * avatar em cima à esquerda, o badge de status à direita e o nome abaixo — um
 * esqueleto que não prevê o layout final não reduz espera percebida, produz um
 * "snap" visível quando os dados chegam (NN Group, Skeleton Screens).
 *
 * A quantidade também estava errada: 8 esqueletos para um primeiro lote de 16.
 * Quem chama passa `LOTE`.
 */
export function SkeletonCard() {
    const C = useBentoTheme();
    const n = neumorfismo(C);
    // O esqueleto carrega o MESMO relevo do card real. Um esqueleto plano sob
    // um card em relevo produz um "estalo" quando os dados chegam, que é
    // exatamente o que o esqueleto deveria evitar.
    // A massa do esqueleto usa `line`, não `surfaceSoft`: sobre a face
    // neumórfica do tema claro (#F5F9FF), surfaceSoft é #F7FAFD — dois pontos
    // de diferença, invisível.
    const massa = { background: C.line, opacity: n.claro ? 1 : 0.6 };

    return (
        <li
            className="rounded-3xl p-6"
            aria-hidden="true"
            style={{ background: n.face, boxShadow: relevo(n, 12, 24), border: '1px solid transparent' }}
        >
            <div className="mb-4 flex justify-center">
                <div className="h-28 w-28 rounded-full" style={{ background: n.face, boxShadow: reentrancia(n, 6, 12) }} />
            </div>
            <div className="flex flex-col items-center">
                <div className="h-[22px] w-3/5 animate-pulse rounded" style={massa} />
                <div className="mt-2 h-[18px] w-2/5 animate-pulse rounded" style={massa} />
                <div className="mt-2 h-4 w-1/3 animate-pulse rounded" style={massa} />
                <div className="mt-4 h-[26px] w-24 animate-pulse rounded-full" style={massa} />
            </div>
            <div className="mt-6 flex gap-2">
                <div className="h-[52px] flex-1 rounded-full" style={{ background: n.face, boxShadow: relevo(n, 6, 12) }} />
                <div className="h-[52px] flex-1 rounded-full" style={{ background: n.face, boxShadow: relevo(n, 6, 12) }} />
            </div>
        </li>
    );
}

export function SkeletonRow() {
    return (
        <li className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3" aria-hidden="true">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-raised" />
            <div className="h-4 w-40 animate-pulse rounded bg-surface-raised" />
            <div className="h-5 w-24 animate-pulse rounded-md bg-surface-raised" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface-raised" />
        </li>
    );
}

/**
 * Erro total: `/api/colaboradores` não respondeu.
 *
 * Antes deste componente, todo fetch tinha `.catch(() => null)` e o `finally`
 * sempre limpava o loading — então queda de backend era renderizada como
 * "Nenhum colaborador encontrado", sem nem o botão de limpar filtros (que só
 * aparece quando há filtro). Uma falha de infraestrutura apresentada como fato
 * de negócio. NN Group, heurística #9.
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
            <p className="m-0 text-[15px] font-bold text-foreground">Não foi possível carregar os colaboradores</p>
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

/**
 * Falha PARCIAL: os colaboradores vieram, mas as tabelas de departamento não.
 *
 * É o caso mais insidioso dos dois. Sem este aviso, `resolverDepartamento`
 * devolve 'N/D' para todo mundo, os chips somem e todo card fica cinza — a
 * tela parece funcionar e está mentindo. Erro de tela cheia seria exagero,
 * porque o dado principal chegou.
 */
export function AvisoTaxonomia() {
    return (
        <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] leading-snug text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-200"
        >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">warning</span>
            <span>
                Não foi possível carregar a lista de departamentos. Os colaboradores estão listados, mas o
                setor aparece como “N/D” e o filtro por departamento está indisponível.
            </span>
        </div>
    );
}

export function EmptyState({ temFiltro, onClear }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-muted" aria-hidden="true">person_search</span>
            <p className="m-0 text-[15px] font-bold text-foreground">Nenhum colaborador encontrado</p>
            <p className="m-0 max-w-sm text-[13px] leading-relaxed text-faint">
                {temFiltro
                    ? 'Nenhum resultado para a busca e o departamento selecionados.'
                    : 'Ainda não há colaboradores para exibir.'}
            </p>
            {temFiltro && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-faint transition-all hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">filter_alt_off</span>
                    Limpar filtros
                </button>
            )}
        </div>
    );
}

import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';

// Mesmo segmented control do DirectoryToolbar.
const SEG_BASE = 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const SEG_ATIVO = 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/50';
const SEG_INATIVO = 'text-muted hover:bg-background';

/**
 * Busca + ordenação + visão do diretório de setores.
 *
 * Sem chips de departamento: aqui o setor É o item da lista, não um filtro
 * sobre ela. Para ~28 itens, busca textual e duas ordenações bastam.
 */
export default function SectorsToolbar({
    busca,
    setBusca,
    ordenacao,
    setOrdenacao,
    visao,
    setVisao,
    isLoading,
    textoContador,
}) {
    const C = useBentoTheme();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <span
                        className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
                        style={{ color: C.muted }}
                        aria-hidden="true"
                    >
                        search
                    </span>
                    <input
                        type="text"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        placeholder="Buscar por setor ou responsável..."
                        aria-label="Buscar setor por nome ou responsável"
                        className="h-11 w-full rounded-xl pl-10 pr-3 text-[13.5px] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        style={{ background: C.surfaceSoft, color: C.ink, border: `1px solid ${C.line}` }}
                    />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <label htmlFor="sectors-ordenacao" className="sr-only">Ordenar setores</label>
                    <select
                        id="sectors-ordenacao"
                        value={ordenacao}
                        onChange={e => setOrdenacao(e.target.value)}
                        className="h-11 cursor-pointer rounded-xl px-3 text-[13px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        style={{ background: C.surfaceSoft, color: C.ink2, border: `1px solid ${C.line}` }}
                    >
                        <option value="nome">Nome A–Z</option>
                        <option value="membros">Mais pessoas</option>
                    </select>

                    <div className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-surface-raised p-1">
                        <button
                            type="button"
                            onClick={() => setVisao('grid')}
                            aria-pressed={visao === 'grid'}
                            className={`${SEG_BASE} ${visao === 'grid' ? SEG_ATIVO : SEG_INATIVO}`}
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">grid_view</span>
                            Cards
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisao('lista')}
                            aria-pressed={visao === 'lista'}
                            className={`${SEG_BASE} ${visao === 'lista' ? SEG_ATIVO : SEG_INATIVO}`}
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">format_list_bulleted</span>
                            Lista
                        </button>
                    </div>
                </div>
            </div>

            {/* aria-live anuncia a contagem para leitor de tela a cada busca;
                min-h impede o salto de layout enquanto carrega. */}
            <p
                aria-live="polite"
                className="m-0 min-h-[18px] font-mono text-[12px] tracking-[0.05em]"
                style={{ color: C.muted }}
            >
                {isLoading ? '' : textoContador}
            </p>
        </div>
    );
}

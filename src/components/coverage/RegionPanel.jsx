import React, { useEffect, useState } from 'react';
import RegionCard from './RegionCard';
import { chaveRegiao } from './constants';

const LOTE = 40;

const ORDENS = [
    { key: 'contratos', label: 'Contratos', icon: 'trending_down' },
    { key: 'alfabetica', label: 'A–Z', icon: 'sort_by_alpha' },
];

// A lista antes paginava de 6 em 6 com setas ‹ ›: encontrar um bairro entre
// 300 exigia dezenas de cliques às cegas, porque a paginação não diz em que
// página ele está. Rolagem contínua + "carregar mais" mantém a busca visual
// (comparar vizinhos) e não força o usuário a lembrar da página anterior.
export default function RegionPanel({
    regioes,
    carregando,
    selecionada,
    onSelecionar,
    onConfigurar,
    isAdmin,
    ordem,
    setOrdem,
    onFechar,
}) {
    const [visiveis, setVisiveis] = useState(LOTE);

    // Trocar filtro/ordem tem de voltar ao topo da fatia; sem isso o painel
    // continuava com 200 itens montados depois de filtrar para 3.
    useEffect(() => { setVisiveis(LOTE); }, [regioes]);

    const fatia = regioes.slice(0, visiveis);
    const restantes = regioes.length - fatia.length;

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* flex-wrap: numa coluna de 300px o título mais os dois botões de
                ordenação não cabem na mesma linha e o segmentado era empurrado
                para fora da borda. Quando não cabe, a ordenação desce. */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <h2 className="font-display truncate text-xl font-bold text-foreground">Regiões</h2>
                    <span className="font-mono text-[11px] tabular-nums text-faint">{regioes.length}</span>
                    {carregando && (
                        <span className="material-symbols-outlined animate-spin text-[15px] text-[var(--accent)]">autorenew</span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <div className="inline-flex items-center gap-0.5 rounded-xl bg-surface-raised p-0.5">
                        {ORDENS.map(o => {
                            const ativo = ordem === o.key;
                            return (
                                <button
                                    key={o.key}
                                    type="button"
                                    onClick={() => setOrdem(o.key)}
                                    aria-pressed={ativo}
                                    title={`Ordenar por ${o.label}`}
                                    // Mesmo bug de `Coverage.jsx` (toggle Mapa/Lista):
                                    // `text-[var(--accent)]` reprova a 2,63:1 no claro.
                                    className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                                        ativo
                                            ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)] ring-1 ring-inset ring-[var(--accent)]/50'
                                            : 'text-faint hover:bg-background'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[14px]">{o.icon}</span>
                                    {o.label}
                                </button>
                            );
                        })}
                    </div>

                    {onFechar && (
                        <button
                            type="button"
                            onClick={onFechar}
                            aria-label="Fechar lista"
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-surface-raised"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
                {carregando && regioes.length === 0 ? (
                    // Skeleton no formato do card — spinner genérico não dá pista
                    // nenhuma sobre o que está por vir.
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-border bg-surface-raised" />
                    ))
                ) : regioes.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                        <span className="material-symbols-outlined text-4xl text-muted">location_off</span>
                        <p className="text-[13px] font-semibold text-foreground">Nenhuma região encontrada</p>
                        <p className="text-sm text-faint">Ajuste a busca ou limpe os filtros.</p>
                    </div>
                ) : (
                    <>
                        {fatia.map(row => (
                            <RegionCard
                                key={chaveRegiao(row)}
                                row={row}
                                selecionada={chaveRegiao(row) === selecionada}
                                onSelecionar={onSelecionar}
                                onConfigurar={onConfigurar}
                                isAdmin={isAdmin}
                            />
                        ))}

                        {restantes > 0 && (
                            <button
                                type="button"
                                onClick={() => setVisiveis(v => v + LOTE)}
                                className="mt-1 w-full cursor-pointer rounded-xl border border-dashed border-border py-2.5 text-[13px] font-bold text-faint transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            >
                                Carregar mais {Math.min(LOTE, restantes)} de {restantes}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

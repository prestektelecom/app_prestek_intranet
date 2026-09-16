import React from 'react';
import { HeroShell, HeroKpiTile, HeroKpiSkeleton, HERO_LABEL_MONO } from '../ui/HeroShell';

/**
 * Hero da aba TI. Mesma anatomia do CoverageHero (rampa de ui/heroGradiente,
 * retícula de pontos, anéis de propagação no background, split 6/6) — as telas
 * são irmãs e precisam ler como o mesmo produto.
 *
 * @param {object}  ferramenta  entrada do registry, define título e descrição
 * @param {Array}   kpis        [{ label, valor, sub }] do painel direito
 * @param {boolean} isLoading   troca os KPIs por esqueletos
 * @param {string}  etapa       texto curto no topo do painel ("Etapa 2 de 3")
 */
export default function TiHero({ ferramenta, kpis = [], isLoading = false, etapa }) {
    return (
        <HeroShell patternId="ti-grid">
            {/* Split em 2xl e não em xl, pelo mesmo motivo do CoverageHero: os
                breakpoints medem a viewport, mas aqui dentro o espaço é ~330px
                menor (sidebar de 248px + px-10 do main). */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={HERO_LABEL_MONO}>Setor de TI</div>
                        <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                            {ferramenta?.label || 'Ferramentas de TI'}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            {ferramenta?.descricao}
                        </p>
                    </div>

                    {/* Selo de modo simulação. Está no hero, e não perto do botão,
                        de propósito: a garantia de que nada é gravado precisa ser
                        visível antes de o operador começar a digitar, não só na
                        hora de enviar. */}
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">science</span>
                        Modo simulação — nada é gravado no IXC
                    </span>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                            <span className={HERO_LABEL_MONO}>Progresso</span>
                        </div>
                        {etapa ? <span className="font-mono text-[10px] text-white/70">{etapa}</span> : null}
                    </div>

                    {/* <dl>: painel de KPIs é lista de descrição (rótulo+valor), não
                        parágrafos soltos — mesma correção já aplicada em Directory/
                        SectorsHero (Fase 6/7), estendida aqui na extração da Fase 16. */}
                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {isLoading
                            ? Array.from({ length: 4 }, (_, i) => <HeroKpiSkeleton key={i} />)
                            : kpis.map(k => <HeroKpiTile key={k.label} {...k} />)}
                    </dl>
                </div>
            </div>
        </HeroShell>
    );
}

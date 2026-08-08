import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';

// Mesmo piso de opacidade do CoverageHero e do ServicesHero: sobre o painel
// bg-black/55, /70 dá 5,6:1 e /75 dá 6,2:1. Abaixo disso reprova em AA.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

function KpiTile({ label, valor, sub }) {
    return (
        <div className="min-w-0">
            <div className={LABEL_MONO}>{label}</div>
            <div className="mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </div>
            {sub ? <div className="mt-1 truncate font-mono text-[11px] text-white/70">{sub}</div> : null}
        </div>
    );
}

function KpiEsqueleto() {
    return (
        <div className="min-w-0">
            <div className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
    );
}

/**
 * Hero da aba TI. Mesma anatomia do CoverageHero (gradiente 120deg, grade SVG
 * de 40px, dois blobs desfocados, split 6/6 em 2xl) — as telas são irmãs e
 * precisam ler como o mesmo produto.
 *
 * @param {object}  ferramenta  entrada do registry, define título e descrição
 * @param {Array}   kpis        [{ label, valor, sub }] do painel direito
 * @param {boolean} isLoading   troca os KPIs por esqueletos
 * @param {string}  etapa       texto curto no topo do painel ("Etapa 2 de 3")
 */
export default function TiHero({ ferramenta, kpis = [], isLoading = false, etapa }) {
    const C = useBentoTheme();

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="ti-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ti-grid)" />
            </svg>
            <div aria-hidden="true" style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

            {/* Split em 2xl e não em xl, pelo mesmo motivo do CoverageHero: os
                breakpoints medem a viewport, mas aqui dentro o espaço é ~330px
                menor (sidebar de 248px + px-10 do main). */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        <div className={LABEL_MONO}>Setor de TI</div>
                        <h1 className="m-0 mt-1.5 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[30px] lg:text-[34px]">
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

                <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-sm 2xl:col-span-6">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                            <span className={LABEL_MONO}>Progresso</span>
                        </div>
                        {etapa ? <span className="font-mono text-[10px] text-white/70">{etapa}</span> : null}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {isLoading
                            ? Array.from({ length: 4 }, (_, i) => <KpiEsqueleto key={i} />)
                            : kpis.map(k => <KpiTile key={k.label} {...k} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

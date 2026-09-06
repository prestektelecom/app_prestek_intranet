import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { fundoHero } from '../ui/heroGradiente';

// Mesmo piso de opacidade das telas irmãs (DirectoryHero, TiHero): sobre o
// painel bg-black/60, /75 dá 4,9:1. Abaixo disso reprova em AA.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

function KpiTile({ label, valor, sub }) {
    return (
        <div className="min-w-0">
            <dt className={LABEL_MONO}>{label}</dt>
            <dd className="m-0 mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </dd>
            {sub ? <dd className="m-0 mt-1 truncate font-mono text-[11px] text-white/70">{sub}</dd> : null}
        </div>
    );
}

function KpiEsqueleto() {
    return (
        <div className="min-w-0" aria-hidden="true">
            <dt className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
            {/* h-[17px] casa a caixa exata do valor final, para o painel não
                saltar quando os números chegam. */}
            <dd className="m-0 mt-1 h-[17px] w-1/2 animate-pulse rounded bg-white/10" />
        </div>
    );
}

/**
 * Hero da aba Setores, sobre os primitivos compartilhados (fundoHero).
 *
 * A versão anterior reintroduzia os mesmos bugs que o DirectoryHero documenta:
 * `C.accentDark` como parada do meio (pêssego nos temas escuros, 1,71:1 sob o
 * branco), orb pintando `C.cyan`, KPIs em pílulas rgba(255,255,255,0.18) que
 * clareiam o fundo sob texto branco, e um emoji no <h1> que o leitor de tela
 * anunciava antes do título.
 */
export default function SectorsHero({ kpis = [], isLoading = false }) {
    const C = useBentoTheme();

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: fundoHero(C),
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
                <defs>
                    {/* id próprio: `dir-grid` já existe no DOM ao navegar entre abas. */}
                    <pattern id="sec-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sec-dots)" />
            </svg>

            {/* Split em 2xl e não em lg: os breakpoints medem a viewport, mas
                aqui dentro sobra ~330px a menos (sidebar 248px + px-10). */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                <div className="2xl:col-span-6">
                    <div className={LABEL_MONO}>Estrutura Organizacional</div>
                    <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                        Setores e Departamentos
                    </h1>
                    {/* Substantivos concretos: o texto anterior prometia
                        "contatos principais" que a página não tinha como seção. */}
                    <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                        Organograma, responsáveis e ramais de cada setor da Prestek.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
                    <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                        <span className={LABEL_MONO}>Estrutura</span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {isLoading
                            ? Array.from({ length: 3 }, (_, i) => <KpiEsqueleto key={i} />)
                            : kpis.map(k => <KpiTile key={k.label} {...k} />)}
                    </dl>
                </div>
            </div>
        </div>
    );
}

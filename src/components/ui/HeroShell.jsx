import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { fundoHero } from './heroGradiente';

// Piso de opacidade comum a todo hero: sobre o painel bg-black/60, /75 dá
// 4,9:1 e /70 dá 4,5:1 — abaixo disso reprova AA. Era uma constante idêntica
// copiada em Ti/Coverage/Directory/Sectors/ServicesHero; extraída na Fase 16
// (Encerramento) junto com a moldura e os tiles de KPI abaixo.
export const HERO_LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

/**
 * Moldura comum a todo hero de aba: fundo em rampa de marca (`fundoHero`),
 * retícula de pontos decorativa e sombra. Cada tela mantém sua própria grade
 * interna (o breakpoint do split de 2 colunas varia: `2xl` em Ti/Directory/
 * Sectors, `xl` em Coverage, `lg` em Services) — só a caixa externa e o fundo
 * eram byte-a-byte idênticos.
 *
 * `patternId` precisa ser único: é o id do `<pattern>` do SVG, e duas telas
 * podem coexistir brevemente no DOM durante uma transição de rota.
 */
export function HeroShell({ patternId, className = '', children }) {
    const C = useBentoTheme();

    return (
        <div
            className={`relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8 ${className}`.trim()}
            style={{
                background: fundoHero(C),
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}>
                <defs>
                    <pattern id={patternId} width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
            {children}
        </div>
    );
}

// <dt>/<dd> porque o painel de KPIs é uma lista de descrição (rótulo + valor),
// não parágrafos soltos — um leitor de tela lia números sem vínculo com seus
// rótulos antes desta estrutura (achado original do DirectoryHero, Fase 6).
// O pai precisa ser um <dl> de verdade; ver HeroShell.jsx nos consumidores.
export function HeroKpiTile({ label, valor, sub, progresso }) {
    return (
        <div className="min-w-0">
            <dt className={HERO_LABEL_MONO}>{label}</dt>
            <dd className="m-0 mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </dd>
            {progresso != null ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                        className="h-full rounded-full bg-white transition-[width] duration-500"
                        style={{ width: `${progresso}%` }}
                    />
                </div>
            ) : sub ? (
                <dd className="m-0 mt-1 truncate font-mono text-[11px] text-white/70">{sub}</dd>
            ) : null}
        </div>
    );
}

// `label` presente = rótulo estático conhecido em build-time (ex.: CoverageHero,
// que só pulsa o número para não saltar o rótulo já sabido); ausente = tudo
// pulsa (Ti/Directory/Sectors, cujos KPIs vêm de fora e o rótulo também é
// desconhecido até os dados chegarem).
export function HeroKpiSkeleton({ label, sub }) {
    return (
        <div className="min-w-0" aria-hidden="true">
            {label ? (
                <dt className={HERO_LABEL_MONO}>{label}</dt>
            ) : (
                <dt className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
            )}
            {/* h-[17px] casa a caixa exata do valor final, para o painel não saltar. */}
            <dd className="m-0 mt-1 h-[17px] w-1/2 animate-pulse rounded bg-white/10" />
            {sub ? <div className="mt-1 truncate font-mono text-[11px] text-white/50">{sub}</div> : null}
        </div>
    );
}

export default HeroShell;

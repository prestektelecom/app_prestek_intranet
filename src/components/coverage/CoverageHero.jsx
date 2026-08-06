import React, { useMemo } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import HeroSearchInput from '../ui/HeroSearchInput';

// Mesmo piso de opacidade do ServicesHero: sobre o painel bg-black/55, /70 dá
// 5,6:1 e /75 dá 6,2:1. Abaixo disso o rótulo reprova em AA sobre o gradiente.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

const nf = (n) => Number(n || 0).toLocaleString('pt-BR');

// `progresso` (0–100) troca o subtítulo por uma barra. É o que permite ao
// avanço da curadoria caber na mesma fileira dos KPIs, em vez de abrir uma
// segunda linha com borda própria embaixo do painel.
function KpiTile({ label, valor, sub, progresso }) {
    return (
        <div className="min-w-0">
            <div className={LABEL_MONO}>{label}</div>
            <div className="mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </div>
            {progresso != null ? (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                        className="h-full rounded-full bg-white transition-[width] duration-500"
                        style={{ width: `${progresso}%` }}
                    />
                </div>
            ) : sub ? (
                <div className="mt-1 truncate font-mono text-[11px] text-white/70">{sub}</div>
            ) : null}
        </div>
    );
}

export default function CoverageHero({
    dados = [],
    isLoading,
    busca,
    onBuscaChange,
    onSincronizar,
    isAdmin,
}) {
    const C = useBentoTheme();

    const stats = useMemo(() => {
        const cidades = new Set(dados.map(d => d.cidade_ixc_id)).size;
        const contratos = dados.reduce((acc, d) => acc + (parseInt(d.total_contratos) || 0), 0);
        const comConfig = dados.filter(d => d.tem_override).length;
        const mapeadas = dados.filter(d => d.latitude != null && d.longitude != null).length;

        const configuradas = dados.filter(d => d.percentual_cobertura != null);
        const coberturaMedia = configuradas.length
            ? Math.round(configuradas.reduce((a, d) => a + Number(d.percentual_cobertura), 0) / configuradas.length)
            : null;

        // A distribuição por status saiu daqui: os chips de CoverageFilters já
        // publicam as mesmas contagens, e lá elas são clicáveis. Duplicar a
        // informação custava uma fileira inteira do hero — ~74px de altura fixa
        // roubados do mapa, numa página de altura travada.
        return { cidades, contratos, comConfig, mapeadas, coberturaMedia };
    }, [dados]);

    // Decide a contagem de colunas junto com o conteúdo: durante o loading são
    // 4 esqueletos, então a grade não pode já estar em 5 e deixar um buraco.
    const mostraCuradoria = isAdmin && !isLoading && dados.length > 0;

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
                    <pattern id="cov-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cov-grid)" />
            </svg>
            <div aria-hidden="true" style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

            {/* Divide em duas colunas só a partir de 2xl. Os breakpoints medem a
                viewport, mas aqui dentro o espaço é ~330px menor (sidebar de
                248px + px-10 do main). Em xl a coluna esquerda ficava com ~383px
                para acomodar h1 + busca + botão Sincronizar, que pedem ~700px:
                a busca encolhia a um terço do teto e o título quebrava em duas
                linhas. Em 2xl o conteúdo bate no teto de 1200px e cada coluna
                fica com ~584px.

                6/6 e não 5/7: com a tipografia maior a coluna esquerda passou a
                pedir tanto quanto o painel de instrumentos. É a mesma proporção
                do ServicesHero. */}
            <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
                {/* ─── Identidade + busca ─── */}
                <div className="flex flex-col gap-4 2xl:col-span-6">
                    <div>
                        {/* O selo "Sincronizado com o IXC" saiu: custava ~34px de
                            altura para repetir o que o botão Sincronizar e o
                            contador "N de M no mapa" já dizem. */}
                        {/* Mesma escala do ServicesHero — as duas telas são irmãs
                            e liam como produtos diferentes só por causa disto. */}
                        <h1 className="m-0 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[30px] lg:text-[34px]">
                            Central de Cobertura de Rede
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Gestão e monitoramento por região dos contratos do IXC.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <HeroSearchInput
                            value={busca}
                            onChange={onBuscaChange}
                            placeholder="Buscar cidade ou bairro..."
                            maxWidth={560}
                        />
                        <button
                            type="button"
                            onClick={onSincronizar}
                            disabled={isLoading}
                            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-white/25 bg-black/25 px-4 py-3 text-[13px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                        >
                            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                            {isLoading ? 'Sincronizando...' : 'Sincronizar'}
                        </button>
                    </div>

                </div>

                {/* ─── Painel de instrumentos ─── */}
                <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-sm 2xl:col-span-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span className="truncate text-[11px] font-bold text-white">Malha de cobertura</span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-white/70">
                            {isLoading ? 'carregando' : `${nf(stats.mapeadas)} de ${nf(dados.length)} no mapa`}
                        </span>
                    </div>

                    {/* Fileira única. A curadoria virou o 5º tile em vez de uma
                        segunda faixa com borda própria — a página tem altura
                        travada, então cada linha aqui sai da altura do mapa.
                        2×N até md: em 640px os 4 tiles davam 136px cada e o
                        subtítulo ("das regiões com dados") truncava em todos. */}
                    <div className={`mt-3 grid grid-cols-2 gap-3 ${mostraCuradoria ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-1.5">
                                    <div className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                                </div>
                            ))
                        ) : (
                            <>
                                <KpiTile label="Cidades" valor={nf(stats.cidades)} sub="atendidas" />
                                <KpiTile label="Regiões" valor={nf(dados.length)} sub="cidade + bairro" />
                                <KpiTile label="Contratos" valor={nf(stats.contratos)} sub="ativos no IXC" />
                                <KpiTile
                                    label="Cobertura méd."
                                    valor={stats.coberturaMedia != null ? `${stats.coberturaMedia}%` : '—'}
                                    sub={stats.coberturaMedia != null ? 'das regiões com dados' : 'sem dados'}
                                />
                                {/* Curadoria só interessa a quem edita os overrides. */}
                                {mostraCuradoria && (
                                    <KpiTile
                                        label="Configuradas"
                                        valor={`${nf(stats.comConfig)} / ${nf(dados.length)}`}
                                        progresso={(stats.comConfig / dados.length) * 100}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

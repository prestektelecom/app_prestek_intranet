import React, { useMemo } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import HeroSearchInput from '../ui/HeroSearchInput';
import { STATUS_META, STATUS_COR_PADRAO } from './constants';

// Mesmo piso de opacidade do ServicesHero: sobre o painel bg-black/55, /70 dá
// 5,6:1 e /75 dá 6,2:1. Abaixo disso o rótulo reprova em AA sobre o gradiente.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

const nf = (n) => Number(n || 0).toLocaleString('pt-BR');

function KpiTile({ label, valor, sub }) {
    return (
        <div className="min-w-0">
            <div className={LABEL_MONO}>{label}</div>
            <div className="mt-1 truncate text-[17px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </div>
            {sub && <div className="mt-1 truncate font-mono text-[11px] text-white/70">{sub}</div>}
        </div>
    );
}

/**
 * Barra de proporção por status. Segmentos separados por 2px de superfície
 * (senão dois status adjacentes de luminância parecida viram um bloco só) e
 * cada fatia é rotulada abaixo com ícone + nome + contagem — status nunca é
 * comunicado só pela cor.
 */
function BarraStatus({ distribuicao, totalRegioes }) {
    if (!totalRegioes) return null;

    return (
        <div>
            <div className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full bg-white/15" role="img"
                 aria-label={distribuicao.map(d => `${d.label}: ${d.qtd} de ${totalRegioes}`).join('; ')}>
                {distribuicao.map(d => (
                    <span
                        key={d.label}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                        style={{ width: `${(d.qtd / totalRegioes) * 100}%`, background: d.cor }}
                    />
                ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {distribuicao.map(d => (
                    <span key={d.label} className="inline-flex items-center gap-1 text-[11px] text-white/85">
                        <span className="material-symbols-outlined text-[13px] leading-none" style={{ color: d.cor }}>
                            {d.icon}
                        </span>
                        {d.label}
                        <b className="tabular-nums text-white">{d.qtd}</b>
                    </span>
                ))}
            </div>
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

        const porStatus = Object.keys(STATUS_META)
            .map(s => ({
                label: s,
                cor: STATUS_META[s].cor,
                icon: STATUS_META[s].icon,
                qtd: dados.filter(d => d.status === s).length,
            }))
            .filter(d => d.qtd > 0);

        const semStatus = dados.filter(d => !STATUS_META[d.status]).length;
        if (semStatus > 0) {
            porStatus.push({ label: 'Sem config.', cor: STATUS_COR_PADRAO, icon: 'help', qtd: semStatus });
        }

        return { cidades, contratos, comConfig, mapeadas, coberturaMedia, porStatus };
    }, [dados]);

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-2xl p-5 text-white sm:p-6"
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

            {/* Divide em duas colunas só a partir de xl. Em lg cada coluna ficava
                com ~460px: a busca (420px) e o botão Sincronizar disputavam a
                mesma linha, e os 4 KPIs caíam para ~107px cada, cortando valores
                de 4 dígitos. Até 1280px o hero empilha. */}
            <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-center xl:gap-8">
                {/* ─── Identidade + busca ─── */}
                <div className="flex flex-col gap-4 xl:col-span-5">
                    <div>
                        {/* O selo "Sincronizado com o IXC" saiu: custava ~34px de
                            altura para repetir o que o botão Sincronizar e o
                            contador "N de M no mapa" já dizem. */}
                        <h1 className="m-0 text-[22px] font-extrabold leading-[1.15] tracking-[-0.03em] text-white sm:text-[26px] lg:text-[29px]">
                            Central de Cobertura de Rede
                        </h1>
                        <p className="mt-1 text-[13px] leading-snug text-white/85 sm:text-sm">
                            Gestão e monitoramento por região dos contratos do IXC.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <HeroSearchInput
                            value={busca}
                            onChange={onBuscaChange}
                            placeholder="Buscar cidade ou bairro..."
                            maxWidth={420}
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
                {/* col-span-7: a coluna esquerda só tem título e busca, e sobrava
                    faixa vazia à direita dela. O painel absorve a largura. */}
                <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-sm xl:col-span-7">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span className="truncate text-[11px] font-bold text-white">Malha de cobertura</span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-white/70">
                            {isLoading ? 'carregando' : `${nf(stats.mapeadas)} de ${nf(dados.length)} no mapa`}
                        </span>
                    </div>

                    {/* 2×2 até md: em 640px os 4 tiles davam 136px cada e o
                        subtítulo ("das regiões com dados") truncava em todos. */}
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
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
                            </>
                        )}
                    </div>

                    {/* As duas barras dividem uma linha em vez de empilhar. Antes
                        a distribuição por status ficava solta no rodapé da coluna
                        esquerda, ocupando metade da largura do hero com o resto
                        vazio, e o progresso de curadoria gastava outra faixa aqui. */}
                    {!isLoading && dados.length > 0 && (
                        <div className={`mt-3 grid gap-x-5 gap-y-3 border-t border-white/[0.15] pt-3 ${isAdmin ? 'sm:grid-cols-2' : ''}`}>
                            <div>
                                <span className={LABEL_MONO}>Status das regiões</span>
                                <div className="mt-1.5">
                                    <BarraStatus distribuicao={stats.porStatus} totalRegioes={dados.length} />
                                </div>
                            </div>

                            {/* Curadoria só interessa a quem edita os overrides. */}
                            {isAdmin && (
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={LABEL_MONO}>Regiões configuradas</span>
                                        <span className="font-mono text-[11px] font-bold tabular-nums text-white">
                                            {nf(stats.comConfig)} / {nf(dados.length)}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
                                        <div
                                            className="h-full rounded-full bg-white transition-[width] duration-500"
                                            style={{ width: `${(stats.comConfig / dados.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

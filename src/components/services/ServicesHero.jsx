import React, { useMemo, useState } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import Sparkline from '../common/Sparkline';
import HeroSearchInput from '../ui/HeroSearchInput';
import { parseVelocidade } from '../../utils/planTaxonomy';

// Os KPIs são de CONTRATOS, não dos planos listados abaixo — o rótulo
// "Contratos do mês" deixa isso explícito em vez de sugerir que 385 é a
// quantidade de planos do catálogo.
const KPI_SECUNDARIOS = [
    { key: 'ativo', label: 'Ativo', icon: 'check_circle' },
    { key: 'inativo', label: 'Inativo', icon: 'power_off' },
    { key: 'pre', label: 'Pré-contratos', icon: 'schedule' },
    { key: 'negativado', label: 'Negativados', icon: 'gpp_maybe' },
    { key: 'desistiu', label: 'Desistiu', icon: 'cancel' },
];

// Opacidades do painel têm piso em /70. Sobre bg-black/55, /70 dá 5,6:1 e /75
// dá 6,2:1; os valores anteriores (/45 e /55) davam 2,1:1 e 2,5:1, reprovados
// em AA — e não dava para consertar só subindo opacidade, o fundo é que estava claro.
const LABEL_MONO = 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75';

const ABAS = [
    { key: 'velocidade', label: 'Velocidade', icon: 'speed' },
    { key: 'dia', label: 'Dia', icon: 'calendar_month' },
];

const MAX_ROTULOS_EIXO = 7;

// 1000 Mbps vira "1G": rótulo de eixo precisa caber em ~40px, como "Jan"/"Fev".
function rotuloVelocidade(mbps) {
    return mbps >= 1000 ? `${(mbps / 1000).toFixed(0)}G` : `${mbps}M`;
}

// Um mês tem até 31 pontos e o eixo não comporta 31 rótulos. Amostra índices
// igualmente espaçados, sempre incluindo o primeiro e o último.
function amostrarIndices(n, alvo = MAX_ROTULOS_EIXO) {
    if (n <= 0) return [];
    if (n <= alvo) return Array.from({ length: n }, (_, i) => i);
    return [...new Set(
        Array.from({ length: alvo }, (_, i) => Math.round((i * (n - 1)) / (alvo - 1)))
    )];
}

function indiceDoPico(serie) {
    if (!serie.length) return null;
    return serie.reduce((melhor, v, i) => (v > serie[melhor] ? i : melhor), 0);
}

const plural = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;

function KpiTile({ label, valor, sub, descricaoCompleta }) {
    return (
        // title serve o mouse, aria-label serve teclado e leitor de tela — o
        // nome do plano tem ~70 caracteres e não cabe visível no tile.
        <div className="min-w-0" title={descricaoCompleta} aria-label={descricaoCompleta || undefined}>
            <div className={LABEL_MONO}>{label}</div>
            <div className="mt-1 truncate text-[15px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                {valor}
            </div>
            {sub && <div className="mt-1 truncate font-mono text-[11px] text-white/70">{sub}</div>}
        </div>
    );
}

export default function ServicesHero({
    counts,
    total,
    isLoading,
    busca,
    onBuscaChange,
    vendasPorVelocidade = [],
    vendasPorDia = [],
    vendasTotais = 0,
    receitaNova = 0,
    ticketMedio = 0,
    planoCampeao = null,
    formatCurrency = (v) => v,
}) {
    const C = useBentoTheme();
    const [aba, setAba] = useState('velocidade');

    const visiveis = KPI_SECUNDARIOS.filter(k => (counts[k.key] || 0) > 0);
    const semDados = !isLoading && total === 0;
    const preContratos = counts.pre || 0;

    const competencia = useMemo(() => {
        const s = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return s.charAt(0).toUpperCase() + s.slice(1);
    }, []);

    // O gráfico troca com a aba; os tiles de KPI não. Contratos, receita e ticket
    // são os números de cabeçalho e sumir com eles ao trocar de aba seria perda.
    const grafico = useMemo(() => {
        if (aba === 'dia') {
            const serie = vendasPorDia.map(d => d.vendas);
            const idxPico = indiceDoPico(serie);
            const soma = serie.reduce((a, v) => a + v, 0);
            const diasComVenda = serie.filter(v => v > 0).length;
            const media = serie.length ? soma / serie.length : 0;

            return {
                serie,
                idxPico,
                rotulos: amostrarIndices(vendasPorDia.length).map(i => ({
                    i,
                    texto: String(vendasPorDia[i].dia).padStart(2, '0'),
                })),
                vazio: 'Mês recém-iniciado: ainda não há dias suficientes para a curva.',
                resumo: !serie.length || !soma
                    ? 'Nenhuma venda registrada nos dias decorridos.'
                    : `Melhor: dia ${vendasPorDia[idxPico].dia} com ${vendasPorDia[idxPico].vendas} · `
                      + `média ${media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/dia · `
                      + `${diasComVenda} de ${plural(serie.length, 'dia', 'dias')} com venda`,
            };
        }

        const serie = vendasPorVelocidade.map(v => v.vendas);
        const idxPico = indiceDoPico(serie);
        const soma = serie.reduce((a, v) => a + v, 0);

        return {
            serie,
            idxPico,
            rotulos: amostrarIndices(vendasPorVelocidade.length).map(i => ({
                i,
                texto: rotuloVelocidade(vendasPorVelocidade[i].mbps),
            })),
            vazio: 'Vendas insuficientes neste mês para traçar a curva.',
            resumo: !serie.length || !soma
                ? 'Nenhuma venda por faixa de velocidade neste mês.'
                : `Pico em ${rotuloVelocidade(vendasPorVelocidade[idxPico].mbps)} `
                  + `com ${plural(vendasPorVelocidade[idxPico].vendas, 'venda', 'vendas')} · `
                  + `${plural(soma, 'venda', 'vendas')} no total`,
        };
    }, [aba, vendasPorVelocidade, vendasPorDia]);

    const temGrafico = grafico.serie.length >= 2;

    const campeaoVelocidade = planoCampeao ? parseVelocidade(planoCampeao.descricao) : null;
    const campeaoLabel = !planoCampeao || !planoCampeao.vendas_mes
        ? '—'
        : campeaoVelocidade ? rotuloVelocidade(campeaoVelocidade) : planoCampeao.descricao;

    return (
        <div
            className="relative overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
            style={{
                background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
                boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
            }}
        >
            <svg width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                <defs>
                    <pattern id="svc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#svc-grid)" />
            </svg>
            <div aria-hidden="true" style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div aria-hidden="true" style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
                {/* ─── Identidade + busca ─── */}
                <div className="flex flex-col gap-5 lg:col-span-6">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                Ao vivo
                            </span>
                        </div>
                        <h1 className="m-0 text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[30px] lg:text-[34px]">
                            Central de Vendas
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Consulte planos de internet, serviços técnicos e pacotes de streaming.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <HeroSearchInput
                            value={busca}
                            onChange={onBuscaChange}
                            placeholder="Buscar plano, velocidade ou valor..."
                        />
                        {preContratos > 0 && (
                            <div className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[14px] border border-white/25 bg-black/25 px-4 py-3 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-[18px] text-white/85">schedule</span>
                                <span className="text-[13px] font-bold text-white">
                                    {preContratos} {preContratos === 1 ? 'pré-contrato' : 'pré-contratos'}
                                </span>
                            </div>
                        )}
                    </div>

                    {semDados ? (
                        <p className="text-[12.5px] text-white/85">Sem contratos registrados neste mês.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(isLoading ? KPI_SECUNDARIOS : visiveis).map(kpi => (
                                <div
                                    key={kpi.key}
                                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white"
                                    style={{
                                        background: 'rgba(0,0,0,0.22)',
                                        backdropFilter: 'blur(6px)',
                                        border: '1px solid rgba(255,255,255,0.22)',
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[14px] leading-none">{kpi.icon}</span>
                                    <span className="text-[13px] font-bold tabular-nums">{isLoading ? '···' : counts[kpi.key]}</span>
                                    <span className="font-mono text-[10.5px] tracking-[0.06em] text-white/85">{kpi.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Painel de instrumentos ─── */}
                <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-sm lg:col-span-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span className="truncate text-[11px] font-bold text-white">Vendas</span>
                        </span>

                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1 rounded-xl bg-white/10 p-0.5">
                                {ABAS.map(opt => {
                                    const ativo = aba === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAba(opt.key)}
                                            aria-pressed={ativo}
                                            className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                                ativo ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="shrink-0 font-mono text-[10px] text-white/70">{competencia}</span>
                        </div>
                    </div>

                    {/* Uma string só alimenta o resumo visível e o aria-label do SVG:
                        assim o que o vidente lê e o que o leitor de tela anuncia não divergem. */}
                    <p className="mt-2 text-[11px] leading-snug text-white/75">
                        {isLoading ? '···' : grafico.resumo}
                    </p>

                    <div className="mt-2">
                        {isLoading ? (
                            <div className="h-20 animate-pulse rounded-lg bg-white/10" />
                        ) : temGrafico ? (
                            <>
                                <Sparkline
                                    data={grafico.serie}
                                    color="#FFFFFF"
                                    height={80}
                                    highlightIndex={grafico.idxPico}
                                    ariaLabel={grafico.resumo}
                                />
                                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-white/70">
                                    {grafico.rotulos.map(({ i, texto }) => (
                                        <span key={i} className={i === grafico.idxPico ? 'font-bold text-white' : undefined}>
                                            {texto}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            // Sparkline retorna null com menos de 2 pontos — sem isso viraria um buraco.
                            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/25 px-3 text-center text-[11.5px] text-white/75">
                                {grafico.vazio}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.15] pt-3 sm:grid-cols-4">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-1.5">
                                    <div className="h-2 w-2/3 animate-pulse rounded bg-white/10" />
                                    <div className="h-3.5 w-1/2 animate-pulse rounded bg-white/10" />
                                </div>
                            ))
                        ) : (
                            <>
                                <KpiTile label="Contratos" valor={total} sub={`${counts.ativo || 0} ativos`} />
                                <KpiTile
                                    label="Receita nova"
                                    valor={formatCurrency(receitaNova)}
                                    sub="mensalidade somada"
                                />
                                {/* O subtítulo expõe o denominador: vendasTotais só conta planos
                                    ativos, então pode ser menor que "Contratos". */}
                                <KpiTile
                                    label="Ticket médio"
                                    valor={formatCurrency(ticketMedio)}
                                    sub={plural(vendasTotais, 'venda', 'vendas')}
                                />
                                <KpiTile
                                    label="Plano campeão"
                                    valor={campeaoLabel}
                                    sub={planoCampeao ? plural(planoCampeao.vendas_mes || 0, 'venda', 'vendas') : 'sem vendas'}
                                    descricaoCompleta={planoCampeao?.descricao}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

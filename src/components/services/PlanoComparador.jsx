import React, { useMemo } from 'react';

// ─── Funções de parsing do nome do plano ──────────────────────────────────────

/**
 * Extrai a velocidade em Mbps do nome do plano.
 * Ex: "500 MEGA + WATCH - AL" → 500
 */
function parseVelocidade(descricao = '') {
    const match = descricao.match(/(\d+)\s*MEGA/i);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Extrai palavras-chave de streaming do nome do plano.
 * Ex: "500 MEGA + WATCH + PARAMOUNT + ITTV 32c - AL"
 *   → ["WATCH", "PARAMOUNT", "ITTV"]
 */
const STREAMING_KEYWORDS = ['WATCH', 'PARAMOUNT', 'MAX', 'PREMIERE', 'ITTV', 'LEVEDUCA', 'NETFLIX', 'DISNEY', 'STAR', 'HBO'];

function parseStreaming(descricao = '') {
    const upper = descricao.toUpperCase();
    return STREAMING_KEYWORDS.filter(kw => upper.includes(kw));
}

/**
 * Tenta estimar o valor dos streamings inclusos cruzando
 * com a lista de pacotes disponíveis.
 */
function estimarValorStreaming(streamingKeys, streamingServices = []) {
    if (!streamingKeys.length || !streamingServices.length) return 0;

    // Acha o pacote que mais coincide com as palavras-chave do plano
    let melhorScore = 0;
    let melhorPacote = null;

    for (const pkg of streamingServices) {
        const nomeUpper = (pkg.service || '').toUpperCase();
        const score = streamingKeys.filter(kw => nomeUpper.includes(kw)).length;
        if (score > melhorScore) {
            melhorScore = score;
            melhorPacote = pkg;
        }
    }

    if (!melhorPacote || melhorScore === 0) return 0;

    // Extrai o valor numérico do pacote (ex: "R$ 19,90" → 19.90)
    const raw = (melhorPacote.value || '').replace(/[^\d,]/g, '').replace(',', '.');
    const valor = parseFloat(raw);
    return isNaN(valor) ? 0 : valor;
}

// ─── Motor de recomendação ─────────────────────────────────────────────────────

/**
 * Analisa os planos e gera um objeto de recomendação com:
 * - badges por plano (ex: "Melhor Preço", "Mais Completo")
 * - insight principal
 * - dica de argumento de venda
 */
function gerarRecomendacao(plans, streamingServices, formatCurrency) {
    if (!plans || plans.length < 2) return null;

    const parseValor = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? Infinity : num;
    };

    // Enriquece cada plano com dados extraídos
    const enriched = plans.map(p => ({
        ...p,
        valor: parseValor(p.valor_mensal),
        velocidade: parseVelocidade(p.descricao),
        streaming: parseStreaming(p.descricao),
        valorStreaming: estimarValorStreaming(parseStreaming(p.descricao), streamingServices),
    }));

    const [a, b] = enriched;
    const badges = {}; // id → { icon, label, color }
    const insights = [];
    let argumentoVenda = null;
    let tipoDestaque = 'neutro'; // 'economia' | 'valor' | 'velocidade' | 'neutro'

    // ── 1. Análise de preço ───────────────────────────────────────────────────
    const diffPreco = Math.abs(a.valor - b.valor);
    const diffPercent = Math.max(a.valor, b.valor) > 0
        ? (diffPreco / Math.max(a.valor, b.valor)) * 100
        : 0;
    const maisBarato = a.valor < b.valor ? a : b;
    const maisCaro   = a.valor > b.valor ? b : a;

    if (diffPreco > 0) {
        badges[maisBarato.id] = {
            icon: 'savings',
            label: 'Melhor Preço',
            color: 'emerald',
        };
    }

    // ── 2. Análise de streaming ───────────────────────────────────────────────
    const aTemStream = a.streaming.length > 0;
    const bTemStream = b.streaming.length > 0;
    const algumTemStream = aTemStream || bTemStream;

    if (aTemStream && !bTemStream) {
        badges[a.id] = { icon: 'play_circle', label: 'Inclui Streaming', color: 'purple' };
    } else if (bTemStream && !aTemStream) {
        badges[b.id] = { icon: 'play_circle', label: 'Inclui Streaming', color: 'purple' };
    } else if (aTemStream && bTemStream) {
        const maisStream = a.streaming.length >= b.streaming.length ? a : b;
        badges[maisStream.id] = { icon: 'play_circle', label: 'Mais Streaming', color: 'purple' };
    }

    // Plano com streaming — verificar se é o mais caro
    const planComStream = aTemStream ? a : (bTemStream ? b : null);
    const planSemStream = aTemStream ? b : (bTemStream ? a : null);

    // ── 3. Análise de velocidade ──────────────────────────────────────────────
    const aVel = a.velocidade;
    const bVel = b.velocidade;
    if (aVel && bVel && aVel !== bVel) {
        const maisRapido = aVel > bVel ? a : b;
        if (!badges[maisRapido.id]) {
            badges[maisRapido.id] = { icon: 'speed', label: 'Mais Rápido', color: 'blue' };
        }
    }

    // ── 4. Badge "Mais Completo" para o plano com mais vantagens ─────────────
    // Conta pontos: streaming (+2 por serviço), velocidade (+1 se maior), preço (-1 se maior)
    const pontosA = a.streaming.length * 2 + (aVel > bVel ? 1 : 0) + (a.valor < b.valor ? 1 : 0);
    const pontosB = b.streaming.length * 2 + (bVel > aVel ? 1 : 0) + (b.valor < a.valor ? 1 : 0);

    if (pontosA !== pontosB) {
        const maisCompleto = pontosA > pontosB ? a : b;
        if (!badges[maisCompleto.id]) {
            badges[maisCompleto.id] = { icon: 'workspace_premium', label: 'Mais Completo', color: 'amber' };
        }
    }

    // ── 5. Geração do insight principal ───────────────────────────────────────
    if (planComStream && planSemStream && diffPreco > 0) {
        // Caso clássico: um tem streaming e é mais caro
        const custoEfetivo = planComStream.valor - planComStream.valorStreaming;
        tipoDestaque = 'valor';

        if (planComStream.valorStreaming > 0) {
            const economiaReal = planSemStream.valor - custoEfetivo;

            if (economiaReal < 0) {
                // O plano com streaming ainda é mais caro mesmo com o desconto do streaming
                insights.push({
                    icon: 'info',
                    texto: `O ${planComStream.descricao.split('+')[0].trim()} inclui streaming no valor estimado de ${formatCurrency(planComStream.valorStreaming)}/mês. O custo efetivo da internet seria ${formatCurrency(custoEfetivo)}/mês — ainda ${formatCurrency(Math.abs(economiaReal))} a mais que o outro plano.`,
                });
                argumentoVenda = `"Este plano já inclui ${planComStream.streaming.join(', ')} — compare o valor total vs. pagar separado."`;
            } else {
                // O plano com streaming tem custo efetivo MENOR!
                tipoDestaque = 'valor';
                insights.push({
                    icon: 'bolt',
                    texto: `Inclui streaming no valor de ~${formatCurrency(planComStream.valorStreaming)}/mês. O custo efetivo da internet cai para ~${formatCurrency(custoEfetivo)}/mês — ${formatCurrency(economiaReal)} mais barato que o plano sem streaming!`,
                });
                argumentoVenda = `"Por apenas ${formatCurrency(diffPreco)} a mais, o cliente recebe ${planComStream.streaming.join(' + ')} incluso — que custaria ${formatCurrency(planComStream.valorStreaming)} separado."`;
            }
        } else {
            // Tem streaming mas não conseguimos estimar o valor
            insights.push({
                icon: 'play_circle',
                texto: `O plano inclui ${planComStream.streaming.join(', ')} — verifique o valor dos pacotes para calcular o custo-benefício real.`,
            });
            argumentoVenda = `"Este plano já vem com ${planComStream.streaming.join(' + ')} incluso no valor."`;
        }
    } else if (diffPercent >= 15 && !algumTemStream) {
        // Diferença grande de preço sem streaming
        tipoDestaque = 'economia';
        insights.push({
            icon: 'savings',
            texto: `Diferença de ${formatCurrency(diffPreco)}/mês (${Math.round(diffPercent)}%). Em 12 meses, o plano mais barato representa uma economia de ${formatCurrency(diffPreco * 12)}.`,
        });
        argumentoVenda = `"Para o cliente que quer economizar, este plano oferece a mesma conexão por ${formatCurrency(diffPreco)} a menos por mês."`;
    } else if (aVel && bVel && aVel !== bVel) {
        // Diferença de velocidade é o destaque
        tipoDestaque = 'velocidade';
        const maisRapido = aVel > bVel ? a : b;
        const maisLento  = aVel > bVel ? b : a;
        insights.push({
            icon: 'speed',
            texto: `Diferença de velocidade: ${maisRapido.velocidade} Mbps vs ${maisLento.velocidade} Mbps. Para home office, streaming 4K ou múltiplos dispositivos, a velocidade maior faz diferença.`,
        });
        argumentoVenda = `"Quantas pessoas usam a internet simultaneamente? Para ${Math.floor(maisRapido.velocidade / 100)}+ dispositivos ao mesmo tempo, os ${maisRapido.velocidade} Mbps garantem mais estabilidade."`;
    } else {
        // Planos muito similares
        tipoDestaque = 'neutro';
        insights.push({
            icon: 'balance',
            texto: 'Planos muito similares. O critério de decisão pode ser o prazo de instalação ou a preferência do cliente.',
        });
        argumentoVenda = null;
    }

    return { badges, insights, argumentoVenda, tipoDestaque, enriched };
}

// ─── Mapa de cores por tipo de badge ─────────────────────────────────────────
const badgeColors = {
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: 'text-emerald-500 dark:text-emerald-400',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: 'text-purple-500 dark:text-purple-400',
    },
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-500 dark:text-blue-400',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-200 dark:border-amber-800/30',
        text: 'text-amber-700 dark:text-amber-400',
        icon: 'text-amber-500 dark:text-amber-400',
    },
};

// Configuração visual do banner por tipo de destaque
const bannerConfig = {
    valor: {
        gradient: 'from-purple-600 to-indigo-600',
        lightBg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800/30',
        icon: 'auto_awesome',
        titleColor: 'text-purple-800 dark:text-purple-300',
        subtitleColor: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    economia: {
        gradient: 'from-emerald-600 to-teal-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800/30',
        icon: 'savings',
        titleColor: 'text-emerald-800 dark:text-emerald-300',
        subtitleColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    },
    velocidade: {
        gradient: 'from-blue-600 to-cyan-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800/30',
        icon: 'bolt',
        titleColor: 'text-blue-800 dark:text-blue-300',
        subtitleColor: 'text-blue-600 dark:text-blue-400',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    neutro: {
        gradient: 'from-slate-500 to-slate-600',
        lightBg: 'bg-slate-50 dark:bg-slate-900/20',
        border: 'border-slate-200 dark:border-slate-700/30',
        icon: 'balance',
        titleColor: 'text-slate-700 dark:text-slate-300',
        subtitleColor: 'text-slate-500 dark:text-slate-400',
        badgeBg: 'bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300',
    },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PlanoComparador({ plans = [], isOpen = false, onClear, formatCurrency, streamingServices = [] }) {
    const parseValor = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? Infinity : num;
    };

    const minValor = plans.length > 0 ? Math.min(...plans.map(p => parseValor(p.valor_mensal))) : Infinity;
    const hasDifferentPrices = plans.length > 1 && new Set(plans.map(p => parseValor(p.valor_mensal))).size > 1;
    const isBestPrice = (plan) => hasDifferentPrices && parseValor(plan.valor_mensal) === minValor;

    const gridColsClass = plans.length === 2 ? 'grid-cols-3' : 'grid-cols-4';

    // Gera a recomendação inteligente
    const recomendacao = useMemo(
        () => gerarRecomendacao(plans, streamingServices, formatCurrency),
        [plans, streamingServices]
    );

    const cfg = recomendacao ? bannerConfig[recomendacao.tipoDestaque] : bannerConfig.neutro;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            }`}
        >
            {/* Sombra superior premium */}
            <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-black/5 to-transparent dark:from-black/20 pointer-events-none" />

            <div className="bg-white/95 dark:bg-[#1c1917]/95 backdrop-blur-md border-t border-[#E4ECF5] dark:border-[#2e2a26] shadow-[0_-10px_30px_rgba(11,27,46,0.08)] px-6 py-5 max-w-[1200px] mx-auto rounded-t-2xl">

                {/* Header do Drawer */}
                <div className="flex items-center justify-between mb-4 border-b border-[#E4ECF5] dark:border-[#2e2a26] pb-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4A9EF5] dark:text-[#7FD4E8]">compare_arrows</span>
                        <h3 className="text-sm font-bold text-[#0B1B2E] dark:text-[#f5f0eb]">
                            Comparador de Planos <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">({plans.length} selecionados)</span>
                        </h3>
                    </div>
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDEDED] text-[#E84545] dark:bg-red-950/20 dark:text-red-400 rounded-lg hover:opacity-90 transition-all text-xs font-bold cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        Fechar comparação
                    </button>
                </div>

                {plans.length >= 2 && (
                    <div className="flex flex-col gap-4">

                        {/* ── Banner de Recomendação Inteligente ── */}
                        {recomendacao && (
                            <div className={`rounded-xl border ${cfg.border} ${cfg.lightBg} overflow-hidden`}>
                                {/* Cabeçalho do banner */}
                                <div className={`flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r ${cfg.gradient}`}>
                                    <span className="material-symbols-outlined text-white text-[18px]">{cfg.icon}</span>
                                    <span className="text-white text-xs font-extrabold uppercase tracking-widest">
                                        Análise Inteligente
                                    </span>
                                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                                        IA
                                    </span>
                                </div>

                                {/* Corpo do banner */}
                                <div className="px-4 py-3 flex flex-col gap-2">
                                    {/* Insights */}
                                    {recomendacao.insights.map((insight, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className={`material-symbols-outlined text-[16px] mt-0.5 shrink-0 ${cfg.subtitleColor}`}>
                                                {insight.icon}
                                            </span>
                                            <p className={`text-xs leading-relaxed ${cfg.titleColor} font-medium`}>
                                                {insight.texto}
                                            </p>
                                        </div>
                                    ))}

                                    {/* Argumento de venda */}
                                    {recomendacao.argumentoVenda && (
                                        <div className={`mt-1 flex items-start gap-2 rounded-lg px-3 py-2 ${cfg.badgeBg}`}>
                                            <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0 opacity-70">record_voice_over</span>
                                            <div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 block mb-0.5">
                                                    Argumento de venda
                                                </span>
                                                <p className="text-xs font-semibold leading-relaxed">
                                                    {recomendacao.argumentoVenda}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Tabela de Comparação ── */}
                        <div className={`grid ${gridColsClass} gap-4 text-xs`}>

                            {/* Linha 1: Títulos / Nomes */}
                            <div className="flex items-center font-bold text-slate-400 dark:text-[#a09080] uppercase tracking-wider">
                                Característica
                            </div>
                            {plans.map((plan) => {
                                const badge = recomendacao?.badges?.[plan.id];
                                const bCfg = badge ? badgeColors[badge.color] : null;
                                return (
                                    <div
                                        key={`name-${plan.id}`}
                                        className={`p-3 rounded-xl border relative ${
                                            bCfg
                                                ? `${bCfg.bg} ${bCfg.border}`
                                                : 'bg-slate-50/50 dark:bg-[#211e1b]/30 border-slate-100/50 dark:border-[#2e2a26]/20'
                                        }`}
                                    >
                                        {/* Badge do plano */}
                                        {badge && (
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1.5 ${bCfg.bg} ${bCfg.border} border ${bCfg.text}`}>
                                                <span className={`material-symbols-outlined text-[10px] ${bCfg.icon}`}>{badge.icon}</span>
                                                {badge.label}
                                            </span>
                                        )}
                                        <h4 className="font-extrabold text-[#0B1B2E] dark:text-[#f5f0eb] text-sm leading-tight line-clamp-2">
                                            {plan.descricao}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: IXC-{plan.id}</span>
                                    </div>
                                );
                            })}

                            {/* Linha 2: Valor Mensal */}
                            <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                                Valor Mensal
                            </div>
                            {plans.map((plan) => {
                                const best = isBestPrice(plan);
                                return (
                                    <div
                                        key={`val-${plan.id}`}
                                        className={`p-3 font-bold border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center justify-between rounded-lg transition-colors ${
                                            best
                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400'
                                            : 'text-[#0B1B2E] dark:text-[#f5f0eb]'
                                        }`}
                                    >
                                        <span className="text-sm font-black">
                                            {formatCurrency(plan.valor_mensal)}
                                        </span>
                                        {best && (
                                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold tracking-wider">
                                                <span className="material-symbols-outlined text-[10px] font-black">trending_down</span>
                                                MELHOR PREÇO
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Linha 3: Velocidade (se detectada) */}
                            {recomendacao?.enriched?.some(p => p.velocidade) && (
                                <>
                                    <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                                        Velocidade
                                    </div>
                                    {recomendacao.enriched.map((plan) => {
                                        const maxVel = Math.max(...recomendacao.enriched.map(p => p.velocidade || 0));
                                        const isFastest = plan.velocidade && plan.velocidade === maxVel && recomendacao.enriched.filter(p => p.velocidade === maxVel).length === 1;
                                        return (
                                            <div
                                                key={`vel-${plan.id}`}
                                                className={`p-3 border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center gap-2 rounded-lg ${
                                                    isFastest ? 'text-blue-600 dark:text-blue-400' : 'text-[#0B1B2E] dark:text-[#f5f0eb]'
                                                }`}
                                            >
                                                {plan.velocidade ? (
                                                    <>
                                                        <span className="font-black text-sm">{plan.velocidade}</span>
                                                        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">Mbps</span>
                                                        {isFastest && (
                                                            <span className="material-symbols-outlined text-[14px] text-blue-500">bolt</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">—</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* Linha 4: Taxa de Instalação */}
                            <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                                Taxa de Instalação
                            </div>
                            {plans.map((plan) => (
                                <div key={`tax-${plan.id}`} className="p-3 text-[#0B1B2E] dark:text-[#f5f0eb] border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center">
                                    {plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'R$ 0,00'}
                                </div>
                            ))}

                            {/* Linha 5: Prazo de Entrega */}
                            <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                                Prazo de Entrega
                            </div>
                            {plans.map((plan) => (
                                <div key={`prazo-${plan.id}`} className="p-3 text-[#0B1B2E] dark:text-[#f5f0eb] border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center font-semibold">
                                    {plan.prazo_instalacao || 'A consultar'}
                                </div>
                            ))}

                            {/* Linha 6: Streaming Inclusos */}
                            <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2">
                                Streaming Inclusos
                            </div>
                            {(recomendacao?.enriched || plans).map((plan) => {
                                const streaming = plan.streaming || [];
                                return (
                                    <div key={`stream-${plan.id}`} className="p-3 flex items-center flex-wrap gap-1">
                                        {streaming.length > 0 ? (
                                            streaming.map(kw => (
                                                <span
                                                    key={kw}
                                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/20 text-purple-700 dark:text-purple-400 text-[9px] font-extrabold uppercase tracking-wide"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">play_circle</span>
                                                    {kw}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 dark:text-slate-500 font-medium">—</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

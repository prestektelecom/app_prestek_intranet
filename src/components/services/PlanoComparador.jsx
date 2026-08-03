import React, { useMemo, useEffect } from 'react';
import { parseVelocidade, parseStreaming, formatarVelocidade } from '../../utils/planTaxonomy';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseValor = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? Infinity : num;
};

/**
 * Estima o valor dos streamings inclusos cruzando com a lista de pacotes.
 * É uma aproximação por casamento de palavras-chave — daí o "~" nos textos.
 */
function estimarValorStreaming(streamingKeys, streamingServices = []) {
    if (!streamingKeys.length || !streamingServices.length) return 0;

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

    const raw = (melhorPacote.value || '').replace(/[^\d,]/g, '').replace(',', '.');
    const valor = parseFloat(raw);
    return isNaN(valor) ? 0 : valor;
}

// ─── Motor de recomendação ────────────────────────────────────────────────────

/**
 * Duas cores codificam tudo: verde = "custa menos", laranja (marca) = "tem mais".
 * Antes eram quatro matizes concorrentes (roxo/esmeralda/azul/âmbar) sem esquema.
 */
function gerarRecomendacao(plans, streamingServices, formatCurrency) {
    if (!plans || plans.length < 2) return null;

    const enriched = plans.map(p => ({
        ...p,
        valor: parseValor(p.valor_mensal),
        velocidade: parseVelocidade(p.descricao),
        streaming: parseStreaming(p.descricao),
        valorStreaming: estimarValorStreaming(parseStreaming(p.descricao), streamingServices),
    }));

    // Badges por plano são ARRAY: um plano pode ser o mais barato E ter streaming.
    // Antes o segundo selo sobrescrevia o primeiro em silêncio.
    const badges = {};
    const marcar = (id, badge) => {
        if (!badges[id]) badges[id] = [];
        if (badges[id].length < 2) badges[id].push(badge);
    };

    const porPreco = [...enriched].sort((x, y) => x.valor - y.valor);
    const maisBarato = porPreco[0];
    const maisCaro = porPreco[porPreco.length - 1];

    // Extremos de preço, não plans[0] e plans[1]: com 3 planos selecionados o
    // motor antigo desprezava o terceiro por completo.
    const a = maisCaro;
    const b = maisBarato;

    const diffPreco = Math.abs(maisCaro.valor - maisBarato.valor);
    const diffPercent = maisCaro.valor > 0 ? (diffPreco / maisCaro.valor) * 100 : 0;

    if (diffPreco > 0) marcar(maisBarato.id, { icon: 'savings', label: 'Melhor preço', tom: 'success' });

    // Velocidade — avaliada sobre todos os planos
    const comVel = enriched.filter(p => p.velocidade);
    const velMax = comVel.length ? Math.max(...comVel.map(p => p.velocidade)) : null;
    const velMin = comVel.length ? Math.min(...comVel.map(p => p.velocidade)) : null;
    if (velMax && velMax !== velMin) {
        comVel.filter(p => p.velocidade === velMax).forEach(p =>
            marcar(p.id, { icon: 'speed', label: 'Mais rápido', tom: 'accent' })
        );
    }

    // Streaming — idem
    const comStream = enriched.filter(p => p.streaming.length > 0);
    if (comStream.length > 0 && comStream.length < enriched.length) {
        comStream.forEach(p => marcar(p.id, { icon: 'play_circle', label: 'Inclui streaming', tom: 'accent' }));
    } else if (comStream.length === enriched.length) {
        const maxStream = Math.max(...comStream.map(p => p.streaming.length));
        comStream.filter(p => p.streaming.length === maxStream).forEach(p =>
            marcar(p.id, { icon: 'play_circle', label: 'Mais streaming', tom: 'accent' })
        );
    }

    // ── Narrativa ────────────────────────────────────────────────────────────
    const planComStream = a.streaming.length > 0 ? a : (b.streaming.length > 0 ? b : null);
    const planSemStream = a.streaming.length > 0 ? b : (b.streaming.length > 0 ? a : null);

    let veredito;
    let argumentoVenda = null;

    if (planComStream && planSemStream && planSemStream.streaming.length === 0 && diffPreco > 0) {
        const custoEfetivo = planComStream.valor - planComStream.valorStreaming;

        if (planComStream.valorStreaming > 0) {
            const economiaReal = planSemStream.valor - custoEfetivo;
            if (economiaReal < 0) {
                veredito = `Com o streaming abatido, a internet do plano mais completo sai por ~${formatCurrency(custoEfetivo)}/mês — ainda ${formatCurrency(Math.abs(economiaReal))} acima do outro.`;
                argumentoVenda = `Este plano já inclui ${planComStream.streaming.join(', ')} — compare o valor total contra pagar os pacotes separado.`;
            } else {
                veredito = `Descontando o streaming (~${formatCurrency(planComStream.valorStreaming)}/mês), a internet sai por ~${formatCurrency(custoEfetivo)}/mês — ${formatCurrency(economiaReal)} mais barata que o plano sem streaming.`;
                argumentoVenda = `Por ${formatCurrency(diffPreco)} a mais, o cliente leva ${planComStream.streaming.join(' + ')} incluso — que sozinho custaria ${formatCurrency(planComStream.valorStreaming)}.`;
            }
        } else {
            veredito = `O plano mais completo inclui ${planComStream.streaming.join(', ')}. Confira o valor dos pacotes para calcular o custo-benefício real.`;
            argumentoVenda = `Este plano já vem com ${planComStream.streaming.join(' + ')} incluso no valor.`;
        }
    } else if (diffPercent >= 15) {
        // Os números já estão nos tiles logo abaixo — repetí-los aqui seria
        // gastar a linha de maior atenção com informação duplicada.
        veredito = velMax && velMin && velMax !== velMin
            ? `Preço e velocidade andam juntos aqui: vale confirmar se o cliente realmente usa a banda extra antes de subir de plano.`
            : `A diferença é de preço, não de entrega — os planos entregam praticamente o mesmo.`;
        argumentoVenda = `Para quem quer economizar, este plano entrega a mesma conexão por ${formatCurrency(diffPreco)} a menos por mês.`;
    } else if (velMax && velMin && velMax !== velMin) {
        const maisRapido = comVel.find(p => p.velocidade === velMax);
        veredito = `${velMax} Mbps contra ${velMin} Mbps. Para home office, 4K ou vários aparelhos ao mesmo tempo, a diferença aparece.`;
        argumentoVenda = `Quantas pessoas usam a internet ao mesmo tempo? Para ${Math.floor(maisRapido.velocidade / 100)}+ aparelhos simultâneos, os ${velMax} Mbps seguram melhor.`;
    } else {
        veredito = 'Planos muito parecidos. O desempate provavelmente é prazo de instalação ou preferência do cliente.';
    }

    return { badges, veredito, argumentoVenda, diffPreco, velMax, velMin, enriched };
}

// ─── Modelo das linhas ────────────────────────────────────────────────────────
// Uma definição só, usada pela tabela (desktop) e pelos blocos (mobile).

function construirLinhas(plans, formatCurrency) {
    const velocidades = plans.map(p => parseVelocidade(p.descricao));
    const valores = plans.map(p => parseValor(p.valor_mensal));
    const menorValor = Math.min(...valores);
    const maiorVel = Math.max(...velocidades.filter(Boolean), 0);

    const precosDiferem = new Set(valores).size > 1;
    const velsDiferem = new Set(velocidades.filter(Boolean)).size > 1;

    return [
        {
            key: 'valor',
            label: 'Valor mensal',
            texto: (p) => formatCurrency(p.valor_mensal),
            vence: (p) => precosDiferem && parseValor(p.valor_mensal) === menorValor,
            tom: 'success',
            destaque: true,
        },
        {
            key: 'velocidade',
            label: 'Velocidade',
            texto: (p) => {
                const v = parseVelocidade(p.descricao);
                return v ? `${v} Mbps` : '—';
            },
            vence: (p) => velsDiferem && parseVelocidade(p.descricao) === maiorVel,
            tom: 'accent',
            destaque: true,
        },
        {
            key: 'streaming',
            label: 'Streaming incluso',
            texto: (p) => {
                const s = parseStreaming(p.descricao);
                return s.length ? s.join(' · ') : '—';
            },
            vence: () => false,
        },
        {
            key: 'taxa',
            label: 'Instalação',
            // taxa_instalacao é texto livre no backend ('Grátis' ou '50').
            texto: (p) => {
                const raw = String(p.taxa_instalacao ?? '').trim();
                if (!raw) return 'Grátis';
                return /^\d+([.,]\d+)?$/.test(raw) ? formatCurrency(raw.replace(',', '.')) : raw;
            },
            vence: () => false,
        },
        {
            key: 'prazo',
            label: 'Prazo de entrega',
            texto: (p) => p.prazo_instalacao || '—',
            vence: () => false,
        },
    ];
}

const iguaisNaLinha = (linha, plans) => {
    const textos = plans.map(p => linha.texto(p).trim().toLowerCase());
    return textos.every(t => t === textos[0]);
};

// ─── Pedaços de UI ────────────────────────────────────────────────────────────

const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-muted';

const TOM = {
    success: {
        chip: 'bg-[var(--success-soft)] text-[var(--success-strong)]',
        valor: 'text-[var(--success-strong)]',
        anel: 'bg-[var(--success-soft)]',
    },
    accent: {
        chip: 'bg-[var(--accent-soft)] text-[var(--accent-dark)]',
        valor: 'text-[var(--accent-dark)]',
        anel: 'bg-[var(--accent-soft)]',
    },
};

function Chip({ badge }) {
    const t = TOM[badge.tom] || TOM.accent;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${t.chip}`}>
            <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
            {badge.label}
        </span>
    );
}

// Nome curto para cabeçalho de coluna: a descrição do IXC tem ~70 caracteres.
const nomeCurtoPlano = (plan) => {
    const v = parseVelocidade(plan.descricao);
    return v ? formatarVelocidade(v) : plan.descricao;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PlanoComparador({ plans = [], isOpen = false, onClear, formatCurrency, streamingServices = [] }) {
    const recomendacao = useMemo(
        () => gerarRecomendacao(plans, streamingServices, formatCurrency),
        [plans, streamingServices, formatCurrency]
    );

    const linhas = useMemo(
        () => (plans.length >= 2 ? construirLinhas(plans, formatCurrency) : []),
        [plans, formatCurrency]
    );

    const linhasDiferentes = linhas.filter(l => !iguaisNaLinha(l, plans));
    const linhasIguais = linhas.filter(l => iguaisNaLinha(l, plans));

    // Esc fecha a comparação.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClear(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClear]);

    const copiarArgumento = () => {
        if (recomendacao?.argumentoVenda) {
            navigator.clipboard?.writeText(recomendacao.argumentoVenda);
        }
    };

    const colunas = `minmax(96px,0.55fr) repeat(${plans.length}, minmax(0,1fr))`;

    return (
        <section
            aria-label={`Comparador de planos — ${plans.length} selecionados`}
            aria-hidden={!isOpen}
            // Sem inert, o botão de fechar continua no Tab mesmo com a folha
            // fora da tela (WCAG 2.4.3 / 2.4.11).
            inert={!isOpen ? '' : undefined}
            className={`fixed bottom-16 left-0 right-0 z-[999] lg:bottom-0 lg:left-[var(--sidebar-w,248px)]
                        transition-transform duration-300 ease-out
                        ${isOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
        >
            {/* Fosco: --card é opaco nos cinco temas, então o /90 aqui é um alfa
                previsível (ao contrário de --surface, translúcido no cyber). O
                modificador só funciona porque o tailwind.config passou a expor
                canais RGB — antes resolvia para transparente. */}
            <div className="mx-auto max-w-[1200px] overflow-hidden rounded-t-2xl border border-b-0 border-border bg-card/90 shadow-xl backdrop-blur-2xl">
                {/* Fio de marca no topo — substitui os 40px de banner roxo */}
                <div
                    aria-hidden="true"
                    className="h-[3px] w-full bg-gradient-to-r from-[var(--accent-deep)] via-[var(--accent)] to-[var(--accent-deep)]"
                />

                <div className="max-h-[min(78dvh,680px)] overflow-y-auto overscroll-contain custom-scrollbar px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                    {/* ── Cabeçalho ── */}
                    {/* Barra de título com régua inferior: sem ela, o rótulo e o
                        botão ficavam soltos nas pontas de uma linha de ~1000px. */}
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] leading-none text-[var(--accent-dark)]">
                                compare_arrows
                            </span>
                            <h3 className={LABEL}>
                                Comparando{' '}
                                <span aria-live="polite" className="tabular-nums text-foreground">
                                    {plans.length} planos
                                </span>
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                            Fechar
                        </button>
                    </div>

                    {recomendacao && (
                        <div className="mb-4 flex flex-col gap-3">
                            {/* ── 1. Veredito ── */}
                            <p className="max-w-[68ch] text-[17px] font-semibold leading-snug text-foreground">
                                {recomendacao.veredito}
                            </p>

                            {/* ── 2. Delta: o número que o vendedor fala em voz alta ── */}
                            <div className="flex flex-wrap gap-2">
                                {recomendacao.diffPreco > 0 && (
                                    <div className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-xl border border-border bg-surface-raised px-4 py-3">
                                        <span className={LABEL}>Diferença mensal</span>
                                        <span className="font-mono text-[24px] font-bold leading-none tabular-nums text-foreground">
                                            {formatCurrency(recomendacao.diffPreco)}
                                        </span>
                                        <span className="font-mono text-[11px] tabular-nums text-faint">
                                            {formatCurrency(recomendacao.diffPreco * 12)} em 12 meses
                                        </span>
                                    </div>
                                )}
                                {recomendacao.velMax && recomendacao.velMin && recomendacao.velMax !== recomendacao.velMin && (
                                    <div className="flex min-w-[150px] flex-1 flex-col gap-0.5 rounded-xl border border-border bg-surface-raised px-4 py-3">
                                        <span className={LABEL}>Diferença de velocidade</span>
                                        <span className="font-mono text-[24px] font-bold leading-none tabular-nums text-foreground">
                                            +{recomendacao.velMax - recomendacao.velMin}
                                            <span className="text-[13px] font-medium text-muted"> Mbps</span>
                                        </span>
                                        <span className="font-mono text-[11px] tabular-nums text-faint">
                                            {recomendacao.velMin} → {recomendacao.velMax} Mbps
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* ── 3. Argumento de venda, copiável ── */}
                            {recomendacao.argumentoVenda && (
                                <div className="flex items-start gap-3 rounded-xl border border-l-[3px] border-border border-l-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-dark)]">
                                            Argumento de venda
                                        </span>
                                        <p className="text-[16px] font-medium leading-relaxed text-foreground">
                                            {recomendacao.argumentoVenda}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={copiarArgumento}
                                        title="Copiar argumento"
                                        aria-label="Copiar argumento de venda"
                                        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-[var(--accent-dark)] transition-colors hover:bg-[var(--accent-soft)]"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">content_copy</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 4. Diferenças — tabela no desktop ── */}
                    <div className="hidden sm:block">
                        <div className="grid items-end gap-x-4 gap-y-0" style={{ gridTemplateColumns: colunas }}>
                            <div />
                            {plans.map(plan => (
                                <div key={plan.id} className="min-w-0 pb-2" title={plan.descricao}>
                                    <div className="mb-1.5 flex flex-wrap gap-1">
                                        {(recomendacao?.badges[plan.id] || []).map(b => <Chip key={b.label} badge={b} />)}
                                    </div>
                                    <h4 className="truncate text-[15px] font-bold leading-tight text-foreground">
                                        {nomeCurtoPlano(plan)}
                                    </h4>
                                    <span className="truncate font-mono text-[10px] text-muted">IXC-{plan.id}</span>
                                </div>
                            ))}

                            {linhasDiferentes.map(linha => (
                                <React.Fragment key={linha.key}>
                                    <div className={`flex items-center border-t border-border-subtle py-3 ${LABEL}`}>
                                        {linha.label}
                                    </div>
                                    {plans.map(plan => {
                                        const venceu = linha.vence(plan);
                                        const t = TOM[linha.tom] || TOM.accent;
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`flex min-w-0 items-center gap-2 border-t border-border-subtle py-3 ${
                                                    linha.destaque ? 'font-mono text-[19px] font-bold tabular-nums' : 'text-[14px]'
                                                } ${venceu ? t.valor : 'text-foreground'}`}
                                            >
                                                <span className="truncate">{linha.texto(plan)}</span>
                                                {venceu && (
                                                    <span className="material-symbols-outlined shrink-0 text-[17px]">
                                                        {linha.tom === 'success' ? 'trending_down' : 'trending_up'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* ── 4b. Diferenças — blocos por característica no mobile ──
                        Attribute-major, não plan-major: os dois valores que estão
                        sendo comparados ficam na mesma fixação do olho. */}
                    <div className="flex flex-col gap-2 sm:hidden">
                        {linhasDiferentes.map(linha => (
                            <div key={linha.key} className="rounded-xl border border-border bg-surface p-3">
                                <span className={`mb-2 block ${LABEL}`}>{linha.label}</span>
                                <div className={`grid gap-2 ${plans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                    {plans.map(plan => {
                                        const venceu = linha.vence(plan);
                                        const t = TOM[linha.tom] || TOM.accent;
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`min-w-0 rounded-lg px-3 py-2 ${venceu ? t.anel : 'bg-surface-raised'}`}
                                            >
                                                <span className="mb-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                                                    {nomeCurtoPlano(plan)}
                                                </span>
                                                <span className={`block truncate font-mono text-[16px] font-bold tabular-nums ${venceu ? t.valor : 'text-foreground'}`}>
                                                    {linha.texto(plan)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 5. Iguais — colapsadas, fora do caminho ── */}
                    {linhasIguais.length > 0 && (
                        <details className="group mt-3 rounded-xl border border-border-subtle bg-surface-raised">
                            <summary className={`flex cursor-pointer list-none items-center gap-2 px-4 py-3 ${LABEL} hover:text-foreground`}>
                                <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90">
                                    chevron_right
                                </span>
                                {linhasIguais.length} {linhasIguais.length === 1 ? 'característica igual' : 'características iguais'} nos {plans.length} planos
                            </summary>
                            <div className="flex flex-col gap-2 px-4 pb-3">
                                {linhasIguais.map(linha => (
                                    <div key={linha.key} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                                        <span className={`shrink-0 sm:w-[140px] ${LABEL}`}>{linha.label}</span>
                                        <span className="min-w-0 text-[14px] text-faint">{linha.texto(plans[0])}</span>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>
        </section>
    );
}

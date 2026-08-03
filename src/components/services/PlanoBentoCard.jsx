import React from 'react';
import { GradientCard } from '../ui/gradient-card';
import {
    CATEGORIA,
    classificarPlano,
    parseVelocidade,
    formatarVelocidade,
    parseStreaming,
    isTopSeller as calcTopSeller,
    vendasRatio as calcVendasRatio,
} from '../../utils/planTaxonomy';

const MAX_STREAMING_CHIPS = 3;

export default function PlanoBentoCard({ plan, isAdmin, onEditClick, formatCurrency, maxVendas, isComparing = false, onToggleCompare, onSelect }) {
    const vendas = plan.vendas_mes || 0;
    const vendasRatio = calcVendasRatio(vendas, maxVendas);
    const isTopSeller = calcTopSeller(vendas, maxVendas);

    const categoria = classificarPlano(plan.descricao);
    const isPJ = categoria === CATEGORIA.PJ;
    const isLink = categoria === CATEGORIA.LINK;

    // A cor codifica apenas a categoria. "Mais vendido" vira sinal ortogonal
    // (estrela + ring), senão a informação PF/PJ se perde nos campeões de venda.
    const gradient = isLink ? 'orange' : isPJ ? 'green' : 'blue';
    const badgeColor = isLink ? '#D97706' : isPJ ? '#059669' : '#2563EB';
    const badgeText = isLink ? 'LINK DEDICADO' : isPJ ? 'INTERNET PJ' : 'INTERNET PF';
    const illustrationType = isLink ? 'link' : isPJ ? 'computer' : 'wifi';

    // Nomes de plano chegam com até ~70 caracteres. Em vez de truncar, rebaixa:
    // a velocidade vira o título e o nome completo vira subtítulo com clamp.
    const velocidade = parseVelocidade(plan.descricao);
    const title = formatarVelocidade(velocidade) || plan.descricao;
    const subtitle = velocidade ? plan.descricao : null;

    const streamings = parseStreaming(plan.descricao);
    const streamingsVisiveis = streamings.slice(0, MAX_STREAMING_CHIPS);
    const streamingsRestantes = streamings.length - streamingsVisiveis.length;

    // taxa_instalacao é texto livre no backend — vem tanto como 'Grátis'
    // quanto como '50'. Formata só quando for puramente numérico.
    const taxaRaw = String(plan.taxa_instalacao ?? '').trim();
    const taxa = taxaRaw === ''
        ? 'Grátis'
        : /^\d+([.,]\d+)?$/.test(taxaRaw)
            ? formatCurrency(taxaRaw.replace(',', '.'))
            : taxaRaw;

    const meta = [`Instalação ${taxa}`, plan.prazo_instalacao].filter(Boolean).join(' · ');

    return (
        <GradientCard
            gradient={gradient}
            badgeText={badgeText}
            badgeColor={badgeColor}
            title={title}
            subtitle={subtitle}
            ctaText="Ver detalhes"
            illustrationType={illustrationType}
            onClick={() => onSelect && onSelect(plan, 'plan')}
            className={`transition-all duration-300 ${isComparing ? 'ring-2 ring-[var(--accent)] shadow-lg' : ''}`}
            topRightContent={
                <div className="flex items-center gap-1.5">
                    {isTopSeller && (
                        <span
                            title="Entre os mais vendidos do mês"
                            className="inline-flex items-center gap-1 rounded-full bg-black/10 dark:bg-white/10 px-2 py-1 backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined text-[13px] font-bold">star</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Top</span>
                        </span>
                    )}
                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(plan);
                            }}
                            className="p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current transition-colors cursor-pointer"
                            title="Editar Plano"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                    )}
                </div>
            }
            // Sem handler, o botão de comparar não aparece — mesma convenção do
            // ServiceDetailModal. É assim que a flag COMPARADOR_PLANOS_ATIVO
            // chega até aqui sem o card precisar conhecê-la.
            footerRight={!onToggleCompare ? undefined : (
                <button
                    type="button"
                    onClick={() => onToggleCompare(plan.id)}
                    aria-pressed={isComparing}
                    title={isComparing ? 'Remover da comparação' : 'Adicionar à comparação'}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors cursor-pointer ${
                        isComparing ? 'bg-current/20 ring-1 ring-current/40' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20'
                    }`}
                >
                    <span className="material-symbols-outlined text-[14px] font-bold">
                        {isComparing ? 'check' : 'compare_arrows'}
                    </span>
                    {isComparing ? 'Comparando' : 'Comparar'}
                </button>
            )}
        >
            <div className="flex flex-col gap-2">
                {streamingsVisiveis.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                        {streamingsVisiveis.map(s => (
                            <span
                                key={s}
                                className="rounded-md bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur-md"
                            >
                                {s}
                            </span>
                        ))}
                        {streamingsRestantes > 0 && (
                            <span className="text-[10px] font-bold opacity-70">+{streamingsRestantes}</span>
                        )}
                    </div>
                )}

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {formatCurrency(plan.valor_mensal)}
                    </span>
                    <span className="text-xs font-semibold opacity-80">/mês</span>
                </div>

                {/* Prazos do IXC são longos ("Até 2 dias úteis (cidade), até 3
                    dias úteis (povoados)") — uma linha só, resto no title. */}
                <div className="truncate font-mono text-[10.5px] tracking-[0.04em] opacity-70" title={meta}>
                    {meta}
                </div>

                {vendas > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 max-w-[90px] overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                            <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${vendasRatio}%` }} />
                        </div>
                        <span className="font-mono text-[10.5px] font-semibold opacity-70">
                            {vendas} {vendas === 1 ? 'venda' : 'vendas'}
                        </span>
                    </div>
                )}
            </div>
        </GradientCard>
    );
}

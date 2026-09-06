import React, { useState, useEffect } from 'react';
import RankingPodium from './RankingPodium';
import { getDeterministicAvatar } from '../../utils/avatarPngs';

const RANKING_TABS = [
    { icon: 'workspace_premium', label: 'Planos' },
    { icon: 'group', label: 'Colaboradoras' },
    { icon: 'request_quote', label: 'Ticket Médio' },
];

function VendorIdentity({ vendor, isGold, rc }) {
    const foto = getDeterministicAvatar(vendor);
    const primeiroNome = (vendor.nome || '').trim().split(' ')[0];

    return (
        <>
            <div className="flex justify-center">
                <div className={`overflow-hidden rounded-full bg-white/15 ${isGold ? 'h-14 w-14' : 'h-10 w-10'}`}>
                    {foto ? (
                        <img src={foto} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white">
                            <span className={`material-symbols-outlined ${isGold ? 'text-xl' : 'text-base'}`}>person</span>
                        </div>
                    )}
                </div>
            </div>
            <h4 className={`truncate text-center font-extrabold leading-tight ${rc.titleColor} ${isGold ? 'mt-2 text-sm sm:text-base' : 'mt-1.5 text-xs sm:text-sm'}`} title={vendor.nome}>
                {primeiroNome}
            </h4>
            <p className={`text-center ${rc.subColor} ${isGold ? 'mt-1 text-[10px] sm:text-[11px]' : 'mt-0.5 text-[9px] sm:text-[10px]'}`}>Vendedora</p>
        </>
    );
}

export default function RankingsSection({ topPlans, topVendors, topTicket, loadingPlans, loadingRanking, formatCurrency }) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => setActiveSlide(prev => (prev === 2 ? 0 : prev + 1)), 3000);
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <div className="mt-8" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                        <span className="material-symbols-outlined text-[#C2410C]">emoji_events</span>
                        Rankings do Mês
                    </h2>
                    <p className="mt-0.5 text-xs text-muted sm:text-sm">Destaques de vendas da equipe — atualizado automaticamente</p>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {RANKING_TABS.map((tab, idx) => (
                        <button
                            key={tab.label}
                            type="button"
                            onClick={() => setActiveSlide(idx)}
                            aria-pressed={activeSlide === idx}
                            className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${
                                activeSlide === idx
                                    ? 'scale-[1.02] bg-gradient-to-r from-[#9A3412] to-[#EC7D23] text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)]'
                                    : 'bg-[#FFF7ED] text-[#9A3412] hover:bg-[#D6E9FF] dark:bg-[#9A3412]/20 dark:text-[#FDBA74] dark:hover:bg-[#9A3412]/30'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative overflow-hidden">
                <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                    <RankingPodium
                        title="Top 3 Planos"
                        items={topPlans}
                        isLoading={loadingPlans}
                        emptyIcon="wifi_off"
                        emptyText="Nenhuma venda de plano registrada."
                        getKey={(p) => `plan-${p.id}`}
                        metricLabel="Vendas"
                        getMetric={(p) => p.vendas_mes || 0}
                        metricFloor={10}
                        renderIdentity={(plan, isGold, rc) => (
                            <>
                                <h4 className={`truncate font-extrabold leading-tight ${rc.titleColor} ${isGold ? 'mt-1 text-sm sm:text-base' : 'text-xs sm:text-sm'}`} title={plan.descricao}>
                                    {plan.descricao}
                                </h4>
                                <p className={`${rc.subColor} ${isGold ? 'mt-1 text-[10px] sm:text-[11px]' : 'mt-0.5 text-[9px] sm:text-[10px]'}`}>Sincronizado via IXC</p>
                                <div className={`flex items-baseline gap-1 ${isGold ? 'mt-3 sm:mt-4' : 'mt-2 sm:mt-3'}`}>
                                    <span className={`font-extrabold ${rc.titleColor} ${isGold ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'}`}>
                                        {formatCurrency(plan.valor_mensal)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-[#E4ECF5]/70 sm:text-xs">/mês</span>
                                </div>
                            </>
                        )}
                    />

                    <RankingPodium
                        title="Top 3 Colaboradoras"
                        items={topVendors}
                        isLoading={loadingRanking}
                        emptyIcon="emoji_events"
                        emptyText="Nenhuma venda registrada."
                        getKey={(v) => `vendor-${v.id}`}
                        metricLabel="Vendas"
                        getMetric={(v) => v.vendas_mes || 0}
                        metricFloor={5}
                        renderIdentity={(vendor, isGold, rc) => <VendorIdentity vendor={vendor} isGold={isGold} rc={rc} />}
                    />

                    <RankingPodium
                        title="Top 3 Ticket Médio"
                        items={topTicket}
                        isLoading={loadingRanking}
                        emptyIcon="request_quote"
                        emptyText="Nenhum ticket médio registrado."
                        getKey={(v) => `ticket-${v.id}`}
                        metricLabel="Valor Médio"
                        getMetric={(v) => v.ticket_medio || 0}
                        formatMetric={formatCurrency}
                        metricFloor={50}
                        renderIdentity={(vendor, isGold, rc) => <VendorIdentity vendor={vendor} isGold={isGold} rc={rc} />}
                    />
                </div>
            </div>
        </div>
    );
}

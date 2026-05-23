import React from 'react';

export default function PlanoComparador({ plans = [], isOpen = false, onClear, formatCurrency }) {
    const parseValor = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? Infinity : num;
    };

    const minValor = plans.length > 0 ? Math.min(...plans.map(p => parseValor(p.valor_mensal))) : Infinity;
    const hasDifferentPrices = plans.length > 1 && new Set(plans.map(p => parseValor(p.valor_mensal))).size > 1;
    const isBestPrice = (plan) => hasDifferentPrices && parseValor(plan.valor_mensal) === minValor;

    const gridColsClass = plans.length === 2 ? 'grid-cols-3' : 'grid-cols-4';

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

                {/* Tabela de Comparação usando CSS Grid */}
                {plans.length >= 2 && (
                    <div className={`grid ${gridColsClass} gap-4 text-xs`}>
                        {/* Linha 1: Títulos / Nomes */}
                        <div className="flex items-center font-bold text-slate-400 dark:text-[#a09080] uppercase tracking-wider">
                            Característica
                        </div>
                        {plans.map((plan) => (
                            <div key={`name-${plan.id}`} className="p-3 bg-slate-50/50 dark:bg-[#211e1b]/30 rounded-xl border border-slate-100/50 dark:border-[#2e2a26]/20">
                                <h4 className="font-extrabold text-[#0B1B2E] dark:text-[#f5f0eb] text-sm leading-tight line-clamp-2">
                                    {plan.descricao}
                                </h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: IXC-{plan.id}</span>
                            </div>
                        ))}

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

                        {/* Linha 3: Taxa de Instalação */}
                        <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                            Taxa de Instalação
                        </div>
                        {plans.map((plan) => (
                            <div key={`tax-${plan.id}`} className="p-3 text-[#0B1B2E] dark:text-[#f5f0eb] border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center">
                                {plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'R$ 0,00'}
                            </div>
                        ))}

                        {/* Linha 4: Prazo de Entrega */}
                        <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-100 dark:border-[#2e2a26]/10">
                            Prazo de Entrega
                        </div>
                        {plans.map((plan) => (
                            <div key={`prazo-${plan.id}`} className="p-3 text-[#0B1B2E] dark:text-[#f5f0eb] border-b border-slate-100 dark:border-[#2e2a26]/10 flex items-center font-semibold">
                                {plan.prazo_instalacao || 'A consultar'}
                            </div>
                        ))}

                        {/* Linha 5: Streaming Inclusos */}
                        <div className="flex items-center font-bold text-slate-500 dark:text-slate-400 py-2">
                            Streaming Inclusos
                        </div>
                        {plans.map((plan) => (
                            <div key={`stream-${plan.id}`} className="p-3 text-slate-400 dark:text-slate-500 flex items-center font-medium">
                                —
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

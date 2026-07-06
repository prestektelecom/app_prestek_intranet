import React from 'react';

export default function PlanoBentoCard({ plan, isAdmin, onEditClick, formatCurrency, maxVendas, isComparing = false, onToggleCompare }) {
    const vendas = plan.vendas_mes || 0;
    const maxVendasLocal = Math.max(maxVendas, 10);
    const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);
    
    // Define if this plan is a top seller (e.g., in top 20% or simply high sales)
    const isTopSeller = vendas >= maxVendasLocal * 0.6 && vendas > 0;
    
    // Choose progress bar color matching Dashboard v2
    const barColor = isTopSeller 
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
        : vendasRatio >= 25 
            ? 'bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5]' 
            : 'bg-gradient-to-r from-amber-500 to-orange-400';

    return (
        <div 
            className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0B1B2E] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isComparing 
                ? 'border-[#4A9EF5] dark:border-[#4A9EF5] shadow-[0_8px_30px_rgba(74,158,245,0.12)] ring-2 ring-[#4A9EF5]/40'
                : isTopSeller 
                    ? 'border-[#4A9EF5] shadow-[0_8px_30px_rgba(74,158,245,0.12)] ring-1 ring-[#4A9EF5]/30' 
                    : 'border-[#E4ECF5] dark:border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(74,158,245,0.04)]'
            }`}
        >
            {/* Checkbox Comparar */}
            <div className="absolute top-3 left-4 z-10">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={isComparing} 
                        onChange={() => onToggleCompare(plan.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[var(--border)] text-[#4A9EF5] focus:ring-[#4A9EF5] dark:bg-[#0B1B2E] dark:focus:ring-offset-[#0B1B2E] cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Comparar</span>
                </label>
            </div>

            {/* Top seller badge decoration */}
            {isTopSeller && (
                <div className="absolute -top-3 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white text-[10px] font-extrabold tracking-wider shadow-md">
                    <span className="material-symbols-outlined text-[12px] font-bold">workspace_premium</span>
                    MAIS VENDIDO
                </div>
            )}

            <div>
                {/* Header info */}
                <div className="flex items-start gap-4 mb-4 mt-3">
                    <div className={`p-3 rounded-xl ${
                        isTopSeller 
                        ? 'bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8]' 
                        : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}>
                        <span className="material-symbols-outlined text-2xl">wifi</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#0B1B2E] dark:text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-[#4A9EF5]" title={plan.descricao}>
                            {plan.descricao}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">ID: IXC-{plan.id}</p>
                    </div>
                </div>

                {/* Pricing area */}
                <div className="flex items-baseline gap-1.5 mb-5 bg-[#F5F9FF] dark:bg-[#0B1B2E] p-3 rounded-xl border border-[#EAF4FF]/60 dark:border-[var(--border)]/40">
                    <span className="text-2xl font-black text-[#1F5BA8] dark:text-[#7FD4E8] tracking-tight">
                        {formatCurrency(plan.valor_mensal)}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500">/mês</span>
                </div>

                {/* Custom plan attributes */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                    <div className="bg-slate-50/50 dark:bg-[#0B1B2E]/30 p-2.5 rounded-lg border border-slate-100/50 dark:border-[var(--border)]/20">
                        <span className="block text-[10px] text-slate-400 dark:text-[#8896A8] font-bold uppercase tracking-wider mb-0.5">Taxa de Instalação</span>
                        <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">
                            {plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'R$ 0,00'}
                        </span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-[#0B1B2E]/30 p-2.5 rounded-lg border border-slate-100/50 dark:border-[var(--border)]/20">
                        <span className="block text-[10px] text-slate-400 dark:text-[#8896A8] font-bold uppercase tracking-wider mb-0.5">Prazo de Entrega</span>
                        <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">
                            {plan.prazo_instalacao || 'A consultar'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sales performance and actions */}
            <div className="border-t border-dashed border-[#E4ECF5] dark:border-[var(--border)] pt-4 mt-auto">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vendas no Mês</span>
                    <span className="text-xs font-black text-[#0B1B2E] dark:text-[var(--foreground)]">{vendas}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-[#0B1B2E] overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                            style={{ width: `${vendasRatio}%` }}
                        />
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => onEditClick(plan)}
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-[#EAF4FF] text-[#1F5BA8] hover:bg-[#4A9EF5] hover:text-white dark:bg-[#0B1B2E] dark:text-[#7FD4E8] dark:hover:bg-[#1F5BA8] dark:hover:text-white border border-[#EAF4FF] dark:border-[var(--border)] transition-all cursor-pointer"
                            title="Editar Plano"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

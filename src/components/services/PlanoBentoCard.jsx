import React from 'react';
import { GradientCard } from '../ui/gradient-card';

export default function PlanoBentoCard({ plan, isAdmin, onEditClick, formatCurrency, maxVendas, isComparing = false, onToggleCompare, onSelect }) {
    const vendas = plan.vendas_mes || 0;
    const maxVendasLocal = Math.max(maxVendas, 10);
    const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);
    
    const isTopSeller = vendas >= maxVendasLocal * 0.6 && vendas > 0;
    
    const desc = (plan.descricao || '').toUpperCase();
    const isPJ = desc.includes('PJ') || desc.includes('JURIDICA');
    const isLink = desc.includes('LINK');

    // Rich gradient matching the reference card style
    const gradient = isLink ? 'orange' : isPJ ? 'green' : isTopSeller ? 'blue' : 'gray';
    const badgeColor = isTopSeller ? '#10B981' : isLink ? '#D97706' : isPJ ? '#059669' : '#2563EB';
    const badgeText = isTopSeller ? 'MAIS VENDIDO' : isLink ? 'LINK DEDICADO' : isPJ ? 'INTERNET PJ' : 'INTERNET PF';
    const illustrationType = isLink ? 'company' : isPJ ? 'globe' : isTopSeller ? 'wifi' : 'wifi';

    return (
        <GradientCard
            gradient={gradient}
            badgeText={badgeText}
            badgeColor={badgeColor}
            title={plan.descricao}
            description={`Velocidade e estabilidade garantidas. R$ ${formatCurrency(plan.valor_mensal)}/mês com instalação ${plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'grátis'}.`}
            ctaText="Ver detalhes"
            illustrationType={illustrationType}
            onClick={() => onSelect && onSelect(plan, 'plan')}
            className={`transition-all duration-300 ${
                isComparing ? 'ring-2 ring-[#4A9EF5] shadow-lg shadow-[#4A9EF5]/30' : ''
            }`}
            topRightContent={
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md">
                        <input 
                            type="checkbox" 
                            checked={isComparing} 
                            onChange={(e) => {
                                e.stopPropagation();
                                onToggleCompare(plan.id);
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-[#4A9EF5] focus:ring-[#4A9EF5] cursor-pointer"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Comparar</span>
                    </label>
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
        >
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {formatCurrency(plan.valor_mensal)}
                    </span>
                    <span className="text-xs font-semibold opacity-80">/mês</span>
                </div>
            </div>
        </GradientCard>
    );
}

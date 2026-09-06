import React from 'react';
import { GradientCard } from '../ui/gradient-card';

export default function TechBentoCard({ service, isAdmin, onEditClick, onDeleteClick, onSelect }) {
    const isFree = service.isFree;
    const isSpecial = service.isSpecial;

    const badgeText = isFree ? 'GRÁTIS' : isSpecial ? 'INFORMATIVO' : 'SERVIÇO TÉCNICO';
    const badgeColor = isFree ? '#10B981' : isSpecial ? '#8B5CF6' : '#6366F1';

    return (
        <GradientCard
            gradient="purple"
            badgeText={badgeText}
            badgeColor={badgeColor}
            title={service.service}
            description={`Prazo: ${service.deadline || 'A consultar'}. Pagamento: ${service.payment || 'À vista ou boleto'}.`}
            ctaText="Ver detalhes"
            illustrationType="tool"
            onClick={() => onSelect && onSelect(service, 'tech')}
            topRightContent={
                isAdmin && (
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(service);
                            }}
                            className="p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current transition-colors cursor-pointer"
                            title="Editar Serviço"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(service.id);
                            }}
                            className="p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white text-current transition-colors cursor-pointer"
                            title="Excluir Serviço"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">delete</span>
                        </button>
                    </div>
                )
            }
        >
            <div className="flex items-center justify-between pt-2">
                {isFree ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/20 dark:bg-emerald-100/20 px-3 py-1 text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                        <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                        ISENTO DE COBRANÇA
                    </span>
                ) : (
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        {service.value}
                    </span>
                )}
            </div>
        </GradientCard>
    );
}

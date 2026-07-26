import React from 'react';
import { GradientCard } from '../ui/gradient-card';

export default function StreamingBentoCard({ service, isAdmin, onEditClick, onDeleteClick, onSelect }) {
    return (
        <GradientCard
            gradient="rose"
            badgeText="STREAMING & MÍDIA"
            badgeColor="#E11D48"
            title={service.service}
            description={`Pacote de entretenimento incluso ou adicional. Assinatura ${service.deadline || 'Mensal'}.`}
            ctaText="Ver detalhes"
            illustrationType="wifi"
            onClick={() => onSelect && onSelect(service, 'streaming')}
            topRightContent={
                isAdmin && (
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(service);
                            }}
                            className="p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current transition-colors cursor-pointer"
                            title="Editar Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(service.id);
                            }}
                            className="p-1.5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white text-current transition-colors cursor-pointer"
                            title="Excluir Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">delete</span>
                        </button>
                    </div>
                )
            }
        >
            <div className="flex items-baseline gap-1 pt-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight">
                    {service.value}
                </span>
                <span className="text-xs font-semibold opacity-80">
                    / {service.deadline || 'Mensal'}
                </span>
            </div>
        </GradientCard>
    );
}

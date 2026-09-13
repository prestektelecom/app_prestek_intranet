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
            illustrationType="play"
            onClick={() => onSelect && onSelect(service, 'streaming')}
            topRightContent={
                isAdmin && (
                    // gap-3 dá espaço para a expansão de toque de cada botão sem que as
                    // duas áreas invisíveis se sobreponham (ver design.md da Fase 10;
                    // verificado ao vivo com elementFromPoint no ponto médio do gap).
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(service);
                            }}
                            className="relative p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current transition-colors cursor-pointer after:absolute after:-inset-1.5 after:content-['']"
                            title="Editar Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(service.id);
                            }}
                            className="relative p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-red-500 hover:text-white text-current transition-colors cursor-pointer after:absolute after:-inset-1.5 after:content-['']"
                            title="Excluir Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">delete</span>
                        </button>
                    </div>
                )
            }
        >
            <div className="flex items-baseline gap-1 pt-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {service.value}
                </span>
                <span className="text-xs font-semibold opacity-80">
                    / {service.deadline || 'Mensal'}
                </span>
            </div>
        </GradientCard>
    );
}

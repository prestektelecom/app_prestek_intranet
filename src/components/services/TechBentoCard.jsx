import React from 'react';

export default function TechBentoCard({ service, isAdmin, onEditClick, onDeleteClick }) {
    const isFree = service.isFree;
    const isSpecial = service.isSpecial;

    return (
        <div className="bento-hover-border relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(74,158,245,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8]">
                        <span className="material-symbols-outlined text-2xl">{service.icon || 'build'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#0B1B2E] dark:text-[var(--foreground)] line-clamp-2 leading-snug" title={service.service}>
                            {service.service}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">ID: SERV-{service.id}</p>
                    </div>
                </div>

                {/* Preço / Valor */}
                <div className="flex items-center gap-1.5 mb-5 bg-[#F5F9FF] dark:bg-[#0B1B2E] p-3 rounded-xl border border-[#EAF4FF]/60 dark:border-[var(--border)]/40">
                    {isFree ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                            GRÁTIS
                        </span>
                    ) : isSpecial ? (
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">info</span>
                            {service.value}
                        </span>
                    ) : (
                        <span className="text-xl font-black text-[#1F5BA8] dark:text-[#7FD4E8] tracking-tight">
                            {service.value}
                        </span>
                    )}
                </div>

                {/* Atributos do Serviço */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-slate-50/50 dark:bg-[#0B1B2E]/30 p-2.5 rounded-lg border border-slate-100/50 dark:border-[var(--border)]/20">
                        <span className="block text-[10px] text-slate-400 dark:text-[#8896A8] font-bold uppercase tracking-wider mb-0.5">Prazo</span>
                        <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)] line-clamp-1">
                            {service.deadline || 'Não definido'}
                        </span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-[#0B1B2E]/30 p-2.5 rounded-lg border border-slate-100/50 dark:border-[var(--border)]/20">
                        <span className="block text-[10px] text-slate-400 dark:text-[#8896A8] font-bold uppercase tracking-wider mb-0.5">Pagamento</span>
                        <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)] line-clamp-1" title={service.payment || '-'}>
                            {service.payment || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="border-t border-dashed border-[#E4ECF5] dark:border-[var(--border)] pt-4 mt-auto">
                <div className="flex items-center justify-between">
                    {isAdmin ? (
                        <div className="flex items-center gap-2 w-full justify-end">
                            <button 
                                onClick={() => onEditClick(service)}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-[#EAF4FF] text-[#1F5BA8] hover:bg-[#4A9EF5] hover:text-white dark:bg-[#0B1B2E] dark:text-[#7FD4E8] dark:hover:bg-[#1F5BA8] dark:hover:text-white border border-[#EAF4FF] dark:border-[var(--border)] transition-all cursor-pointer"
                                title="Editar Serviço"
                            >
                                <span className="material-symbols-outlined text-sm font-bold">edit</span>
                            </button>
                            <button 
                                onClick={() => onDeleteClick(service.id)}
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-[#0B1B2E] dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white border border-red-100 dark:border-[var(--border)] transition-all cursor-pointer"
                                title="Excluir Serviço"
                            >
                                <span className="material-symbols-outlined text-sm font-bold">delete</span>
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => console.log('Solicitar: ' + service.service)}
                            className="flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">edit_document</span>
                            Solicitar Serviço
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

import React from 'react';

export default function StreamingBentoCard({ service, isAdmin, onEditClick, onDeleteClick }) {
    return (
        <div className="bento-hover-border relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(74,158,245,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8]">
                        <span className="material-symbols-outlined text-2xl">{service.icon || 'play_circle'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-[#0B1B2E] dark:text-[var(--foreground)] line-clamp-2 leading-snug" title={service.service}>
                            {service.service}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">ID: STRM-{service.id}</p>
                    </div>
                </div>

                {/* Preço / Valor */}
                <div className="flex items-baseline gap-1.5 mb-5 bg-[#F5F9FF] dark:bg-[#0B1B2E] p-3 rounded-xl border border-[#EAF4FF]/60 dark:border-[var(--border)]/40">
                    <span className="text-xl font-black text-[#1F5BA8] dark:text-[#7FD4E8] tracking-tight">
                        {service.value}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">/ {service.deadline || 'Mensal'}</span>
                </div>
            </div>

            {/* Ações */}
            {isAdmin && (
                <div className="border-t border-dashed border-[#E4ECF5] dark:border-[var(--border)] pt-4 mt-auto">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => onEditClick(service)}
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-[#EAF4FF] text-[#1F5BA8] hover:bg-[#4A9EF5] hover:text-white dark:bg-[#0B1B2E] dark:text-[#7FD4E8] dark:hover:bg-[#1F5BA8] dark:hover:text-white border border-[#EAF4FF] dark:border-[var(--border)] transition-all cursor-pointer"
                            title="Editar Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">edit</span>
                        </button>
                        <button 
                            onClick={() => onDeleteClick(service.id)}
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-[#0B1B2E] dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white border border-red-100 dark:border-[var(--border)] transition-all cursor-pointer"
                            title="Excluir Pacote"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">delete</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

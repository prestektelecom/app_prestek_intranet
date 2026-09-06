import { cn } from '../../lib/utils';

export function formatarDataPlantao(val) {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function formatarDataHoraAlteracao(val) {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleString('pt-BR');
}

export function DiffBadge({ anterior, novo, label }) {
    const mudou = anterior !== novo;
    if (!mudou && !anterior && !novo) return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--ink2)]">{label}</span>
            {mudou ? (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="bg-[var(--danger-soft)] text-[var(--danger-bento)] px-2 py-0.5 rounded-md line-through font-medium">
                        {anterior || '—'}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[var(--ink2)]">arrow_forward</span>
                    <span className="bg-[var(--success-soft)] text-[var(--success-bento)] px-2 py-0.5 rounded-md font-bold">
                        {novo || '—'}
                    </span>
                </div>
            ) : (
                <span className="text-xs text-[var(--ink2)] font-medium">{novo || '—'} <span className="opacity-50">(sem alteração)</span></span>
            )}
        </div>
    );
}

export function HistoricoColumnHeader() {
    return (
        <div className="hidden md:grid grid-cols-[1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 bg-[var(--surface-soft)] border-b border-[var(--line)] text-[10px] font-extrabold text-[var(--ink2)] uppercase tracking-widest">
            <div>Data do Plantão</div>
            <div>Alterado por</div>
            <div>Quando</div>
            <div>Detalhes</div>
        </div>
    );
}

export function HistoricoSkeleton({ rows = 6 }) {
    return (
        <div className="flex flex-col divide-y divide-[var(--line)]/40">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                    <div className="h-4 bg-[var(--line)] rounded w-24" />
                    <div className="h-4 bg-[var(--line)] rounded w-32 ml-4" />
                    <div className="h-4 bg-[var(--line)] rounded w-40 ml-4" />
                </div>
            ))}
        </div>
    );
}

export function HistoricoEmptyState({ title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="material-symbols-outlined text-5xl text-[var(--muted-bento)]/40">history</span>
            <div className="text-center">
                <p className="font-extrabold text-[var(--ink)] text-base">{title}</p>
                <p className="text-[var(--ink2)] text-sm mt-1">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function HistoricoRows({ historico, expandido, onToggle }) {
    return (
        <div className="flex flex-col divide-y divide-[var(--line)]/40">
            {historico.map((h) => {
                const isOpen = expandido === h.id;
                const temAlteracao = (h.n1_anterior !== h.n1_novo) || (h.n2_anterior !== h.n2_novo) || (h.gerente_anterior !== h.gerente_novo);
                return (
                    <div key={h.id} className="flex flex-col">
                        <button
                            type="button"
                            onClick={() => onToggle(h.id)}
                            aria-expanded={isOpen}
                            className={cn(
                                'w-full flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 md:gap-4 px-6 py-4 text-left hover:bg-[var(--surface-soft)] transition-colors',
                                isOpen && 'bg-[var(--surface-soft)]/60'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span className={cn('w-2 h-2 rounded-full shrink-0', temAlteracao ? 'bg-[var(--warning-bento)]' : 'bg-[var(--line)]')} />
                                <span className="text-sm font-extrabold text-[var(--ink)]">
                                    {formatarDataPlantao(h.plantao_data)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 pl-4 md:pl-0">
                                <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent-dark)] flex items-center justify-center text-xs font-extrabold shrink-0">
                                    {(h.admin_nome || '?').charAt(0).toUpperCase()}
                                </div>
                                <span
                                    className="text-sm text-[var(--ink)] font-medium truncate max-w-[180px]"
                                    title={h.admin_nome || undefined}
                                >
                                    {h.admin_nome || '—'}
                                </span>
                            </div>
                            <div className="pl-4 md:pl-0">
                                <span className="text-sm text-[var(--ink2)] font-medium">{formatarDataHoraAlteracao(h.alterado_em)}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 pl-4 md:pl-0">
                                <span className={cn(
                                    'text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full',
                                    temAlteracao ? 'bg-[var(--warning-soft)] text-[var(--warning-strong)]' : 'bg-[var(--surface-soft)] text-[var(--ink2)]'
                                )}>
                                    {temAlteracao ? 'Alterado' : 'Sem mudança'}
                                </span>
                                <span className={cn(
                                    'material-symbols-outlined text-[18px] text-[var(--ink2)] ml-1 transition-transform duration-200',
                                    isOpen && 'rotate-180'
                                )}>
                                    expand_more
                                </span>
                            </div>
                        </button>

                        {isOpen && (
                            <div className="px-6 pb-5 pt-1 bg-[var(--surface-soft)]/50 border-t border-[var(--line)]/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                    <DiffBadge label="N1 — Atendimento / NOC" anterior={h.n1_anterior} novo={h.n1_novo} />
                                    <DiffBadge label="N2 — Suporte / Serviços" anterior={h.n2_anterior} novo={h.n2_novo} />
                                    <DiffBadge label="Supervisão" anterior={h.gerente_anterior} novo={h.gerente_novo} />
                                </div>
                                {!temAlteracao && (
                                    <p className="text-xs text-[var(--ink2)] mt-3 italic">Nenhuma diferença detectada nos campos N1, N2 e Supervisão.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

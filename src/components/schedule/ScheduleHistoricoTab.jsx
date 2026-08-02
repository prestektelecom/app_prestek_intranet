import { useState, useEffect, useCallback } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';

const LIMITE = 20;

function DiffBadge({ anterior, novo, label }) {
    const mudou = anterior !== novo;
    if (!mudou && !anterior && !novo) return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#475467]">{label}</span>
            {mudou ? (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="bg-[var(--danger-soft)] text-[var(--danger-bento)] px-2 py-0.5 rounded-md line-through font-medium">
                        {anterior || '—'}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[#475467]">arrow_forward</span>
                    <span className="bg-[var(--success-soft)] text-[var(--success-bento)] px-2 py-0.5 rounded-md font-bold">
                        {novo || '—'}
                    </span>
                </div>
            ) : (
                <span className="text-xs text-[#475467] font-medium">{novo || '—'} <span className="opacity-50">(sem alteração)</span></span>
            )}
        </div>
    );
}

export default function ScheduleHistoricoTab({ filterMonth, filterYear, user, onViewFullAudit }) {
    const C = useBentoTheme();
    const [historico, setHistorico] = useState([]);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [expandido, setExpandido] = useState(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        setExpandido(null);
        try {
            const params = new URLSearchParams({ mes: filterMonth, ano: filterYear, pagina: 1, limite: LIMITE });
            const res = await fetch(`/api/plantoes/historico?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao carregar histórico.');
            setHistorico(data.historico || []);
            setTotal(data.total || 0);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [filterMonth, filterYear]);

    useEffect(() => { carregar(); }, [carregar]);

    const formatarData = (val) => {
        if (!val) return '—';
        const d = new Date(val);
        return isNaN(d) ? val : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const formatarDateTime = (val) => {
        if (!val) return '—';
        const d = new Date(val);
        return isNaN(d) ? val : d.toLocaleString('pt-BR');
    };

    const toggleExpandido = (id) => setExpandido(prev => prev === id ? null : id);

    const monthLabel = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-[#0B1B2E] tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#C2410C] text-[22px]">history</span>
                        Alterações Recentes
                    </h2>
                    <p className="text-sm text-[#475467] font-medium mt-0.5">
                        Últimas {LIMITE} alterações na escala de <span className="capitalize">{monthLabel}</span>
                        {total > LIMITE && (
                            <span className="ml-1 text-[#475467]/70">({total} no total)</span>
                        )}
                    </p>
                </div>
                {user?.is_admin && onViewFullAudit && (
                    <button
                        onClick={onViewFullAudit}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#E4ECF5] text-[#0B1B2E] font-bold shadow-sm hover:bg-[#F7FAFD] transition-colors text-sm self-start sm:self-auto"
                    >
                        <span className="material-symbols-outlined text-[18px]">manage_history</span>
                        Auditoria Completa
                    </button>
                )}
            </div>

            {/* Error */}
            {erro && (
                <div className="p-4 rounded-xl border border-[#E84545]/20 bg-[var(--danger-soft)] text-[var(--danger-bento)] text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {erro}
                    <button onClick={carregar} className="ml-auto underline hover:no-underline font-bold text-sm">Tentar novamente</button>
                </div>
            )}

            {/* Table card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-[#E4ECF5]">
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 bg-[#F7FAFD] border-b border-[#E4ECF5] text-[10px] font-black text-[#475467] uppercase tracking-widest">
                    <div>Data do Plantão</div>
                    <div>Alterado por</div>
                    <div>Quando</div>
                    <div>Detalhes</div>
                </div>

                {carregando ? (
                    <div className="flex flex-col divide-y divide-[#E4ECF5]/40">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                                <div className="h-4 bg-[#E4ECF5] rounded w-24" />
                                <div className="h-4 bg-[#E4ECF5] rounded w-32 ml-4" />
                                <div className="h-4 bg-[#E4ECF5] rounded w-40 ml-4" />
                            </div>
                        ))}
                    </div>
                ) : historico.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <span className="material-symbols-outlined text-5xl text-[#8896A8]/40">history</span>
                        <div className="text-center">
                            <p className="font-black text-[#0B1B2E] text-base">Nenhuma alteração encontrada</p>
                            <p className="text-[#475467] text-sm mt-1">Não há mudanças registradas na escala de <span className="capitalize">{monthLabel}</span>.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-[#E4ECF5]/40">
                        {historico.map((h) => {
                            const isOpen = expandido === h.id;
                            const temAlteracao = (h.n1_anterior !== h.n1_novo) || (h.n2_anterior !== h.n2_novo) || (h.gerente_anterior !== h.gerente_novo);
                            return (
                                <div key={h.id} className="flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => toggleExpandido(h.id)}
                                        className={`w-full flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 md:gap-4 px-6 py-4 text-left hover:bg-[#F7FAFD] transition-colors ${isOpen ? 'bg-[#F7FAFD]/60' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${temAlteracao ? 'bg-[#D97706]' : 'bg-[#E4ECF5]'}`} />
                                            <span className="text-sm font-black text-[#0B1B2E]">
                                                {formatarData(h.plantao_data)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-4 md:pl-0">
                                            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center text-xs font-black shrink-0">
                                                {(h.admin_nome || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-[#0B1B2E] font-medium truncate max-w-[180px]">{h.admin_nome || '—'}</span>
                                        </div>
                                        <div className="pl-4 md:pl-0">
                                            <span className="text-sm text-[#475467] font-medium">{formatarDateTime(h.alterado_em)}</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 pl-4 md:pl-0">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${temAlteracao ? 'bg-[var(--warning-soft)] text-[var(--warning-bento)]' : 'bg-[var(--surface-soft)] text-[var(--ink2)]'}`}>
                                                {temAlteracao ? 'Alterado' : 'Sem mudança'}
                                            </span>
                                            <span
                                                className="material-symbols-outlined text-[18px] text-[#475467] ml-1 transition-transform duration-200"
                                                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                expand_more
                                            </span>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 pb-5 pt-1 bg-[#F7FAFD]/50 border-t border-[#E4ECF5]/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                                <DiffBadge label="N1 — Atendimento / NOC" anterior={h.n1_anterior} novo={h.n1_novo} />
                                                <DiffBadge label="N2 — Suporte / Serviços" anterior={h.n2_anterior} novo={h.n2_novo} />
                                                <DiffBadge label="Supervisão" anterior={h.gerente_anterior} novo={h.gerente_novo} />
                                            </div>
                                            {!temAlteracao && (
                                                <p className="text-xs text-[#475467] mt-3 italic">Nenhuma diferença detectada nos campos N1, N2 e Supervisão.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer note when there are more records */}
                {!carregando && total > LIMITE && (
                    <div className="px-6 py-3 border-t border-[#E4ECF5]/50 bg-[#F7FAFD]/30 text-center text-xs text-[#475467] font-bold">
                        Exibindo as {LIMITE} alterações mais recentes de {total} no total.
                        {user?.is_admin && onViewFullAudit && (
                            <button onClick={onViewFullAudit} className="ml-1 text-[#C2410C] hover:underline">Ver todas na auditoria completa.</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
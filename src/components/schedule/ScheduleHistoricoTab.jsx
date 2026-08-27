import { useState, useEffect, useCallback } from 'react';
import { HistoricoColumnHeader, HistoricoSkeleton, HistoricoEmptyState, HistoricoRows } from './HistoricoList';

const LIMITE = 20;

export default function ScheduleHistoricoTab({ filterMonth, filterYear, user, onViewFullAudit }) {
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

    const toggleExpandido = (id) => setExpandido(prev => prev === id ? null : id);

    const monthLabel = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-[var(--ink)] tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-[var(--accent-dark)] text-[22px]">history</span>
                        Alterações Recentes
                    </h2>
                    <p className="text-sm text-[var(--ink2)] font-medium mt-0.5">
                        Últimas {LIMITE} alterações na escala de <span className="capitalize">{monthLabel}</span>
                        {total > LIMITE && (
                            <span className="ml-1 text-[var(--ink2)]/70">({total} no total)</span>
                        )}
                    </p>
                </div>
                {user?.is_admin && onViewFullAudit && (
                    <button
                        onClick={onViewFullAudit}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-bold shadow-sm hover:bg-[var(--surface-soft)] transition-colors text-sm self-start sm:self-auto"
                    >
                        <span className="material-symbols-outlined text-[18px]">manage_history</span>
                        Auditoria Completa
                    </button>
                )}
            </div>

            {/* Error */}
            {erro && (
                <div className="p-4 rounded-xl border border-[var(--danger-bento)]/20 bg-[var(--danger-soft)] text-[var(--danger-strong)] text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {erro}
                    <button onClick={carregar} className="ml-auto underline hover:no-underline font-bold text-sm">Tentar novamente</button>
                </div>
            )}

            {/* Table card */}
            <div className="bg-[var(--surface)] rounded-3xl shadow-sm overflow-hidden border border-[var(--line)]">
                <HistoricoColumnHeader />

                {carregando ? (
                    <HistoricoSkeleton rows={6} />
                ) : historico.length === 0 ? (
                    <HistoricoEmptyState
                        title="Nenhuma alteração encontrada"
                        description={<>Não há mudanças registradas na escala de <span className="capitalize">{monthLabel}</span>.</>}
                    />
                ) : (
                    <HistoricoRows historico={historico} expandido={expandido} onToggle={toggleExpandido} />
                )}

                {/* Footer note when there are more records */}
                {!carregando && total > LIMITE && (
                    <div className="px-6 py-3 border-t border-[var(--line)]/50 bg-[var(--surface-soft)]/30 text-center text-xs text-[var(--ink2)] font-bold">
                        Exibindo as {LIMITE} alterações mais recentes de {total} no total.
                        {user?.is_admin && onViewFullAudit && (
                            <button onClick={onViewFullAudit} className="ml-1 text-[var(--accent-dark)] hover:underline">Ver todas na auditoria completa.</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

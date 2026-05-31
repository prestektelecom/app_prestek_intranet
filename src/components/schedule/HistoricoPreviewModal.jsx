import React, { useState, useEffect, useCallback } from 'react';
import { handleExportarHistoricoCSV } from '../../services/exportService';

const SERVER_PAGE_SIZE = 50;

export default function HistoricoPreviewModal({ isOpen, onClose, filterMonth, filterYear, user, showToast }) {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const adminEmail = user?.email || '';

    const fetchPage = useCallback(async (pageNum) => {
        setLoading(true);
        setErro('');
        try {
            const params = new URLSearchParams({
                mes: filterMonth,
                ano: filterYear,
                pagina: pageNum,
                limite: SERVER_PAGE_SIZE,
            });
            const headers = adminEmail ? { 'x-admin-email': adminEmail } : {};
            const res = await fetch(`/api/plantoes/historico?${params}`, { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao buscar histórico');
            setRows(data.historico || []);
            setTotal(data.total ?? 0);
        } catch (err) {
            setErro('Não foi possível carregar o histórico. Tente novamente.');
            console.error('Erro ao carregar histórico:', err);
        } finally {
            setLoading(false);
        }
    }, [filterMonth, filterYear, adminEmail]);

    useEffect(() => {
        if (!isOpen) return;
        setRows([]);
        setTotal(0);
        setErro('');
        setPage(1);
        fetchPage(1);
    }, [isOpen, filterMonth, filterYear]);

    const goToPage = (p) => {
        setPage(p);
        fetchPage(p);
    };

    const monthLabel = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const totalPages = Math.max(1, Math.ceil(total / SERVER_PAGE_SIZE));

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high flex flex-col w-full max-w-6xl max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">manage_history</span>
                        <div>
                            <h2 className="text-base font-black text-on-surface leading-tight">Histórico de Alterações</h2>
                            <p className="text-[11px] text-secondary font-medium capitalize">{monthLabel}</p>
                        </div>
                        {!loading && total > 0 && (
                            <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
                                {total} registro{total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleExportarHistoricoCSV(filterMonth, filterYear, showToast, adminEmail)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:brightness-110 transition-colors shadow-md shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Exportar CSV
                        </button>
                        <button
                            onClick={onClose}
                            className="text-secondary hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto min-h-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary">
                            <span className="material-symbols-outlined text-[40px] animate-spin">progress_activity</span>
                            <span className="text-sm font-medium">Carregando histórico...</span>
                        </div>
                    ) : erro ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16">
                            <span className="material-symbols-outlined text-[40px] text-red-400">error</span>
                            <p className="text-sm text-red-500 font-medium">{erro}</p>
                            <button
                                onClick={() => fetchPage(page)}
                                className="text-sm text-primary font-bold hover:underline"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary">
                            <span className="material-symbols-outlined text-[40px]">history_toggle_off</span>
                            <p className="text-sm font-medium">Nenhum registro de histórico neste período.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-10 bg-surface-container-low border-b border-surface-container-high">
                                <tr>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">Data</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">Alterado Por</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">Momento</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">N1 Anterior</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">N1 Novo</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">N2 Anterior</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">N2 Novo</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">Sup. Anterior</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-secondary whitespace-nowrap">Sup. Novo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((h, idx) => {
                                    const plantaoData = h.plantao_data
                                        ? new Date(h.plantao_data + 'T12:00:00').toLocaleDateString('pt-BR')
                                        : '—';
                                    const alteradoEm = h.alterado_em
                                        ? new Date(h.alterado_em).toLocaleString('pt-BR', {
                                            timeZone: 'America/Sao_Paulo',
                                            day: '2-digit', month: '2-digit', year: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : '—';
                                    return (
                                        <tr
                                            key={h.id}
                                            className={`border-b border-surface-container-high/50 hover:bg-primary/5 transition-colors ${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/30'}`}
                                        >
                                            <td className="px-3 py-2.5 font-bold text-on-surface whitespace-nowrap">{plantaoData}</td>
                                            <td className="px-3 py-2.5 text-on-surface whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[13px] text-primary">manage_accounts</span>
                                                    <span className="font-medium">{h.admin_nome || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-secondary whitespace-nowrap text-[12px]">{alteradoEm}</td>
                                            <td className="px-3 py-2.5 text-secondary/80 text-[12px]">
                                                <span className={h.n1_anterior ? 'line-through opacity-60' : 'opacity-40 italic'}>{h.n1_anterior || '—'}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-on-surface font-medium text-[12px]">{h.n1_novo || '—'}</td>
                                            <td className="px-3 py-2.5 text-secondary/80 text-[12px]">
                                                <span className={h.n2_anterior ? 'line-through opacity-60' : 'opacity-40 italic'}>{h.n2_anterior || '—'}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-on-surface font-medium text-[12px]">{h.n2_novo || '—'}</td>
                                            <td className="px-3 py-2.5 text-secondary/80 text-[12px]">
                                                <span className={h.gerente_anterior ? 'line-through opacity-60' : 'opacity-40 italic'}>{h.gerente_anterior || '—'}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-on-surface font-medium text-[12px]">{h.gerente_novo || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination footer */}
                {!loading && !erro && total > 0 && (
                    <div className="shrink-0 px-5 py-3 border-t border-surface-container-high bg-surface-container-low rounded-b-2xl flex items-center justify-between gap-4">
                        <p className="text-[12px] text-secondary font-medium">
                            {total <= SERVER_PAGE_SIZE
                                ? `${total} registro${total !== 1 ? 's' : ''} no total`
                                : `Mostrando ${((page - 1) * SERVER_PAGE_SIZE) + 1}–${Math.min(page * SERVER_PAGE_SIZE, total)} de ${total}`
                            }
                        </p>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Primeira página"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-secondary">first_page</span>
                                </button>
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Página anterior"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-secondary">chevron_left</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...' ? (
                                            <span key={`e-${i}`} className="px-1 text-secondary text-[12px]">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => goToPage(p)}
                                                className={`w-7 h-7 rounded-lg text-[12px] font-bold transition-colors ${p === page ? 'bg-primary text-white shadow-sm' : 'hover:bg-surface-container-high text-secondary'}`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )
                                }
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Próxima página"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Última página"
                                >
                                    <span className="material-symbols-outlined text-[16px] text-secondary">last_page</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

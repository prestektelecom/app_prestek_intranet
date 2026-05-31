import { useState, useEffect, useCallback } from 'react';

const LIMITE = 50;

function DiffBadge({ anterior, novo, label }) {
    const mudou = anterior !== novo;
    if (!mudou && !anterior && !novo) return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{label}</span>
            {mudou ? (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md line-through font-medium">
                        {anterior || '—'}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-secondary">arrow_forward</span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                        {novo || '—'}
                    </span>
                </div>
            ) : (
                <span className="text-xs text-secondary font-medium">{novo || '—'} <span className="text-faint">(sem alteração)</span></span>
            )}
        </div>
    );
}

export default function PlantaoHistorico({ setCurrentView, user }) {
    const [historico, setHistorico] = useState([]);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [pagina, setPagina] = useState(1);

    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroAdmin, setFiltroAdmin] = useState('');
    const [filtroAdminAplicado, setFiltroAdminAplicado] = useState('');
    const [expandido, setExpandido] = useState(null);

    const adminEmail = user?.email || '';

    const carregar = useCallback(async (p = 1, dataInicio = filtroDataInicio, dataFim = filtroDataFim, admin = filtroAdminAplicado) => {
        setCarregando(true);
        setErro(null);
        try {
            const params = new URLSearchParams({ pagina: p, limite: LIMITE });
            if (dataInicio) params.set('data_inicio', dataInicio);
            if (dataFim) params.set('data_fim', dataFim);
            if (admin) params.set('admin_nome', admin);
            const res = await fetch(`/api/plantoes/historico?${params}`, {
                headers: adminEmail ? { 'x-admin-email': adminEmail } : {},
            });
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao carregar histórico.');
            setHistorico(data.historico || []);
            setTotal(data.total || 0);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [filtroDataInicio, filtroDataFim, filtroAdminAplicado]);

    useEffect(() => { carregar(pagina); }, [carregar, pagina]);

    const aplicarFiltros = (e) => {
        e.preventDefault();
        setFiltroAdminAplicado(filtroAdmin);
        setPagina(1);
        carregar(1, filtroDataInicio, filtroDataFim, filtroAdmin);
    };

    const limparFiltros = () => {
        setFiltroDataInicio('');
        setFiltroDataFim('');
        setFiltroAdmin('');
        setFiltroAdminAplicado('');
        setPagina(1);
        carregar(1, '', '', '');
    };

    const totalPaginas = Math.ceil(total / LIMITE);

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

    const filtrosAtivos = filtroAdmin !== '' || filtroAdminAplicado !== ''
        || filtroDataInicio !== ''
        || filtroDataFim !== '';

    const [exportando, setExportando] = useState(false);

    const exportarCSV = async () => {
        setExportando(true);
        try {
            const params = new URLSearchParams();
            if (filtroDataInicio) params.set('data_inicio', filtroDataInicio);
            if (filtroDataFim) params.set('data_fim', filtroDataFim);
            if (filtroAdminAplicado) params.set('admin_nome', filtroAdminAplicado);
            const res = await fetch(`/api/plantoes/historico/export?${params}`, {
                headers: adminEmail ? { 'x-admin-email': adminEmail } : {},
            });
            if (!res.ok) throw new Error('Erro ao exportar');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const cd = res.headers.get('Content-Disposition') || '';
            const match = cd.match(/filename="?([^"]+)"?/);
            a.download = match ? match[1] : 'historico_plantoes.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        } finally {
            setExportando(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="flex-1 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">Histórico de Plantões</h1>
                            <p className="text-secondary font-medium mt-1">Auditoria completa de todas as alterações realizadas na escala.</p>
                        </div>
                        <button
                            onClick={() => setCurrentView?.('schedule')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-bold shadow-sm hover:bg-surface-container-low transition-colors self-start md:self-auto"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            Voltar à Escala
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <form
                    onSubmit={aplicarFiltros}
                    className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-surface-container-high/50 flex flex-wrap gap-4 items-end"
                >
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Data início</span>
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={e => setFiltroDataInicio(e.target.value)}
                            className="bg-surface-container-low border border-transparent rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Data fim</span>
                        <input
                            type="date"
                            value={filtroDataFim}
                            onChange={e => setFiltroDataFim(e.target.value)}
                            className="bg-surface-container-low border border-transparent rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Admin</span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                value={filtroAdmin}
                                onChange={e => setFiltroAdmin(e.target.value)}
                                className="bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-10 pr-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold placeholder-secondary/50 transition-all w-52"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                            Filtrar
                        </button>
                        {filtrosAtivos && (
                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-container-high text-secondary font-bold hover:bg-surface-container-low transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                                Limpar
                            </button>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-secondary font-bold">
                            {carregando ? 'Carregando...' : `${total} registro${total !== 1 ? 's' : ''}`}
                        </span>
                        <button
                            type="button"
                            onClick={exportarCSV}
                            disabled={exportando || carregando || total === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-500/60 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {exportando ? 'hourglass_empty' : 'download'}
                            </span>
                            {exportando ? 'Exportando...' : 'Exportar CSV'}
                        </button>
                    </div>
                </form>

                {/* Error state */}
                {erro && (
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {erro}
                    </div>
                )}

                {/* Table */}
                <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden border border-surface-container-high/50">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[1fr_1fr_1.5fr_auto] gap-4 px-6 py-3 bg-surface-container-low/50 border-b border-surface-container-high/50 text-[10px] font-black text-secondary uppercase tracking-widest">
                        <div>Data do Plantão</div>
                        <div>Alterado por</div>
                        <div>Quando</div>
                        <div>Detalhes</div>
                    </div>

                    {carregando ? (
                        <div className="flex flex-col divide-y divide-surface-container-high/40">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex gap-4 px-6 py-4 animate-pulse">
                                    <div className="h-4 bg-surface-container-high rounded w-24" />
                                    <div className="h-4 bg-surface-container-high rounded w-32 ml-4" />
                                    <div className="h-4 bg-surface-container-high rounded w-40 ml-4" />
                                </div>
                            ))}
                        </div>
                    ) : historico.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <span className="material-symbols-outlined text-5xl text-secondary/40">history</span>
                            <div className="text-center">
                                <p className="font-black text-on-surface text-base">Nenhum registro encontrado</p>
                                <p className="text-secondary text-sm mt-1">Não há alterações registradas para os filtros selecionados.</p>
                            </div>
                            {filtrosAtivos && (
                                <button
                                    onClick={limparFiltros}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-surface-container-high/40">
                            {historico.map((h) => {
                                const isOpen = expandido === h.id;
                                const temAlteracao = (h.n1_anterior !== h.n1_novo) || (h.n2_anterior !== h.n2_novo) || (h.gerente_anterior !== h.gerente_novo);
                                return (
                                    <div key={h.id} className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpandido(h.id)}
                                            className={`w-full flex flex-col md:grid md:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 md:gap-4 px-6 py-4 text-left hover:bg-surface-container-low/60 transition-colors ${isOpen ? 'bg-surface-container-low/40' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${temAlteracao ? 'bg-amber-400' : 'bg-surface-container-high'}`} />
                                                <span className="text-sm font-black text-on-surface">
                                                    {formatarData(h.plantao_data)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pl-4 md:pl-0">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                                                    {(h.admin_nome || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-on-surface font-medium truncate max-w-[180px]">{h.admin_nome || '—'}</span>
                                            </div>
                                            <div className="pl-4 md:pl-0">
                                                <span className="text-sm text-secondary font-medium">{formatarDateTime(h.alterado_em)}</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-1 pl-4 md:pl-0">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${temAlteracao ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-surface-container-high text-secondary'}`}>
                                                    {temAlteracao ? 'Alterado' : 'Sem mudança'}
                                                </span>
                                                <span className="material-symbols-outlined text-[18px] text-secondary ml-1 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                    expand_more
                                                </span>
                                            </div>
                                        </button>

                                        {/* Expandable detail row */}
                                        {isOpen && (
                                            <div className="px-6 pb-5 pt-1 bg-surface-container-low/30 border-t border-surface-container-high/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                                    <DiffBadge
                                                        label="N1 — Atendimento / NOC"
                                                        anterior={h.n1_anterior}
                                                        novo={h.n1_novo}
                                                    />
                                                    <DiffBadge
                                                        label="N2 — Suporte / Serviços"
                                                        anterior={h.n2_anterior}
                                                        novo={h.n2_novo}
                                                    />
                                                    <DiffBadge
                                                        label="Supervisão"
                                                        anterior={h.gerente_anterior}
                                                        novo={h.gerente_novo}
                                                    />
                                                </div>
                                                {!temAlteracao && (
                                                    <p className="text-xs text-secondary mt-3 italic">Nenhuma diferença detectada nos campos N1, N2 e Supervisão.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-container-high/50 bg-surface-container-low/30">
                            <button
                                disabled={pagina === 1 || carregando}
                                onClick={() => setPagina(p => p - 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-surface-container-high text-sm font-bold text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                Anterior
                            </button>
                            <span className="text-xs font-bold text-secondary">
                                Página {pagina} de {totalPaginas} · {total} registros
                            </span>
                            <button
                                disabled={pagina === totalPaginas || carregando}
                                onClick={() => setPagina(p => p + 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-surface-container-high text-sm font-bold text-secondary hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Próxima
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-4 pt-8 border-t border-surface-container-high pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-secondary font-bold gap-4 uppercase tracking-widest">
                    <p>© 2026 Prestek Intranet • Portal Interno</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Políticas</a>
                        <a className="hover:text-primary transition-colors" href="#">Suporte</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

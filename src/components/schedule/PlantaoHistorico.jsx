import { useState, useEffect, useCallback } from 'react';
import { HistoricoColumnHeader, HistoricoSkeleton, HistoricoEmptyState, HistoricoRows } from './HistoricoList';

const LIMITE = 50;

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
            const res = await fetch(`/api/plantoes/historico?${params}`);
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
            const res = await fetch(`/api/plantoes/historico/export?${params}`);
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
        <div className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            <main className="flex-1 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Histórico de Plantões</h1>
                            <p className="text-faint font-medium mt-1">Auditoria completa de todas as alterações realizadas na escala.</p>
                        </div>
                        <button
                            onClick={() => setCurrentView?.('schedule')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-lg text-foreground font-bold shadow-sm hover:bg-surface-raised transition-colors self-start md:self-auto"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            Voltar à Escala
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <form
                    onSubmit={aplicarFiltros}
                    className="bg-surface rounded-[20px] p-6 shadow-sm border border-border flex flex-wrap gap-4 items-end"
                >
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-faint uppercase tracking-widest">Data início</span>
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={e => setFiltroDataInicio(e.target.value)}
                            className="bg-surface-raised border border-transparent rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] font-bold transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-faint uppercase tracking-widest">Data fim</span>
                        <input
                            type="date"
                            value={filtroDataFim}
                            onChange={e => setFiltroDataFim(e.target.value)}
                            className="bg-surface-raised border border-transparent rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] font-bold transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-faint uppercase tracking-widest">Admin</span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-faint text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                value={filtroAdmin}
                                onChange={e => setFiltroAdmin(e.target.value)}
                                className="bg-surface-raised border border-transparent rounded-lg py-2.5 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] font-bold placeholder-faint/50 transition-all w-52"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 items-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)] text-white font-bold hover:brightness-110 transition-colors shadow-lg shadow-[var(--accent)]/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                            Filtrar
                        </button>
                        {filtrosAtivos && (
                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-faint font-bold hover:bg-surface-raised transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                                Limpar
                            </button>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-faint font-bold">
                            {carregando ? 'Carregando...' : `${total} registro${total !== 1 ? 's' : ''}`}
                        </span>
                        <button
                            type="button"
                            onClick={exportarCSV}
                            disabled={exportando || carregando || total === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--success-bento)]/60 bg-[var(--success-soft)] text-[var(--success-bento)] font-bold text-sm hover:bg-[var(--success-bento)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
                    <div className="p-4 rounded-xl border border-[var(--danger-bento)]/20 bg-[var(--danger-soft)] text-[var(--danger-bento)] text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {erro}
                    </div>
                )}

                {/* Table */}
                <div className="bg-surface rounded-3xl shadow-sm overflow-hidden border border-border">
                    <HistoricoColumnHeader />

                    {carregando ? (
                        <HistoricoSkeleton rows={8} />
                    ) : historico.length === 0 ? (
                        <HistoricoEmptyState
                            title="Nenhum registro encontrado"
                            description="Não há alterações registradas para os filtros selecionados."
                            action={filtrosAtivos && (
                                <button
                                    onClick={limparFiltros}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-soft)] text-[var(--accent-dark)] rounded-lg font-bold text-sm hover:bg-[var(--accent-soft)]/80 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                                    Limpar filtros
                                </button>
                            )}
                        />
                    ) : (
                        <HistoricoRows historico={historico} expandido={expandido} onToggle={toggleExpandido} />
                    )}

                    {/* Pagination */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface-raised/30">
                            <button
                                disabled={pagina === 1 || carregando}
                                onClick={() => setPagina(p => p - 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-bold text-faint hover:bg-[var(--accent-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                Anterior
                            </button>
                            <span className="text-xs font-bold text-faint">
                                Página {pagina} de {totalPaginas} · {total} registros
                            </span>
                            <button
                                disabled={pagina === totalPaginas || carregando}
                                onClick={() => setPagina(p => p + 1)}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-bold text-faint hover:bg-[var(--accent-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Próxima
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="mt-4 pt-8 border-t border-border pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-faint font-bold gap-4 uppercase tracking-widest">
                    <p>© 2026 Prestek Intranet • Portal Interno</p>
                    <div className="flex gap-6">
                        <a className="hover:text-[var(--accent-dark)] transition-colors" href="#">Políticas</a>
                        <a className="hover:text-[var(--accent-dark)] transition-colors" href="#">Suporte</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
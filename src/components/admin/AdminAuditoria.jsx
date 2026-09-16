import { useState, useEffect, useCallback } from 'react';
import { iconeParaAcao } from './iconeAcao';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminAuditoria({ adminEmail }) {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [filtroEmail, setFiltroEmail] = useState('');
    const [filtroAcao, setFiltroAcao] = useState('');
    const [pagina, setPagina] = useState(1);
    const LIMITE = 20;

    const carregar = useCallback(async (p = 1, email = '', acao = '') => {
        setCarregando(true);
        setErro(null);
        try {
            const params = new URLSearchParams({ pagina: p, limite: LIMITE });
            if (email) params.set('admin_email', email);
            if (acao)  params.set('acao', acao);
            const res = await fetch(`${API}/api/admin/auditoria?${params}`);
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro);
            setLogs(data.logs);
            setTotal(data.total);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [adminEmail]);

    useEffect(() => { carregar(pagina, filtroEmail, filtroAcao); }, [carregar, pagina, filtroEmail, filtroAcao]);

    const aplicarFiltros = (e) => { e.preventDefault(); setPagina(1); carregar(1, filtroEmail, filtroAcao); };
    const limparFiltros  = () => { setFiltroEmail(''); setFiltroAcao(''); setPagina(1); carregar(1, '', ''); };

    const totalPaginas = Math.ceil(total / LIMITE);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-foreground font-display text-3xl font-extrabold tracking-tight">Logs de Auditoria</h1>
                <p className="text-faint text-sm mt-1">Histórico de ações administrativas realizadas na intranet.</p>
            </div>

            {/* Filtros */}
            <form onSubmit={aplicarFiltros} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end card-elevated">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-faint uppercase">E-mail do Admin</label>
                    <input
                        type="text"
                        placeholder="filtrar por email..."
                        value={filtroEmail}
                        onChange={e => setFiltroEmail(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-faint uppercase">Tipo de Ação</label>
                    <select
                        value={filtroAcao}
                        onChange={e => setFiltroAcao(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="">Todas as ações</option>
                        <option value="grant_admin">Conceder Admin</option>
                        <option value="revoke_admin">Revogar Admin</option>
                        <option value="update_comunicado">Editar Comunicado</option>
                        <option value="create_comunicado">Criar Comunicado</option>
                        <option value="delete_comunicado">Excluir Comunicado</option>
                        <option value="update_config">Alterar Configuração</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="min-h-[44px] px-4 py-2 bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium hover:bg-[var(--accent-dark)] transition-colors">
                        Filtrar
                    </button>
                    {(filtroEmail || filtroAcao) && (
                        <button type="button" onClick={limparFiltros} className="min-h-[44px] px-3 py-2 border border-border rounded-lg text-sm hover:bg-surface-raised transition-colors">
                            Limpar
                        </button>
                    )}
                </div>
                <div className="ml-auto text-xs text-faint self-center">{total} registro(s)</div>
            </form>

            {erro && (
                <div
                    title={erro}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm"
                >
                    Não foi possível carregar o histórico de auditoria.
                </div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden card-elevated">
                {carregando ? (
                    <div className="text-center py-16 text-faint">Carregando...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 text-faint">Nenhum registro encontrado.</div>
                ) : (
                    <div className="flex flex-col divide-y divide-border/60">
                        {logs.map(log => {
                            const { icon, cor } = iconeParaAcao(log.acao);
                            return (
                                <div key={log.id} className="flex gap-4 px-5 py-4 hover:bg-surface-raised transition-colors">
                                    <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${cor}`}>
                                        <span className="material-symbols-outlined text-sm">{icon}</span>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm text-foreground">{log.descricao}</p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                            <span className="text-xs text-faint">{log.admin_nome || log.admin_email}</span>
                                            <span className="text-xs text-faint">{new Date(log.criado_em).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-surface-raised text-faint px-2 py-0.5 rounded-full self-start shrink-0">
                                        {log.acao}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                        <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} className="min-h-[44px] px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-raised transition-colors disabled:opacity-40">
                            Anterior
                        </button>
                        <span className="text-xs text-faint">Página {pagina} de {totalPaginas}</span>
                        <button disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)} className="min-h-[44px] px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-raised transition-colors disabled:opacity-40">
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

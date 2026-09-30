import { useState, useEffect, useCallback } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { iconeParaAcao } from './iconeAcao';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// `AdminAuditoria.jsx` era o único painel deste hub estilizado via classes
// Tailwind com variáveis CSS (`text-faint`, `bg-card`...) enquanto os
// irmãos (`AdminDashboard.jsx`, `AdminUsuarios.jsx`, `AdminComunicados.jsx`)
// usam `useBentoTheme()` — os dois sistemas apontavam pros mesmos hex na
// maioria dos temas, então não era um bug visual, só duas convenções
// coexistindo no mesmo hub (Fase 15, P2/P3). Convertido em 2026-09-20.
const tone = (hex, a) => {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
};

export default function AdminAuditoria({ adminEmail }) {
    const C = useBentoTheme();
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

    const sInput = {
        border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 12px', fontSize: 13,
        background: C.bg, color: C.ink,
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Logs de Auditoria</h1>
                <p className="mt-1 text-sm" style={{ color: C.ink2 }}>Histórico de ações administrativas realizadas na intranet.</p>
            </div>

            {/* Filtros */}
            <form
                onSubmit={aplicarFiltros}
                className="flex flex-wrap items-end gap-3 rounded-xl border p-4 shadow-sm"
                style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor="auditoria-filtro-email" className="text-xs font-bold uppercase" style={{ color: C.ink2 }}>E-mail do Admin</label>
                    <input
                        id="auditoria-filtro-email"
                        type="text"
                        placeholder="filtrar por email..."
                        value={filtroEmail}
                        onChange={e => setFiltroEmail(e.target.value)}
                        className="w-56 text-sm"
                        style={sInput}
                        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${tone(C.accent, 0.15)}`; }}
                        onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="auditoria-filtro-acao" className="text-xs font-bold uppercase" style={{ color: C.ink2 }}>Tipo de Ação</label>
                    <select
                        id="auditoria-filtro-acao"
                        value={filtroAcao}
                        onChange={e => setFiltroAcao(e.target.value)}
                        className="text-sm"
                        style={sInput}
                        onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${tone(C.accent, 0.15)}`; }}
                        onBlur={e => { e.target.style.borderColor = C.line; e.target.style.boxShadow = 'none'; }}
                    >
                        <option value="">Todas as ações</option>
                        <option value="grant_admin">Conceder Admin</option>
                        <option value="revoke_admin">Revogar Admin</option>
                        <option value="grant_permissao">Conceder permissão</option>
                        <option value="revoke_permissao">Retirar permissão</option>
                        <option value="update_comunicado">Editar Comunicado</option>
                        <option value="create_comunicado">Criar Comunicado</option>
                        <option value="delete_comunicado">Excluir Comunicado</option>
                        <option value="update_config">Alterar Configuração</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        style={{ background: C.accent, color: C.onAccent }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.accentDark; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.accent; }}
                    >
                        Filtrar
                    </button>
                    {(filtroEmail || filtroAcao) && (
                        <button
                            type="button"
                            onClick={limparFiltros}
                            className="min-h-[44px] rounded-lg border px-3 py-2 text-sm transition-colors"
                            style={{ borderColor: C.line, color: C.ink }}
                            onMouseEnter={e => { e.currentTarget.style.background = C.surfaceSoft; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Limpar
                        </button>
                    )}
                </div>
                <div className="ml-auto self-center text-xs" style={{ color: C.ink2 }}>{total} registro(s)</div>
            </form>

            {erro && (
                <div
                    title={erro}
                    role="alert"
                    className="rounded-lg border p-4 text-sm"
                    style={{ background: C.dangerSoft, borderColor: tone(C.danger, 0.35), color: C.danger }}
                >
                    Não foi possível carregar o histórico de auditoria.
                </div>
            )}

            <div
                className="overflow-hidden rounded-xl border shadow-sm"
                style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
            >
                {carregando ? (
                    <div className="py-16 text-center" style={{ color: C.ink2 }}>Carregando...</div>
                ) : logs.length === 0 ? (
                    <div className="py-16 text-center" style={{ color: C.ink2 }}>Nenhum registro encontrado.</div>
                ) : (
                    <div className="flex flex-col">
                        {logs.map((log, i) => {
                            const { icon, cor } = iconeParaAcao(log.acao);
                            return (
                                <div
                                    key={log.id}
                                    className="flex gap-4 px-5 py-4 transition-colors"
                                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${tone(C.line, 0.6)}` }}
                                    onMouseEnter={e => { e.currentTarget.style.background = C.surfaceSoft; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cor}`}>
                                        <span className="material-symbols-outlined text-sm">{icon}</span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <p className="text-sm" style={{ color: C.ink }}>{log.descricao}</p>
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                            <span className="text-xs" style={{ color: C.ink2 }}>{log.admin_nome || log.admin_email}</span>
                                            <span className="text-xs" style={{ color: C.ink2 }}>{new Date(log.criado_em).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <span
                                        className="shrink-0 self-start rounded-full px-2 py-0.5 text-xs"
                                        style={{ background: C.surfaceSoft, color: C.ink2 }}
                                    >
                                        {log.acao}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${C.line}` }}>
                        <button
                            disabled={pagina === 1}
                            onClick={() => setPagina(p => p - 1)}
                            className="min-h-[44px] rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ borderColor: C.line, color: C.ink }}
                            onMouseEnter={e => { if (pagina !== 1) e.currentTarget.style.background = C.surfaceSoft; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Anterior
                        </button>
                        <span className="text-xs" style={{ color: C.ink2 }}>Página {pagina} de {totalPaginas}</span>
                        <button
                            disabled={pagina === totalPaginas}
                            onClick={() => setPagina(p => p + 1)}
                            className="min-h-[44px] rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ borderColor: C.line, color: C.ink }}
                            onMouseEnter={e => { if (pagina !== totalPaginas) e.currentTarget.style.background = C.surfaceSoft; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminUsuarios({ adminEmail }) {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [salvando, setSalvando] = useState(null);

    const carregar = useCallback(async (q = '') => {
        setCarregando(true);
        setErro(null);
        try {
            const url = `${API}/api/admin/usuarios${q ? `?busca=${encodeURIComponent(q)}` : ''}`;
            const res = await fetch(url, { headers: { 'x-admin-email': adminEmail } });
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro);
            setUsuarios(data.usuarios);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [adminEmail]);

    useEffect(() => { carregar(); }, [carregar]);

    const toggleAdmin = async (usuario) => {
        setSalvando(usuario.usuario_id);
        try {
            const res = await fetch(`${API}/api/admin/usuarios/${usuario.usuario_id}/privilegios`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-email': adminEmail },
                body: JSON.stringify({ is_admin: !usuario.is_admin }),
            });
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro);
            setUsuarios(prev => prev.map(u =>
                u.usuario_id === usuario.usuario_id ? { ...u, is_admin: !u.is_admin } : u
            ));
        } catch (e) {
            alert(`Erro: ${e.message}`);
        } finally {
            setSalvando(null);
        }
    };

    const handleBusca = (e) => { e.preventDefault(); carregar(busca); };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-foreground text-3xl font-extrabold tracking-tight">Gerenciar Usuários</h1>
                    <p className="text-muted text-sm mt-1">Gerencie permissões e visualize todos os colaboradores sincronizados.</p>
                </div>
                <form onSubmit={handleBusca} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Buscar
                    </button>
                    {busca && (
                        <button type="button" onClick={() => { setBusca(''); carregar(''); }} className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-surface-raised transition-colors">
                            Limpar
                        </button>
                    )}
                </form>
            </div>

            {erro && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">
                    {erro}
                </div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden card-elevated">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface">
                            <th className="text-left px-5 py-3 text-xs font-bold text-faint uppercase tracking-wider">Colaborador</th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-faint uppercase tracking-wider hidden md:table-cell">E-mail</th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-faint uppercase tracking-wider hidden lg:table-cell">Última Atividade</th>
                            <th className="text-center px-5 py-3 text-xs font-bold text-faint uppercase tracking-wider">Perfil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carregando ? (
                            <tr><td colSpan={4} className="text-center py-12 text-muted">Carregando...</td></tr>
                        ) : usuarios.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-12 text-muted">Nenhum usuário encontrado.</td></tr>
                        ) : usuarios.map(u => (
                            <tr key={u.usuario_id} className="border-b border-border/60 hover:bg-surface transition-colors">
                                <td className="px-5 py-3">
                                    <div className="font-medium text-foreground">{u.funcionario_nome || u.usuario_nome}</div>
                                    <div className="text-xs text-muted md:hidden">{u.usuario_email}</div>
                                </td>
                                <td className="px-5 py-3 text-foreground hidden md:table-cell">{u.usuario_email}</td>
                                <td className="px-5 py-3 text-muted hidden lg:table-cell">
                                    {u.ultima_atividade ? new Date(u.ultima_atividade).toLocaleString('pt-BR') : '—'}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <button
                                        onClick={() => toggleAdmin(u)}
                                        disabled={salvando === u.usuario_id}
                                        title={u.is_admin ? 'Revogar acesso admin' : 'Conceder acesso admin'}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                                            u.is_admin
                                                ? 'bg-primary/10 text-primary hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                                                : 'bg-surface-raised text-muted hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {salvando === u.usuario_id ? 'sync' : u.is_admin ? 'verified_user' : 'person'}
                                        </span>
                                        {u.is_admin ? 'Admin' : 'Usuário'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!carregando && usuarios.length > 0 && (
                    <div className="px-5 py-3 text-xs text-muted border-t border-border">
                        {usuarios.length} colaborador(es) listado(s)
                    </div>
                )}
            </div>
        </div>
    );
}

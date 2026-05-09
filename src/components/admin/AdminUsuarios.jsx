import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminUsuarios({ adminEmail }) {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [salvando, setSalvando] = useState(null); // usuario_id em progresso

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

    const handleBusca = (e) => {
        e.preventDefault();
        carregar(busca);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="text-[#1d150c] dark:text-white text-3xl font-extrabold tracking-tight">Gerenciar Usuários</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-sm mt-1">Gerencie permissões e visualize todos os colaboradores sincronizados.</p>
                </div>
                <form onSubmit={handleBusca} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        className="border border-[#eaddcd] dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 w-64"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-orange-600 transition-colors">
                        Buscar
                    </button>
                    {busca && (
                        <button type="button" onClick={() => { setBusca(''); carregar(''); }} className="px-3 py-2 border border-[#eaddcd] dark:border-gray-700 rounded text-sm hover:bg-[#eaddcd] dark:hover:bg-gray-800 transition-colors">
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

            <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#eaddcd] dark:border-gray-800 bg-[#f8f7f5] dark:bg-[#0f0a05]">
                            <th className="text-left px-5 py-3 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Colaborador</th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider hidden md:table-cell">E-mail</th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider hidden lg:table-cell">Última Atividade</th>
                            <th className="text-center px-5 py-3 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Admin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carregando ? (
                            <tr><td colSpan={4} className="text-center py-12 text-[#a17745] dark:text-orange-300">Carregando...</td></tr>
                        ) : usuarios.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-12 text-[#a17745] dark:text-orange-300">Nenhum usuário encontrado.</td></tr>
                        ) : usuarios.map(u => (
                            <tr key={u.usuario_id} className="border-b border-[#eaddcd]/60 dark:border-gray-800/60 hover:bg-[#f8f7f5] dark:hover:bg-[#0f0a05] transition-colors">
                                <td className="px-5 py-3">
                                    <div className="font-medium text-[#1d150c] dark:text-white">{u.funcionario_nome || u.usuario_nome}</div>
                                    <div className="text-xs text-[#a17745] dark:text-orange-300 md:hidden">{u.usuario_email}</div>
                                </td>
                                <td className="px-5 py-3 text-[#1d150c] dark:text-white hidden md:table-cell">{u.usuario_email}</td>
                                <td className="px-5 py-3 text-[#a17745] dark:text-orange-300 hidden lg:table-cell">
                                    {u.ultima_atividade
                                        ? new Date(u.ultima_atividade).toLocaleString('pt-BR')
                                        : '—'}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <button
                                        onClick={() => toggleAdmin(u)}
                                        disabled={salvando === u.usuario_id}
                                        title={u.is_admin ? 'Revogar acesso admin' : 'Conceder acesso admin'}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${u.is_admin
                                            ? 'bg-primary/10 text-primary hover:bg-red-100 hover:text-red-600'
                                            : 'bg-gray-100 dark:bg-gray-800 text-[#a17745] dark:text-orange-300 hover:bg-primary/10 hover:text-primary'
                                        } disabled:opacity-50`}
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
                    <div className="px-5 py-3 text-xs text-[#a17745] dark:text-orange-300 border-t border-[#eaddcd] dark:border-gray-800">
                        {usuarios.length} colaborador(es) listado(s)
                    </div>
                )}
            </div>
        </div>
    );
}

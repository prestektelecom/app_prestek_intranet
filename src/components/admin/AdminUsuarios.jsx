import { useState, useEffect, useCallback, useMemo } from 'react';
import BentoAvatar from '../common/Avatar';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import ResponsiveTable from '../responsive/ResponsiveTable';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Paleta Bento Blue ─────────────────────────────────────────────────────

const tone = (hex, a) => {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
};

const sIconBox = (color, bg) => ({
    width: 34,
    height: 34,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
});

export default function AdminUsuarios({ adminEmail }) {
    const C = useBentoTheme();
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

    const totalUsuarios = usuarios.length;
    const totalAdmins = useMemo(() => usuarios.filter(u => u.is_admin).length, [usuarios]);
    const totalUsuariosComuns = totalUsuarios - totalAdmins;

    const stats = [
        { label: 'Total de Usuários', valor: totalUsuarios, icon: 'group', cor: C.accent, bg: C.accentSoft },
        { label: 'Administradores', valor: totalAdmins, icon: 'verified_user', cor: C.success, bg: C.successSoft },
        { label: 'Usuários Comuns', valor: totalUsuariosComuns, icon: 'person', cor: C.accentDeep, bg: C.accentSoft },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header + Busca */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Gerenciar Usuários</h1>
                    <p className="mt-1 text-sm" style={{ color: C.muted }}>Gerencie permissões e visualize todos os colaboradores sincronizados.</p>
                </div>
                <form onSubmit={handleBusca} className="flex gap-2">
                    <div
                        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                        style={{ background: C.surface, borderColor: C.line, width: 280 }}
                    >
                        <span className="material-symbols-outlined" style={{ color: C.muted }}>search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none"
                            style={{ color: C.ink }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                        style={{ background: C.accent }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDark; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
                    >
                        Buscar
                    </button>
                    {busca && (
                        <button
                            type="button"
                            onClick={() => { setBusca(''); carregar(''); }}
                            className="rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
                            style={{ borderColor: C.line, color: C.ink2, background: C.surface }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceSoft; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
                        >
                            Limpar
                        </button>
                    )}
                </form>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map(s => (
                    <div
                        key={s.label}
                        className="flex items-center gap-4 rounded-2xl border p-4"
                        style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                    >
                        <div style={sIconBox(s.cor, s.bg)}>
                            <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: C.ink }}>{carregando ? '—' : s.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Erro */}
            {erro && (
                <div
                    className="rounded-xl border p-4 text-sm"
                    style={{ background: C.dangerSoft, borderColor: '#F5B0B0', color: C.danger }}
                >
                    {erro}
                </div>
            )}

            {/* Tabela */}
            <div
                className="overflow-hidden rounded-2xl border shadow-sm p-2 md:p-4"
                style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
            >
                {carregando ? (
                    <div className="py-14 text-center" style={{ color: C.muted }}>
                        <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined animate-spin text-3xl" style={{ color: C.accent }}>progress_activity</span>
                            Carregando usuários...
                        </div>
                    </div>
                ) : (
                    <ResponsiveTable
                        columns={[
                            {
                                key: 'nome',
                                header: 'Colaborador',
                                render: (_, u) => {
                                    const displayName = u.funcionario_nome || u.usuario_nome || '—';
                                    return (
                                        <div className="flex items-center gap-3">
                                            <BentoAvatar name={displayName} size={36} color={[C.accent, '#fff']} />
                                            <div>
                                                <div className="font-semibold" style={{ color: C.ink }}>{displayName}</div>
                                                <div className="text-xs md:hidden" style={{ color: C.muted }}>{u.usuario_email}</div>
                                            </div>
                                        </div>
                                    );
                                }
                            },
                            { key: 'usuario_email', header: 'E-mail', priority: false },
                            { key: 'ultima_atividade', header: 'Última Atividade', priority: false, render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '—' },
                            { key: 'perfil', header: 'Perfil', render: (_, u) => u.is_admin ? 'Admin' : 'Usuário' },
                        ]}
                        rows={usuarios}
                        keyExtractor={(u) => u.usuario_id}
                        cardTitle={(u) => u.funcionario_nome || u.usuario_nome || '—'}
                        actions={(u) => (
                            <button
                                onClick={() => toggleAdmin(u)}
                                disabled={salvando === u.usuario_id}
                                title={u.is_admin ? 'Revogar acesso admin' : 'Conceder acesso admin'}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-60 min-h-[36px]"
                                style={{
                                    background: u.is_admin ? C.accentSoft : C.surfaceSoft,
                                    color: u.is_admin ? C.accentDeep : C.muted,
                                    border: `1px solid ${u.is_admin ? C.accent : C.line}`,
                                }}
                                onMouseEnter={(e) => {
                                    if (u.is_admin) {
                                        e.currentTarget.style.background = C.dangerSoft;
                                        e.currentTarget.style.color = C.danger;
                                        e.currentTarget.style.borderColor = C.danger;
                                    } else {
                                        e.currentTarget.style.background = C.accentSoft;
                                        e.currentTarget.style.color = C.accentDeep;
                                        e.currentTarget.style.borderColor = C.accent;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = u.is_admin ? C.accentSoft : C.surfaceSoft;
                                    e.currentTarget.style.color = u.is_admin ? C.accentDeep : C.muted;
                                    e.currentTarget.style.borderColor = u.is_admin ? C.accent : C.line;
                                }}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {salvando === u.usuario_id ? 'sync' : u.is_admin ? 'verified_user' : 'person'}
                                </span>
                                {u.is_admin ? 'Admin' : 'Usuário'}
                            </button>
                        )}
                        emptyMessage={(
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full"
                                    style={{ background: C.accentSoft, color: C.accent }}
                                >
                                    <span className="material-symbols-outlined text-2xl">search_off</span>
                                </div>
                                Nenhum usuário encontrado.
                            </div>
                        )}
                    />
                )}
                {!carregando && usuarios.length > 0 && (
                    <div
                        className="border-t px-5 py-3 text-xs font-medium mt-2"
                        style={{ borderColor: C.line, color: C.muted }}
                    >
                        {usuarios.length} colaborador(es) listado(s)
                    </div>
                )}
            </div>
        </div>
    );
}
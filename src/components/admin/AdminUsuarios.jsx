import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import BentoAvatar from '../common/Avatar';
import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../../hooks/useDismissable';
import ResponsiveTable from '../responsive/ResponsiveTable';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

const CONFIRMAR_ADMIN_TITULO_ID = 'confirmar-admin-titulo';

// Conceder/revogar admin era um clique só, sem confirmação nenhuma — a ação
// de maior privilégio do produto inteiro era a única sem proteção alguma
// (achado ao vivo, Fase 15: excluir um comunicado, reversível, já tinha
// window.confirm; isto não tinha nada). Modal próprio, nunca window.confirm.
function ModalConfirmarPrivilegio({ usuario, salvando, erro, onCancelar, onConfirmar, C }) {
    const modalRef = useRef(null);
    useDismissable(modalRef, { open: true, onClose: onCancelar, lockScroll: true, closeOnOutside: true });

    const trapTab = makeTrapTab(modalRef);

    const concedendo = !usuario.is_admin;
    const nome = usuario.funcionario_nome || usuario.usuario_nome || usuario.usuario_email;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" style={{ background: 'rgba(11, 27, 46, 0.5)', backdropFilter: 'blur(4px)' }}>
            <div
                ref={modalRef}
                onKeyDown={trapTab}
                role="dialog"
                aria-modal="true"
                aria-labelledby={CONFIRMAR_ADMIN_TITULO_ID}
                className="w-full max-w-[440px] overflow-hidden rounded-2xl border shadow-2xl"
                style={{ background: C.surface, borderColor: C.line }}
            >
                <div className="flex items-center gap-3 px-5 py-4">
                    <div style={sIconBox(concedendo ? C.accent : C.danger, concedendo ? C.accentSoft : C.dangerSoft)}>
                        <span className="material-symbols-outlined">{concedendo ? 'verified_user' : 'person_off'}</span>
                    </div>
                    <h2 id={CONFIRMAR_ADMIN_TITULO_ID} className="text-base font-bold" style={{ color: C.ink }}>
                        {concedendo ? 'Conceder acesso de administrador' : 'Revogar acesso de administrador'}
                    </h2>
                </div>
                <div className="px-5 pb-2 text-sm" style={{ color: C.ink2 }}>
                    {concedendo
                        ? <>Isto dá a <b style={{ color: C.ink }}>{nome}</b> acesso total ao Painel Admin — usuários, comunicados e auditoria.</>
                        : <><b style={{ color: C.ink }}>{nome}</b> perde o acesso ao Painel Admin imediatamente.</>}
                </div>
                {erro && (
                    <div role="alert" className="mx-5 mt-3 rounded-lg p-3 text-sm" style={{ background: C.dangerSoft, color: C.danger }}>
                        {erro}
                    </div>
                )}
                <div className="flex justify-end gap-3 px-5 py-4">
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                        style={{ borderColor: C.line, background: C.surface, color: C.ink2 }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={!!salvando}
                        className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60"
                        style={{ background: concedendo ? C.accent : C.danger, color: C.onAccent }}
                    >
                        {salvando ? 'Salvando…' : concedendo ? 'Conceder acesso' : 'Revogar acesso'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsuarios({ adminEmail }) {
    const C = useBentoTheme();
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [salvando, setSalvando] = useState(null);
    const [confirmando, setConfirmando] = useState(null);
    const [erroConfirmacao, setErroConfirmacao] = useState(null);

    const carregar = useCallback(async (q = '') => {
        setCarregando(true);
        setErro(null);
        try {
            const url = `${API}/api/admin/usuarios${q ? `?busca=${encodeURIComponent(q)}` : ''}`;
            const res = await fetch(url);
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

    const confirmarToggle = async () => {
        const usuario = confirmando;
        if (!usuario) return;
        setSalvando(usuario.usuario_id);
        setErroConfirmacao(null);
        try {
            const res = await fetch(`${API}/api/admin/usuarios/${usuario.usuario_id}/privilegios`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_admin: !usuario.is_admin }),
            });
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro);
            setUsuarios(prev => prev.map(u =>
                u.usuario_id === usuario.usuario_id ? { ...u, is_admin: !u.is_admin } : u
            ));
            setConfirmando(null);
        } catch (e) {
            setErroConfirmacao(`Erro: ${e.message}`);
        } finally {
            setSalvando(null);
        }
    };

    const fecharConfirmacao = () => {
        if (salvando) return;
        setConfirmando(null);
        setErroConfirmacao(null);
    };

    const handleBusca = (e) => { e.preventDefault(); carregar(busca); };

    const totalUsuarios = usuarios.length;
    const totalAdmins = useMemo(() => usuarios.filter(u => u.is_admin).length, [usuarios]);
    const totalUsuariosComuns = totalUsuarios - totalAdmins;

    const stats = [
        { label: 'Total de Usuários', valor: totalUsuarios, icon: 'group', cor: C.accent, bg: C.accentSoft },
        { label: 'Administradores', valor: totalAdmins, icon: 'verified_user', cor: C.success, bg: C.successSoft },
        { label: 'Usuários Comuns', valor: totalUsuariosComuns, icon: 'person', cor: C.info, bg: tone(C.info, 0.15) },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header + Busca */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Gerenciar Usuários</h1>
                    <p className="mt-1 text-sm" style={{ color: C.ink2 }}>Gerencie permissões e visualize todos os colaboradores sincronizados.</p>
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
                        className="min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
                        style={{ background: C.accent, color: C.onAccent }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDark; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
                    >
                        Buscar
                    </button>
                    {busca && (
                        <button
                            type="button"
                            onClick={() => { setBusca(''); carregar(''); }}
                            className="min-h-[44px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
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
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.ink2 }}>{s.label}</p>
                            <p className="text-2xl font-extrabold" style={{ color: C.ink }}>{carregando ? '—' : s.valor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Erro */}
            {erro && (
                <div
                    className="rounded-xl border p-4 text-sm"
                    style={{ background: C.dangerSoft, borderColor: tone(C.danger, 0.35), color: C.danger }}
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
                    <div className="py-14 text-center" style={{ color: C.ink2 }}>
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
                                                <div className="text-xs md:hidden" style={{ color: C.ink2 }}>{u.usuario_email}</div>
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
                                onClick={() => setConfirmando(u)}
                                disabled={salvando === u.usuario_id}
                                aria-label={u.is_admin ? `Revogar acesso admin de ${u.funcionario_nome || u.usuario_nome || u.usuario_email}` : `Conceder acesso admin a ${u.funcionario_nome || u.usuario_nome || u.usuario_email}`}
                                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-60"
                                style={{
                                    background: u.is_admin ? C.dangerSoft : C.accentSoft,
                                    color: u.is_admin ? C.danger : (isDark ? C.accentDark : C.accentDeep),
                                    border: `1px solid ${u.is_admin ? C.danger : C.accent}`,
                                }}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {salvando === u.usuario_id ? 'sync' : u.is_admin ? 'person_off' : 'verified_user'}
                                </span>
                                {u.is_admin ? 'Revogar' : 'Conceder'}
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
                        style={{ borderColor: C.line, color: C.ink2 }}
                    >
                        {usuarios.length} colaborador(es) listado(s)
                    </div>
                )}
            </div>

            {confirmando && (
                <ModalConfirmarPrivilegio
                    usuario={confirmando}
                    salvando={salvando === confirmando.usuario_id}
                    erro={erroConfirmacao}
                    onCancelar={fecharConfirmacao}
                    onConfirmar={confirmarToggle}
                    C={C}
                />
            )}
        </div>
    );
}

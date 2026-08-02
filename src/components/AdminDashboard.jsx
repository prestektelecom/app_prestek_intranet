import { useState, useEffect, useCallback } from 'react';
import ResponsaveisManual from './ResponsaveisManual';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminComunicados from './admin/AdminComunicados';
import AdminAuditoria from './admin/AdminAuditoria';
import PlantaoHistorico from './schedule/PlantaoHistorico';
import BentoAvatar from './common/Avatar';
import { useBentoTheme } from '../hooks/useBentoTheme';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const tone = (hex, a) => {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
};

const sIconBox = (color, bg) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
});

// Logo azul estilo bento
function BentoLogo({ C, size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="14" height="14" rx="4" fill={C.accent} />
            <rect x="4" y="23" width="14" height="21" rx="4" fill={C.accentDark} />
            <rect x="23" y="4" width="21" height="14" rx="4" fill={C.accentSoft} />
            <rect x="23" y="23" width="21" height="21" rx="4" fill={C.cyan} />
        </svg>
    );
}

function NavRow({ C, id, icon, label, active, badge, onClick }) {
    return (
        <button
            onClick={() => onClick(id)}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
            style={{
                background: active ? C.accent : 'transparent',
                color: active ? C.surface : C.ink2,
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = C.accentSoft;
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
            }}
        >
            <span
                className="material-symbols-outlined text-xl"
                style={{ color: active ? C.surface : C.muted }}
            >
                {icon}
            </span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            {badge != null && (
                <span
                    className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                    style={{ background: active ? 'rgba(245,249,255,0.25)' : C.dangerSoft, color: active ? C.surface : C.danger }}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

export default function AdminDashboard({ setCurrentView, user }) {
    const C = useBentoTheme();
    const [abaAtiva, setAbaAtiva] = useState('painel');
    const [stats, setStats] = useState(null);
    const [logsRecentes, setLogsRecentes] = useState([]);
    const [carregandoStats, setCarregandoStats] = useState(true);

    const adminEmail = user?.email || '';
    const adminName = user?.nome || 'Administrador';

    const carregarStats = useCallback(async () => {
        if (!adminEmail) return;
        setCarregandoStats(true);
        try {
            const [resStats, resLogs] = await Promise.all([
                fetch(`${API}/api/admin/dashboard-stats`, { headers: { 'x-admin-email': adminEmail } }),
                fetch(`${API}/api/admin/auditoria?limite=5`, { headers: { 'x-admin-email': adminEmail } }),
            ]);
            const dataStats = await resStats.json();
            const dataLogs = await resLogs.json();
            if (dataStats.sucesso) setStats(dataStats.stats);
            if (dataLogs.sucesso) setLogsRecentes(dataLogs.logs || []);
        } catch (e) {
            console.warn('AdminDashboard: falha ao carregar stats:', e.message);
        } finally {
            setCarregandoStats(false);
        }
    }, [adminEmail]);

    useEffect(() => {
        if (abaAtiva === 'painel') carregarStats();
    }, [abaAtiva, carregarStats]);

    const handleLogout = async () => {
        if (user?.id) {
            try { await fetch(`/api/presenca/${user.id}/logout`, { method: 'POST' }); } catch (_) { }
        }
        localStorage.removeItem('@Stitch:user');
        localStorage.removeItem('@Stitch:currentView');
        sessionStorage.removeItem('@Stitch:user');
        sessionStorage.removeItem('@Stitch:currentView');
        setCurrentView('login');
    };

    const ICONE_ACAO = {
        grant_admin: { icon: 'verified_user', cor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
        revoke_admin: { icon: 'person_off', cor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
        update_comunicado: { icon: 'edit_document', cor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
        create_comunicado: { icon: 'add_circle', cor: 'bg-[#FFF7ED] text-[#C2410C]' },
        delete_comunicado: { icon: 'delete', cor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
        update_config: { icon: 'settings', cor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    };

    const menuItens = [
        { id: 'painel', label: 'Painel', icon: 'dashboard' },
        { id: 'usuarios', label: 'Usuários', icon: 'group' },
        { id: 'grupos-supervisores', label: 'Responsáveis', icon: 'manage_accounts' },
        { id: 'comunicados', label: 'Comunicados', icon: 'campaign' },
        { id: 'auditoria', label: 'Auditoria', icon: 'description' },
        { id: 'plantao-historico', label: 'Plantões', icon: 'manage_history' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex h-screen w-full flex-col overflow-hidden font-jakarta" style={{ background: C.bg, color: C.ink }}>

            {/* ── Header ── */}
            <header
                className="flex h-16 shrink-0 items-center justify-between px-6"
                style={{
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderBottom: `1px solid ${C.line}`,
                }}
            >
                <div className="flex items-center gap-3">
                    <BentoLogo C={C} size={34} />
                    <span className="text-lg font-extrabold tracking-tight" style={{ color: C.ink }}>Prestek Admin</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden text-sm font-semibold sm:block" style={{ color: C.ink2 }}>
                        {adminName}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                        style={{ background: C.accent }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDark; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; }}
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sair
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Sidebar ── */}
                <aside
                    className="hidden flex-col border-r lg:flex"
                    style={{ width: 256, background: C.surface, borderColor: C.line }}
                >
                    <div className="flex flex-col gap-1 p-4">
                        {/* Avatar Admin Azul Bento */}
                        <div className="mb-5 flex items-center gap-3 rounded-xl p-3" style={{ background: C.surfaceSoft }}>
                            <BentoAvatar name={adminName} size={48} color={[C.accent, '#fff']} />
                            <div className="flex min-w-0 flex-col">
                                <h1 className="truncate text-sm font-bold" style={{ color: C.ink }}>{adminName}</h1>
                                <p className="text-xs font-medium" style={{ color: C.muted }}>Super Admin</p>
                            </div>
                        </div>

                        <p
                            className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: C.muted }}
                        >
                            Menu
                        </p>
                        {menuItens.map(item => (
                            <NavRow
                                key={item.id}
                                C={C}
                                {...item}
                                active={abaAtiva === item.id}
                                onClick={setAbaAtiva}
                            />
                        ))}
                    </div>

                    <div className="mt-auto p-4" style={{ borderTop: `1px solid ${C.line}` }}>
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                            style={{ color: C.muted }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceSoft; e.currentTarget.style.color = C.ink; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            Voltar à Intranet
                        </button>
                    </div>
                </aside>

                {/* ── Navegação mobile bottom bar ── */}
                <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t lg:hidden" style={{ background: C.surface, borderColor: C.line }}>
                    {menuItens.slice(0, 4).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setAbaAtiva(item.id)}
                            className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
                            style={{ color: abaAtiva === item.id ? C.accent : C.muted }}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto p-6 pb-24 lg:p-10 lg:pb-10 scrollbar-hide">
                    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">

                        {/* ── Painel de Controle ── */}
                        {abaAtiva === 'painel' && (
                            <>
                                <div className="flex flex-wrap items-end justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl" style={{ color: C.ink }}>Visão Geral</h1>
                                        <p className="mt-1 text-base font-normal" style={{ color: C.muted }}>Bem-vindo, {adminName.split(' ')[0]}.</p>
                                    </div>
                                    <button
                                        onClick={carregarStats}
                                        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow"
                                        style={{ background: C.surface, borderColor: C.line, color: C.ink2 }}
                                    >
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        Atualizar
                                    </button>
                                </div>

                                {/* KPIs — Bento Grid */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {[
                                        { label: 'Usuários Ativos', valor: stats?.total_usuarios, icon: 'group', stripe: C.accent, iconCor: C.accent, iconBg: C.accentSoft },
                                        { label: 'Comunicações', valor: stats?.total_comunicados, icon: 'campaign', stripe: C.cyan, iconCor: '#9A3412', iconBg: C.cyanSoft },
                                        { label: 'Ações (g)', valor: stats?.acoes_recentes, icon: 'edit_document', stripe: C.success, iconCor: C.success, iconBg: C.successSoft },
                                    ].map(kpi => (
                                        <div
                                            key={kpi.label}
                                            className="relative flex flex-col justify-between overflow-hidden rounded-[18px] border p-5 transition-shadow hover:shadow-md"
                                            style={{
                                                background: C.surface,
                                                borderColor: C.line,
                                                boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}`,
                                            }}
                                        >
                                            {/* Accent Stripe */}
                                            <div className="absolute left-0 right-0 top-0 h-1" style={{ background: kpi.stripe }} />

                                            {/* Icon box */}
                                            <div style={{ ...sIconBox(kpi.iconCor, kpi.iconBg), marginBottom: 16 }}>
                                                <span className="material-symbols-outlined">{kpi.icon}</span>
                                            </div>

                                            <div>
                                                <p
                                                    className="mb-1.5 text-[10.5px] font-bold uppercase tracking-widest"
                                                    style={{ color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}
                                                >
                                                    {kpi.label}
                                                </p>
                                                <p
                                                    className="text-[30px] font-extrabold leading-none tracking-tight"
                                                    style={{ color: C.ink }}
                                                >
                                                    {carregandoStats ? '—' : (kpi.valor ?? '—')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Atividades Recentes */}
                                <div
                                    className="rounded-[18px] border p-6"
                                    style={{ background: C.surface, borderColor: C.line, boxShadow: `0 1px 3px ${tone(C.accentDeep, 0.05)}` }}
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-base font-bold" style={{ color: C.ink }}>Atividades Recentes</h3>
                                        <button
                                            onClick={() => setAbaAtiva('auditoria')}
                                            className="text-sm font-bold transition-opacity hover:opacity-70"
                                            style={{ color: C.accent }}
                                        >
                                            Ver Tudo
                                        </button>
                                    </div>
                                    {carregandoStats ? (
                                        <p className="text-sm" style={{ color: C.muted }}>Carregando...</p>
                                    ) : logsRecentes.length === 0 ? (
                                        <p className="text-sm" style={{ color: C.muted }}>Nenhuma atividade registrada ainda.</p>
                                    ) : (
                                        <div className="flex flex-col gap-5">
                                            {logsRecentes.map(log => {
                                                const { icon, cor } = ICONE_ACAO[log.acao] || { icon: 'info', cor: 'bg-[#F7FAFD] text-[#8896A8]' };
                                                return (
                                                    <div key={log.id} className="flex items-start gap-4">
                                                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cor}`}>
                                                            <span className="material-symbols-outlined text-sm">{icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium" style={{ color: C.ink }}>{log.descricao}</p>
                                                            <p className="mt-0.5 text-xs" style={{ color: C.muted }}>
                                                                {log.admin_nome || log.admin_email} · {new Date(log.criado_em).toLocaleString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Atalhos */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {/* Gerenciar Usuários — gradiente azul */}
                                    <div
                                        onClick={() => setAbaAtiva('usuarios')}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-shadow hover:shadow-xl"
                                        style={{ background: `linear-gradient(135deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)` }}
                                    >
                                        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 transform opacity-10 transition-transform duration-500 group-hover:scale-110">
                                            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>group</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                                <span className="material-symbols-outlined">group</span>
                                            </div>
                                            <h3 className="mb-1 text-lg font-bold">Gerenciar Usuários</h3>
                                            <p className="text-sm text-white/80">Conceder ou revogar permissões de administrador.</p>
                                        </div>
                                    </div>

                                    {/* Comunicados — hover bg */}
                                    <div
                                        onClick={() => setAbaAtiva('comunicados')}
                                        className="group cursor-pointer rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
                                        style={{ background: C.surface, borderColor: C.line }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.accent}66`; e.currentTarget.style.background = C.accentSoft; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.surface; }}
                                    >
                                        <div style={sIconBox(C.accent, C.accentSoft)} className="mb-4">
                                            <span className="material-symbols-outlined">campaign</span>
                                        </div>
                                        <h3 className="mb-1 text-lg font-bold transition-colors group-hover:text-[#C2410C]" style={{ color: C.ink }}>Comunicados</h3>
                                        <p className="text-sm" style={{ color: C.muted }}>Criar, editar e excluir comunicados da intranet.</p>
                                    </div>

                                    {/* Logs de Auditoria — hover bg */}
                                    <div
                                        onClick={() => setAbaAtiva('auditoria')}
                                        className="group cursor-pointer rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
                                        style={{ background: C.surface, borderColor: C.line }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.accent}66`; e.currentTarget.style.background = C.accentSoft; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.surface; }}
                                    >
                                        <div style={sIconBox('#8B5CF6', '#F5F3FF')} className="mb-4">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <h3 className="mb-1 text-lg font-bold transition-colors group-hover:text-[#C2410C]" style={{ color: C.ink }}>Logs de Auditoria</h3>
                                        <p className="text-sm" style={{ color: C.muted }}>Histórico completo de ações administrativas.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {abaAtiva === 'usuarios' && <AdminUsuarios adminEmail={adminEmail} />}
                        {abaAtiva === 'grupos-supervisores' && <ResponsaveisManual />}
                        {abaAtiva === 'comunicados' && <AdminComunicados adminEmail={adminEmail} />}
                        {abaAtiva === 'auditoria' && <AdminAuditoria adminEmail={adminEmail} />}
                        {abaAtiva === 'plantao-historico' && <PlantaoHistorico user={user} setCurrentView={(v) => { if (v === 'schedule') setAbaAtiva('painel'); else setCurrentView(v); }} />}
                    </div>
                </main>
            </div>
        </div>
    );
}

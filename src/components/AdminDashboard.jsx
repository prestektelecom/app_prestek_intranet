import { useState, useEffect, useCallback } from 'react';
import ResponsaveisManual from './ResponsaveisManual';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminComunicados from './admin/AdminComunicados';
import AdminAuditoria from './admin/AdminAuditoria';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminDashboard({ setCurrentView, user }) {
    const [abaAtiva, setAbaAtiva] = useState('painel');
    const [stats, setStats] = useState(null);
    const [logsRecentes, setLogsRecentes] = useState([]);
    const [carregandoStats, setCarregandoStats] = useState(true);

    const adminEmail = user?.email || '';

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

    const ICONE_ACAO = {
        grant_admin: { icon: 'verified_user', cor: 'bg-green-100 text-green-600' },
        revoke_admin: { icon: 'person_off', cor: 'bg-red-100 text-red-600' },
        update_comunicado: { icon: 'edit_document', cor: 'bg-blue-100 text-blue-600' },
        create_comunicado: { icon: 'add_circle', cor: 'bg-orange-100 text-primary' },
        delete_comunicado: { icon: 'delete', cor: 'bg-red-100 text-red-600' },
        update_config: { icon: 'settings', cor: 'bg-purple-100 text-purple-600' },
    };

    const menuItens = [
        { id: 'painel', label: 'Painel de Controle', icon: 'dashboard' },
        { id: 'usuarios', label: 'Gerenciar Usuários', icon: 'group' },
        { id: 'grupos-supervisores', label: 'Responsáveis de Setor', icon: 'manage_accounts' },
        { id: 'comunicados', label: 'Gerenciar Comunicados', icon: 'campaign' },
        { id: 'auditoria', label: 'Logs de Auditoria', icon: 'description' },
    ];

    return (
        <div className="flex h-screen w-full flex-col font-display bg-[#f8f7f5] dark:bg-[#0f0a05] text-[#1d150c] dark:text-white overflow-x-hidden absolute inset-0 z-50">

            {/* Header Administrativo */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#eaddcd] dark:border-gray-800 bg-[#f8f7f5] dark:bg-[#0f0a05] px-6 py-3 z-20 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-[#1d150c] dark:text-white">
                        <div className="size-8 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">Prestek Admin</h2>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-4 items-center">
                    <span className="hidden sm:block text-sm text-[#a17745] dark:text-orange-300">{user?.nome || adminEmail}</span>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-primary hover:bg-orange-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="truncate">Sair do Admin</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Administrativo */}
                <aside className="w-64 flex-col justify-between bg-white dark:bg-[#1a130b] border-r border-[#eaddcd] dark:border-gray-800 hidden lg:flex shrink-0">
                    <div className="flex flex-col gap-1 p-4">
                        <div className="flex items-center gap-3 px-3 py-4 mb-2">
                            <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                {(user?.nome || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="text-[#1d150c] dark:text-white text-sm font-bold leading-tight truncate">{user?.nome || 'Administrador'}</h1>
                                <p className="text-[#a17745] dark:text-orange-300 text-xs font-medium">Super Admin</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="px-3 py-2 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Menu Principal</p>
                            {menuItens.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setAbaAtiva(item.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${abaAtiva === item.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-[#eaddcd] dark:hover:bg-gray-800 text-[#1d150c] dark:text-white'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-xl ${abaAtiva === item.id ? 'text-primary' : 'text-[#a17745] dark:text-orange-300'}`}>
                                        {item.icon}
                                    </span>
                                    <p className={`text-sm leading-normal ${abaAtiva === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-[#eaddcd] dark:border-gray-800">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[#a17745] dark:text-orange-300 hover:bg-[#eaddcd] dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            Voltar à Intranet
                        </button>
                    </div>
                </aside>

                {/* Navegação mobile */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a130b] border-t border-[#eaddcd] dark:border-gray-800 flex z-40">
                    {menuItens.slice(0, 4).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setAbaAtiva(item.id)}
                            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${abaAtiva === item.id ? 'text-primary' : 'text-[#a17745] dark:text-orange-300'}`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-[10px]">{item.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-[#f8f7f5] dark:bg-[#0f0a05] p-6 lg:p-10 pb-20 lg:pb-10 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

                        {/* Painel de Controle */}
                        {abaAtiva === 'painel' && (
                            <>
                                <div className="flex flex-wrap justify-between items-end gap-4">
                                    <div>
                                        <h1 className="text-[#1d150c] dark:text-white tracking-tight text-3xl lg:text-4xl font-extrabold leading-tight">Visão Geral do Painel</h1>
                                        <p className="text-[#a17745] dark:text-orange-300 text-base font-normal">Bem-vindo, {user?.nome?.split(' ')[0] || 'Administrador'}.</p>
                                    </div>
                                    <button onClick={carregarStats} className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 text-sm font-medium shadow-sm hover:shadow transition-all">
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        Atualizar
                                    </button>
                                </div>

                                {/* KPIs */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        {
                                            label: 'Usuários Ativos',
                                            valor: carregandoStats ? '—' : (stats?.total_usuarios ?? '—'),
                                            icon: 'group',
                                            cor: 'bg-primary/10 text-primary',
                                        },
                                        {
                                            label: 'Comunicados',
                                            valor: carregandoStats ? '—' : (stats?.total_comunicados ?? '—'),
                                            icon: 'campaign',
                                            cor: 'bg-blue-50 text-blue-500',
                                        },
                                        {
                                            label: 'Ações Admin (30d)',
                                            valor: carregandoStats ? '—' : (stats?.acoes_recentes ?? '—'),
                                            icon: 'edit_document',
                                            cor: 'bg-purple-50 text-purple-500',
                                        },
                                    ].map(kpi => (
                                        <div key={kpi.label} className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded ${kpi.cor}`}>
                                                    <span className="material-symbols-outlined">{kpi.icon}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[#a17745] dark:text-orange-300 text-sm font-medium mb-1">{kpi.label}</p>
                                                <p className="text-[#1d150c] dark:text-white text-3xl font-bold tracking-tight">{kpi.valor}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Atividades Recentes */}
                                <div className="rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-[#1d150c] dark:text-white text-lg font-bold">Atividades Recentes</h3>
                                        <button onClick={() => setAbaAtiva('auditoria')} className="text-primary text-sm font-bold hover:underline">Ver Tudo</button>
                                    </div>
                                    {carregandoStats ? (
                                        <p className="text-[#a17745] dark:text-orange-300 text-sm">Carregando...</p>
                                    ) : logsRecentes.length === 0 ? (
                                        <p className="text-[#a17745] dark:text-orange-300 text-sm">Nenhuma atividade registrada ainda.</p>
                                    ) : (
                                        <div className="flex flex-col gap-5">
                                            {logsRecentes.map(log => {
                                                const { icon, cor } = ICONE_ACAO[log.acao] || { icon: 'info', cor: 'bg-gray-100 text-gray-500' };
                                                return (
                                                    <div key={log.id} className="flex gap-4 items-start">
                                                        <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${cor}`}>
                                                            <span className="material-symbols-outlined text-sm">{icon}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-[#1d150c] dark:text-white text-sm font-medium">{log.descricao}</p>
                                                            <p className="text-[#a17745] dark:text-orange-300 text-xs mt-0.5">
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div onClick={() => setAbaAtiva('usuarios')} className="p-6 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>group</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="bg-white/20 w-10 h-10 rounded flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined">group</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">Gerenciar Usuários</h3>
                                            <p className="text-white/80 text-sm">Conceder ou revogar permissões de administrador.</p>
                                        </div>
                                    </div>
                                    <div onClick={() => setAbaAtiva('comunicados')} className="p-6 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer hover:shadow-md">
                                        <div className="bg-blue-50 w-10 h-10 rounded flex items-center justify-center mb-4 text-blue-600">
                                            <span className="material-symbols-outlined">campaign</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1 text-[#1d150c] dark:text-white group-hover:text-primary transition-colors">Comunicados</h3>
                                        <p className="text-[#a17745] dark:text-orange-300 text-sm">Criar, editar e excluir comunicados da intranet.</p>
                                    </div>
                                    <div onClick={() => setAbaAtiva('auditoria')} className="p-6 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer hover:shadow-md">
                                        <div className="bg-purple-50 w-10 h-10 rounded flex items-center justify-center mb-4 text-purple-600">
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1 text-[#1d150c] dark:text-white group-hover:text-primary transition-colors">Logs de Auditoria</h3>
                                        <p className="text-[#a17745] dark:text-orange-300 text-sm">Histórico completo de ações administrativas.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {abaAtiva === 'usuarios' && <AdminUsuarios adminEmail={adminEmail} />}
                        {abaAtiva === 'grupos-supervisores' && <ResponsaveisManual />}
                        {abaAtiva === 'comunicados' && <AdminComunicados adminEmail={adminEmail} />}
                        {abaAtiva === 'auditoria' && <AdminAuditoria adminEmail={adminEmail} />}
                    </div>
                </main>
            </div>
        </div>
    );
}

import { useState } from 'react';
import ResponsaveisManual from './ResponsaveisManual';

export default function AdminDashboard({ setCurrentView }) {
    const [abaAtiva, setAbaAtiva] = useState('painel');
    return (
        <div className="flex h-screen w-full flex-col font-display bg-[#f8f7f5] text-[#1d150c] dark:text-white overflow-x-hidden absolute inset-0 z-50">
            {/* Header Administrativo */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#eaddcd] dark:border-gray-800 bg-[#f8f7f5] px-6 py-3 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-[#1d150c] dark:text-white">
                        <div className="size-8 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">Prestek Admin</h2>
                    </div>
                    {/* Barra de Busca Admin */}
                    <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded h-full">
                            <div className="text-[#a17745] dark:text-orange-300 flex border-none bg-white dark:bg-[#1a130b] items-center justify-center pl-4 rounded-l border-r-0">
                                <span className="material-symbols-outlined text-xl">search</span>
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded text-[#1d150c] dark:text-white focus:outline-0 focus:ring-0 border-none bg-white dark:bg-[#1a130b] focus:border-none h-full placeholder:text-[#a17745] dark:text-orange-300 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Buscar recursos..." defaultValue="" />
                        </div>
                    </label>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <button className="flex items-center justify-center text-[#a17745] dark:text-orange-300 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-primary hover:bg-orange-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="truncate">Sair</span>
                    </button>
                    {/* Avatar Admin */}
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 ring-2 ring-[#eaddcd]" data-alt="Foto do perfil" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuABFj2Puk3yX_sqZvFcU7y5hwPuR12CZRHkSVHwg0wfCVwgr05PF293ywfYziWWoq2kXAJJUHLX5sIXZSfxoEs9ZWTUelSqrx2SlFzwF29b1M_KYcr2aImQ1zsJyohoroBlzhZg7dAVjObqk09YFbIAtWr8osnZcBxMZ5aMOqEfBBbxh2cd8Egy5jOANpsx3KFmhLQt8OrZyOpFCbzuQldR8IpV-H7vN7pZFrfZajh2ns0hZoIpDgBmqb8GuO3XtxUdVA1616eBoP8")' }}></div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Administrativo */}
                <aside className="w-64 flex-col justify-between bg-white dark:bg-[#1a130b] border-r border-[#eaddcd] dark:border-gray-800 hidden lg:flex">
                    <div className="flex flex-col gap-1 p-4">
                        <div className="flex items-center gap-3 px-3 py-4 mb-2">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20" data-alt="Retrato do administrador" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDN3mBT9Ih1jrMyleRk-p5JBlm04D18NkFgkxPpuA3Mikj_L4gI9D7URdMpNodenZ7kJzm14HjLS-yeOFp6TNUBh_zv50un8E3d9YxLG8fcFzPS-GBL9WR-7Bl9p63HGtxlULFZ68yqgcSz2fJ4VrPe2ohA4KPdvJAPlpZklyKhYCTv_BveY6pmZ3WnMJagPcPNR1Gk2KArpJTGh8F-ErzZE9oIOQo4lX9nAwHBdShxGoXfQczcd4bM56L2P4dMhUnvxU3QMOeUTvk")' }}></div>
                            <div className="flex flex-col">
                                <h1 className="text-[#1d150c] dark:text-white text-sm font-bold leading-tight">Admin User</h1>
                                <p className="text-[#a17745] dark:text-orange-300 text-xs font-medium">Super Admin</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="px-3 py-2 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Menu Principal</p>
                            <button onClick={() => setAbaAtiva('painel')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${abaAtiva === 'painel' ? 'bg-primary/10 text-primary' : 'hover:bg-[#eaddcd] text-[#1d150c] dark:text-white'}`}>
                                <span className="material-symbols-outlined text-xl">dashboard</span>
                                <p className="text-sm font-bold leading-normal">Painel de Controle</p>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#eaddcd] text-[#1d150c] dark:text-white transition-colors group w-full text-left">
                                <span className="material-symbols-outlined text-xl text-[#a17745] dark:text-orange-300 group-hover:text-primary transition-colors">group</span>
                                <p className="text-sm font-medium leading-normal">Gerenciar Usuários</p>
                            </button>
                            <button onClick={() => setAbaAtiva('grupos-supervisores')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors group w-full text-left ${abaAtiva === 'grupos-supervisores' ? 'bg-primary/10 text-primary' : 'hover:bg-[#eaddcd] text-[#1d150c] dark:text-white'}`}>
                                <span className={`material-symbols-outlined text-xl transition-colors ${abaAtiva === 'grupos-supervisores' ? 'text-primary' : 'text-[#a17745] dark:text-orange-300 group-hover:text-primary'}`}>manage_accounts</span>
                                <p className="text-sm font-medium leading-normal">Responsáveis de Setor</p>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#eaddcd] text-[#1d150c] dark:text-white transition-colors group w-full text-left">
                                <span className="material-symbols-outlined text-xl text-[#a17745] dark:text-orange-300 group-hover:text-primary transition-colors">pie_chart</span>
                                <p className="text-sm font-medium leading-normal">Relatórios</p>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#eaddcd] text-[#1d150c] dark:text-white transition-colors group w-full text-left">
                                <span className="material-symbols-outlined text-xl text-[#a17745] dark:text-orange-300 group-hover:text-primary transition-colors">description</span>
                                <p className="text-sm font-medium leading-normal">Logs de Auditoria</p>
                            </button>
                        </div>
                        <div className="mt-4 flex flex-col gap-1 border-t border-[#eaddcd] dark:border-gray-800 pt-4">
                            <p className="px-3 py-2 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">Sistema</p>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#eaddcd] text-[#1d150c] dark:text-white transition-colors group w-full text-left">
                                <span className="material-symbols-outlined text-xl text-[#a17745] dark:text-orange-300 group-hover:text-primary transition-colors">settings</span>
                                <p className="text-sm font-medium leading-normal">Configurações</p>
                            </button>
                            <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#eaddcd] text-[#1d150c] dark:text-white transition-colors group w-full text-left">
                                <span className="material-symbols-outlined text-xl text-[#a17745] dark:text-orange-300 group-hover:text-primary transition-colors">help</span>
                                <p className="text-sm font-medium leading-normal">Ajuda e Suporte</p>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border-t border-[#eaddcd] dark:border-gray-800">
                        <p className="text-[#a17745] dark:text-orange-300 text-xs text-center">Prestek Admin v2.4.0</p>
                    </div>
                </aside>

                {/* Main Content Administrativo */}
                <main className="flex-1 overflow-y-auto bg-[#f8f7f5] dark:bg-[#0f0a05] p-6 lg:p-10 scrollbar-hide">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

                        {/* Seção: Responsáveis de Setor */}
                        {abaAtiva === 'grupos-supervisores' && (
                            <div className="flex flex-col gap-8">
                                <ResponsaveisManual />
                            </div>
                        )}

                        {/* Seção: Painel de Controle */}
                        {abaAtiva === 'painel' && <>
                        <div className="flex flex-wrap justify-between items-end gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-[#1d150c] dark:text-white tracking-tight text-3xl lg:text-4xl font-extrabold leading-tight">Visão Geral do Painel</h1>
                                <p className="text-[#a17745] dark:text-orange-300 text-base font-normal">Bem-vindo de volta, Administrador. Aqui está o que está acontecendo hoje.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 rounded bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 text-sm font-medium shadow-sm hover:shadow transition-all">
                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    <span>Últimos 30 Dias</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white text-sm font-medium shadow-md hover:bg-orange-600 transition-all">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    <span>Novo Relatório</span>
                                </button>
                            </div>
                        </div>

                        {/* KPIS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                    <span className="text-[#078810] text-xs font-bold bg-green-100 px-2 py-1 rounded">+12%</span>
                                </div>
                                <div>
                                    <p className="text-[#a17745] dark:text-orange-300 text-sm font-medium mb-1">Total de Usuários</p>
                                    <p className="text-[#1d150c] dark:text-white text-3xl font-bold tracking-tight">1,245</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded bg-blue-50 text-blue-500">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <span className="text-[#078810] text-xs font-bold bg-green-100 px-2 py-1 rounded">+5%</span>
                                </div>
                                <div>
                                    <p className="text-[#a17745] dark:text-orange-300 text-sm font-medium mb-1">Visitantes Mensais</p>
                                    <p className="text-[#1d150c] dark:text-white text-3xl font-bold tracking-tight">8,302</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded bg-purple-50 text-purple-500">
                                        <span className="material-symbols-outlined">edit_document</span>
                                    </div>
                                    <span className="text-[#e71008] text-xs font-bold bg-red-100 px-2 py-1 rounded">-2%</span>
                                </div>
                                <div>
                                    <p className="text-[#a17745] dark:text-orange-300 text-sm font-medium mb-1">Alterações Realizadas</p>
                                    <p className="text-[#1d150c] dark:text-white text-3xl font-bold tracking-tight">142</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded bg-red-50 text-red-500">
                                        <span className="material-symbols-outlined">error</span>
                                    </div>
                                    <span className="text-[#e71008] text-xs font-bold bg-red-100 px-2 py-1 rounded">-50%</span>
                                </div>
                                <div>
                                    <p className="text-[#a17745] dark:text-orange-300 text-sm font-medium mb-1">Erros Registrados</p>
                                    <p className="text-[#1d150c] dark:text-white text-3xl font-bold tracking-tight">3</p>
                                </div>
                            </div>
                        </div>

                        {/* Charts / Activity */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-[#1d150c] dark:text-white text-lg font-bold">Uso do Sistema</h3>
                                        <p className="text-[#a17745] dark:text-orange-300 text-sm">Carga do servidor ao longo do tempo</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#1d150c] dark:text-white">85%</p>
                                        <p className="text-[#078810] text-xs font-medium">Carga +5%</p>
                                    </div>
                                </div>
                                <div className="relative w-full h-64">
                                    <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 400 150">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.2"></stop>
                                                <stop offset="100%" stopColor="#ff8c00" stopOpacity="0"></stop>
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 100 Q 40 80 80 90 T 160 80 T 240 60 T 320 70 T 400 40 V 150 H 0 Z" fill="url(#chartGradient)"></path>
                                        <path d="M0 100 Q 40 80 80 90 T 160 80 T 240 60 T 320 70 T 400 40" fill="none" stroke="#ff8c00" strokeLinecap="round" strokeWidth="3"></path>
                                    </svg>
                                    <div className="flex justify-between mt-2 text-xs text-[#a17745] dark:text-orange-300 font-medium">
                                        <span>00:00</span>
                                        <span>04:00</span>
                                        <span>08:00</span>
                                        <span>12:00</span>
                                        <span>16:00</span>
                                        <span>20:00</span>
                                        <span>23:59</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 lg:max-w-md rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[#1d150c] dark:text-white text-lg font-bold">Atividades Recentes</h3>
                                    <button className="text-primary text-sm font-bold hover:underline">Ver Tudo</button>
                                </div>
                                <div className="flex flex-col gap-5">
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <span className="material-symbols-outlined text-sm">price_change</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[#1d150c] dark:text-white text-sm font-medium">
                                                <span className="font-bold">Roberta</span> atualizou o preço de <span className="font-semibold text-primary">600 MEGA</span>
                                            </p>
                                            <p className="text-[#a17745] dark:text-orange-300 text-xs mt-1">2 horas atrás</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                            <span className="material-symbols-outlined text-sm">person_add</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[#1d150c] dark:text-white text-sm font-medium">
                                                <span className="font-bold">System</span> registrou novo colaborador <span className="font-semibold text-primary">Mark S.</span>
                                            </p>
                                            <p className="text-[#a17745] dark:text-orange-300 text-xs mt-1">5 horas atrás</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                            <span className="material-symbols-outlined text-sm">security</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[#1d150c] dark:text-white text-sm font-medium">
                                                <span className="font-bold">Admin</span> alterou permissões para <span className="font-semibold text-primary">Time de Vendas</span>
                                            </p>
                                            <p className="text-[#a17745] dark:text-orange-300 text-xs mt-1">Ontem às 16:30</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                            <span className="material-symbols-outlined text-sm">upload_file</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[#1d150c] dark:text-white text-sm font-medium">
                                                <span className="font-bold">Sarah J.</span> fez upload do relatório de auditoria do 3º Trim
                                            </p>
                                            <p className="text-[#a17745] dark:text-orange-300 text-xs mt-1">Ontem às 11:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>add_circle</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="bg-white/20 w-10 h-10 rounded flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">Criar Novo Serviço</h3>
                                    <p className="text-white/80 text-sm">Lançar uma nova oferta no diretório imediatamente.</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer hover:shadow-md">
                                <div className="bg-blue-50 w-10 h-10 rounded flex items-center justify-center mb-4 text-blue-600">
                                    <span className="material-symbols-outlined">group_add</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-[#1d150c] dark:text-white group-hover:text-primary transition-colors">Onboarding de Colaborador</h3>
                                <p className="text-[#a17745] dark:text-orange-300 text-sm">Iniciar o processo de configuração para um novo membro da equipe.</p>
                            </div>
                            <div className="p-6 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:border-primary/50 transition-colors group cursor-pointer hover:shadow-md">
                                <div className="bg-purple-50 w-10 h-10 rounded flex items-center justify-center mb-4 text-purple-600">
                                    <span className="material-symbols-outlined">settings_system_daydream</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-[#1d150c] dark:text-white group-hover:text-primary transition-colors">Check-up de Saúde do Sistema</h3>
                                <p className="text-[#a17745] dark:text-orange-300 text-sm">Executar um diagnóstico nos serviços do portal da intranet.</p>
                            </div>
                        </div>
                        </>}
                    </div>
                </main>
            </div>
        </div>
    )
}

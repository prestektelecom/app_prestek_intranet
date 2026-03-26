import { useState, useEffect, useRef } from 'react';
import defaultAvatar from '../image/avatar/4472613.json';
import logoP from '../image/logos/Logo_P.webp';
import LottieAvatar from './common/LottieAvatar';

// Header: barra superior com logo, busca, notificações, perfil do usuário e navegação condicional
export default function Header({ currentView, setCurrentView, user }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const headerMenuItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'services', label: 'Serviços' },
        { id: 'coverage', label: 'Cobertura' },
        { id: 'directory', label: 'Colaboradores' },
        { id: 'sectors', label: 'Setores' },
        { id: 'schedule', label: 'Plantão' },
        { id: 'offices', label: 'Escritórios' },
        { id: 'processes', label: 'Processos' },
    ];

    const func = user?.funcionario ?? {};
    const safeName = func.funcionario || user?.nome || 'Usuário';
    const nameParts = safeName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    const safeRole = func.id_funcao || 'Colaborador';
    const safeDepto = func.id_departamento || '';
    const safeId = func.id ?? user?.id ?? '0000';

    const [avatarUrl, setAvatarUrl] = useState(user?.funcionario?.foto_perfil || defaultAvatar);

    useEffect(() => {
        setAvatarUrl(user?.funcionario?.foto_perfil || defaultAvatar);
    }, [user?.funcionario?.foto_perfil]);
    const [cargoName, setCargoName] = useState(safeRole);
    const [hasUrgent, setHasUrgent] = useState(false);
    const [urgentAnnouncements, setUrgentAnnouncements] = useState([]);
    const [hasViewedUrgent, setHasViewedUrgent] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const fetchUrgentCount = async () => {
            try {
                const response = await fetch('/api/comunicados');
                if (response.ok) {
                    const data = await response.json();
                    if (data.sucesso && data.comunicados) {
                        const urgentOnly = data.comunicados.filter(c => c.tipo === 'Urgente');
                        setHasUrgent(urgentOnly.length > 0);
                        setUrgentAnnouncements(prev => {
                            if (urgentOnly.length > prev.length) {
                                setHasViewedUrgent(false);
                            }
                            return urgentOnly;
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar comunicados no header", err);
            }
        };

        fetchUrgentCount();
        const intervalId = setInterval(fetchUrgentCount, 30000); // Atualiza a cada 30 segundos
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchCargoESetor = async () => {
            let nomeFinal = safeRole;
            try {
                // Busca departamentos (tickets), cargos (empresa_setor) e departamentos (organizacional)
                const [resDept, resCargo, resDeptEmp] = await Promise.all([
                    fetch('/api/departamentos').catch(() => null),
                    fetch('/api/cargos').catch(() => null),
                    fetch('/api/departamentos-empresa').catch(() => null)
                ]);

                let departamentos = [];
                let cargos = [];
                let deptosEmpresa = [];

                if (resDept?.ok) {
                    const data = await resDept.json();
                    if (data.sucesso) departamentos = data.departamentos || [];
                }
                if (resCargo?.ok) {
                    const data = await resCargo.json();
                    if (data.sucesso) cargos = data.cargos || [];
                }
                if (resDeptEmp?.ok) {
                    const data = await resDeptEmp.json();
                    if (data.sucesso) deptosEmpresa = data.departamentos || [];
                }

                // Tenta achar pelo departamento primeiro (organizacional, ticket ou cargo)
                let deptoName = 'N/D';
                if (safeDepto) {
                    const foundDeptEmp = deptosEmpresa.find(d => String(d.id).trim() === String(safeDepto).trim());
                    const foundDept = departamentos.find(d => String(d.id).trim() === String(safeDepto).trim());
                    const foundCargo = cargos.find(c => String(c.id).trim() === String(safeDepto).trim());
                    
                    deptoName = foundDeptEmp?.departamento || foundDept?.setor || foundCargo?.setor || safeDepto;
                }

                // Se encontrou o departamento, usa ele; senão, cai para id_funcao
                if (deptoName !== 'N/D' && deptoName !== '') {
                    nomeFinal = deptoName;
                } else if (safeRole && safeRole !== 'Colaborador') {
                    const foundRole = cargos.find(c => String(c.id).trim() === String(safeRole).trim());
                    if (foundRole?.setor) nomeFinal = foundRole.setor;
                }

                setCargoName(nomeFinal);
            } catch (err) {
                console.error("Erro ao buscar cargos/departamentos no header", err);
            }
        };

        fetchCargoESetor();
    }, [safeDepto, safeRole]);

    const avatarUrlRef = useRef(avatarUrl);
    useEffect(() => {
        avatarUrlRef.current = avatarUrl;
    }, [avatarUrl]);

    useEffect(() => {
        if (!safeId || safeId === '0000') return;
        
        const syncAvatar = () => {
            const currentSaved = localStorage.getItem(`stitch_profile_${safeId}`);
            if (currentSaved) {
                try {
                    const parsed = JSON.parse(currentSaved);
                    if (parsed.avatarUrl) {
                        const currentStr = JSON.stringify(avatarUrlRef.current);
                        const nextStr = JSON.stringify(parsed.avatarUrl);
                        if (currentStr !== nextStr) {
                            setAvatarUrl(parsed.avatarUrl);
                        }
                    }
                } catch (e) { }
            }
        };

        syncAvatar();
        const interval = setInterval(syncAvatar, 1500);
        return () => clearInterval(interval);
    }, [safeId]);

    // Handle click outside for notifications dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationsRef]);

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] px-4 md:px-6 py-3 shrink-0 h-16 z-20 shadow-sm relative transition-colors duration-200">
            {/* Logo + Busca + Navegação Condicional */}
            <div className="flex items-center gap-4 xl:gap-8 flex-1">
                {/* Botão Menu Hambúrguer (Mobile) - Touch Friendly (min-44px) */}
                <button
                    onClick={() => {
                        setIsMobileMenuOpen(!isMobileMenuOpen);
                        if (isMobileSearchOpen) setIsMobileSearchOpen(false);
                    }}
                    className="xl:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px] -ml-2 rounded-lg text-[#1d150c] dark:text-[#f8f7f5] hover:bg-[#f4eee6] dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-primary/50 outline-none"
                    aria-label="Alternar menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="material-symbols-outlined text-[26px]">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="size-8 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={logoP} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-[#1d150c] dark:text-white text-lg md:text-xl font-bold leading-tight tracking-tight hidden sm:block">
                        Prestek Intranet
                    </h2>
                    <h2 className="text-[#1d150c] dark:text-white text-lg font-bold leading-tight tracking-tight sm:hidden">
                        Prestek
                    </h2>
                </div>

                {/* Campo de busca (visível em md+) */}
                <label className="hidden md:flex relative group min-w-40 w-full max-w-sm h-10 transition-all duration-300">
                    <div className="absolute inset-0 bg-[#f4eee6] dark:bg-gray-800 rounded-full group-focus-within:bg-white dark:group-focus-within:bg-[#1a130b] transition-colors duration-300"></div>
                    <div className="relative flex w-full items-stretch rounded-full h-full border border-transparent group-focus-within:border-[#a17745]/30 group-focus-within:shadow-[0_2px_12px_rgba(161,119,69,0.08)] transition-all duration-300">
                        <div className="text-[#a17745] dark:text-orange-300 flex items-center justify-center pl-4 pr-2">
                            <span className="material-symbols-outlined text-[20px] group-focus-within:text-[#1d150c] dark:group-focus-within:text-white transition-colors duration-300">search</span>
                        </div>
                        <input
                            type="text"
                            className="flex-1 min-w-0 bg-transparent text-[#1d150c] dark:text-white border-0 focus:ring-0 px-2 text-sm font-medium placeholder:text-[#a17745]/70 dark:placeholder:text-orange-300/70 outline-none w-full"
                            placeholder="Buscar por serviços, pessoas ou documentos..."
                        />
                    </div>
                </label>

                {/* Navegação Horizontal (Visível apenas fora do dashboard) */}
                {currentView !== 'dashboard' && (
                    <nav className="hidden xl:flex items-center gap-1 ml-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {headerMenuItems.map(item => {
                            // Tratamento especial para o botão de voltar ao Dashboard
                            if (item.id === 'dashboard') {
                                return (
                                    <div key={item.id} className="flex items-center pr-2 mr-2 border-r border-slate-200">
                                        <button
                                            onClick={() => setCurrentView(item.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-lg transition-all duration-200 bg-primary/10 text-primary hover:bg-primary/20"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                            {item.label}
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 relative ${currentView === item.id
                                        ? 'text-primary bg-primary/5 dark:bg-primary/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {item.label}
                                    {currentView === item.id && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-primary rounded-t-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>

            {/* Ações + Perfil */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Busca Mobile */}
                <button
                    onClick={() => {
                        setIsMobileSearchOpen(!isMobileSearchOpen);
                        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                    className="md:hidden flex items-center justify-center p-1.5 sm:p-2 min-h-[44px] min-w-[44px] rounded-full text-[#1d150c] dark:text-[#f8f7f5] hover:bg-[#f4eee6] dark:hover:bg-gray-800 transition-colors"
                    aria-label="Alternar busca"
                >
                    <span className="material-symbols-outlined text-[24px]">search</span>
                </button>

                {/* Notificações */}
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            if (!isNotificationsOpen) {
                                setHasViewedUrgent(true);
                            }
                        }}
                        className={`flex items-center justify-center size-10 rounded-full hover:bg-[#f4eee6] dark:hover:bg-gray-800 transition-colors relative ${isNotificationsOpen ? 'bg-[#f4eee6] dark:bg-gray-800 text-primary' : 'bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-[#f8f7f5]'}`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${(hasUrgent && !hasViewedUrgent) ? 'animate-bell-ring text-orange-600 dark:text-orange-500' : ''}`}>notifications</span>
                        {(hasUrgent && !hasViewedUrgent) && (
                            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-white dark:border-[#1a130b]"></span>
                        )}
                    </button>
                    
                    {/* Dropdown de Notificações */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-[#fcfaf8] dark:bg-gray-800 px-4 py-3 border-b border-[#eaddcd] dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-[#1d150c] dark:text-white">Notificações</h3>
                                {hasUrgent && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {urgentAnnouncements.length} Urgente(s)
                                    </span>
                                )}
                            </div>
                            
                            <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                {!hasUrgent ? (
                                    <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                                        <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-2">
                                            <span className="material-symbols-outlined text-[28px]">task_alt</span>
                                        </div>
                                        <p className="text-[#1d150c] dark:text-[#f8f7f5] font-semibold">Tudo tranquilo!</p>
                                        <p className="text-[#635c55] dark:text-gray-400 text-xs text-balance">Nenhum comunicado urgente no momento.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#f4eee6] dark:divide-gray-800">
                                        {urgentAnnouncements.map((announcement) => {
                                            let dateFormatted = announcement.criado_em;
                                            try {
                                                const dt = new Date(announcement.criado_em);
                                                dateFormatted = new Intl.DateTimeFormat('pt-BR', {
                                                    day: '2-digit', month: 'short'
                                                }).format(dt);
                                            } catch(e) {}
                                            
                                            return (
                                                <div key={announcement.id} className="px-4 py-3 hover:bg-[#fcfaf8] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                                    <div className="flex gap-3">
                                                        <div className="shrink-0 pt-0.5">
                                                            <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-[18px]">priority_high</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="text-sm font-bold text-[#1d150c] dark:text-white truncate group-hover:text-primary transition-colors">
                                                                    {announcement.titulo}
                                                                </h4>
                                                            </div>
                                                            <p className="text-xs text-[#635c55] dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                                {announcement.descricao}
                                                            </p>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <p className="text-[10px] font-medium text-primary">
                                                                    {announcement.departamento_autor}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    {dateFormatted}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="p-2 bg-[#fcfaf8] dark:bg-gray-800 border-t border-[#eaddcd] dark:border-gray-700">
                                <button 
                                    onClick={() => {
                                        setIsNotificationsOpen(false);
                                        setCurrentView('dashboard'); // Assuming dashboard contains the 'Comunicados' view, or user can navigate there
                                    }}
                                    className="w-full py-2 text-xs font-bold text-center text-primary hover:text-[#a17745] transition-colors"
                                >
                                    Ver todos os comunicados
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Painel Admin */}
                {user?.is_admin && (
                    <button
                        onClick={() => setCurrentView('admin')}
                        title="Painel Administrativo"
                        className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a130b] hover:bg-[#f4eee6] dark:hover:bg-gray-800 text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                    </button>
                )}

                {/* Botão Sair / Logout */}
                <button
                    onClick={() => {
                        localStorage.removeItem('@Stitch:user');
                        localStorage.removeItem('@Stitch:currentView');
                        sessionStorage.removeItem('@Stitch:user');
                        sessionStorage.removeItem('@Stitch:currentView');
                        setCurrentView('login');
                    }}
                    title="Sair da Conta"
                    className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a130b] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">logout</span>
                </button>

                <div className="h-8 w-px bg-[#eaddcd] dark:bg-gray-800 mx-1"></div>

                {/* Avatar + Nome */}
                <div onClick={() => setCurrentView('settings')} className="flex items-center gap-3 cursor-pointer group">
                    <LottieAvatar 
                        src={avatarUrl || defaultAvatar}
                        className="rounded-full size-10 border-2 border-transparent group-hover:border-primary shrink-0 transition-all bg-gradient-to-br from-primary/20 to-orange-100"
                    />
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-bold leading-none dark:text-white truncate max-w-[250px]">{safeName}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[250px]">{cargoName}</p>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown/Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#1a130b] border-b border-[#eaddcd] dark:border-gray-800 p-4 shadow-xl xl:hidden flex flex-col gap-2 z-50 animate-in slide-in-from-top-2">
                    {headerMenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl font-bold transition-all ${currentView === item.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-[#f4eee6] dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {item.id === 'dashboard' ? 'dashboard' :
                                    item.id === 'services' ? 'construction' :
                                        item.id === 'coverage' ? 'verified_user' :
                                            item.id === 'directory' ? 'groups' :
                                                item.id === 'sectors' ? 'pie_chart' :
                                                    item.id === 'schedule' ? 'schedule' :
                                                        item.id === 'offices' ? 'apartment' :
                                                            'description'}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[#1a130b]/95 backdrop-blur-md border-b border-[#eaddcd] dark:border-gray-800 p-4 shadow-xl md:hidden z-50 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex relative w-full h-12 group">
                        <div className="absolute inset-0 bg-[#f4eee6] dark:bg-gray-800 rounded-full group-focus-within:bg-white dark:group-focus-within:bg-[#1a130b] transition-colors duration-300"></div>
                        <div className="relative flex w-full flex-1 items-stretch rounded-full h-full border border-transparent group-focus-within:border-[#a17745]/30 group-focus-within:shadow-[0_2px_12px_rgba(161,119,69,0.08)] transition-all duration-300">
                            <div className="text-[#a17745] dark:text-orange-300 flex items-center justify-center pl-5 pr-2">
                                <span className="material-symbols-outlined text-[22px] group-focus-within:text-[#1d150c] dark:group-focus-within:text-white transition-colors duration-300">search</span>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                className="flex-1 min-w-0 bg-transparent text-[#1d150c] dark:text-white border-0 focus:ring-0 px-2 text-base font-medium placeholder:text-[#a17745]/70 dark:placeholder:text-orange-300/70 outline-none w-full"
                                placeholder="Buscar serviços, pessoas..."
                            />
                        </div>
                    </label>
                </div>
            )}
        </header>
    )
}

import { useState, useEffect, useRef } from 'react';
import { resolveNomeSetor } from '../utils/resolveSetor';
import defaultAvatar from '../image/avatar/4472613.json';
import logoP from '../image/logos/Logo_P.webp';
import LottieAvatar from './common/LottieAvatar';

import avatar1 from '../image/avatar/4472612.json';
import avatar2 from '../image/avatar/4472613.json';
import avatar3 from '../image/avatar/4472614.json';
import avatar4 from '../image/avatar/4472615.json';
import avatar5 from '../image/avatar/4472616.json';
import avatar6 from '../image/avatar/4472617.json';
import avatar7 from '../image/avatar/4472622.json';
import avatar8 from '../image/avatar/4472623.json';
import avatar9 from '../image/avatar/4472624.json';
import avatar10 from '../image/avatar/4472625.json';

const PREDEFINED_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function resolveAvatar(raw) {
    if (!raw) return null;
    if (typeof raw === 'string' && raw.startsWith('__lottie_idx:')) {
        const idx = parseInt(raw.split(':')[1], 10);
        return PREDEFINED_AVATARS[idx] ?? null;
    }
    if (typeof raw === 'object' && (raw.v || raw.fr)) return raw;
    if (typeof raw === 'string' && (raw.startsWith('data:') || raw.startsWith('http') || raw.startsWith('/'))) return raw;
    return null;
}

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

    const [avatarUrl, setAvatarUrl] = useState(resolveAvatar(user?.funcionario?.foto_perfil) || defaultAvatar);

    useEffect(() => {
        setAvatarUrl(resolveAvatar(user?.funcionario?.foto_perfil) || defaultAvatar);
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
                            if (urgentOnly.length > prev.length) setHasViewedUrgent(false);
                            return urgentOnly;
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar comunicados no header", err);
            }
        };
        fetchUrgentCount();
        const intervalId = setInterval(fetchUrgentCount, 30000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        resolveNomeSetor(safeDepto, safeRole, user?.nome_grupo)
            .then(setCargoName)
            .catch(err => console.error("Erro ao resolver setor no header", err));
    }, [safeDepto, safeRole, user?.nome_grupo]);

    const avatarUrlRef = useRef(avatarUrl);
    useEffect(() => { avatarUrlRef.current = avatarUrl; }, [avatarUrl]);

    useEffect(() => {
        if (!safeId || safeId === '0000') return;
        const syncAvatar = () => {
            const currentSaved = localStorage.getItem(`stitch_profile_${safeId}`);
            if (currentSaved) {
                try {
                    const parsed = JSON.parse(currentSaved);
                    if (parsed.avatarUrl) {
                        const resolved = resolveAvatar(parsed.avatarUrl) || defaultAvatar;
                        if (JSON.stringify(avatarUrlRef.current) !== JSON.stringify(resolved)) {
                            setAvatarUrl(resolved);
                        }
                    }
                } catch (e) { }
            }
        };
        syncAvatar();
        const interval = setInterval(syncAvatar, 1500);
        return () => clearInterval(interval);
    }, [safeId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ─────────────────────── Render ─────────────────────────── */
    return (
        <header className="glass flex items-center justify-between whitespace-nowrap px-4 md:px-6 py-3 shrink-0 h-16 z-[1000] sticky top-0 transition-all duration-200">
            {/* Logo + Busca + Navegação */}
            <div className="flex items-center gap-4 xl:gap-8 flex-1">
                {/* Hambúrguer mobile */}
                <button
                    onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); if (isMobileSearchOpen) setIsMobileSearchOpen(false); }}
                    className="xl:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px] -ml-2 rounded-lg text-foreground hover:bg-surface-raised transition-colors focus:ring-2 focus:ring-primary/50 outline-none"
                    aria-label="Alternar menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="material-symbols-outlined text-[26px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Logo */}
                <div
                    className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                    onClick={() => setCurrentView('dashboard')}
                    title="Ir para o Dashboard"
                >
                    <div className="size-8 flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        <img src={logoP} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-foreground text-lg md:text-xl font-bold leading-tight tracking-tight hidden sm:block group-hover:text-primary transition-colors">
                        Prestek Intranet
                    </h2>
                    <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight sm:hidden group-hover:text-primary transition-colors">
                        Prestek
                    </h2>
                </div>

                {/* Campo de busca (md+) */}
                <label className="hidden md:flex relative group min-w-40 w-full max-w-sm h-10 transition-all duration-300">
                    <div className="absolute inset-0 bg-input rounded-full group-focus-within:bg-card transition-colors duration-300"></div>
                    <div className="relative flex w-full items-stretch rounded-full h-full border border-transparent group-focus-within:border-primary/25 group-focus-within:shadow-[0_2px_12px_var(--ring)] transition-all duration-300">
                        <div className="text-faint flex items-center justify-center pl-4 pr-2">
                            <span className="material-symbols-outlined text-[20px] group-focus-within:text-foreground transition-colors duration-300">search</span>
                        </div>
                        <input
                            type="text"
                            className="flex-1 min-w-0 bg-transparent text-foreground border-0 focus:ring-0 px-2 text-sm font-medium placeholder:text-faint/70 outline-none w-full"
                            placeholder="Buscar serviços, pessoas ou documentos..."
                        />
                    </div>
                </label>

                {/* Navegação horizontal (fora do dashboard, xl+) */}
                {currentView !== 'dashboard' && (
                    <nav className="hidden xl:flex items-center gap-1 ml-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {headerMenuItems.map(item => {
                            if (item.id === 'dashboard') {
                                return (
                                    <div key={item.id} className="flex items-center pr-2 mr-2 border-r border-border">
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
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 relative ${
                                        currentView === item.id
                                            ? 'text-primary bg-primary/8 dark:bg-primary/15'
                                            : 'text-muted hover:text-foreground hover:bg-surface-raised'
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
            <div className="flex items-center gap-2 md:gap-3">
                {/* Busca mobile */}
                <button
                    onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); if (isMobileMenuOpen) setIsMobileMenuOpen(false); }}
                    className="md:hidden flex items-center justify-center p-1.5 sm:p-2 min-h-[44px] min-w-[44px] rounded-full text-foreground hover:bg-surface-raised transition-colors"
                    aria-label="Alternar busca"
                >
                    <span className="material-symbols-outlined text-[24px]">search</span>
                </button>

                {/* Notificações */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); if (!isNotificationsOpen) setHasViewedUrgent(true); }}
                        className={`flex items-center justify-center size-10 rounded-full transition-colors relative ${
                            isNotificationsOpen ? 'bg-surface-raised text-primary' : 'text-foreground hover:bg-surface-raised'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[24px] ${hasUrgent && !hasViewedUrgent ? 'animate-bell-ring text-orange-500' : ''}`}>
                            notifications
                        </span>
                        {hasUrgent && !hasViewedUrgent && (
                            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-card"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-surface px-4 py-3 border-b border-border flex justify-between items-center">
                                <h3 className="font-bold text-foreground">Notificações</h3>
                                {hasUrgent && (
                                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                                        <p className="text-foreground font-semibold">Tudo tranquilo!</p>
                                        <p className="text-muted text-xs text-balance">Nenhum comunicado urgente no momento.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {urgentAnnouncements.map((announcement) => {
                                            let dateFormatted = announcement.criado_em;
                                            try {
                                                dateFormatted = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(announcement.criado_em));
                                            } catch (e) { }
                                            return (
                                                <div key={announcement.id} className="px-4 py-3 hover:bg-surface transition-colors cursor-pointer group">
                                                    <div className="flex gap-3">
                                                        <div className="shrink-0 pt-0.5">
                                                            <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-[18px]">priority_high</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors mb-1">
                                                                {announcement.titulo}
                                                            </h4>
                                                            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                                                                {announcement.descricao}
                                                            </p>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <p className="text-[10px] font-medium text-primary">{announcement.departamento_autor}</p>
                                                                <p className="text-[10px] text-muted">{dateFormatted}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 bg-surface border-t border-border">
                                <button
                                    onClick={() => { setIsNotificationsOpen(false); setCurrentView('announcements'); }}
                                    className="w-full py-2 text-xs font-bold text-center text-primary hover:text-primary/70 transition-colors"
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
                        className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                    </button>
                )}

                {/* Logout */}
                <button
                    onClick={() => {
                        localStorage.removeItem('@Stitch:user');
                        localStorage.removeItem('@Stitch:currentView');
                        sessionStorage.removeItem('@Stitch:user');
                        sessionStorage.removeItem('@Stitch:currentView');
                        setCurrentView('login');
                    }}
                    title="Sair da Conta"
                    className="flex items-center justify-center size-10 rounded-full text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">logout</span>
                </button>

                <div className="h-8 w-px bg-border mx-1"></div>

                {/* Avatar + Nome */}
                <div onClick={() => setCurrentView('settings')} className="flex items-center gap-3 cursor-pointer group">
                    <LottieAvatar
                        src={avatarUrl || defaultAvatar}
                        className="rounded-full size-10 border-2 border-transparent group-hover:border-primary shrink-0 transition-all bg-surface-raised"
                    />
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-bold leading-none text-foreground truncate max-w-[220px]">{safeName}</p>
                        <p className="text-xs text-muted mt-1 truncate max-w-[220px]">{cargoName}</p>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 shadow-xl xl:hidden flex flex-col gap-2 z-50 animate-in slide-in-from-top-2">
                    {headerMenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl font-bold transition-all ${
                                currentView === item.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted hover:bg-surface-raised hover:text-foreground'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {item.id === 'dashboard' ? 'dashboard' :
                                    item.id === 'services' ? 'construction' :
                                    item.id === 'coverage' ? 'verified_user' :
                                    item.id === 'directory' ? 'groups' :
                                    item.id === 'sectors' ? 'pie_chart' :
                                    item.id === 'schedule' ? 'schedule' :
                                    item.id === 'offices' ? 'apartment' : 'description'}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="absolute top-full left-0 right-0 glass border-b border-border p-4 shadow-xl md:hidden z-50 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex relative w-full h-12 group">
                        <div className="absolute inset-0 bg-input rounded-full group-focus-within:bg-card transition-colors duration-300"></div>
                        <div className="relative flex w-full flex-1 items-stretch rounded-full h-full border border-transparent group-focus-within:border-primary/25 group-focus-within:shadow-[0_2px_12px_var(--ring)] transition-all duration-300">
                            <div className="text-faint flex items-center justify-center pl-5 pr-2">
                                <span className="material-symbols-outlined text-[22px] group-focus-within:text-foreground transition-colors">search</span>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                className="flex-1 min-w-0 bg-transparent text-foreground border-0 focus:ring-0 px-2 text-base font-medium placeholder:text-faint/70 outline-none w-full"
                                placeholder="Buscar serviços, pessoas..."
                            />
                        </div>
                    </label>
                </div>
            )}
        </header>
    );
}

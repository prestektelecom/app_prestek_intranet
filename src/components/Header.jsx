import { useState } from 'react';

// Header: barra superior com logo, busca, notificações, perfil do usuário e navegação condicional
export default function Header({ currentView, setCurrentView }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const headerMenuItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'services', label: 'Serviços' },
        { id: 'coverage', label: 'Cobertura' },
        { id: 'directory', label: 'Diretório' },
        { id: 'sectors', label: 'Setores' },
        { id: 'schedule', label: 'Plantão' },
        { id: 'offices', label: 'Escritórios' },
        { id: 'processes', label: 'Processos' },
    ];

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#eaddcd] bg-white px-4 md:px-6 py-3 shrink-0 h-16 z-20 shadow-sm relative">
            {/* Logo + Busca + Navegação Condicional */}
            <div className="flex items-center gap-4 xl:gap-8 flex-1">
                {/* Botão Menu Hambúrguer (Mobile) - Touch Friendly (min-44px) */}
                <button
                    onClick={() => {
                        setIsMobileMenuOpen(!isMobileMenuOpen);
                        if (isMobileSearchOpen) setIsMobileSearchOpen(false);
                    }}
                    className="xl:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px] -ml-2 rounded-lg text-[#1d150c] hover:bg-[#f4eee6] transition-colors focus:ring-2 focus:ring-primary/50 outline-none"
                    aria-label="Alternar menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="material-symbols-outlined text-[26px]">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="size-8 rounded bg-primary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </div>
                    <h2 className="text-[#1d150c] text-lg md:text-xl font-bold leading-tight tracking-tight hidden sm:block">
                        Prestek Intranet
                    </h2>
                    <h2 className="text-[#1d150c] text-lg font-bold leading-tight tracking-tight sm:hidden">
                        Prestek
                    </h2>
                </div>

                {/* Campo de busca (visível em md+) */}
                <label className="hidden md:flex flex-col min-w-40 w-96 h-10">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#f4eee6] focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="text-[#a17745] flex items-center justify-center pl-4 rounded-l-lg">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none bg-transparent text-[#1d150c] focus:outline-0 focus:ring-0 h-full placeholder:text-[#a17745] px-3 text-sm font-normal leading-normal"
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
                                        ? 'text-primary bg-primary/5'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
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
                    className="md:hidden flex items-center justify-center p-1.5 sm:p-2 min-h-[44px] min-w-[44px] rounded-full text-[#1d150c] hover:bg-[#f4eee6] transition-colors"
                    aria-label="Alternar busca"
                >
                    <span className="material-symbols-outlined text-[24px]">search</span>
                </button>

                {/* Notificações */}
                <button className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-[#f4eee6] text-[#1d150c] transition-colors relative">
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-white"></span>
                </button>

                {/* Painel Admin */}
                <button
                    onClick={() => setCurrentView('admin')}
                    title="Painel Administrativo"
                    className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-[#f4eee6] text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                </button>

                {/* Configurações */}
                <button
                    onClick={() => setCurrentView('settings')}
                    title="Configurações"
                    className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-[#f4eee6] text-[#1d150c] transition-colors">
                    <span className="material-symbols-outlined text-[24px]">settings</span>
                </button>

                <div className="h-8 w-px bg-[#eaddcd] mx-1"></div>

                {/* Avatar + Nome */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-transparent group-hover:border-primary transition-all"
                        style={{
                            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzNpKtesQXtpcYif9ejbbMoZTuuRQGeIXa6m9sfm4J9LKnRIOTD8EBvlEOWFaUx-bXnxSunYjvJgSfs_5y0O7OFYf-e2DXSTBdO9Z9tnSErexUMgREwAScP_3KkTTqWj_FscXKucqmtwla4CUanVTBdz2myIkW2A8YOEBzv7z2WMc-YhFQT7h4amBXMMjREIk28yX2iWzX8a8npYrgt6uJM15Bj5yaEjw2wDoZTNqFBXpRQiiSWATeUxSzclzkzJ3Jt5Zmotuq7Ts")`,
                        }}
                    ></div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold leading-none">Alex Morgan</p>
                        <p className="text-xs text-gray-500 mt-1">Líder Comercial</p>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown/Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-[#eaddcd] p-4 shadow-xl xl:hidden flex flex-col gap-2 z-50 animate-in slide-in-from-top-2">
                    {headerMenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl font-bold transition-all ${currentView === item.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-600 hover:bg-[#f4eee6] hover:text-[#1d150c]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {item.id === 'dashboard' ? 'dashboard' :
                                    item.id === 'services' ? 'construction' :
                                        item.id === 'coverage' ? 'verified_user' :
                                            item.id === 'directory' ? 'menu_book' :
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
                <div className="absolute top-full left-0 right-0 bg-white border-b border-[#eaddcd] p-4 shadow-xl md:hidden z-50 animate-in slide-in-from-top-2">
                    <label className="flex flex-col w-full h-12">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#f4eee6] focus-within:ring-2 focus-within:ring-primary/50 transition-all overflow-hidden border border-transparent focus-within:border-primary/30">
                            <div className="text-[#a17745] flex items-center justify-center pl-4 bg-transparent">
                                <span className="material-symbols-outlined text-[22px]">search</span>
                            </div>
                            <input
                                autoFocus
                                className="form-input flex w-full min-w-0 flex-1 resize-none rounded-r-lg border-none bg-transparent text-[#1d150c] focus:outline-none focus:ring-0 h-full placeholder:text-[#a17745] px-3 text-base font-normal"
                                placeholder="Buscar serviços, pessoas..."
                            />
                        </div>
                    </label>
                </div>
            )}
        </header>
    )
}

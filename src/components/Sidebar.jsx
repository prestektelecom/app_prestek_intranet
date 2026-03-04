// Links de navegação do sidebar
const menuItems = [
    { id: 'services', icon: 'construction', label: 'Serviços' },
    { id: 'coverage', icon: 'verified_user', label: 'Cobertura' },
    { id: 'directory', icon: 'menu_book', label: 'Diretório' },
    { id: 'sectors', icon: 'pie_chart', label: 'Setores' },
    { id: 'schedule', icon: 'schedule', label: 'Plantão' },
    { id: 'offices', icon: 'apartment', label: 'Escritórios' },
    { id: 'processes', icon: 'description', label: 'Processos' },
]

const systemItems = [
    { id: 'announcements', icon: 'campaign', label: 'Comunicados', badge: '3' },
    { id: 'settings', icon: 'settings', label: 'Configurações' },
]

// Sidebar: menu de navegação lateral (visível apenas em lg+)
export default function Sidebar({ currentView, setCurrentView }) {
    return (
        <aside className="w-64 bg-white border-r border-[#eaddcd] flex flex-col py-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0">
            <nav className="flex flex-col gap-1 px-3">
                {/* Item ativo: Dashboard */}
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors text-left ${currentView === 'dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] text-[#635c55] hover:text-[#1d150c]'}`}
                >
                    <span className="material-symbols-outlined fill-1">dashboard</span>
                    <span className="text-sm font-bold">Dashboard</span>
                </button>

                {/* Seção Menu */}
                <div className="pt-4 pb-2 px-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</p>
                </div>

                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === item.id || (currentView === 'services' && item.label === 'Serviços') ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] text-[#635c55] hover:text-[#1d150c]'}`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}

                {/* Seção Sistema */}
                <div className="pt-4 pb-2 px-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sistema</p>
                </div>

                {systemItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] text-[#635c55] hover:text-[#1d150c]'}`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                            <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Widget "Precisa de Ajuda?" */}
            <div className="mt-auto p-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
                    <h4 className="text-sm font-bold text-primary mb-1">Precisa de Ajuda?</h4>
                    <p className="text-xs text-[#635c55] mb-3">
                        Contate o suporte de TI para problemas de acesso.
                    </p>
                    <button className="w-full bg-white text-primary text-xs font-bold py-2 rounded border border-primary/20 hover:bg-primary hover:text-white transition-colors">
                        Contatar Suporte
                    </button>
                </div>
            </div>
        </aside>
    )
}

import { useState, useEffect } from 'react';

// Links de navegação do sidebar
const menuItems = [
    { id: 'services', icon: 'construction', label: 'Serviços' },
    { id: 'coverage', icon: 'verified_user', label: 'Cobertura' },
    { id: 'directory', icon: 'groups', label: 'Colaboradores' },
    { id: 'sectors', icon: 'pie_chart', label: 'Setores' },
    { id: 'schedule', icon: 'schedule', label: 'Plantão' },
    { id: 'offices', icon: 'apartment', label: 'Escritórios' },
    { id: 'processes', icon: 'description', label: 'Processos' },
    { id: 'tickets', icon: 'confirmation_number', label: 'Meus Chamados' },
]

// Sidebar: menu de navegação lateral (visível apenas em lg+)
export default function Sidebar({ currentView, setCurrentView }) {
    const [urgentCount, setUrgentCount] = useState(0);

    useEffect(() => {
        const fetchUrgents = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/comunicados');
                const data = await res.json();
                if (data.sucesso) {
                    const count = data.comunicados.filter(item => item.tipo === 'Urgente').length;
                    setUrgentCount(count);
                }
            } catch (error) {
                console.error("Erro ao carregar quantidade de urgentes no sidebar:", error);
            }
        };

        fetchUrgents();
        // Option to refresh periodically
        const intervalId = setInterval(fetchUrgents, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const systemItems = [
        { id: 'announcements', icon: 'campaign', label: 'Comunicados', badge: urgentCount > 0 ? String(urgentCount) : null },
        { id: 'settings', icon: 'settings', label: 'Configurações' },
        { id: 'admin', icon: 'admin_panel_settings', label: 'Painel Admin' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-[#1a130b] border-r border-[#eaddcd] dark:border-gray-800 flex flex-col py-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0 transition-colors duration-200">
            <nav className="flex flex-col gap-1 px-3">
                {/* Item ativo: Dashboard */}
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg group transition-colors text-left ${currentView === 'dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] dark:hover:bg-gray-800 text-[#635c55] dark:text-[#f8f7f5] hover:text-[#1d150c] dark:hover:text-white'}`}
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === item.id || (currentView === 'services' && item.label === 'Serviços') ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] dark:hover:bg-gray-800 text-[#635c55] dark:text-[#f8f7f5] hover:text-[#1d150c] dark:hover:text-white'}`}
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${currentView === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-[#f4eee6] dark:hover:bg-gray-800 text-[#635c55] dark:text-[#f8f7f5] hover:text-[#1d150c] dark:hover:text-white'}`}
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
                    <p className="text-xs text-[#635c55] dark:text-gray-300 mb-3">
                        Contate o suporte de TI para problemas de acesso.
                    </p>
                    <button className="w-full bg-white dark:bg-gray-800 text-primary text-xs font-bold py-2 rounded border border-primary/20 hover:bg-primary hover:text-white transition-colors">
                        Contatar Suporte
                    </button>
                </div>
            </div>
        </aside>
    )
}

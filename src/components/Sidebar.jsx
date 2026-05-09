import { useState, useEffect } from 'react';

const menuItems = [
    { id: 'services',  icon: 'construction',        label: 'Serviços' },
    { id: 'coverage',  icon: 'verified_user',        label: 'Cobertura' },
    { id: 'directory', icon: 'groups',               label: 'Colaboradores' },
    { id: 'sectors',   icon: 'pie_chart',            label: 'Setores' },
    { id: 'schedule',  icon: 'schedule',             label: 'Plantão' },
    { id: 'offices',   icon: 'apartment',            label: 'Escritórios' },
    { id: 'processes', icon: 'description',          label: 'Processos' },
    { id: 'tickets',   icon: 'confirmation_number',  label: 'Meus Chamados' },
];

export default function Sidebar({ currentView, setCurrentView }) {
    const [urgentCount, setUrgentCount] = useState(0);

    useEffect(() => {
        const fetchUrgents = async () => {
            try {
                const res = await fetch('/api/comunicados');
                const data = await res.json();
                if (data.sucesso) {
                    setUrgentCount(data.comunicados.filter(item => item.tipo === 'Urgente').length);
                }
            } catch (error) {
                console.error("Erro ao carregar quantidade de urgentes no sidebar:", error);
            }
        };
        fetchUrgents();
        const intervalId = setInterval(fetchUrgents, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const systemItems = [
        { id: 'announcements', icon: 'campaign',             label: 'Comunicados', badge: urgentCount > 0 ? String(urgentCount) : null },
        { id: 'settings',      icon: 'settings',             label: 'Configurações' },
        { id: 'admin',         icon: 'admin_panel_settings', label: 'Painel Admin' },
    ];

    const navBtn = (item) => {
        const active = currentView === item.id;
        return (
            <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left group ${
                    active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-surface-raised hover:text-foreground'
                }`}
            >
                <span className={`material-symbols-outlined ${active ? 'text-primary' : 'group-hover:text-foreground'}`}>
                    {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                    </span>
                )}
            </button>
        );
    };

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col py-4 overflow-y-auto no-scrollbar hidden lg:flex shrink-0 transition-colors duration-200">
            <nav className="flex flex-col gap-0.5 px-3">
                {/* Dashboard */}
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left group ${
                        currentView === 'dashboard'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted hover:bg-surface-raised hover:text-foreground'
                    }`}
                >
                    <span className={`material-symbols-outlined fill-1 ${currentView === 'dashboard' ? 'text-primary' : 'group-hover:text-foreground'}`}>
                        dashboard
                    </span>
                    <span className="text-sm font-bold">Dashboard</span>
                </button>

                <div className="pt-4 pb-1.5 px-3">
                    <p className="text-xs font-bold text-muted/60 uppercase tracking-wider">Menu</p>
                </div>
                {menuItems.map(navBtn)}

                <div className="pt-4 pb-1.5 px-3">
                    <p className="text-xs font-bold text-muted/60 uppercase tracking-wider">Sistema</p>
                </div>
                {systemItems.map(navBtn)}
            </nav>

            {/* Widget "Precisa de Ajuda?" */}
            <div className="mt-auto p-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/15 card-elevated">
                    <h4 className="text-sm font-bold text-primary mb-1">Precisa de Ajuda?</h4>
                    <p className="text-xs text-muted mb-3">
                        Contate o suporte de TI para problemas de acesso.
                    </p>
                    <button className="w-full bg-card text-primary text-xs font-bold py-2 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors shadow-sm">
                        Contatar Suporte
                    </button>
                </div>
            </div>
        </aside>
    );
}

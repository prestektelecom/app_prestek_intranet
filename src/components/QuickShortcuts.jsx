// Grade 2x2 de atalhos rápidos
export default function QuickShortcuts({ setCurrentView }) {
    // Atalhos rápidos disponíveis no dashboard
    const shortcuts = [
        { icon: 'add_box', label: 'Nova Solicitação', action: () => { } },
        { icon: 'event', label: 'Reservar Sala', action: () => { } },
        { icon: 'support_agent', label: 'Suporte de TI', action: () => { } },
        { icon: 'badge', label: 'Meu Perfil', action: () => setCurrentView('settings') },
    ]

    return (
        <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
                <button
                    key={shortcut.label}
                    onClick={shortcut.action}
                    className="flex flex-col items-center justify-center p-6 bg-white border border-[#eaddcd] rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-center group w-full"
                >
                    <span className="material-symbols-outlined text-4xl text-[#635c55] mb-3 group-hover:text-primary transition-colors">
                        {shortcut.icon}
                    </span>
                    <span className="text-sm font-bold text-[#1d150c]">{shortcut.label}</span>
                </button>
            ))}
        </div>
    )
}

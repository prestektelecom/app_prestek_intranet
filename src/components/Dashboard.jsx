import StatCard from './StatCard'
import AnnouncementsList from './AnnouncementsList'
import QuickShortcuts from './QuickShortcuts'
import TeamAvailability from './TeamAvailability'

// Dados dos cards de estatísticas do topo
const stats = [
    {
        icon: 'pie_chart',
        label: 'Meu Setor',
        value: 'Comercial',
        badge: (
            <>
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                +12% Eficiência
            </>
        ),
        badgeClassName: 'text-green-600',
    },
    {
        icon: 'event_available',
        label: 'Próximo Plantão',
        value: '01/03/2025',
        badge: '09:00 - 17:00',
        badgeClassName: 'text-[#635c55]',
    },
    {
        icon: 'folder_open',
        label: 'Contratos Ativos',
        value: '45',
        badge: (
            <>
                <span className="material-symbols-outlined text-sm mr-1">priority_high</span>
                3 Necessitam de Revisão
            </>
        ),
        badgeClassName: 'text-orange-600',
    },
]

// Página principal do Dashboard
export default function Dashboard() {
    return (
        <main className="flex-1 overflow-y-auto bg-background-light p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Saudação + Data */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1d150c] mb-2">
                            Bem-vindo de volta, Alex!
                        </h1>
                        <p className="text-[#635c55]">
                            Aqui está o que está acontecendo no seu setor hoje.
                        </p>
                    </div>
                    <div className="text-sm text-[#635c55] bg-white px-4 py-2 rounded-lg border border-[#eaddcd] shadow-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span>Hoje é Terça-feira, 24 Out 2023</span>
                    </div>
                </div>

                {/* Cards de estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>

                {/* Comunicados + Atalhos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <AnnouncementsList />

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1d150c]">Atalhos Rápidos</h2>
                        <QuickShortcuts />
                        <TeamAvailability />
                    </div>
                </div>

                {/* Rodapé */}
                <div className="border-t border-[#eaddcd] pt-6 flex justify-between items-center text-xs text-[#635c55]">
                    <p>© 2026 Prestek Inc. Portal Interno. Confidencial.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary">Política de Privacidade</a>
                        <a href="#" className="hover:text-primary">Diretrizes Internas</a>
                    </div>
                </div>

            </div>
        </main>
    )
}

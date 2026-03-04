// Dados dos comunicados urgentes
const announcements = [
    {
        id: 1,
        icon: 'campaign',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'Atualização de Política Q4: Diretrizes de Trabalho Remoto',
        date: 'Hoje',
        summary:
            'Por favor, revise as diretrizes atualizadas sobre alocação de trabalho remoto para o próximo trimestre. Todos os chefes de departamento devem assinar até sexta-feira.',
    },
    {
        id: 2,
        icon: 'engineering',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        title: 'Manutenção de Sistema Agendada',
        date: 'Ontem',
        summary:
            'O portal da Intranet estará fora do ar para manutenção programada no sábado, 28 de outubro, das 02:00 às 04:00.',
    },
    {
        id: 3,
        icon: 'celebration',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        title: 'Reunião Geral Anual (Town Hall)',
        date: '20 Out',
        summary:
            'Junte-se a nós para a reunião geral anual, onde discutiremos nossas conquistas e o roteiro para o próximo ano fiscal.',
    },
]

// Lista de comunicados urgentes
export default function AnnouncementsList() {
    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1d150c]">Comunicados Urgentes</h2>
                <a href="#" className="text-sm font-bold text-primary hover:underline">
                    Ver Todos
                </a>
            </div>

            <div className="bg-white rounded-lg border border-[#eaddcd] shadow-sm divide-y divide-[#f4eee6]">
                {announcements.map((item) => (
                    <div
                        key={item.id}
                        className="p-5 flex gap-4 hover:bg-[#fcfaf8] transition-colors cursor-pointer group"
                    >
                        {/* Ícone */}
                        <div className="shrink-0 pt-1">
                            <div className={`size-10 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-[#1d150c] group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <span className="text-xs text-[#635c55] bg-[#f4eee6] px-2 py-1 rounded shrink-0 ml-2">
                                    {item.date}
                                </span>
                            </div>
                            <p className="text-sm text-[#635c55] line-clamp-2">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

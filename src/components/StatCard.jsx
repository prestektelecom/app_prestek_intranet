// StatCard: card de estatística genérico com ícone decorativo em background
export default function StatCard({ icon, label, value, badge, badgeClassName }) {
    return (
        <div className="bg-white p-6 rounded-lg border border-[#eaddcd] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Ícone decorativo (fundo) */}
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">{icon}</span>
            </div>

            {/* Conteúdo */}
            <div className="relative z-10">
                <p className="text-sm font-medium text-[#635c55] mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary"></span>
                    {label}
                </p>
                <p className="text-3xl font-bold text-[#1d150c]">{value}</p>
                {badge && (
                    <p className={`text-xs mt-2 font-medium flex items-center ${badgeClassName}`}>
                        {badge}
                    </p>
                )}
            </div>
        </div>
    )
}

// StatCard: card de estatística genérico com ícone decorativo em background
export default function StatCard({ icon, label, value, badge, badgeClassName, tooltip }) {
    return (
        <div className={`bg-white dark:bg-[#1a130b] p-6 rounded-lg border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow relative group ${tooltip ? 'group/tooltip cursor-help' : ''}`}>
            {/* Ícone decorativo (fundo) com overflow hidden isolado */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-primary">{icon}</span>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="relative z-10">
                <p className="text-sm font-medium text-[#635c55] dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary"></span>
                    {label}
                    {tooltip && <span className="material-symbols-outlined text-xs text-gray-400">info</span>}
                </p>
                <p className="text-3xl font-bold text-[#1d150c] dark:text-white">{value}</p>
                {badge && (
                    <p className={`text-xs mt-2 font-medium flex items-center ${badgeClassName}`}>
                        {badge}
                    </p>
                )}
            </div>

            {/* Tooltip — ativado ao hover no card inteiro */}
            {tooltip && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-max max-w-[260px] p-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 pointer-events-none">
                    {tooltip}
                    <div className="absolute bottom-full left-5 border-4 border-transparent border-b-gray-700"></div>
                    <div className="absolute bottom-[calc(100%-1px)] left-5 border-4 border-transparent border-b-gray-900"></div>
                </div>
            )}
        </div>
    )
}

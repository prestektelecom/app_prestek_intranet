export default function Comunicados() {
    return (
        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1024px] mx-auto w-full overflow-y-auto no-scrollbar">
            <div className="mb-10 mt-4">
                <h1 className="text-3xl sm:text-4xl font-black text-[#1d150c] dark:text-white mb-3 leading-tight tracking-[-0.033em]">Comunicados da Empresa</h1>
                <p className="text-[#a17745] dark:text-orange-300 text-lg max-w-2xl leading-relaxed">Fique atualizado com as últimas notícias, alertas urgentes e diretrizes importantes da diretoria da Prestek.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-[#1a130b] p-4 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white shadow-md shadow-primary/20 hover:bg-[#e67e00] transition-colors">
                        Todas as Atualizações
                    </button>
                    <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                        Urgente
                    </button>
                    <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 transition-colors">
                        Importante
                    </button>
                    <button className="px-4 py-2 rounded-full text-sm font-medium bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">
                        Geral
                    </button>
                </div>
                <div className="w-full md:w-auto relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a17745] dark:text-orange-300 text-xl">filter_list</span>
                    <select className="pl-10 pr-8 py-2 w-full md:w-48 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm text-[#1d150c] dark:text-white focus:ring-2 focus:ring-primary/50 cursor-pointer outline-none transition-all">
                        <option>Mais recentes primeiro</option>
                        <option>Mais antigos primeiro</option>
                        <option>Ordenar por Autor</option>
                    </select>
                </div>
            </div>

            <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 sm:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#eaddcd] before:to-transparent">

                {/* Urgente */}
                <div className="relative group">
                    <div className="absolute -left-4 sm:-left-8 mt-1.5 h-8 w-8 rounded-full border-4 border-[#fcfaf8] bg-red-500 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-white text-[16px]">priority_high</span>
                    </div>
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl p-6 border border-l-4 border-l-red-500 border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Urgente</span>
                                <span className="text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> 24 Out, 2023
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#635c55] dark:text-gray-300 uppercase tracking-wider">Pelo Departamento de RH</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2 group-hover:text-primary transition-colors">Nova Atualização da Política de Segurança de TI</h3>
                        <p className="text-[#635c55] dark:text-gray-300 text-sm leading-relaxed mb-4">
                            Com efeito imediato, todos os funcionários devem atualizar suas senhas seguindo as novas diretrizes de complexidade. O não cumprimento até sexta-feira resultará na suspensão temporária da conta. Por favor, revise o documento anexo para detalhes completos.
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                            <div className="flex -space-x-2">
                                {/* Pode adicionar avatares aqui se quiser */}
                            </div>
                            <button className="flex items-center text-sm font-bold text-primary hover:text-[#e67e00] transition-colors group/btn">
                                Ler atualização completa <span className="material-symbols-outlined text-lg ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Importante */}
                <div className="relative group">
                    <div className="absolute -left-4 sm:-left-8 mt-1.5 h-8 w-8 rounded-full border-4 border-[#fcfaf8] bg-yellow-500 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-white text-[16px]">notification_important</span>
                    </div>
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl p-6 border border-l-4 border-l-yellow-500 border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">Importante</span>
                                <span className="text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> 20 Out, 2023
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#635c55] dark:text-gray-300 uppercase tracking-wider">Pela Diretoria</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2 group-hover:text-primary transition-colors">Anúncio de Horário de Feriado</h3>
                        <p className="text-[#635c55] dark:text-gray-300 text-sm leading-relaxed mb-4">
                            O escritório estará fechado de 24 de dezembro a 2 de janeiro. Por favor, certifique-se de que todos os projetos pendentes sejam enviados antes do recesso. Desejamos a todos uma temporada de festas relaxante.
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                            <div className="text-xs font-bold text-[#a17745] dark:text-orange-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">attachment</span> 2 anexos
                            </div>
                            <button className="flex items-center text-sm font-bold text-primary hover:text-[#e67e00] transition-colors group/btn">
                                Ler atualização completa <span className="material-symbols-outlined text-lg ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Geral 1 */}
                <div className="relative group">
                    <div className="absolute -left-4 sm:-left-8 mt-1.5 h-8 w-8 rounded-full border-4 border-[#fcfaf8] bg-green-500 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-white text-[16px]">article</span>
                    </div>
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl p-6 border border-l-4 border-l-green-500 border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Geral</span>
                                <span className="text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> 15 Out, 2023
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#635c55] dark:text-gray-300 uppercase tracking-wider">Pelo Departamento de RH</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2 group-hover:text-primary transition-colors">Diretrizes de Avaliação de Desempenho do 3º Trimestre</h3>
                        <p className="text-[#635c55] dark:text-gray-300 text-sm leading-relaxed mb-4">
                            Os gestores são lembrados de concluir as avaliações de desempenho do 3º trimestre até o final do mês. O novo portal de avaliação já está no ar e pode ser acessado pelo dashboard.
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                            <div className="text-xs font-bold text-[#a17745] dark:text-orange-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">link</span> Link para o Portal
                            </div>
                            <button className="flex items-center text-sm font-bold text-primary hover:text-[#e67e00] transition-colors group/btn">
                                Ler atualização completa <span className="material-symbols-outlined text-lg ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Geral 2 */}
                <div className="relative group">
                    <div className="absolute -left-4 sm:-left-8 mt-1.5 h-8 w-8 rounded-full border-4 border-[#fcfaf8] bg-green-500 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-white text-[16px]">restaurant</span>
                    </div>
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl p-6 border border-l-4 border-l-green-500 border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Geral</span>
                                <span className="text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> 10 Out, 2023
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[#635c55] dark:text-gray-300 uppercase tracking-wider">Pelas Operações</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2 group-hover:text-primary transition-colors">Mudanças no Cardápio do Refeitório</h3>
                        <p className="text-[#635c55] dark:text-gray-300 text-sm leading-relaxed mb-4">
                            Com base no feedback dos funcionários, estamos introduzindo novas opções veganas e sem glúten a partir da próxima segunda-feira. Confira o novo cardápio semanal anexo abaixo.
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                            <div className="text-xs font-bold text-[#a17745] dark:text-orange-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">attachment</span> 1 anexo
                            </div>
                            <button className="flex items-center text-sm font-bold text-primary hover:text-[#e67e00] transition-colors group/btn">
                                Ler atualização completa <span className="material-symbols-outlined text-lg ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
                <button className="p-2 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#a17745] dark:text-orange-300 transition-colors disabled:opacity-50 flex items-center justify-center" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="h-10 w-10 rounded-lg bg-primary text-white font-bold text-sm shadow-md shadow-primary/20">1</button>
                <button className="h-10 w-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white font-bold text-sm transition-colors">2</button>
                <button className="h-10 w-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white font-bold text-sm transition-colors">3</button>
                <span className="text-[#a17745] dark:text-orange-300 px-2 font-bold">...</span>
                <button className="h-10 w-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white font-bold text-sm transition-colors">8</button>
                <button className="p-2 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </main>
    )
}

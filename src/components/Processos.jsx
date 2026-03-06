export default function Processos() {
    return (
        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1400px] mx-auto w-full overflow-y-auto no-scrollbar">
            <div className="flex flex-wrap justify-between gap-6 mb-8 items-end">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#a17745] dark:text-orange-300 text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        <span>/</span>
                        <span>Recursos Internos</span>
                        <span>/</span>
                        <span className="text-[#1d150c] dark:text-white">Processos</span>
                    </div>
                    <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Processos Operacionais</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-base font-normal leading-normal max-w-2xl">Gerencie e visualize procedimentos internos documentados, fluxos de trabalho e diagramas BPMN para todos os departamentos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded text-[#1d150c] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Exportar Lista</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 h-10 bg-primary hover:bg-[#e67e00] text-white rounded text-sm font-bold shadow-md transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Novo Processo</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a130b] p-4 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a17745] dark:text-orange-300">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2.5 border border-[#eaddcd] dark:border-gray-800 rounded leading-5 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white placeholder:text-[#a17745] dark:text-orange-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Buscar por Nome do Processo ou ID (ex: OP-001)..." type="text" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium whitespace-nowrap shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">grid_view</span>
                            Todas as Categorias
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white rounded text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                            <span className="material-symbols-outlined text-[18px] text-[#a17745] dark:text-orange-300">support_agent</span>
                            Atendimento
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white rounded text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                            <span className="material-symbols-outlined text-[18px] text-[#a17745] dark:text-orange-300">sell</span>
                            Vendas
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white rounded text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                            <span className="material-symbols-outlined text-[18px] text-[#a17745] dark:text-orange-300">settings</span>
                            Operações
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fcfaf8] dark:bg-[#2c2217] border-b border-[#eaddcd] dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-32">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-1/4">NOME DO PROCESSO</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">DESCRIÇÃO</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-40 text-center">STATUS</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-48 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaddcd] bg-white dark:bg-[#1a130b]">
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">OP-001</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-semibold">Onboarding de Clientes</td>
                                <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300">Procedimento padrão para registro de novos clientes e configuração do sistema.</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-[#e67e00] font-bold flex items-center justify-end gap-1 ml-auto group-hover:underline">
                                        <span>Ver Diagrama</span>
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">OP-002</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-semibold">Resposta a Quedas de Serviço</td>
                                <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300">Protocolo para lidar com interrupções críticas inesperadas no serviço.</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em Revisão</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-[#e67e00] font-bold flex items-center justify-end gap-1 ml-auto group-hover:underline">
                                        <span>Ver Diagrama</span>
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">SAL-104</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-semibold">Qualificação de Leads</td>
                                <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300">Critérios e etapas automatizadas para qualificação de leads de vendas.</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-[#e67e00] font-bold flex items-center justify-end gap-1 ml-auto group-hover:underline">
                                        <span>Ver Diagrama</span>
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">CS-205</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-semibold">Escalonamento de Ticket N2</td>
                                <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300">Diretrizes para escalonar tickets de suporte para o time técnico de Nível 2.</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-[#e67e00] font-bold flex items-center justify-end gap-1 ml-auto group-hover:underline">
                                        <span>Ver Diagrama</span>
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">HR-003</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d150c] dark:text-white font-semibold">Desligamento de Colaborador</td>
                                <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300">Checklist abrangente para procedimentos de saída e devolução de ativos.</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Rascunho</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-[#e67e00] font-bold flex items-center justify-end gap-1 ml-auto cursor-not-allowed" disabled>
                                        <span>Em Rascunho</span>
                                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-[#eaddcd] dark:border-gray-800 flex items-center justify-between bg-[#fcfaf8] dark:bg-[#2c2217]">
                    <span className="text-sm text-[#a17745] dark:text-orange-300">Mostrando <span className="font-medium text-[#1d150c] dark:text-white">1</span> a <span className="font-medium text-[#1d150c] dark:text-white">5</span> de <span className="font-medium text-[#1d150c] dark:text-white">42</span> resultados</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-[#eaddcd] dark:border-gray-800 rounded text-sm text-[#a17745] dark:text-orange-300 hover:bg-gray-100 disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 border border-[#eaddcd] dark:border-gray-800 rounded text-sm text-[#1d150c] dark:text-white hover:bg-gray-100">Próximo</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">support_agent</span>
                        </div>
                        <span className="text-3xl font-bold text-[#1d150c] dark:text-white">12</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-1">Atendimento ao Cliente</h3>
                    <p className="text-[#a17745] dark:text-orange-300 text-sm">Processos relacionados a suporte, abertura de chamados e feedback.</p>
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <p className="text-xs text-[#a17745] dark:text-orange-300 mt-2 text-right">70% Atualizado</p>
                </div>
                <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">sell</span>
                        </div>
                        <span className="text-3xl font-bold text-[#1d150c] dark:text-white">8</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-1">Vendas</h3>
                    <p className="text-[#a17745] dark:text-orange-300 text-sm">Geração de leads, qualificação e fluxos de fechamento.</p>
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <p className="text-xs text-[#a17745] dark:text-orange-300 mt-2 text-right">90% Atualizado</p>
                </div>
                <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">settings</span>
                        </div>
                        <span className="text-3xl font-bold text-[#1d150c] dark:text-white">22</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-1">Operações</h3>
                    <p className="text-[#a17745] dark:text-orange-300 text-sm">Logística interna, RH e procedimentos de manutenção técnica.</p>
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-xs text-[#a17745] dark:text-orange-300 mt-2 text-right">45% Atualizado</p>
                </div>
            </div>
        </main>
    )
}

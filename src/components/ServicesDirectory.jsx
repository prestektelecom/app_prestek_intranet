export default function ServicesDirectory() {
    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark py-8 px-4 md:px-10">
            <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button className="hover:text-primary transition-colors">Início</button>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <button className="hover:text-primary transition-colors">Dashboard</button>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-slate-900 dark:text-white">Serviços</span>
                    </div>

                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Diretório de Serviços Internos</h1>
                            <p className="text-base text-slate-500 dark:text-slate-400">Gerencie planos de internet, detalhes de serviços e estruturas de preços.</p>
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all">
                            <span className="material-symbols-outlined text-xl">add</span>
                            Adicionar Novo Serviço
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-slate-900">
                        <span>Todos os Serviços</span>
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1a130b] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary">
                        <span className="material-symbols-outlined text-lg">person</span>
                        Internet PF
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1a130b] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary">
                        <span className="material-symbols-outlined text-lg">business</span>
                        Internet PJ
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#1a130b] border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary">
                        <span className="material-symbols-outlined text-lg">router</span>
                        Link Dedicado
                    </button>
                </div>

                {/* Services Table */}
                <div className="rounded-xl border border-slate-200 bg-white dark:bg-[#1a130b] shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-semibold" scope="col">NOME DO SERVIÇO</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">VALOR (R$)</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">PRAZO</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">INSTALAÇÃO</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">MARGEM (%)</th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                                <span className="material-symbols-outlined">wifi</span>
                                            </div>
                                            Internet 800 MEGA PF
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">R$ 149,90</td>
                                    <td className="px-6 py-4">3 Dias</td>
                                    <td className="px-6 py-4 text-green-600 font-medium dark:text-green-400">Grátis</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-600">
                                                <div className="h-2 rounded-full bg-primary" style={{ width: '35%' }}></div>
                                            </div>
                                            <span className="text-xs font-medium">35%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary">
                                            <span className="material-symbols-outlined">edit_square</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                                <span className="material-symbols-outlined">wifi</span>
                                            </div>
                                            Internet 600 MEGA PF
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">R$ 119,90</td>
                                    <td className="px-6 py-4">3 Dias</td>
                                    <td className="px-6 py-4 text-green-600 font-medium dark:text-green-400">Grátis</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-600">
                                                <div className="h-2 rounded-full bg-primary" style={{ width: '30%' }}></div>
                                            </div>
                                            <span className="text-xs font-medium">30%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary">
                                            <span className="material-symbols-outlined">edit_square</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                                <span className="material-symbols-outlined">wifi</span>
                                            </div>
                                            Internet 500 MEGA PF
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">R$ 99,90</td>
                                    <td className="px-6 py-4">3 Dias</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">R$ 50,00</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-600">
                                                <div className="h-2 rounded-full bg-orange-400" style={{ width: '25%' }}></div>
                                            </div>
                                            <span className="text-xs font-medium">25%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary">
                                            <span className="material-symbols-outlined">edit_square</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                                <span className="material-symbols-outlined">domain</span>
                                            </div>
                                            Internet 1GB PJ
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">R$ 299,90</td>
                                    <td className="px-6 py-4">5 Dias</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">R$ 100,00</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-600">
                                                <div className="h-2 rounded-full bg-green-500" style={{ width: '40%' }}></div>
                                            </div>
                                            <span className="text-xs font-medium">40%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary">
                                            <span className="material-symbols-outlined">edit_square</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                <span className="material-symbols-outlined">settings_ethernet</span>
                                            </div>
                                            Internet Link Dedicado 500MB
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">R$ 899,00</td>
                                    <td className="px-6 py-4">15 Dias</td>
                                    <td className="px-6 py-4 text-slate-600 italic dark:text-slate-400">Consultar</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-16 rounded-full bg-slate-100 dark:bg-slate-600">
                                                <div className="h-2 rounded-full bg-green-500" style={{ width: '50%' }}></div>
                                            </div>
                                            <span className="text-xs font-medium">50%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary">
                                            <span className="material-symbols-outlined">edit_square</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plans Overview */}
                <div className="mt-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Visão Geral dos Planos de Fibra</h3>
                        <button className="text-sm font-semibold text-primary hover:text-orange-700 flex items-center gap-1">
                            Ver todos os planos
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white dark:bg-[#1a130b] p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                <span className="material-symbols-outlined">speed</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">800 MEGA</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Velocidade máxima para usuários intensos</p>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ 149,90</span>
                                <span className="text-sm font-medium text-slate-500">/mês</span>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Custo</span>
                                    <span className="font-medium text-slate-900 dark:text-white">R$ 97,43</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Margem de Lucro</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">35%</span>
                                </div>
                            </div>
                            <button className="mt-6 w-full rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors">
                                Detalhes
                            </button>
                        </div>

                        <div className="group relative flex flex-col rounded-xl border-2 border-primary bg-white dark:bg-[#1a130b] p-6 shadow-md dark:border-primary dark:bg-slate-800">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                                MAIS VENDIDO
                            </div>
                            <div className="absolute right-4 top-4 rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                <span className="material-symbols-outlined">local_fire_department</span>
                            </div>
                            <h4 className="text-lg font-bold text-primary">600 MEGA</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Equilíbrio perfeito entre velocidade e valor</p>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ 119,90</span>
                                <span className="text-sm font-medium text-slate-500">/mês</span>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Custo</span>
                                    <span className="font-medium text-slate-900 dark:text-white">R$ 83,93</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Margem de Lucro</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">30%</span>
                                </div>
                            </div>
                            <button className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all">
                                Editar Plano
                            </button>
                        </div>

                        <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white dark:bg-[#1a130b] p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                <span className="material-symbols-outlined">network_check</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">500 MEGA</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Conexão de fibra de entrada</p>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ 99,90</span>
                                <span className="text-sm font-medium text-slate-500">/mês</span>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Custo</span>
                                    <span className="font-medium text-slate-900 dark:text-white">R$ 74,92</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Margem de Lucro</span>
                                    <span className="font-bold text-orange-500 dark:text-orange-400">25%</span>
                                </div>
                            </div>
                            <button className="mt-6 w-full rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors">
                                Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

import React from 'react';

export default function Sectors() {
    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto w-full">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">

                {/* Breadcrumbs e Header */}
                <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end mb-10">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap gap-2 items-center text-sm mb-4">
                            <span className="text-[#a17745] dark:text-orange-300 font-semibold">Início</span>
                            <span className="text-[#a17745] dark:text-orange-300/50">/</span>
                            <span className="text-[#1d150c] dark:text-white font-bold">Estrutura da Empresa</span>
                        </div>
                        <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Setores e Departamentos</h1>
                        <p className="text-[#a17745] dark:text-orange-300 text-lg font-medium">Visão geral da hierarquia organizacional da Prestek, contatos principais e setores de serviços internos.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-[#1d150c] dark:text-white font-bold shadow-sm hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Exportar Organograma
                        </button>
                    </div>
                </div>

                {/* Bloco de Organograma Hierárquico */}
                <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-6 md:p-8 overflow-hidden relative mb-12 shadow-sm">
                    <div className="flex flex-wrap gap-4 justify-between items-start mb-8">
                        <div>
                            <p className="text-primary text-sm font-black uppercase tracking-wider mb-1">Hierarquia Organizacional</p>
                            <h3 className="text-[#1d150c] dark:text-white text-2xl font-bold">Estrutura Prestek</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#1d150c] dark:text-white font-bold bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 px-4 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            Trimestre Atual
                        </div>
                    </div>

                    {/* Visualização de Árvore */}
                    <div className="flex flex-col items-center justify-center gap-8 w-full overflow-x-auto py-4">
                        <div className="flex flex-col items-center gap-6 min-w-[600px]">
                            {/* CEO - Topo da árvore */}
                            <div className="flex flex-col items-center">
                                <div className="w-56 bg-white dark:bg-[#1a130b] border-2 border-primary rounded-xl p-4 shadow-md text-center relative z-10 transition-transform hover:-translate-y-1 cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3 bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCaXDL9-IKCovbonIRkZxmOQtVMGSq9hyfkzfGLuREdVts0S_TaHxPdDnq3Q0ZJQjUV4h3rsQYIqn8IcxS_XYiTsGl7VZSibnFKenb1YcQ0cRTa6H2PBFYkAI08QxDVYEakee_SSZNVmDgKUZKNBbH83yobUivT_QlJR9MXzzJSQqZiUM-DhViuKy72fSO78t2--RJlAX_T4wZe--SQJQK8UqaFsgnKqB24Y4bEsxXAfaVVzxQ5ICzm6VI9t9ELNXIsqly0dkdybeQ')" }}></div>
                                    <p className="font-bold text-[#1d150c] dark:text-white text-lg">Jonathan Prestek</p>
                                    <p className="text-xs text-primary font-black uppercase tracking-wider">CEO</p>
                                </div>
                                {/* Linhas de conexão */}
                                <div className="h-8 w-0.5 bg-[#eaddcd]"></div>
                                <div className="h-0.5 w-[80%] bg-[#eaddcd]"></div>
                                <div className="flex justify-between w-[80%] -mt-0.5">
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                    <div className="h-6 w-0.5 bg-[#eaddcd]"></div>
                                </div>
                            </div>

                            {/* Diretorias */}
                            <div className="grid grid-cols-4 gap-6 w-full">
                                <OrgNode icon="terminal" title="Tecnologia (TI)" name="Sarah Lin" />
                                <OrgNode icon="settings_suggest" title="Operações" name="Marcus Cole" />
                                <OrgNode icon="trending_up" title="Vendas & MKT" name="Elena Rodriguez" />
                                <OrgNode icon="support_agent" title="Suporte" name="David Kim" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diretório de Setores (Grid) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                        <h2 className="text-[#1d150c] dark:text-white text-2xl font-black leading-tight">Diretório de Setores</h2>
                        <div className="flex gap-2">
                            <button className="p-2 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-primary shadow-sm" title="Visualização em Grade">
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button className="p-2 hover:bg-[#fcfaf8] dark:bg-[#2c2217] rounded-lg text-[#a17745] dark:text-orange-300 transition-colors" title="Visualização em Lista">
                                <span className="material-symbols-outlined">view_list</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SectorCard
                            icon="storefront"
                            ext="402"
                            title="Setor Comercial"
                            desc="Responsável por parcerias B2B, aquisição de clientes e estratégias de expansão de mercado em todas as regiões."
                            managerName="Elena Rodriguez"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuA8J7on3DVWvZwqwYdfNGXQwipXm0-EN2i6Me-NESAtSeXXVItKB3LQ1k1RH08bLpVA1ivniT2qnhR--babzHdpFhA5z6GwZ-u6oTTpuNL_4Q3I0_atK6VK5odPyeeS5t7e7CyJlrg86uB_6JpuqcI-tDCA8WE4szOmNu_gQvdyGOh1Hlsdli1U-AbDfxCi9AxuTvWAkHICjXCQ8KUacH5-cWqiBipGO4p2A3oEhb47Vq7Bbw9X_uxDZ16s1Q2emquFEL2l3P7i3Vc"
                            teamCount="24"
                        />
                        <SectorCard
                            icon="dns"
                            ext="105"
                            title="Tecnologia & Infra"
                            desc="Gerencia servidores internos, desenvolvimento de software, cibersegurança e provisionamento de hardware."
                            managerName="Sarah Lin"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuCcFwfxJG1wFdVOhaVphE8aF1c3JgHa50IYc0_qBtdqhJsoAzHHLatxAFhx98DsIACm_Oot1jjJ2bDZKZ29Ngg9o3G84oqS76K1-_JuvuR5mz8nwd0Suq5axvoXJxUoU-HLOTts0NQpJlghIyJ6uMcfLhUzzX-lJcpW8rxoMhxWzdC_JdK3SJk0_-B4Rp4KyaD8o35SU0K8gQMxVdan1-WhLMhqg1LZsNhd-COBRe4U9libx7TOOrgM93Bde6Ssf6ePhx23QCiqFCk"
                            teamCount="42"
                        />
                        <SectorCard
                            icon="groups"
                            ext="220"
                            title="Recursos Humanos"
                            desc="Supervisiona recrutamento, relações com funcionários, administração de benefícios e iniciativas de cultura empresarial."
                            managerName="James Wilson"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuA1o2uFrWYBCQUbfIPgbjfyWL5j6QOXyfvOUzUdRp1YqL8bAFowhrLpR_kqlTUUL4O4gz6y-wKx90YCJ3nXseXfhPFicZbAtcW9Qk7xZwfSQceYsptj6c36UWTAtHyNf7UQlHRe1hD8Z7RWFK6Ybckms5mt8SvhFoUannnUpQahsHg8VX4UcEhEWmzvcRa2ePmp1N--s1Xj_QWbi0qeODLykyxdF-S_juh3wjRUZCiyWUjhto0A5xTS1tflidhvzQ1cF2PbnAc0Lng"
                            teamCount="8"
                        />
                        <SectorCard
                            icon="precision_manufacturing"
                            ext="301"
                            title="Operações"
                            desc="Garante a eficiência operacional do dia a dia, gestão de logística e otimização de processos."
                            managerName="Marcus Cole"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuC_4AX3DmzrEhEJckKZUUuW1k2mfyzbk_cVjUFbaPEXTXLCIsay3-2YBB6bgfm5IkOYVxcwAwI6SZELS_oLfeFQYurOLNBhqUliTdz4iNsEO94VDaU-xyyJTw7dslow-DW0LMyKAOBal4JY2YvVVp7HaXvyHDBU4zj4gQO4_7VKItaupKBsTCiIyftmuuppCc6tvi546g1V4zVrFtflSxyabdGtvD4_XlFeaK7SUjx7AOUc30a5JcoH9GLVGdX-VeTKTkGOIECi_mc"
                            teamCount="56"
                        />
                        <SectorCard
                            icon="account_balance"
                            ext="500"
                            title="Financeiro & Jurídico"
                            desc="Lida com orçamento, contabilidade, conformidade e assuntos jurídicos da corporação."
                            managerName="Amanda Lee"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuCxp0Kz0E90uwEtQg6FXYvwsiTTUgupAyPTR87QhawqdttRv-JzNSNP__hIZ2R6s0f9nwZ4_sMg5GpLYPEbuajtlSeZpH3HGAz5gMIBmZeua5kOlsrOag3_Fu4i67mqwpMtatt7JNwPEck5l1h8P9aOaLNKmjTj7tY9pqffdlHC82zd2HnRO6Vwpx1fFz9TkqMe_n_V6VtHMAQGO-qs0spk9eGEc-e9awc4yMdkt5R-pBh8uQnyrut_Ir1BLIDQxzN_eqpi5yOJsN8"
                            teamCount="12"
                        />
                        <SectorCard
                            icon="support_agent"
                            ext="610"
                            title="Suporte ao Cliente"
                            desc="Suporte de primeira linha para consultas de clientes, resolução de problemas técnicos e pesquisas de satisfação."
                            managerName="David Kim"
                            managerImg="https://lh3.googleusercontent.com/aida-public/AB6AXuC1oW8W8Q45k8R7jQeXriH0d9o0NnvktFDDBHC9aLOVUXSwUu8Sh4vYLpKKIfJEMyUiSI3UI7CqLiVL218Taqhy32XnBMUKP5HKfrqGe9-D4k7csbvo5jTol1Ij4YdKSJniCjdmRajceyUJoj7cB-oB8YlLRjtyJ2c9UsruwoZbIwUu36EORlI8ZFctm5WBk9-FmKQN1mfGC3DvOLkg-X2XNXS1hFX-JcqRDtEjx2EcmamoOzCdbX0kAQs_1Pb7SBttuV5mft5UGdg"
                            teamCount="35"
                        />
                    </div>
                </div>

                {/* Footer contextualizado */}
                <div className="mt-12 pt-8 border-t border-[#eaddcd] dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-[#a17745] dark:text-orange-300 gap-4">
                    <p className="font-semibold">© 2024 Prestek Intranet. Apenas para uso interno.</p>
                    <div className="flex gap-6 font-bold">
                        <a className="hover:text-primary transition-colors" href="#">Política</a>
                        <a className="hover:text-primary transition-colors" href="#">Central de Ajuda</a>
                        <a className="hover:text-primary transition-colors" href="#">Reportar Problema</a>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Subcomponente Node do Organograma
function OrgNode({ icon, title, name }) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl p-4 shadow-sm text-center hover:shadow-md hover:border-[#ff8c00]/50 transition-all cursor-pointer group flex flex-col items-center justify-center">
                <div className="size-10 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[22px] group-hover:scale-110 transition-transform">{icon}</span>
                </div>
                <p className="font-bold text-sm text-[#1d150c] dark:text-white mb-1">{title}</p>
                <p className="text-[11px] font-black text-[#a17745] dark:text-orange-300 uppercase tracking-wider">{name}</p>
            </div>
        </div>
    );
}

// Subcomponente Card de Setor
function SectorCard({ icon, ext, title, desc, managerName, managerImg, teamCount }) {
    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 p-6 flex flex-col gap-5 hover:border-[#ff8c00]/50 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Linha colorida de destaque no hover */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
                <span className="px-2.5 py-1 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded font-black text-[11px] text-[#a17745] dark:text-orange-300 tracking-widest uppercase">
                    Ramal {ext}
                </span>
            </div>

            <div>
                <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-[#a17745] dark:text-orange-300 font-medium leading-relaxed line-clamp-2">{desc}</p>
            </div>

            <div className="flex items-center gap-3 py-4 border-y border-[#f4eee6]">
                <div
                    className="size-10 rounded-full bg-gray-200 bg-cover bg-center border border-[#eaddcd] dark:border-gray-800"
                    style={{ backgroundImage: `url('${managerImg}')` }}
                    title={`Líder do setor: ${managerName}`}
                ></div>
                <div className="flex-1">
                    <p className="text-[10px] text-[#a17745] dark:text-orange-300 font-black uppercase tracking-wider mb-0.5">Responsável</p>
                    <p className="text-sm font-bold text-[#1d150c] dark:text-white">{managerName}</p>
                </div>
                <div className="text-right pl-3 border-l border-[#f4eee6]">
                    <p className="text-[10px] text-[#a17745] dark:text-orange-300 font-black uppercase tracking-wider mb-0.5">Equipe</p>
                    <p className="text-sm font-bold text-[#1d150c] dark:text-white">{teamCount}</p>
                </div>
            </div>

            <div className="flex gap-3 mt-auto pt-1">
                <button className="flex-1 py-2.5 px-3 rounded-lg border-2 border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white font-bold text-sm hover:border-primary hover:text-primary transition-colors focus:outline-none">
                    Ver Equipe
                </button>
                <button className="flex items-center justify-center size-11 rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] border-2 border-transparent hover:border-primary/30 text-primary hover:bg-primary/5 transition-colors" title="Contatar Setor">
                    <span className="material-symbols-outlined text-[22px]">mail</span>
                </button>
            </div>
        </div>
    );
}

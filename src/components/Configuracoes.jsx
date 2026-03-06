import ThemeSwitcher from './ThemeSwitcher';

export default function Configuracoes() {
    return (
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center overflow-y-auto no-scrollbar">
            <div className="max-w-[1024px] w-full flex flex-col mt-4">
                <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 px-4 mb-6">
                    <a className="text-[#a17745] dark:text-orange-300 hover:text-primary text-sm font-medium leading-normal transition-colors" href="#">Início</a>
                    <span className="text-[#a17745] dark:text-orange-300 text-sm font-medium leading-normal">/</span>
                    <span className="text-[#1d150c] dark:text-white text-sm font-medium leading-normal">Configurações de Perfil</span>
                </nav>
                <div className="flex flex-col gap-2 px-4 mb-10">
                    <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Perfil do Usuário e Configurações</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-base font-normal">Gerencie suas informações pessoais, preferências de segurança e configurações de conta.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 bg-white dark:bg-[#1a130b] rounded-xl p-6 shadow-sm border border-[#eaddcd] dark:border-gray-800 flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 ring-4 ring-[#fcfaf8] shadow-md" data-alt="Avatar de Alex Johnson" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEo3E9fZw_QuwIW9kOFNyk3IVDhwgd3tLL5WkNpWvW9A0Q5offrPtuGKHoc-d1pnxXt8jtCrqp1jRZQdnl-YqQyblbhy70pWxpgbYxwSu7LDQLXYwsdDaxwYvt-h6ICECOSRw8fh-4qSQXtzTxo4zJ81GjRTSUpHasXFPHUv6tXjje41uXsmZ5V4p_3SKINlmYFp3FY6C7FcF06LBkx7ZOh9bRlsfXBkdhuJrz1yK5nHuONT2EW50Zc_kbhFwvTWB8wYcshYXKAFI")' }}></div>
                                <button className="absolute bottom-0 right-0 bg-primary hover:bg-[#e67e00] text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-105" title="Alterar Foto">
                                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                </button>
                            </div>
                            <div className="text-center w-full">
                                <h2 className="text-[#1d150c] dark:text-white text-xl font-bold mb-1">Alex Johnson</h2>
                                <p className="text-primary font-medium text-sm mb-4">Analista de Sistemas Sênior</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Colaborador Ativo
                                </span>
                            </div>
                            <div className="w-full border-t border-[#eaddcd] dark:border-gray-800 pt-4 mt-2">
                                <div className="flex items-center gap-3 mb-3 text-sm text-[#a17745] dark:text-orange-300">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>ID: <span className="text-[#1d150c] dark:text-white font-medium">EMP-8842</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[#a17745] dark:text-orange-300">
                                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                    <span>Admitido em: <span className="text-[#1d150c] dark:text-white font-medium">Mar 2019</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Informações Pessoais</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">NOME</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="text" defaultValue="Alex" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">SOBRENOME</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="text" defaultValue="Johnson" />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">ENDEREÇO DE E-MAIL</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a17745] dark:text-orange-300 text-[20px]">mail</span>
                                        <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary pl-10 pr-4 py-2.5 transition-shadow" type="email" defaultValue="alex.johnson@prestek.com" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">NÚMERO DE TELEFONE</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="tel" defaultValue="+1 (555) 012-3456" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">DATA DE NASCIMENTO</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="date" defaultValue="1988-05-12" />
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">work</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Setor e Função</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">DEPARTAMENTO</label>
                                    <div className="relative">
                                        <select className="form-select w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow">
                                            <option>Tecnologia da Informação</option>
                                            <option>Recursos Humanos</option>
                                            <option>Marketing</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">LOCALIZAÇÃO DO ESCRITÓRIO</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="text" defaultValue="HQ - Building A, Floor 4" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">CARGO</label>
                                    <input className="form-input w-full rounded-lg border-transparent bg-gray-100 text-gray-500 cursor-not-allowed px-4 py-2.5" readOnly type="text" defaultValue="Analista de Sistemas Sênior" />
                                    <span className="text-xs text-[#a17745] dark:text-orange-300 italic">Contate o RH para atualizar o cargo.</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#a17745] dark:text-orange-300">RAMAL INTERNO</label>
                                    <input className="form-input w-full rounded-lg border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white focus:border-primary focus:ring-primary px-4 py-2.5 transition-shadow" type="text" defaultValue="x4402" />
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">lock</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Segurança</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217]">
                                    <div className="flex items-start gap-4">
                                        <div className="hidden sm:flex items-center justify-center size-10 rounded-full bg-orange-100 text-orange-600">
                                            <span className="material-symbols-outlined">key</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1d150c] dark:text-white">Senha</h4>
                                            <p className="text-sm text-[#a17745] dark:text-orange-300">Alterada há 3 meses</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all">Alterar</button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217]">
                                    <div className="flex items-start gap-4">
                                        <div className="hidden sm:flex items-center justify-center size-10 rounded-full bg-green-100 text-green-600">
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1d150c] dark:text-white">Autenticação de Dois Fatores</h4>
                                            <p className="text-sm text-[#a17745] dark:text-orange-300">Proteja sua conta com 2FA</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </section>
                        <section className="bg-white dark:bg-[#1a130b] rounded-xl p-6 md:p-8 shadow-sm border border-[#eaddcd] dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-6 border-b border-[#eaddcd] dark:border-gray-800 pb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">tune</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Preferências</h3>
                            </div>
                            <div className="space-y-6">
                                <ThemeSwitcher />
                                <div className="border-t border-[#eaddcd] dark:border-gray-800 pt-6">
                                    <h4 className="text-sm font-bold text-[#1d150c] dark:text-white mb-4">Notificações por E-mail</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Comunicados do Departamento</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Manutenção do Sistema</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#1d150c] dark:text-white">Atualizações do Diretório</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input className="sr-only peer" type="checkbox" value="" />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a130b] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4 pb-12">
                            <button className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold text-[#a17745] dark:text-orange-300 hover:text-[#1d150c] dark:text-white hover:bg-black/5 transition-colors">Cancelar</button>
                            <button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary hover:bg-[#e67e00] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

import React from 'react';

export default function Directory() {
    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[#1d150c] dark:text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Diretório de Colaboradores</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-lg">Busque e conecte-se com seus colegas em todos os departamentos.</p>
                </div>

                {/* Busca e Filtros */}
                <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="block text-sm font-semibold text-[#1d150c] dark:text-white mb-2">Buscar Colaborador</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a17745] dark:text-orange-300">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-[#eaddcd] dark:border-gray-800 rounded-lg leading-5 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white placeholder:text-[#a17745] dark:text-orange-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm"
                                placeholder="Buscar por nome, ramal ou e-mail"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-semibold text-[#1d150c] dark:text-white mb-2">Departamento</label>
                        <div className="relative">
                            <select className="block w-full pl-3 pr-10 py-3 text-base border border-[#eaddcd] dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white shadow-sm appearance-none cursor-pointer">
                                <option>Todos os Departamentos</option>
                                <option>Engenharia</option>
                                <option>Recursos Humanos</option>
                                <option>Marketing</option>
                                <option>Vendas</option>
                                <option>Produto</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#a17745] dark:text-orange-300">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full md:w-auto h-[46px] px-6 bg-primary hover:bg-[#cc7000] text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        Filtrar
                    </button>
                </div>

                {/* Grid de Colaboradores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <EmployeeCard
                        name="Roberta Silva"
                        role="Gerente de Recursos Humanos"
                        extension="1024"
                        email="roberta@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDgNUY-a8p7UZiOMMmPXdC1xXKMu6OIk-USr-bLaw1X_9ycVUl4uHCUoUzpOobNl32sP0E_E17AYWH8jETmNSweiRfZdqnbNGGwfC1EaMl5y5XFbqTZLsGKEeML_zS_6pSK99yYOJoO8xfMUh2UGRa0JB3htsj-9qvuDRAjQS-O1XRwgL19IQF0kq3mAR7JAF6lD5b5tdH7KFQEcTRoTMB8HYRIFhbvi9_63aQow8GKMM0n1hfUS_E6m9K5t81sHDq6IOyek9zsVFw"
                        statusColor="bg-green-500"
                    />
                    <EmployeeCard
                        name="Carlos Mendez"
                        role="Líder de Engenharia"
                        extension="1045"
                        email="carlos@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuB8Hjr0OaFDwBktqlMO6RIqKl5PhcjSxRRM30qKbT72-q49FqqfyltSm2zHMU1CKRAdDcEGnu9yPlmH_LlpTfyWe2k0EGI9Oc_wn27k2H1bLXxEfeBbrsxRQKydf1s3y5uPOCTKWemzsOFxksGwwPwNDV6kWD9PcxjcW8SyaDhhgN6QDDLOmHn9nloOeB-EnEt5c02hNFMTw7kY5pzUeKWrZ94j4s3VVPQluaK8FekHMt-q3zX6FwmDXn1_Q2zqB6CRaBww-VHS8LA"
                        statusColor="bg-gray-400"
                    />
                    <EmployeeCard
                        name="Laíse Oliveira"
                        role="Especialista em Marketing"
                        extension="1088"
                        email="laise@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDy8QxI5KUcWj8MhITUue9OnddTzFnGTXBniKn4AnxYSoQKFALzfjBd3D2ZCaf-Nxa2-PT4e4isVuoaDSgQo63rUP6XKnnBkzT1hLvgqj2LfLqfJm79KndwSv8-feQajawrY_EuLxl_IYCdiwoph3Wryc8XinZrC6JCrH670lhbpxbbAVZP18XnHveg1aN8xwKGdrKvELfUe48fl0z_lwifVsHOWygpqV0tosaSnZjGvmy0ec5j77ztJiVrmODAor0_J5pdB1vSr3I"
                        statusColor="bg-green-500"
                    />
                    <EmployeeCard
                        name="John Doe"
                        role="Suporte de TI"
                        extension="1002"
                        email="john@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuCuhv5Ms-OBlmSiIL2u4-FNQqE-zLTmxmffXhgzP4Q_nW0FN2wjnig9klA0493OsuyQprA-FSZiyB63-dLgJrQ7ZAYfXHzBJr5F1R9POMfRHmpQKckLh_K51iUjgkJhRtT4SYEGnQ44dz_3iyExJX4lpIsJetxruSKJT5WKe4qOjh3cvdVpeldQ6NA_q-EFsy1ZBvv47cPaFL4bhiZLYxvsCi9ZG0wtaQKsYL6XR82bWazaw6-sHUpBxUOgS-rJTWm3Hb-1JTeYqOQ"
                        statusColor="bg-yellow-500"
                    />
                    <EmployeeCard
                        name="Sarah Jenkins"
                        role="Gerente de Produto"
                        extension="1120"
                        email="sarah@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuBhlNTFxCTIDNyQ-cBEHqsjobDLSTHZM-fwr-utvvd61C7L3_ys8pUDsYXn69Xkgym9GWbAsQxtxQVV1PKJmRWbH8xffVWEIwqAe8FfSkVGxVDEKY5XmKtQUp5oi0diRLPszttuGjFP8o_N2PonI0ZxJ-GdKEvILifImcMpyYpl-zX6qzinon-8tCEfqr1tGsq2_n9EXyu2ZHZ8YMCyM6SJm5mDUBG5nkPz80e0DeBAzkgbXwvG0oUdyoWcKTPaVJfYiEMnYyZ7sRQ"
                        statusColor="bg-green-500"
                    />
                    <EmployeeCard
                        name="Michael Brown"
                        role="Diretor de Vendas"
                        extension="1010"
                        email="michael@prestek.com"
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuC-KazWBZgpw-dfSfM0mqpExci2TZJ-vbEjPk1k2FvdpOTHXAXEoBbum0gSXI7DyOahrhmYfzytGjI2nNoaMfwyfEJH0PlOuMNo8KavgE1Jmg4j9ODpWYKybtmSIswQlpuPDYQW7bO4Lbn86gF3mXT6LRPSioLCfJUZqvt48my5p-7vLFGIEYJttrsW9awqcWwyhqVl1w5x1gMXDDFoAeQkIzu81LToAOIFCxQA8ymYdYBEGnHgJoJCvKusjs5yUBy2XRKb0HttqyY"
                        statusColor="bg-red-500"
                    />
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-center gap-2 mt-auto pb-10">
                    <button className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-lg bg-primary text-white font-bold shadow-md">
                        1
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white hover:text-primary hover:border-primary transition-colors font-semibold">
                        2
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white hover:text-primary hover:border-primary transition-colors font-semibold">
                        3
                    </button>
                    <span className="text-[#a17745] dark:text-orange-300 px-2">...</span>
                    <button className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white hover:text-primary hover:border-primary transition-colors font-semibold">
                        8
                    </button>
                    <button className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 hover:text-primary hover:border-primary transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </main>
    );
}

// Subcomponente de Card de Colaborador
function EmployeeCard({ name, role, extension, email, image, statusColor }) {
    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl overflow-hidden border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full hover:border-[#ff8c00]/50">
            <div className="p-6 flex flex-col items-center text-center flex-grow">
                <div className="relative mb-4">
                    <div
                        className="size-24 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white shadow-sm"
                        title={`De ${name}`}
                        style={{ backgroundImage: `url("${image}")` }}
                    ></div>
                    <div className={`absolute bottom-0 right-0 ${statusColor} border-2 border-white size-4 rounded-full`}></div>
                </div>
                <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-1">{name}</h3>
                <p className="text-primary font-medium text-sm mb-4">{role}</p>
                <div className="w-full space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-[#a17745] dark:text-orange-300 bg-[#fcfaf8] dark:bg-[#2c2217] p-2 rounded-lg border border-[#f4eee6]">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        <span className="font-medium">Ramal: {extension}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#a17745] dark:text-orange-300 bg-[#fcfaf8] dark:bg-[#2c2217] p-2 rounded-lg border border-[#f4eee6]">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        <span className="truncate">{email}</span>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 pt-0">
                <button className="w-full py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all focus:ring-2 focus:ring-primary/40 outline-none">
                    Ver Perfil
                </button>
            </div>
        </div>
    );
}

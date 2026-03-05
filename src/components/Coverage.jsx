import React from 'react';

export default function Coverage() {
    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">

                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[#1d150c] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Mapa de Cobertura de Rede</h1>
                        <p className="text-[#a17745] text-base font-normal max-w-2xl">
                            Verifique a disponibilidade de serviço entre regiões, tipos de tecnologia (FTTH, Rádio, UTP) e gerencie novas solicitações.
                        </p>
                    </div>
                    <button className="flex items-center justify-center gap-2 h-10 px-5 bg-primary hover:bg-[#cc7000] transition-colors rounded-lg text-white text-sm font-bold shadow-sm hover:shadow-md">
                        <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
                        <span>Solicitar Cobertura</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 mb-6 items-center bg-white p-4 rounded-xl shadow-sm border border-[#f4eee6]">
                    <span className="text-[#a17745] text-sm font-semibold uppercase tracking-wider mr-2">FILTROS:</span>

                    {['Tecnologia: Todas', 'Velocidade: Qualquer', 'Estado: Alagoas', 'Cidade: Todas'].map((filter, i) => (
                        <button key={i} className="group flex h-9 items-center justify-center gap-x-2 rounded-lg bg-[#fcfaf8] hover:bg-[#f4eee6] border border-[#f4eee6] px-3 transition-colors">
                            <span className="material-symbols-outlined text-[#1d150c] text-[20px]">
                                {i === 0 ? 'router' : i === 1 ? 'speed' : i === 2 ? 'map' : 'location_city'}
                            </span>
                            <span className="text-[#1d150c] text-sm font-medium">{filter}</span>
                            <span className="material-symbols-outlined text-[#a17745] text-[20px]">arrow_drop_down</span>
                        </button>
                    ))}

                    <div className="ml-auto flex items-center">
                        <button className="text-primary text-sm font-medium hover:underline">Limpar Filtros</button>
                    </div>
                </div>

                {/* Mapa */}
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-md mb-8 group border border-[#f4eee6] bg-slate-100">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity group-hover:opacity-100"
                        title="Mapa interativo mostrando nós de cobertura de rede"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAa3DiRl9fKvb3i9sliS-uQ1Rz_9sd7Q4tgI2H11g3lcThXjibRJx_TdY3ka7Ues4h-uYyhGzKR9sNEnZxlUtpOar_Pz5tcnUm2VxDqFXD3W0H8Zj_sDMLClfbCHHa_pgGVWcwGqZtM79aHNmkHoZczHwOeNb5Vk9HgxfHgKki-1BvM9WbsIXLHhkwjaSAst8_Zmtucvjynymsd8SboYoWppeeE0znFdr3p3pH7gmzelH1mi0NxjQRqwzbpT-uGZqzNOcWdkZ_BXn0')" }}
                    ></div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                    <div className="absolute top-4 left-4 right-4 md:left-6 md:w-80 z-10">
                        <div className="flex w-full items-center bg-white rounded-lg shadow-lg h-12 px-4">
                            <span className="material-symbols-outlined text-[#a17745]">search</span>
                            <input className="flex-1 bg-transparent border-none focus:ring-0 text-[#1d150c] placeholder:text-[#a17745] ml-2 font-normal focus:outline-none" placeholder="Buscar cidade ou bairro" />
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
                        <button className="size-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center text-[#1d150c] transition-colors">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button className="size-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center text-[#1d150c] transition-colors">
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                        <button className="size-10 bg-primary hover:bg-[#cc7000] rounded-lg shadow-lg flex items-center justify-center text-white mt-2 transition-colors">
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                    </div>

                    {/* Marcadores */}
                    <Marker top="50%" left="33%" label="Batalha (FTTH)" color="text-primary" />
                    <Marker top="40%" left="60%" label="Delmiro Gouveia" color="text-green-600" />
                    <Marker top="70%" left="70%" label="Penedo" color="text-blue-600" />
                </div>

                {/* Tabela de Dados */}
                <div className="bg-white rounded-xl shadow-sm border border-[#f4eee6] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#f4eee6] flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-[#1d150c] text-xl font-bold">Cidades com Cobertura</h2>
                        <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                            Exportar Dados <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fcfaf8] text-[#a17745] text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 whitespace-nowrap">REGIÃO / CIDADE</th>
                                    <th className="px-6 py-4 whitespace-nowrap">BAIRRO</th>
                                    <th className="px-6 py-4 whitespace-nowrap">TECNOLOGIA</th>
                                    <th className="px-6 py-4 whitespace-nowrap">VELOC. MÁXIMA</th>
                                    <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f4eee6] text-sm">
                                <TableRow city="Delmiro Gouveia" neighborhood="Centro" tech="FTTH" speed="500 MEGA" status="Ativo" percent="98" state="AL" />
                                <TableRow city="Batalha" neighborhood="Zona Rural" tech="Rádio" speed="20 MEGA" status="Ativo" percent="85" techColor="blue" state="AL" />
                                <TableRow city="Penedo" neighborhood="Santa Luzia" tech="UTP" speed="100 MEGA" status="Ativo" percent="92" techColor="green" state="AL" />
                                <TableRow city="Delmiro Gouveia" neighborhood="Novo Horizonte" tech="FTTH" speed="300 MEGA" status="Expansão" percent="45" statusColor="blue" state="AL" />
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-[#f4eee6] bg-gray-50 flex items-center justify-between">
                        <p className="text-sm text-[#a17745]">Mostrando 1 a 4 de 28 entradas</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white text-[#a17745] disabled:opacity-50 hover:bg-gray-100 transition-colors">Anterior</button>
                            <button className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-primary text-white">1</button>
                            <button className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white text-[#1d150c] hover:bg-gray-100 transition-colors">2</button>
                            <button className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white text-[#1d150c] hover:bg-gray-100 transition-colors">3</button>
                            <button className="px-3 py-1 text-sm border border-[#f4eee6] rounded bg-white text-[#a17745] hover:bg-gray-100 transition-colors">Próximo</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Subcomponente para marcadores no mapa
function Marker({ top, left, label, color }) {
    return (
        <div
            className="absolute flex flex-col items-center group/marker cursor-pointer -translate-y-1/2 -translate-x-1/2"
            style={{ top, left }}
        >
            <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-bold mb-1 opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap text-[#1d150c]">
                {label}
            </div>
            <span className={`material-symbols-outlined ${color} text-4xl drop-shadow-md`}>location_on</span>
        </div>
    );
}

// Subcomponente para as linhas da tabela
function TableRow({ city, neighborhood, tech, speed, status, percent, techColor = "purple", statusColor = "orange", state }) {

    const techClasses = {
        purple: "bg-purple-100 text-purple-700",
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700"
    };

    const statusColors = {
        green: "bg-green-500",
        orange: "bg-orange-400",
        blue: "bg-blue-500",
    };

    const techIcons = {
        "FTTH": "fiber_manual_record",
        "Rádio": "settings_input_antenna",
        "UTP": "cable"
    };

    const theStatusColor = status === "Ativo" && parseInt(percent) >= 90 ? "green"
        : status === "Ativo" ? "orange"
            : "blue";

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-[#1d150c]">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {state}
                    </div>
                    {city}
                </div>
            </td>
            <td className="px-6 py-4 text-[#a17745]">{neighborhood}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${techClasses[techColor] || techClasses.purple}`}>
                    <span className="material-symbols-outlined text-[14px]">{techIcons[tech] || "fiber_manual_record"}</span> {tech}
                </span>
            </td>
            <td className="px-6 py-4 font-semibold text-[#1d150c]">{speed}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1 w-24">
                    <div className="flex justify-between text-xs text-[#a17745]">
                        <span>{status}</span>
                        <span className={`font-bold ${theStatusColor === 'green' ? 'text-green-600' :
                                theStatusColor === 'orange' ? 'text-orange-500' : 'text-blue-500'
                            }`}>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${statusColors[theStatusColor]}`} style={{ width: `${percent}%` }}></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-[#a17745] hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 flex items-center justify-center ml-auto">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </td>
        </tr>
    );
}

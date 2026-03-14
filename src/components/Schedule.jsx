import React, { useState, useEffect } from 'react';
import LottieAvatar from './common/LottieAvatar';

export default function Schedule() {
    const [plantoes, setPlantoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlantoes = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/plantoes');
                const data = await res.json();
                if (data.sucesso) {
                    setPlantoes(data.plantoes);
                }
            } catch (err) {
                console.error("Erro ao buscar plantões:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlantoes();
    }, []);

    // Função para formatar data do banco para exibição (ex: "Fev 05")
    const formatarData = (dataStr) => {
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' })
            .replace('.', '')
            .replace(/^\w/, (c) => c.toUpperCase());
    };

    // Função para pegar o dia da semana
    const getDiaSemana = (dataStr) => {
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[new Date(dataStr).getDay()];
    };

    // Função para verificar se é final de semana
    const isFimDeSemana = (dataStr) => {
        const dia = new Date(dataStr).getDay();
        return dia === 0 || dia === 6;
    };

    // Função para verificar se é hoje
    const isHoje = (dataStr) => {
        const hoje = new Date().toISOString().split('T')[0];
        return dataStr.split('T')[0] === hoje;
    };
    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
                <a className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1" href="#">
                    <span className="material-symbols-outlined text-lg">home</span>
                    Início
                </a>
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                <a className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors" href="#">Processos Internos</a>
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                <span className="text-[#1d150c] dark:text-white text-sm font-bold">Escala de Plantão</span>
            </div>

            {/* Header da Página */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#eaddcd] dark:border-gray-800 pb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#1d150c] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Escala de Plantão</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-lg font-medium max-w-2xl">Visualize e gerencie as atribuições de cobertura mensal para a equipe de suporte.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-[#1d150c] dark:text-white font-bold shadow-sm hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:border-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        Imprimir
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                        <span className="material-symbols-outlined text-[20px]">ios_share</span>
                        Exportar para iCal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Coluna Esquerda: Calendário e Filtros */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Seletor de Período */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            Selecionar Período
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">MÊS</span>
                                <div className="relative">
                                    <select className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all">
                                        <option>Janeiro</option>
                                        <option defaultValue>Fevereiro</option>
                                        <option>Março</option>
                                        <option>Abril</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                </div>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">ANO</span>
                                <div className="relative">
                                    <select className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all">
                                        <option>2024</option>
                                        <option defaultValue>2025</option>
                                        <option>2026</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Mini Calendário */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <p className="text-[#1d150c] dark:text-white text-base font-bold">Fevereiro 2025</p>
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                                <div key={day} className="text-xs font-black text-[#a17745] dark:text-orange-300 uppercase tracking-widest">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                            {/* Lógica do calendário simplificada para marcar os dias com plantão */}
                            {Array.from({ length: 28 }, (_, i) => {
                                const day = i + 1;
                                const dateStr = `2025-02-${day.toString().padStart(2, '0')}`; // Exemplo estático para o calendário visual
                                const temPlantao = plantoes.some(p => p.data.split('T')[0] === dateStr);
                                return (
                                    <CalendarDay 
                                        key={day} 
                                        day={day} 
                                        active={temPlantao} 
                                        isToday={day === 14} // Exemplo simplificado
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-6 flex items-center gap-5 text-xs font-bold justify-center border-t border-[#f4eee6] pt-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary shadow-sm shadow-primary/20"></div>
                                <span className="text-[#1d150c] dark:text-white">Dia Atual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-[#10b981] shadow-sm shadow-[#10b981]/20"></div>
                                <span className="text-[#1d150c] dark:text-white">Plantão</span>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="bg-[#fcfaf8] dark:bg-[#2c2217] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white dark:bg-[#1a130b] rounded-lg shadow-sm text-primary border border-[#eaddcd] dark:border-gray-800">
                                <span className="material-symbols-outlined text-[24px]">analytics</span>
                            </div>
                            <div>
                                <p className="text-[#a17745] dark:text-orange-300 text-xs font-black uppercase tracking-wider mb-1">Total de Plantões</p>
                                <p className="text-3xl font-black text-[#1d150c] dark:text-white">24</p>
                                <p className="text-sm font-medium text-[#a17745] dark:text-orange-300 mt-1">Atribuições na equipe este mês</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Tabela de Escala Detalhada */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-[#1a130b] rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800 overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-5 border-b border-[#eaddcd] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-[#fcfaf8] dark:bg-[#2c2217]">
                            <h3 className="text-lg font-bold text-[#1d150c] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">table_chart</span>
                                Escala Detalhada de Suporte
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 text-[#a17745] dark:text-orange-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/20">
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                                <button className="p-2 text-[#a17745] dark:text-orange-300 hover:text-[#1d150c] dark:text-white hover:bg-white dark:bg-[#1a130b] rounded-lg transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800">
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-white dark:bg-[#1a130b] border-b-2 border-[#f4eee6] text-[#a17745] dark:text-orange-300">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-28">Data</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-36">Dia da Semana</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N1</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N2</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Gerente ON</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4eee6]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-[#a17745] font-bold">
                                                Carregando escala...
                                            </td>
                                        </tr>
                                    ) : plantoes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-[#a17745] font-bold">
                                                Nenhum plantão agendado para este período.
                                            </td>
                                        </tr>
                                    ) : (
                                        plantoes.map((p) => (
                                            <ScheduleRow
                                                key={p.id}
                                                date={formatarData(p.data)}
                                                day={getDiaSemana(p.data)}
                                                isToday={isHoje(p.data)}
                                                isWeekend={isFimDeSemana(p.data)}
                                                n1={{ name: p.n1_nome || 'Não atribuído', img: p.n1_foto }}
                                                n2={p.n2_id ? { name: p.n2_nome || 'Não atribuído', img: p.n2_foto } : null}
                                                mgr={{ name: p.mgr_nome || 'Não atribuído', img: p.mgr_foto }}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-auto p-4 border-t border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] text-center">
                            <button className="text-[#a17745] dark:text-orange-300 font-bold text-sm hover:text-primary transition-colors flex items-center gap-1 mx-auto">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Ver Escala Completa do Mês
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 p-4 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-xl border border-[#eaddcd] dark:border-gray-800 text-sm text-[#a17745] dark:text-orange-300 font-medium">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <p><strong>Nota:</strong> Os plantões estão sujeitos a alterações. Em caso de imprevistos, contatar o RH para realocações com 48h de antecedência.</p>
                    </div>
                </div>
            </div>

            <footer className="mt-8 pt-8 border-t border-[#eaddcd] dark:border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-center text-sm text-[#a17745] dark:text-orange-300 gap-4">
                <p className="font-semibold cursor-default">© 2025 Prestek Intranet. Portal Interno. Todos os direitos reservados.</p>
                <div className="flex gap-6 font-bold">
                    <a className="hover:text-primary transition-colors" href="#">Política de Plantões</a>
                    <a className="hover:text-primary transition-colors" href="#">Regras de Descanso</a>
                </div>
            </footer>
        </main>
    );
}

// Componentes estendidos/subcomponentes

function CalendarDay({ day, isToday, active }) {
    let classes = "size-9 mx-auto flex items-center justify-center text-sm rounded-full font-bold transition-transform cursor-pointer ";

    if (isToday) {
        classes += "bg-primary text-white shadow-md shadow-primary/30 hover:scale-110";
    } else if (active) {
        classes += "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 hover:scale-110";
    } else {
        classes += "text-[#1d150c] dark:text-white hover:bg-[#fcfaf8] dark:bg-[#2c2217] hover:text-primary border border-transparent hover:border-[#eaddcd] dark:border-gray-800";
    }

    return (
        <button className={classes}>{day}</button>
    );
}

function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr }) {
    let rowClasses = "transition-colors group hover:bg-[#fcfaf8] dark:bg-[#2c2217] ";

    if (isToday) {
        rowClasses += "bg-primary/5 border-l-4 border-l-primary";
    } else if (isWeekend) {
        rowClasses += "bg-[#fcfaf8] dark:bg-[#2c2217]/50";
    }

    return (
        <tr className={rowClasses}>
            <td className={`px-6 py-4 font-black ${isToday ? 'text-primary' : 'text-[#1d150c] dark:text-white'}`}>{date}</td>
            <td className={`px-6 py-4 font-semibold ${isWeekend ? 'text-[#a17745] dark:text-orange-300' : 'text-[#1d150c] dark:text-white'}`}>{day}</td>
            <td className="px-6 py-4"><UserAvatar user={n1} /></td>
            <td className="px-6 py-4"><UserAvatar user={n2} allowEmpty /></td>
            <td className="px-6 py-4"><UserAvatar user={mgr} /></td>
        </tr>
    );
}

function UserAvatar({ user, allowEmpty }) {
    if (!user && allowEmpty) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">
                Não atribuído
            </span>
        );
    }

    if (!user) return null;

    let avatarBgClasses = "size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-[#eaddcd] dark:border-gray-800 ";

    if (user.color === 'purple') {
        avatarBgClasses += "bg-purple-100 text-purple-600 border-purple-200";
    } else if (user.color === 'orange') {
        avatarBgClasses += "bg-orange-100 text-orange-600 border-orange-200";
    } else {
        avatarBgClasses += "bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white";
    }

    return (
        <div className="flex items-center gap-3">
            {user.img ? (
                <LottieAvatar 
                    src={user.img}
                    className="size-8 rounded-full border border-[#eaddcd] dark:border-gray-800 shrink-0"
                />
            ) : (
                <div className={avatarBgClasses} title={user.name}>
                    {user.initials}
                </div>
            )}
            <div className="font-bold text-[#1d150c] dark:text-white whitespace-nowrap">{user.name}</div>
        </div>
    );
}

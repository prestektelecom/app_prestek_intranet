import React, { useState, useEffect } from 'react';
import LottieAvatar from './common/LottieAvatar';

export default function Schedule({ setCurrentView, user }) {
    const [plantoes, setPlantoes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const d = new Date();
    const [filterMonth, setFilterMonth] = useState((d.getMonth() + 1).toString());
    const [filterYear, setFilterYear] = useState(d.getFullYear().toString());
    const [filterSearch, setFilterSearch] = useState('');

    // Admin Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ n1_id: '', n2_id: '', gerente_id: '' });

    const [erroCarregamento, setErroCarregamento] = useState(null);

    const safeJson = async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            const text = await res.text().catch(() => '');
            throw new Error(`Resposta não-JSON (${res.status}): ${text.slice(0, 120)}`);
        }
        return res.json();
    };

    const fetchPlantoes = async () => {
        try {
            const res = await fetch('/api/plantoes');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso && Array.isArray(data.plantoes)) {
                setPlantoes(data.plantoes);
                setErroCarregamento(null);
            } else {
                setPlantoes([]);
                throw new Error(data?.erro || 'Resposta inesperada da API de plantões.');
            }
        } catch (err) {
            console.error("Erro ao buscar plantões:", err);
            setPlantoes([]);
            setErroCarregamento('Não foi possível carregar a escala de plantão. Tente novamente em instantes.');
        }
    };

    const fetchFuncionarios = async () => {
        try {
            const res = await fetch('/api/funcionarios');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso && Array.isArray(data.funcionarios)) {
                setFuncionarios(data.funcionarios);
            } else {
                setFuncionarios([]);
                throw new Error(data?.erro || 'Resposta inesperada da API de funcionários.');
            }
        } catch (err) {
            console.error("Erro ao buscar funcionários:", err);
            setFuncionarios([]);
            setErroCarregamento('Não foi possível carregar a lista de funcionários para gestão dos plantões.');
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchPlantoes();
            if (user?.is_admin) {
                await fetchFuncionarios();
            }
            setLoading(false);
        };
        init();
    }, [user]);

    // Helper interno: garante 'YYYY-MM-DD' a partir de string ou Date
    const toIsoDay = (raw) => {
        if (!raw) return null;
        if (raw instanceof Date) {
            const y = raw.getUTCFullYear();
            const m = String(raw.getUTCMonth() + 1).padStart(2, '0');
            const d = String(raw.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return String(raw).split('T')[0];
    };

    // Função para formatar data do banco para exibição (ex: "Fev 05")
    const formatarData = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return '';
        const data = new Date(`${iso}T00:00:00Z`);
        return data.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', timeZone: 'UTC' })
            .replace('.', '')
            .replace(/^\w/, (c) => c.toUpperCase());
    };

    // Função para pegar o dia da semana
    const getDiaSemana = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return '';
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[new Date(`${iso}T00:00:00`).getDay()];
    };

    // Função para verificar se é final de semana
    const isFimDeSemana = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return false;
        const dia = new Date(`${iso}T00:00:00`).getDay();
        return dia === 0 || dia === 6;
    };

    // Função para verificar se é hoje
    const isHoje = (dataStr) => {
        const iso = toIsoDay(dataStr);
        if (!iso) return false;
        const hojeObj = new Date();
        const y = hojeObj.getFullYear();
        const m = String(hojeObj.getMonth() + 1).padStart(2, '0');
        const d = String(hojeObj.getDate()).padStart(2, '0');
        return iso === `${y}-${m}-${d}`;
    };

    const openManagement = (dateStr) => {
        if (!user?.is_admin) return;
        
        setSelectedDate(dateStr);
        const existingInfo = plantoes.find(p => toIsoDay(p?.data) === dateStr);
        
        if (existingInfo) {
            setFormData({
                n1_id: existingInfo.n1_id || '',
                n2_id: existingInfo.n2_id || '',
                gerente_id: existingInfo.gerente_id || ''
            });
        } else {
            setFormData({ n1_id: '', n2_id: '', gerente_id: '' });
        }
        setIsModalOpen(true);
    };

    const salvarPlantao = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/plantoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: selectedDate,
                    ...formData
                })
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await safeJson(res);
            if (data.sucesso) {
                await fetchPlantoes();
                setIsModalOpen(false);
            } else {
                alert('Erro ao salvar plantão: ' + (data.erro || 'desconhecido'));
            }
        } catch(err) {
            console.error('Erro ao salvar plantão:', err);
            alert('Erro de conexão ao salvar plantão');
        }
    };

    const closeManagement = () => setIsModalOpen(false);

    // Filter Logic
    const filteredPlantoes = plantoes.filter(p => {
        const pStr = toIsoDay(p?.data);
        if (!pStr) return false;
        const [y, m] = pStr.split('-');
        if (parseInt(y) !== parseInt(filterYear) || parseInt(m) !== parseInt(filterMonth)) return false;

        if (filterSearch) {
            const term = filterSearch.toLowerCase();
            const names = [p.n1_nome, p.n2_nome, p.mgr_nome].filter(Boolean).map(n => n.toLowerCase());
            if (!names.some(n => n.includes(term))) return false;
        }
        return true;
    });

    const daysInMonth = new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate();

    return (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto relative">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-lg">home</span>
                    Início
                </button>
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

            {erroCarregamento && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {erroCarregamento}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Coluna Esquerda: Calendário e Filtros */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Filtros Livres */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <h3 className="text-lg font-bold text-[#1d150c] dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">filter_alt</span>
                            Filtros de Período e Setor
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">MÊS</span>
                                    <div className="relative">
                                        <select 
                                            value={filterMonth}
                                            onChange={(e) => setFilterMonth(e.target.value)}
                                            className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all"
                                        >
                                            <option value="1">Janeiro</option>
                                            <option value="2">Fevereiro</option>
                                            <option value="3">Março</option>
                                            <option value="4">Abril</option>
                                            <option value="5">Maio</option>
                                            <option value="6">Junho</option>
                                            <option value="7">Julho</option>
                                            <option value="8">Agosto</option>
                                            <option value="9">Setembro</option>
                                            <option value="10">Outubro</option>
                                            <option value="11">Novembro</option>
                                            <option value="12">Dezembro</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                    </div>
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">ANO</span>
                                    <div className="relative">
                                        <select 
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                            className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all"
                                        >
                                            <option>2024</option>
                                            <option>2025</option>
                                            <option>2026</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
                                    </div>
                                </label>
                            </div>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider">BUSCA POR ATENDENTE</span>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Ana, Carlos..." 
                                    value={filterSearch}
                                    onChange={e => setFilterSearch(e.target.value)}
                                    className="w-full rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-[#fcfaf8] dark:bg-[#2c2217] px-4 py-2.5 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all placeholder:text-[#a17745]/50"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Mini Calendário */}
                    <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800 text-sm font-bold opacity-0 cursor-default">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <p className="text-[#1d150c] dark:text-white text-base font-bold capitalize">
                                {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                            <button className="p-1 rounded-full hover:bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white transition-colors border border-transparent hover:border-[#eaddcd] dark:border-gray-800 opacity-0 cursor-default">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-2">
                            {[
                                { id: 'sun', label: 'D' },
                                { id: 'mon', label: 'S' },
                                { id: 'tue', label: 'T' },
                                { id: 'wed', label: 'Q' },
                                { id: 'thu', label: 'Q' },
                                { id: 'fri', label: 'S' },
                                { id: 'sat', label: 'S' },
                            ].map(({ id, label }) => (
                                <div key={id} className="text-xs font-black text-[#a17745] dark:text-orange-300 uppercase tracking-widest">{label}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const dateStr = `${filterYear}-${String(filterMonth).padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                const temPlantao = plantoes.some(p => toIsoDay(p?.data) === dateStr);
                                const ehHoje = isHoje(`${dateStr}T00:00:00Z`);
                                return (
                                    <CalendarDay 
                                        key={day} 
                                        day={day} 
                                        active={temPlantao} 
                                        isToday={ehHoje} 
                                        onClick={() => openManagement(dateStr)}
                                        isAdmin={user?.is_admin}
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-6 flex items-center gap-5 text-xs font-bold justify-center border-t border-[#f4eee6] dark:border-gray-800 pt-4">
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
                                <p className="text-[#a17745] dark:text-orange-300 text-xs font-black uppercase tracking-wider mb-1">Plantões Filtrados</p>
                                <p className="text-3xl font-black text-[#1d150c] dark:text-white">{filteredPlantoes.length}</p>
                                <p className="text-sm font-medium text-[#a17745] dark:text-orange-300 mt-1">Atribuições neste período</p>
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
                                Escala Detalhada de Suporte {user?.is_admin && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded font-black hidden sm:inline-block">MODO ADMIN</span>}
                            </h3>
                            <div className="flex gap-2 text-sm text-[#a17745] dark:text-orange-300">
                                {user?.is_admin ? "Clique nos dias no calendário ou nas linhas para editar." : ""}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-white dark:bg-[#1a130b] border-b-2 border-[#f4eee6] dark:border-gray-800 text-[#a17745] dark:text-orange-300">
                                    <tr>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-28">Data</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-36">Dia da Semana</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N1</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Suporte N2</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Gerente ON</th>
                                        {user?.is_admin && <th className="px-6 py-4 font-black uppercase tracking-wider text-xs w-10">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f4eee6] dark:divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={user?.is_admin ? 6 : 5} className="px-6 py-10 text-center text-[#a17745] font-bold">
                                                Carregando escala...
                                            </td>
                                        </tr>
                                    ) : filteredPlantoes.length === 0 ? (
                                        <tr>
                                            <td colSpan={user?.is_admin ? 6 : 5} className="px-6 py-10 text-center text-[#a17745] font-bold">
                                                Nenhum plantão agendado para este período visualizado.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPlantoes.map((p) => (
                                            <ScheduleRow
                                                key={p.id ?? toIsoDay(p.data)}
                                                date={formatarData(p.data)}
                                                day={getDiaSemana(p.data)}
                                                isToday={isHoje(p.data)}
                                                isWeekend={isFimDeSemana(p.data)}
                                                n1={{ name: p.n1_nome || 'Não atribuído', img: p.n1_foto }}
                                                n2={p.n2_id ? { name: p.n2_nome || 'Não atribuído', img: p.n2_foto } : null}
                                                mgr={{ name: p.mgr_nome || 'Não atribuído', img: p.mgr_foto }}
                                                isAdmin={user?.is_admin}
                                                onEdit={() => openManagement(toIsoDay(p.data))}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 p-4 bg-[#fcfaf8] dark:bg-[#2c2217] rounded-xl border border-[#eaddcd] dark:border-gray-800 text-sm text-[#a17745] dark:text-orange-300 font-medium">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <p><strong>Nota:</strong> Os plantões estão sujeitos a alterações. Em caso de imprevistos, contatar o RH para realocações com 48h de antecedência.</p>
                    </div>
                </div>
            </div>

            {/* Modal de Gestão (Visível Apenas para Admin) */}
            {isModalOpen && user?.is_admin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a130b] rounded-2xl shadow-xl w-full max-w-lg border border-[#eaddcd] dark:border-gray-800 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-[#eaddcd] dark:border-gray-800 flex justify-between items-center bg-[#fcfaf8] dark:bg-[#2c2217]">
                            <h2 className="text-xl font-black text-[#1d150c] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_calendar</span>
                                Gerenciar Plantão
                            </h2>
                            <button onClick={closeManagement} className="text-[#a17745] dark:text-orange-300 hover:text-red-500 rounded-full p-1 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={salvarPlantao} className="p-6 flex flex-col gap-6">
                            <div className="flex gap-2 items-center bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold w-max">
                                <span className="material-symbols-outlined">calendar_today</span>
                                Data Selecionada: {selectedDate.split('-').reverse().join('/')}
                            </div>

                            <SelectEmployee 
                                label="SUPORTE N1" 
                                value={formData.n1_id} 
                                onChange={(val) => setFormData({...formData, n1_id: val})} 
                                options={funcionarios} 
                            />
                            <SelectEmployee 
                                label="SUPORTE N2" 
                                value={formData.n2_id} 
                                onChange={(val) => setFormData({...formData, n2_id: val})} 
                                options={funcionarios} 
                            />
                            <SelectEmployee 
                                label="GERENTE ON" 
                                value={formData.gerente_id} 
                                onChange={(val) => setFormData({...formData, gerente_id: val})} 
                                options={funcionarios} 
                            />

                            <div className="mt-4 flex gap-3 justify-end pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                                <button type="button" onClick={closeManagement} className="px-5 py-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-[#1d150c] dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    Salvar Plantão
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

function SelectEmployee({ label, value, onChange, options }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase text-[#a17745] dark:text-orange-300 tracking-wider flex items-center gap-1">
                {label}
            </span>
            <div className="relative">
                <select 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] px-4 py-3 pr-8 text-[#1d150c] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold transition-all"
                >
                    <option value="">-- Não Atribuído --</option>
                    {options.map(func => (
                        <option key={func.funcionario_id} value={func.funcionario_id}>
                            {func.funcionario_nome}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a17745] dark:text-orange-300">expand_more</span>
            </div>
        </label>
    );
}

function CalendarDay({ day, isToday, active, onClick, isAdmin }) {
    let classes = "size-9 mx-auto flex items-center justify-center text-sm rounded-full font-bold transition-transform ";
    
    if (isAdmin) {
        classes += "cursor-pointer ";
    } else {
        classes += "cursor-default ";
    }

    if (isToday) {
        classes += "bg-primary text-white shadow-md shadow-primary/30 ";
        if (isAdmin) classes += "hover:scale-110 ";
    } else if (active) {
        classes += "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30 ";
        if (isAdmin) classes += "hover:scale-110 hover:ring-2 ring-primary ring-offset-2 ring-offset-white ring-offset-dark-100 ";
    } else {
        classes += "text-[#1d150c] dark:text-white border border-transparent ";
        if (isAdmin) classes += "hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] hover:text-primary hover:border-[#eaddcd] dark:hover:border-gray-800 hover:scale-110";
    }

    return (
        <button onClick={onClick} className={classes}>{day}</button>
    );
}

function ScheduleRow({ date, day, isToday, isWeekend, n1, n2, mgr, isAdmin, onEdit }) {
    let rowClasses = "transition-colors group ";

    if (isToday) {
        rowClasses += "bg-primary/5 border-l-4 border-l-primary ";
    } else if (isWeekend) {
        rowClasses += "bg-[#fcfaf8] dark:bg-[#2c2217]/50 ";
    }

    if (isAdmin) {
        rowClasses += "hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] cursor-pointer";
    }

    return (
        <tr className={rowClasses} onClick={isAdmin ? onEdit : undefined}>
            <td className={`px-6 py-4 font-black ${isToday ? 'text-primary' : 'text-[#1d150c] dark:text-white'}`}>{date}</td>
            <td className={`px-6 py-4 font-semibold ${isWeekend ? 'text-[#a17745] dark:text-orange-300' : 'text-[#1d150c] dark:text-white'}`}>{day}</td>
            <td className="px-6 py-4"><UserAvatar user={n1} /></td>
            <td className="px-6 py-4"><UserAvatar user={n2} allowEmpty /></td>
            <td className="px-6 py-4"><UserAvatar user={mgr} /></td>
            {isAdmin && (
                <td className="px-6 py-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 rounded-md text-[#a17745] dark:text-orange-300 opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-black hover:text-primary border border-[#eaddcd] dark:border-gray-800 transition-all font-bold text-xs"
                    >
                        EDITAR
                    </button>
                </td>
            )}
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

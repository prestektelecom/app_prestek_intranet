import React, { useState, useMemo } from 'react';
import CalendarDay from './schedule/CalendarDay';
import ScheduleRow from './schedule/ScheduleRow';
import ManagePlantaoModal from './schedule/ManagePlantaoModal';
import { useScheduleData } from '../hooks/useScheduleData';
import { toIsoDay, formatarData, getDiaSemana, isFimDeSemana, isHoje } from '../utils/dateHelpers';
import { handleImprimir, handleExportarICal } from '../services/exportService';

// Skeleton row for loading state
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="p-4 pl-8">
                    <div className="h-4 bg-surface-container-high rounded-md w-3/4" />
                </td>
            ))}
        </tr>
    );
}

export default function Schedule({ setCurrentView, user }) {
    const d = new Date();
    const [filterMonth, setFilterMonth] = useState((d.getMonth() + 1).toString());
    const [filterYear, setFilterYear] = useState(d.getFullYear().toString());
    const [filterSearch, setFilterSearch] = useState('');
    const [filterMeusPlantoes, setFilterMeusPlantoes] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ n1_ids: [], n2_ids: [], gerente_ids: [] });
    const [existingPlantao, setExistingPlantao] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const {
        plantoes,
        funcionarios,
        colaboradoresNoc,
        colaboradoresSuporteN2,
        todosColaboradores,
        loading,
        erroCarregamento,
        historico,
        loadingHistorico,
        fetchPlantoes,
        fetchHistorico,
        setHistorico,
    } = useScheduleData(user);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const safeJson = async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            const text = await res.text().catch(() => '');
            throw new Error(`Resposta não-JSON (${res.status}): ${text.slice(0, 120)}`);
        }
        return res.json();
    };

    const mapIdsToPessoas = useMemo(() => (idsStr) => {
        if (!idsStr) return [{ name: 'Não atribuído', initials: '??', img: null }];
        const ids = String(idsStr).split(',').filter(Boolean);
        if (ids.length === 0) return [{ name: 'Não atribuído', initials: '??', img: null }];

        const toName = (obj) => obj?.funcionario_nome || obj?.nome || obj?.funcionario;
        const makePessoa = (obj, img = null) => {
            const nome = toName(obj);
            return {
                name: nome,
                initials: (nome || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
                img
            };
        };
        const matchId = (obj, id) =>
            String(obj.funcionario_id) === String(id) || String(obj.id) === String(id);

        return ids.map(id => {
            // 1. usuarios_perfil — tem foto
            const func = funcionarios?.find(f => matchId(f, id));
            if (func) return makePessoa(func, func.foto_perfil || null);

            // 2. colaboradores NOC (N1)
            const noc = colaboradoresNoc?.find(c => matchId(c, id));
            if (noc) return makePessoa(noc);

            // 3. colaboradores Suporte N2
            const n2 = colaboradoresSuporteN2?.find(c => matchId(c, id));
            if (n2) return makePessoa(n2);

            // 4. todos colaboradores IXC — fallback geral
            const colab = todosColaboradores?.find(c => matchId(c, id));
            if (colab) return makePessoa(colab);

            return { name: `ID: ${id}`, initials: '??', img: null };
        });
    }, [funcionarios, colaboradoresNoc, colaboradoresSuporteN2, todosColaboradores]);

    const getNamesFromIds = (idsStr) => mapIdsToPessoas(idsStr).map(p => p.name).filter(n => n !== 'Não atribuído');

    const filteredPlantoes = useMemo(() => {
        return plantoes.filter(p => {
            const pStr = toIsoDay(p?.data);
            if (!pStr) return false;
            const [y, m] = pStr.split('-');
            if (parseInt(y) !== parseInt(filterYear) || parseInt(m) !== parseInt(filterMonth)) return false;

            if (filterSearch) {
                const term = filterSearch.toLowerCase();
                const allNomes = [
                    ...getNamesFromIds(p.n1_id),
                    ...getNamesFromIds(p.n2_id),
                    ...getNamesFromIds(p.gerente_id)
                ].filter(Boolean).map(n => n.toLowerCase());
                if (!allNomes.some(n => n.includes(term))) return false;
            }

            if (filterMeusPlantoes && user) {
                const userName = (user.nome || user.name || '').toLowerCase();
                const userId = String(user.id || '');
                const allNomes = [
                    ...getNamesFromIds(p.n1_id),
                    ...getNamesFromIds(p.n2_id),
                    ...getNamesFromIds(p.gerente_id)
                ].filter(Boolean).map(n => n.toLowerCase());
                const allIds = [
                    ...(p.n1_id ? String(p.n1_id).split(',') : []),
                    ...(p.n2_id ? String(p.n2_id).split(',') : []),
                    ...(p.gerente_id ? String(p.gerente_id).split(',') : []),
                ].map(id => id.trim());
                const matchNome = userName && allNomes.some(n => n.includes(userName));
                const matchId = userId && allIds.includes(userId);
                if (!matchNome && !matchId) return false;
            }

            return true;
        });
    }, [plantoes, filterYear, filterMonth, filterSearch, filterMeusPlantoes, user, mapIdsToPessoas]);

    const limparFiltros = () => {
        setFilterSearch('');
        setFilterMonth((d.getMonth() + 1).toString());
        setFilterYear(d.getFullYear().toString());
        setFilterMeusPlantoes(false);
    };

    const monthLabel = () => new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const openManagement = (dateStr) => {
        if (!user?.is_admin) return;
        setSelectedDate(dateStr);
        setHistorico([]);
        const existingInfo = plantoes.find(p => toIsoDay(p?.data) === dateStr);
        const parseIds = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return val.split(',').filter(Boolean);
        };
        if (existingInfo) {
            setFormData({
                n1_ids: parseIds(existingInfo.n1_id),
                n2_ids: parseIds(existingInfo.n2_id),
                gerente_ids: parseIds(existingInfo.gerente_id)
            });
            setExistingPlantao(existingInfo);
        } else {
            setFormData({ n1_ids: [], n2_ids: [], gerente_ids: [] });
            setExistingPlantao(null);
        }
        setIsModalOpen(true);
        fetchHistorico(dateStr);
    };

    const executarSalvamento = async () => {
        setSalvando(true);
        try {
            const payload = {
                data: selectedDate,
                n1_ids: formData.n1_ids,
                n2_ids: formData.n2_ids,
                gerente_ids: formData.gerente_ids,
                admin_usuario_id: user?.id || null
            };
            const res = await fetch('/api/plantoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso) {
                await fetchPlantoes();
                setIsModalOpen(false);
                showToast(existingPlantao ? 'Plantão substituído com sucesso!' : 'Plantão cadastrado com sucesso!', 'success');
            } else {
                showToast('Erro ao salvar plantão: ' + (data.erro || 'desconhecido'), 'error');
            }
        } catch (err) {
            console.error('Erro ao salvar plantão:', err);
            showToast('Erro de conexão ao salvar plantão.', 'error');
        } finally {
            setSalvando(false);
        }
    };

    const executarDelecao = async () => {
        setDeletando(true);
        try {
            const payload = { data: selectedDate, admin_usuario_id: user?.id || null };
            const res = await fetch('/api/plantoes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await safeJson(res);
            if (data.sucesso) {
                await fetchPlantoes();
                setConfirmDeleteOpen(false);
                setIsModalOpen(false);
                showToast('Plantão excluído com sucesso!', 'success');
            } else {
                showToast('Erro ao excluir plantão: ' + (data.erro || 'desconhecido'), 'error');
            }
        } catch (err) {
            console.error('Erro ao excluir plantão:', err);
            showToast('Erro de conexão ao excluir plantão.', 'error');
        } finally {
            setDeletando(false);
        }
    };

    const salvarPlantao = () => {
        executarSalvamento();
    };

    const closeManagement = () => {
        setIsModalOpen(false);
        setConfirmDeleteOpen(false);
        setExistingPlantao(null);
        setHistorico([]);
    };

    const daysInMonth = new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate();
    const firstDayOfMonth = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).getDay();

    const filtrosAtivos = filterSearch !== '' || filterMonth !== (d.getMonth() + 1).toString() || filterYear !== d.getFullYear().toString() || filterMeusPlantoes;

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="flex-1 flex flex-col gap-8">
                {/* Breadcrumbs */}
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-secondary tracking-wide flex items-center gap-2">
                        <button onClick={() => setCurrentView('dashboard')} className="hover:text-primary transition-colors flex items-center gap-1">
                            Início
                        </button>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-on-surface">Escala de Plantão</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">Visão Geral da Escala</h1>
                            <p className="text-secondary font-medium mt-1">Visualize e gerencie as atribuições de cobertura mensal.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleImprimir(filteredPlantoes, filterMonth, filterYear, filterSearch, formatarData, getDiaSemana)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface font-bold shadow-sm hover:bg-surface-container-low transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">print</span>
                                Imprimir
                            </button>
                            <button
                                onClick={() => handleExportarICal(filteredPlantoes, filterMonth, filterYear, showToast)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                                Exportar iCal
                            </button>
                        </div>
                    </div>
                </div>

                {erroCarregamento && (
                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {erroCarregamento}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Filters & Context */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Filtros Card */}
                        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">tune</span>
                                    <h2 className="text-lg font-black text-on-surface tracking-tight">Filtros</h2>
                                </div>
                                {filtrosAtivos && (
                                    <button
                                        onClick={limparFiltros}
                                        className="text-[10px] uppercase font-bold tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md"
                                        aria-label="Limpar filtros"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close_small</span> Limpar
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors">Mês</span>
                                        <div className="relative">
                                            <select
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(e.target.value)}
                                                className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-surface-container-low/80"
                                                aria-label="Selecionar Mês"
                                            >
                                                <option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option>
                                                <option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option>
                                                <option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option>
                                                <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary group-focus-within:text-primary text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors">Ano</span>
                                        <div className="relative">
                                            <select
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                                className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-surface-container-low/80"
                                                aria-label="Selecionar Ano"
                                            >
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary group-focus-within:text-primary text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                </div>
                                <label className="flex flex-col gap-1.5 group cursor-pointer">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors block mb-0.5">Atendente</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg group-focus-within:text-primary transition-colors">search</span>
                                        <input
                                            type="text"
                                            placeholder="Buscar nome..."
                                            value={filterSearch}
                                            onChange={e => setFilterSearch(e.target.value)}
                                            className="w-full bg-surface-container-low border border-transparent rounded-lg py-2.5 pl-10 pr-10 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-bold text-sm placeholder-secondary-variant/50 transition-all hover:bg-surface-container-low/80"
                                            aria-label="Buscar Atendente"
                                        />
                                        {filterSearch && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); setFilterSearch(''); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                                                aria-label="Limpar busca"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        )}
                                    </div>
                                </label>

                                {/* Meus Plantões toggle */}
                                <button
                                    type="button"
                                    onClick={() => setFilterMeusPlantoes(v => !v)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${filterMeusPlantoes
                                        ? 'bg-primary/10 text-primary border-primary/30'
                                        : 'bg-surface-container-low text-secondary border-transparent hover:border-surface-container-high'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    Meus Plantões
                                    {filterMeusPlantoes && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-surface-container-high/50 animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-black text-on-surface capitalize tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                                    {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </h3>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-3 font-black text-secondary uppercase tracking-widest opacity-80">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm bg-surface-container-low/20 rounded-xl p-1">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
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
                            <div className="mt-5 flex gap-4 text-[10px] font-black text-secondary uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm shadow-primary/20"></div> Hoje</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-full"></div> Plantão</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border-l-4 border-primary animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">insights</span>
                                    Status do Filtro
                                </div>
                                <div className="text-3xl font-black text-on-surface">
                                    {filteredPlantoes.length} <span className="text-sm font-bold text-secondary uppercase tracking-widest ml-1">Plantões Filtrados</span>
                                </div>
                            </div>
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110 duration-300">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Data Table */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high/50 animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-6 md:p-8 flex flex-wrap justify-between items-center bg-surface-container-lowest border-b border-surface-container-low gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-on-surface tracking-tight">Escala Detalhada de Suporte</h2>
                                    <p className="text-sm font-medium text-secondary mt-1">Clique nas linhas {user?.is_admin ? "ou no calendário" : ""} para ver detalhes.</p>
                                </div>
                                {user?.is_admin && (
                                    <div className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-primary/20 animate-pulse">
                                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                        Gestão Ativa
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low/50 border-b border-surface-container-high/50">
                                            <th scope="col" className="p-4 pl-8 text-[11px] font-black text-secondary uppercase tracking-widest">DATA</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">DIA</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N1 - ATENDIMENTO/NOC</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-secondary uppercase tracking-widest">N2 - SUPORTE/SERVIÇOS</th>
                                            <th scope="col" className="p-4 pr-8 text-[11px] font-black text-secondary uppercase tracking-widest text-right sm:text-left">SUPERVISÃO</th>
                                            {user?.is_admin && <th scope="col" className="p-4 pr-6 w-12"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {loading ? (
                                            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                        ) : filteredPlantoes.length === 0 ? (
                                            <tr>
                                                <td colSpan={user?.is_admin ? 6 : 5} className="p-16 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <span className="material-symbols-outlined text-5xl text-secondary/40">event_busy</span>
                                                        <div>
                                                            <p className="font-black text-on-surface text-base">Nenhum plantão encontrado</p>
                                                            <p className="text-secondary text-sm mt-1">Não há plantões agendados para os filtros selecionados.</p>
                                                        </div>
                                                        {filtrosAtivos && (
                                                            <button
                                                                onClick={limparFiltros}
                                                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary/20 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                                                                Limpar filtros
                                                            </button>
                                                        )}
                                                    </div>
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
                                                    n1={mapIdsToPessoas(p.n1_id)}
                                                    n2={p.n2_id ? mapIdsToPessoas(p.n2_id) : [{ name: 'Não atribuído', initials: '??', img: null }]}
                                                    mgr={mapIdsToPessoas(p.gerente_id)}
                                                    isAdmin={user?.is_admin}
                                                    onEdit={() => openManagement(toIsoDay(p.data))}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Gestão */}
                {user?.is_admin && (
                    <ManagePlantaoModal
                        isOpen={isModalOpen}
                        selectedDate={selectedDate}
                        existingPlantao={existingPlantao}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={salvarPlantao}
                        onDelete={() => setConfirmDeleteOpen(true)}
                        onClose={closeManagement}
                        historico={historico}
                        loadingHistorico={loadingHistorico}
                        salvando={salvando}
                        deletando={deletando}
                        colaboradoresNoc={colaboradoresNoc}
                        colaboradoresSuporteN2={colaboradoresSuporteN2}
                        funcionarios={funcionarios}
                        getNamesFromIds={getNamesFromIds}
                    />
                )}
                {/* Confirmação de exclusão */}
                {confirmDeleteOpen && existingPlantao && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background-dark/70 backdrop-blur-sm p-4">
                        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-surface-container-high flex flex-col">
                            <div className="px-5 py-4 border-b border-surface-container-high flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">delete_forever</span>
                                <h3 className="text-base font-black text-on-surface">Excluir plantão?</h3>
                            </div>
                            <div className="px-5 py-4 flex flex-col gap-3 text-sm text-on-surface">
                                <p className="font-medium">
                                    Tem certeza que deseja excluir permanentemente o plantão do dia <strong className="whitespace-nowrap">{new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>?
                                </p>
                                <div className="bg-surface-container-low rounded-lg p-3 text-xs flex flex-col gap-1 opacity-70">
                                    <div><span className="font-black">N1:</span> {getNamesFromIds(existingPlantao.n1_id).join(', ') || '—'}</div>
                                    <div><span className="font-black">N2:</span> {getNamesFromIds(existingPlantao.n2_id).join(', ') || '—'}</div>
                                    <div><span className="font-black">Supervisão:</span> {getNamesFromIds(existingPlantao.gerente_id).join(', ') || '—'}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 px-5 py-4 border-t border-surface-container-high">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOpen(false)}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-colors text-sm disabled:opacity-60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={executarDelecao}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-red-500 text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-red-500/30 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                    {deletando && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
                                    {deletando ? 'Excluindo...' : 'Sim, excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast.show && (
                    <div className="fixed top-8 right-8 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className={`flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md border ${toast.type === 'success'
                            ? 'bg-emerald-500/90 border-emerald-400 text-white'
                            : 'bg-red-500/90 border-red-400 text-white'
                        }`}>
                            <span className="material-symbols-outlined text-2xl font-bold">
                                {toast.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            <p className="font-bold tracking-wide">{toast.message}</p>
                        </div>
                    </div>
                )}

                <footer className="mt-8 pt-8 border-t border-surface-container-high pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-secondary font-bold gap-4 uppercase tracking-widest">
                    <p>© 2026 Prestek Intranet • Portal Interno</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Políticas</a>
                        <a className="hover:text-primary transition-colors" href="#">Suporte</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

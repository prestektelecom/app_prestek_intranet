import React, { useState, useMemo, useEffect } from 'react';
import CalendarDay from './schedule/CalendarDay';
import ScheduleRow from './schedule/ScheduleRow';
import ManagePlantaoModal from './schedule/ManagePlantaoModal';
import HistoricoPreviewModal from './schedule/HistoricoPreviewModal';
import ScheduleHistoricoTab from './schedule/ScheduleHistoricoTab';
import { useScheduleData } from '../hooks/useScheduleData';
import { toIsoDay, formatarData, getDiaSemana, isFimDeSemana, isHoje } from '../utils/dateHelpers';
import { handleImprimir, handleExportarICal } from '../services/exportService';

// Paleta Bento Blue Prestek (alinhada com Dashboard/Serviços/Colaboradores)
const C = {
  bg: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7FAFD',
  accent: '#4A9EF5',
  accentDark: '#2D7BD4',
  accentDeep: '#1F5BA8',
  accentSoft: '#EAF4FF',
  cyan: '#7FD4E8',
  ink: '#0B1B2E',
  ink2: '#475467',
  muted: '#8896A8',
  line: '#E4ECF5',
  success: '#1F8A5B',
  successSoft: '#E6F4EC',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#E84545',
  dangerSoft: '#FDEDED',
};

function tone(hex, a) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

function ScheduleHero({ monthLabel, totalPlantoes, diasCobertos, alteracoes, user, onPrint, onExport, onHistory, onAudit }) {
  const kpis = [
    { label: 'Plantões', value: totalPlantoes, icon: 'event_available' },
    { label: 'Dias Cobertos', value: diasCobertos, icon: 'calendar_today' },
    { label: user?.is_admin ? 'Alterações' : 'Meus Plantões', value: user?.is_admin ? alteracoes : '—', icon: user?.is_admin ? 'edit_calendar' : 'person' },
  ];

  return (
    <div style={{
      background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
      borderRadius: 24, padding: '28px 32px', color: 'white',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
    }}>
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.12 }} width="100%" height="100%">
        <defs><pattern id="schedule-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#schedule-hero-grid)" />
      </svg>
      <div style={{ position: 'absolute', top: -100, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -80, right: 60, width: 180, height: 180, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            fontSize: 11.5, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#7FD8B8' }} />
            {monthLabel}
          </div>
          <h1 style={{ margin: '14px 0 6px', fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Visão Geral da Escala
          </h1>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5 }}>
            Visualize e gerencie as atribuições de cobertura mensal do time.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={onPrint} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
              color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
              <span className="material-symbols-outlined text-[18px]">print</span> Imprimir
            </button>
            <button onClick={onExport} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10,
              background: 'white', color: C.accentDeep,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}>
              <span className="material-symbols-outlined text-[18px]">ios_share</span> Exportar iCal
            </button>
            {user?.is_admin && onHistory && (
              <button onClick={onHistory} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
                color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                <span className="material-symbols-outlined text-[18px]">table_chart</span> Ver Histórico
              </button>
            )}
            {user?.is_admin && onAudit && (
              <button onClick={onAudit} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)',
                color: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                <span className="material-symbols-outlined text-[18px]">manage_history</span> Auditoria
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.22)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
            </div>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>{kpi.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton row for loading state
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="p-4 pl-8">
                    <div className="h-4 bg-[#E4ECF5] rounded-md w-3/4" />
                </td>
            ))}
        </tr>
    );
}

export default function Schedule({ setCurrentView, user }) {
    const d = new Date();
    const [activeTab, setActiveTab] = useState('escala');
    const [filterMonth, setFilterMonth] = useState((d.getMonth() + 1).toString());
    const [filterYear, setFilterYear] = useState(d.getFullYear().toString());
    const [filterSearch, setFilterSearch] = useState('');
    const [filterMeusPlantoes, setFilterMeusPlantoes] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ n1_ids: [], n2_ids: [], gerente_ids: [] });
    const [existingPlantao, setExistingPlantao] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [monthlyChangeCount, setMonthlyChangeCount] = useState(null);
    const [loadingChangeCount, setLoadingChangeCount] = useState(false);

    const {
        plantoes,
        funcionarios,
        supervisoresPlantao,
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

    useEffect(() => {
        if (!user?.is_admin) return;
        let cancelled = false;
        const fetchCount = async () => {
            setLoadingChangeCount(true);
            try {
                const params = new URLSearchParams({ mes: filterMonth, ano: filterYear, pagina: 1, limite: 1 });
                const headers = user?.email ? { 'x-admin-email': user.email } : {};
                const res = await fetch(`/api/plantoes/historico?${params}`, { headers });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) setMonthlyChangeCount(data.sucesso ? (data.total ?? 0) : null);
            } catch {
                if (!cancelled) setMonthlyChangeCount(null);
            } finally {
                if (!cancelled) setLoadingChangeCount(false);
            }
        };
        fetchCount();
        return () => { cancelled = true; };
    }, [filterMonth, filterYear, user]);

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

    const diasCobertos = useMemo(() => {
        const datas = new Set(filteredPlantoes.map(p => toIsoDay(p?.data)).filter(Boolean));
        return datas.size;
    }, [filteredPlantoes]);

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', backgroundColor: C.bg }}>
            <main className="flex-1 flex flex-col gap-8">
                <ScheduleHero
                    monthLabel={monthLabel()}
                    totalPlantoes={filteredPlantoes.length}
                    diasCobertos={diasCobertos}
                    alteracoes={monthlyChangeCount ?? 0}
                    user={user}
                    onPrint={() => handleImprimir(filteredPlantoes, filterMonth, filterYear, filterSearch, formatarData, getDiaSemana)}
                    onExport={() => handleExportarICal(filteredPlantoes, filterMonth, filterYear, showToast)}
                    onHistory={user?.is_admin ? () => setIsHistoricoModalOpen(true) : null}
                    onAudit={user?.is_admin ? () => setCurrentView?.('plantao-historico') : null}
                />

                {erroCarregamento && (
                    <div className="p-4 rounded-xl border border-[#E84545]/30 bg-[#FDEDED] dark:bg-[#3a1515] text-[#E84545] dark:text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {erroCarregamento}
                    </div>
                )}

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-[#EAF4FF] rounded-xl border border-[#E4ECF5] self-start">
                    <button
                        type="button"
                        onClick={() => setActiveTab('escala')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'escala' ? 'bg-white text-[#0B1B2E] shadow-sm' : 'text-[#475467] hover:text-[#0B1B2E]'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Escala
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('historico')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-white text-[#0B1B2E] shadow-sm' : 'text-[#475467] hover:text-[#0B1B2E]'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        Histórico
                    </button>
                </div>

                {activeTab === 'historico' ? (
                    <ScheduleHistoricoTab
                        filterMonth={filterMonth}
                        filterYear={filterYear}
                        user={user}
                        onViewFullAudit={user?.is_admin ? () => setCurrentView?.('plantao-historico') : null}
                    />
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Filters & Context */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Filtros Card */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm flex flex-col gap-5 border border-[#E4ECF5] animate-in fade-in slide-in-from-left-4 duration-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between border-b border-[#E4ECF5] pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4A9EF5]">tune</span>
                                    <h2 className="text-lg font-black text-[#0B1B2E] tracking-tight">Filtros</h2>
                                </div>
                                {filtrosAtivos && (
                                    <button
                                        onClick={limparFiltros}
                                        className="text-[10px] uppercase font-bold tracking-widest text-[#475467] hover:text-[#4A9EF5] transition-colors flex items-center gap-1 bg-[#EAF4FF] px-2 py-1 rounded-md"
                                        aria-label="Limpar filtros"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close_small</span> Limpar
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest group-focus-within:text-[#4A9EF5] transition-colors">Mês</span>
                                        <div className="relative">
                                            <select
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(e.target.value)}
                                                className="w-full bg-[#F7FAFD] border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-[#0B1B2E] focus:border-[#4A9EF5] focus:ring-1 focus:ring-[#4A9EF5] focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-[#EAF4FF]/80"
                                                aria-label="Selecionar Mês"
                                            >
                                                <option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option>
                                                <option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option>
                                                <option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option>
                                                <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#475467] group-focus-within:text-[#4A9EF5] text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest group-focus-within:text-[#4A9EF5] transition-colors">Ano</span>
                                        <div className="relative">
                                            <select
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                                className="w-full bg-[#F7FAFD] border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-[#0B1B2E] focus:border-[#4A9EF5] focus:ring-1 focus:ring-[#4A9EF5] focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-[#EAF4FF]/80"
                                                aria-label="Selecionar Ano"
                                            >
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#475467] group-focus-within:text-[#4A9EF5] text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                </div>
                                <label className="flex flex-col gap-1.5 group cursor-pointer">
                                    <span className="text-[10px] font-bold text-[#475467] uppercase tracking-widest group-focus-within:text-[#4A9EF5] transition-colors block mb-0.5">Atendente</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#475467] text-lg group-focus-within:text-[#4A9EF5] transition-colors">search</span>
                                        <input
                                            type="text"
                                            placeholder="Buscar nome..."
                                            value={filterSearch}
                                            onChange={e => setFilterSearch(e.target.value)}
                                            className="w-full bg-[#F7FAFD] border border-transparent rounded-lg py-2.5 pl-10 pr-10 text-[#0B1B2E] focus:border-[#4A9EF5] focus:ring-1 focus:ring-[#4A9EF5] focus:outline-none font-bold text-sm placeholder-[#475467]/50 transition-all hover:bg-[#EAF4FF]/80"
                                            aria-label="Buscar Atendente"
                                        />
                                        {filterSearch && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); setFilterSearch(''); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#EAF4FF] text-[#475467] hover:text-[#0B1B2E] transition-colors"
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
                                        ? 'bg-[#EAF4FF] text-[#4A9EF5] border-[#4A9EF5]/30'
                                        : 'bg-[#F7FAFD] text-[#475467] border-transparent hover:border-[#E4ECF5]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    Meus Plantões
                                    {filterMeusPlantoes && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-[#4A9EF5]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E4ECF5] animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-black text-[#0B1B2E] capitalize tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4A9EF5] text-[20px]">calendar_month</span>
                                    {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </h3>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-3 font-black text-[#475467] uppercase tracking-widest opacity-80">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm bg-[#F7FAFD]/60 rounded-xl p-1">
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
                            <div className="mt-5 flex gap-4 text-[10px] font-black text-[#475467] uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#4A9EF5] rounded-full shadow-sm shadow-[#4A9EF5]/20"></div> Hoje</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#4A9EF5] rounded-full"></div> Plantão</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E4ECF5] animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="text-[10px] font-bold text-[#475467] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">insights</span>
                                    Status do Filtro
                                </div>
                                <div className="text-3xl font-black text-[#0B1B2E]">
                                    {filteredPlantoes.length} <span className="text-sm font-bold text-[#475467] uppercase tracking-widest ml-1">Plantões Filtrados</span>
                                </div>
                            </div>
                            <div className="size-10 rounded-full bg-[#EAF4FF] flex items-center justify-center text-[#4A9EF5] shrink-0 transition-transform hover:scale-110 duration-300">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                        </div>

                        {/* Monthly change count — admin only */}
                        {user?.is_admin && (
                            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E4ECF5] animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="text-[10px] font-bold text-[#475467] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                                        Alterações no Mês
                                    </div>
                                    <div className="text-3xl font-black text-[#0B1B2E]">
                                        {loadingChangeCount ? (
                                            <span className="inline-block w-12 h-8 bg-[#E4ECF5] rounded-md animate-pulse" />
                                        ) : monthlyChangeCount === null ? (
                                            <span className="text-sm font-bold text-[#475467]">—</span>
                                        ) : monthlyChangeCount === 0 ? (
                                            <span className="text-base font-bold text-[#475467]">Sem alterações</span>
                                        ) : (
                                            <>
                                                {monthlyChangeCount}{' '}
                                                <span className="text-sm font-bold text-[#475467] uppercase tracking-widest ml-1">
                                                    {monthlyChangeCount === 1 ? 'alteração' : 'alterações'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="size-10 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#D97706] shrink-0 transition-transform hover:scale-110 duration-300">
                                    <span className="material-symbols-outlined">history</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Data Table */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col border border-[#E4ECF5] animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-6 md:p-8 flex flex-wrap justify-between items-center bg-white border-b border-[#E4ECF5] gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#0B1B2E] tracking-tight">Escala Detalhada de Suporte</h2>
                                    <p className="text-sm font-medium text-[#475467] mt-1">Clique nas linhas {user?.is_admin ? "ou no calendário" : ""} para ver detalhes.</p>
                                </div>
                                {user?.is_admin && (
                                    <div className="bg-[#EAF4FF] text-[#4A9EF5] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-[#4A9EF5]/20 animate-pulse">
                                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                        Gestão Ativa
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F7FAFD] border-b border-[#E4ECF5]">
                                            <th scope="col" className="p-4 pl-8 text-[11px] font-black text-[#475467] uppercase tracking-widest">DATA</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-[#475467] uppercase tracking-widest">DIA</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-[#475467] uppercase tracking-widest">N1 - ATENDIMENTO/NOC</th>
                                            <th scope="col" className="p-4 text-[11px] font-black text-[#475467] uppercase tracking-widest">N2 - SUPORTE/SERVIÇOS</th>
                                            <th scope="col" className="p-4 pr-8 text-[11px] font-black text-[#475467] uppercase tracking-widest text-right sm:text-left">SUPERVISÃO</th>
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
                                                        <span className="material-symbols-outlined text-5xl text-[#8896A8]/40">event_busy</span>
                                                        <div>
                                                            <p className="font-black text-[#0B1B2E] text-base">Nenhum plantão encontrado</p>
                                                            <p className="text-[#475467] text-sm mt-1">Não há plantões agendados para os filtros selecionados.</p>
                                                        </div>
                                                        {filtrosAtivos && (
                                                            <button
                                                                onClick={limparFiltros}
                                                                className="flex items-center gap-2 px-4 py-2 bg-[#EAF4FF] text-[#4A9EF5] rounded-lg font-bold text-sm hover:bg-[#EAF4FF]/80 transition-colors"
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
                )}

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
                        funcionarios={supervisoresPlantao}
                        getNamesFromIds={getNamesFromIds}
                    />
                )}
                {/* Confirmação de exclusão */}
                {confirmDeleteOpen && existingPlantao && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B1B2E]/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#E4ECF5] flex flex-col">
                            <div className="px-5 py-4 border-b border-[#E4ECF5] flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#E84545]">delete_forever</span>
                                <h3 className="text-base font-black text-[#0B1B2E]">Excluir plantão?</h3>
                            </div>
                            <div className="px-5 py-4 flex flex-col gap-3 text-sm text-[#0B1B2E]">
                                <p className="font-medium">
                                    Tem certeza que deseja excluir permanentemente o plantão do dia <strong className="whitespace-nowrap">{new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>?
                                </p>
                                <div className="bg-[#F7FAFD] rounded-lg p-3 text-xs flex flex-col gap-1 opacity-70">
                                    <div><span className="font-black">N1:</span> {getNamesFromIds(existingPlantao.n1_id).join(', ') || '—'}</div>
                                    <div><span className="font-black">N2:</span> {getNamesFromIds(existingPlantao.n2_id).join(', ') || '—'}</div>
                                    <div><span className="font-black">Supervisão:</span> {getNamesFromIds(existingPlantao.gerente_id).join(', ') || '—'}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 px-5 py-4 border-t border-[#E4ECF5]">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOpen(false)}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-[#F7FAFD] text-[#0B1B2E] font-bold rounded-xl hover:bg-[#EAF4FF] transition-colors text-sm disabled:opacity-60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={executarDelecao}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-[#E84545] text-white font-black rounded-xl hover:brightness-110 transition-colors shadow-md shadow-[#E84545]/30 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                    {deletando && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
                                    {deletando ? 'Excluindo...' : 'Sim, excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Histórico Preview Modal */}
                <HistoricoPreviewModal
                    isOpen={isHistoricoModalOpen}
                    onClose={() => setIsHistoricoModalOpen(false)}
                    filterMonth={filterMonth}
                    filterYear={filterYear}
                    user={user}
                    showToast={showToast}
                />

                {/* Toast */}
                {toast.show && (
                    <div className="fixed bottom-8 right-8 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
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

                <footer className="mt-8 pt-8 border-t border-[#E4ECF5] pb-4 flex flex-col md:flex-row justify-between items-center text-xs text-[#8896A8] font-bold gap-4 uppercase tracking-widest">
                    <p>© 2026 Prestek Intranet • Portal Interno</p>
                    <div className="flex gap-6">
                        <a className="hover:text-[#4A9EF5] transition-colors" href="#">Políticas</a>
                        <a className="hover:text-[#4A9EF5] transition-colors" href="#">Suporte</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

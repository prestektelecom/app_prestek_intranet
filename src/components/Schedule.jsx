import React, { useState, useMemo, useEffect } from 'react';
import CalendarDay from './schedule/CalendarDay';
import ScheduleRow from './schedule/ScheduleRow';
import ManagePlantaoModal from './schedule/ManagePlantaoModal';
import HistoricoPreviewModal from './schedule/HistoricoPreviewModal';
import ScheduleHistoricoTab from './schedule/ScheduleHistoricoTab';
import ScheduleMobileCard from './schedule/ScheduleMobileCard';
import { SkeletonRow, SkeletonCard, EmptyState, ErrorState } from './schedule/ScheduleStates';
import { useScheduleData } from '../hooks/useScheduleData';
import { toIsoDay, formatarData, getDiaSemana, isFimDeSemana, isHoje } from '../utils/dateHelpers';
import { handleImprimir, handleExportarICal } from '../services/exportService';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { tone } from '../utils/tone';
import { fundoHero } from './ui/heroGradiente';

const HERO_LABEL_MONO = 'font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75';

function HeroKpiTile({ label, value, icon }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="material-symbols-outlined shrink-0 text-white/70 text-[18px]" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <div className={HERO_LABEL_MONO}>{label}</div>
        <div className="mt-0.5 truncate text-lg font-extrabold leading-none tracking-tight text-white tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function HeroActionButton({ onClick, icon, children, primary, C }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={primary
        ? { background: C.surface, color: C.accentDeep }
        : { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {children}
    </button>
  );
}

function ScheduleHero({ monthLabel, totalPlantoes, diasCobertos, alteracoes, user, onPrint, onExport, onHistory, onAudit, onNewPlantao }) {
  const C = useBentoTheme();
  const kpis = [
    { label: 'Plantões', value: totalPlantoes, icon: 'event_available' },
    { label: 'Dias Cobertos', value: diasCobertos, icon: 'calendar_today' },
    { label: user?.is_admin ? 'Alterações' : 'Meus Plantões', value: user?.is_admin ? alteracoes : '—', icon: user?.is_admin ? 'edit_calendar' : 'person' },
  ];

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[24px] p-6 text-white sm:p-8"
      style={{
        background: fundoHero(C),
        boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
      }}
    >
      <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="sch-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sch-dots)" />
      </svg>

      <div className="relative grid grid-cols-1 gap-6 2xl:grid-cols-12 2xl:items-center 2xl:gap-8">
        <div className="flex flex-col gap-4 2xl:col-span-6">
          <div>
            <div className={HERO_LABEL_MONO}>{monthLabel}</div>
            <h1 className="m-0 mt-1.5 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
              Visão Geral da Escala
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
              Visualize e gerencie as atribuições de cobertura mensal do time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.is_admin && onNewPlantao && (
              <HeroActionButton onClick={onNewPlantao} icon="add" C={C}>Novo Plantão</HeroActionButton>
            )}
            <HeroActionButton onClick={onPrint} icon="print" C={C}>Imprimir</HeroActionButton>
            <HeroActionButton onClick={onExport} icon="ios_share" primary C={C}>Exportar iCal</HeroActionButton>
            {user?.is_admin && onHistory && (
              <HeroActionButton onClick={onHistory} icon="table_chart" C={C}>Ver Histórico</HeroActionButton>
            )}
            {user?.is_admin && onAudit && (
              <HeroActionButton onClick={onAudit} icon="manage_history" C={C}>Auditoria</HeroActionButton>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/60 p-4 2xl:col-span-6">
          <div className="flex items-center gap-2 border-b border-white/[0.15] pb-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
            <span className={HERO_LABEL_MONO}>Escala</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {kpis.map(k => <HeroKpiTile key={k.label} {...k} />)}
          </div>
        </div>
      </div>
    </div>
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
    const [dateEditable, setDateEditable] = useState(false);
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
                const res = await fetch(`/api/plantoes/historico?${params}`);
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

    const parseIds = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return val.split(',').filter(Boolean);
    };

    // Carrega formData/existingPlantao/histórico para uma data — usada tanto
    // ao abrir o modal quanto ao trocar a data dentro dele (modo "Novo
    // Plantão"), para que trocar a data revalide sobreposição em vez de
    // manter o aviso/formulário da data anterior (achado P0 da crítica).
    const carregarDadosDaData = (dateStr) => {
        const existingInfo = plantoes.find(p => toIsoDay(p?.data) === dateStr);
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
        fetchHistorico(dateStr);
    };

    const openNewPlantao = () => {
        if (!user?.is_admin) return;
        // Não usar toIsoDay(new Date()) aqui: aquela função lê os campos UTC
        // (pensada para strings de data "ingênuas" do IXC), e `new Date()` é o
        // instante atual — à noite no fuso de Brasília (UTC-3) isso já "vira o
        // dia seguinte" em UTC. `isHoje` usa hora local; hoje precisa usar o
        // mesmo horário local para os dois concordarem sobre qual dia é "hoje".
        const agora = new Date();
        const hojeLocal = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
        setSelectedDate(hojeLocal);
        setDateEditable(true);
        setIsModalOpen(true);
        carregarDadosDaData(hojeLocal);
    };

    const trocarDataNoModal = (dateStr) => {
        setSelectedDate(dateStr);
        if (dateStr) carregarDadosDaData(dateStr);
    };

    const openManagement = (dateStr) => {
        if (!user?.is_admin) return;
        setSelectedDate(dateStr);
        setDateEditable(false);
        setIsModalOpen(true);
        carregarDadosDaData(dateStr);
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
            showToast('Não foi possível salvar o plantão. Tente novamente.', 'error');
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
            showToast('Não foi possível excluir o plantão. Tente novamente.', 'error');
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
        setSelectedDate(null);
        setDateEditable(false);
    };

    const daysInMonth = new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate();
    const firstDayOfMonth = new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).getDay();

    const filtrosAtivos = filterSearch !== '' || filterMonth !== (d.getMonth() + 1).toString() || filterYear !== d.getFullYear().toString() || filterMeusPlantoes;

    const diasCobertos = useMemo(() => {
        const datas = new Set(filteredPlantoes.map(p => toIsoDay(p?.data)).filter(Boolean));
        return datas.size;
    }, [filteredPlantoes]);

    return (
        <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    onNewPlantao={user?.is_admin ? openNewPlantao : null}
                />

                {erroCarregamento && (
                    <ErrorState onRetry={fetchPlantoes} />
                )}

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 bg-[var(--accent-soft)] rounded-xl border border-border self-start">
                    <button
                        type="button"
                        onClick={() => setActiveTab('escala')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'escala' ? 'bg-surface text-foreground shadow-sm' : 'text-faint hover:text-foreground'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Escala
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('historico')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-surface text-foreground shadow-sm' : 'text-faint hover:text-foreground'}`}
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
                        <div className="bg-surface rounded-[20px] p-6 shadow-sm flex flex-col gap-5 border border-border animate-in fade-in slide-in-from-left-4 duration-500 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[var(--accent-dark)]">tune</span>
                                    <h2 className="text-lg font-extrabold text-foreground tracking-tight">Filtros</h2>
                                </div>
                                {filtrosAtivos && (
                                    <button
                                        onClick={limparFiltros}
                                        className="text-[11px] uppercase font-bold tracking-widest text-faint hover:text-[var(--accent-dark)] transition-colors flex items-center gap-1 bg-[var(--accent-soft)] px-2 py-1 rounded-md"
                                        aria-label="Limpar filtros"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close_small</span> Limpar
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[11px] font-bold text-faint uppercase tracking-widest group-focus-within:text-[var(--accent-dark)] transition-colors">Mês</span>
                                        <div className="relative">
                                            <select
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(e.target.value)}
                                                className="w-full bg-surface-raised border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-foreground focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-[var(--accent-soft)]/80"
                                                aria-label="Selecionar Mês"
                                            >
                                                <option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option>
                                                <option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option>
                                                <option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option>
                                                <option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-faint group-focus-within:text-[var(--accent-dark)] text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-1.5 cursor-pointer group">
                                        <span className="text-[11px] font-bold text-faint uppercase tracking-widest group-focus-within:text-[var(--accent-dark)] transition-colors">Ano</span>
                                        <div className="relative">
                                            <select
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                                className="w-full bg-surface-raised border border-transparent rounded-lg py-2.5 pl-3 pr-8 text-foreground focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all hover:bg-[var(--accent-soft)]/80"
                                                aria-label="Selecionar Ano"
                                            >
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-faint group-focus-within:text-[var(--accent-dark)] text-[18px] transition-colors">expand_more</span>
                                        </div>
                                    </label>
                                </div>
                                <label className="flex flex-col gap-1.5 group cursor-pointer">
                                    <span className="text-[11px] font-bold text-faint uppercase tracking-widest group-focus-within:text-[var(--accent-dark)] transition-colors block mb-0.5">Atendente</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-faint text-lg group-focus-within:text-[var(--accent-dark)] transition-colors">search</span>
                                        <input
                                            type="text"
                                            placeholder="Buscar nome..."
                                            value={filterSearch}
                                            onChange={e => setFilterSearch(e.target.value)}
                                            className="w-full bg-surface-raised border border-transparent rounded-lg py-2.5 pl-10 pr-10 text-foreground focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] focus:outline-none font-bold text-sm placeholder-faint/50 transition-all hover:bg-[var(--accent-soft)]/80"
                                            aria-label="Buscar Atendente"
                                        />
                                        {filterSearch && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); setFilterSearch(''); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--accent-soft)] text-faint hover:text-foreground transition-colors"
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
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)] border-[var(--accent)]/30'
                                        : 'bg-surface-raised text-faint border-transparent hover:border-border'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    Meus Plantões
                                    {filterMeusPlantoes && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent)]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mini Calendar */}
                        <div className="bg-surface rounded-[20px] p-6 shadow-sm border border-border animate-in fade-in slide-in-from-left-4 duration-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-extrabold text-foreground capitalize tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[var(--accent-dark)] text-[20px]">calendar_month</span>
                                    {new Date(parseInt(filterYear), parseInt(filterMonth) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </h3>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-[11px] mb-3 font-extrabold text-faint uppercase tracking-widest opacity-80">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-sm bg-surface-raised/60 rounded-xl p-1">
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
                            <div className="mt-5 flex gap-4 text-[11px] font-extrabold text-faint uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full shadow-sm shadow-[var(--accent)]/20"></div> Hoje</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div> Plantão</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-surface rounded-[20px] p-6 shadow-sm border border-border animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="text-[11px] font-bold text-faint uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">insights</span>
                                    Status do Filtro
                                </div>
                                <div className="text-3xl font-extrabold text-foreground">
                                    {filteredPlantoes.length} <span className="text-sm font-bold text-faint uppercase tracking-widest ml-1">Plantões Filtrados</span>
                                </div>
                            </div>
                            <div className="size-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-dark)] shrink-0 transition-transform hover:scale-110 duration-300">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                        </div>

                        {/* Monthly change count — admin only */}
                        {user?.is_admin && (
                            <div className="bg-surface rounded-[20px] p-6 shadow-sm border border-border animate-in fade-in slide-in-from-left-4 duration-1000 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="text-[11px] font-bold text-faint uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                                        Alterações no Mês
                                    </div>
                                    <div className="text-3xl font-extrabold text-foreground">
                                        {loadingChangeCount ? (
                                            <span className="inline-block w-12 h-8 bg-border rounded-md animate-pulse" />
                                        ) : monthlyChangeCount === null ? (
                                            <span className="text-sm font-bold text-faint">—</span>
                                        ) : monthlyChangeCount === 0 ? (
                                            <span className="text-base font-bold text-faint">Sem alterações</span>
                                        ) : (
                                            <>
                                                {monthlyChangeCount}{' '}
                                                <span className="text-sm font-bold text-faint uppercase tracking-widest ml-1">
                                                    {monthlyChangeCount === 1 ? 'alteração' : 'alterações'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="size-10 rounded-full bg-[var(--warning-soft)] flex items-center justify-center text-[var(--warning-bento)] shrink-0 transition-transform hover:scale-110 duration-300">
                                    <span className="material-symbols-outlined">history</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Data Table */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="bg-surface rounded-3xl shadow-sm overflow-hidden flex flex-col border border-border animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-6 md:p-8 flex flex-wrap justify-between items-center bg-surface border-b border-border gap-4">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-foreground">Escala Detalhada de Suporte</h2>
                                    <p className="text-sm font-medium text-faint mt-1">Clique nas linhas {user?.is_admin ? "ou no calendário" : ""} para ver detalhes.</p>
                                </div>
                                {user?.is_admin && (
                                    <div className="bg-[var(--accent-soft)] text-[var(--accent-dark)] text-[11px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-[var(--accent)]/20">
                                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                        Gestão Ativa
                                    </div>
                                )}
                            </div>

                            {/* Desktop/Tablet table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="schedule-table w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-raised border-b border-border">
                                            <th scope="col" className="p-4 pl-8 text-[11px] font-extrabold text-faint uppercase tracking-widest">DATA</th>
                                            <th scope="col" className="p-4 text-[11px] font-extrabold text-faint uppercase tracking-widest">DIA</th>
                                            <th scope="col" className="p-4 text-[11px] font-extrabold text-faint uppercase tracking-widest">N1 - ATENDIMENTO/NOC</th>
                                            <th scope="col" className="p-4 text-[11px] font-extrabold text-faint uppercase tracking-widest">N2 - SUPORTE/SERVIÇOS</th>
                                            <th scope="col" className="p-4 pr-8 text-[11px] font-extrabold text-faint uppercase tracking-widest text-right sm:text-left">SUPERVISÃO</th>
                                            {user?.is_admin && <th scope="col" className="p-4 pr-6 w-12"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {loading ? (
                                            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                        ) : filteredPlantoes.length === 0 ? (
                                            <tr>
                                                <td colSpan={user?.is_admin ? 6 : 5} className="p-0">
                                                    <EmptyState temFiltro={filtrosAtivos} onClear={limparFiltros} />
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
                                                    n2={p.n2_id ? mapIdsToPessoas(p.n2_id) : null}
                                                    mgr={p.gerente_id ? mapIdsToPessoas(p.gerente_id) : null}
                                                    isAdmin={user?.is_admin}
                                                    onEdit={() => openManagement(toIsoDay(p.data))}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {loading ? (
                                    [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                                ) : filteredPlantoes.length === 0 ? (
                                    <EmptyState temFiltro={filtrosAtivos} onClear={limparFiltros} />
                                ) : (
                                    filteredPlantoes.map((p) => (
                                        <ScheduleMobileCard
                                            key={p.id ?? toIsoDay(p.data)}
                                            date={formatarData(p.data)}
                                            day={getDiaSemana(p.data)}
                                            isToday={isHoje(p.data)}
                                            isWeekend={isFimDeSemana(p.data)}
                                            n1={mapIdsToPessoas(p.n1_id)}
                                            n2={p.n2_id ? mapIdsToPessoas(p.n2_id) : [{ name: 'Não atribuído', initials: '??', img: null }]}
                                            mgr={p.gerente_id ? mapIdsToPessoas(p.gerente_id) : null}
                                            isAdmin={user?.is_admin}
                                            onEdit={() => openManagement(toIsoDay(p.data))}
                                        />
                                    ))
                                )}
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
                        dateEditable={dateEditable}
                        onDateChange={trocarDataNoModal}
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
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm border border-border flex flex-col">
                            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                                <span className="material-symbols-outlined text-[var(--danger-bento)]">delete_forever</span>
                                <h3 className="text-base font-extrabold text-foreground">Excluir plantão?</h3>
                            </div>
                            <div className="px-5 py-4 flex flex-col gap-3 text-sm text-foreground">
                                <p className="font-medium">
                                    Tem certeza que deseja excluir permanentemente o plantão do dia <strong className="whitespace-nowrap">{new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>?
                                </p>
                                <div className="bg-surface-raised rounded-lg p-3 text-xs flex flex-col gap-1 opacity-70">
                                    <div><span className="font-extrabold">N1:</span> {getNamesFromIds(existingPlantao.n1_id).join(', ') || '—'}</div>
                                    <div><span className="font-extrabold">N2:</span> {getNamesFromIds(existingPlantao.n2_id).join(', ') || '—'}</div>
                                    <div><span className="font-extrabold">Supervisão:</span> {getNamesFromIds(existingPlantao.gerente_id).join(', ') || '—'}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 px-5 py-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOpen(false)}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-surface-raised text-foreground font-bold rounded-xl hover:bg-[var(--accent-soft)] transition-colors text-sm disabled:opacity-60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={executarDelecao}
                                    disabled={deletando}
                                    className="flex-1 px-3 py-2 bg-[var(--danger-bento)] text-white font-extrabold rounded-xl hover:brightness-110 transition-colors shadow-md shadow-[var(--danger-bento)]/30 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
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

                <style>{`
                    @media (max-width: 767px) {
                        .schedule-table th:first-child,
                        .schedule-table td:first-child {
                            position: sticky;
                            left: 0;
                            z-index: 10;
                            background: var(--surface);
                        }
                        .schedule-table th:first-child::after,
                        .schedule-table td:first-child::after {
                            content: '';
                            position: absolute;
                            top: 0;
                            right: 0;
                            bottom: 0;
                            width: 4px;
                            background: linear-gradient(to right, rgba(0,0,0,0.06), transparent);
                            pointer-events: none;
                        }
                    }
                `}</style>
            </div>
        </main>
    );
}

import React, { useState, useEffect, useMemo, useId, useRef } from 'react';
import { useDismissable } from '../hooks/useDismissable';
import TechBentoCard from './services/TechBentoCard';
import StreamingBentoCard from './services/StreamingBentoCard';
import PlanoComparador from './services/PlanoComparador';
import ServiceDetailModal from './services/ServiceDetailModal';
import ServicesHero from './services/ServicesHero';
import ServicesFilterBar from './services/ServicesFilterBar';
import PlansGrid from './services/PlansGrid';
import RankingsSection from './services/RankingsSection';
import PlanEditModal from './services/modals/PlanEditModal';
import TechServiceModal from './services/modals/TechServiceModal';
import StreamingServiceModal from './services/modals/StreamingServiceModal';
import { FALLBACK_TECH_SERVICES, FALLBACK_STREAMING_PACKAGES } from './services/seedData';
import { CATEGORIA, classificarPlano, parseVelocidade } from '../utils/planTaxonomy';
import { COMPARADOR_PLANOS_ATIVO } from '../config/features';

const GRID = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

// Serviços técnicos e streaming não são planos — as abas deles trocam o grid inteiro.
const isAbaDeServico = (filter) => filter === 'Technical' || filter === 'Streaming';

function AvisoDadosLocais() {
    return (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-[var(--warning-soft)] px-4 py-3 text-[13px] font-semibold text-[var(--warning-bento)]">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Exibindo dados locais; falha ao carregar do servidor.
        </div>
    );
}

const DELETE_DIALOG_FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ServicesDirectory({ user, searchQuery }) {
    const isAdmin = user?.is_admin;
    const deleteDialogRef = useRef(null);
    const deleteDialogTituloId = useId();

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', type: '' });
    const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, type: 'plan' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [plans, setPlans] = useState([]);
    const [comparingIds, setComparingIds] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [vendasPorDiaRaw, setVendasPorDiaRaw] = useState({});
    const [filter, setFilter] = useState('All');
    // Sem chave inicial, nenhum botão de ordenação aparecia ativo e a lista
    // vinha na ordem crua do IXC. "Mais vendidos" é o padrão útil.
    const [sortConfig, setSortConfig] = useState({ key: 'vendas_mes', direction: 'descending' });
    const [busca, setBusca] = useState('');

    // Um único isLoading fazia os slides de ranking piscarem vazio quando a
    // API de vendedores demorava mais que a de planos.
    const [loading, setLoading] = useState({ plans: true, ranking: true, tech: true, streaming: true });
    const [errors, setErrors] = useState({ tech: false, streaming: false });

    const [editingPlan, setEditingPlan] = useState(null);
    const [editForm, setEditForm] = useState({ prazo_instalacao: '', taxa_instalacao: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [techServices, setTechServices] = useState(FALLBACK_TECH_SERVICES);
    const [editingTechService, setEditingTechService] = useState(null);
    const [editTechForm, setEditTechForm] = useState({ service: '', value: '', deadline: '', payment: '', icon: 'build' });

    const [streamingServices, setStreamingServices] = useState(FALLBACK_STREAMING_PACKAGES);
    const [editingStreamingService, setEditingStreamingService] = useState(null);
    const [editStreamingForm, setEditStreamingForm] = useState({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });

    const [topVendors, setTopVendors] = useState([]);
    const [topTicket, setTopTicket] = useState([]);

    useEffect(() => {
        fetchPlans();
        fetchServicosTecnicos();
        fetchPacotesStreaming();
        fetchTopVendors();
    }, []);

    // ─── Fetching ─────────────────────────────────────────────────────────────

    const fetchPlans = async () => {
        setLoading(l => ({ ...l, plans: true }));
        try {
            const response = await fetch('/api/planos-negociacoes');
            if (response.ok) {
                const data = await response.json();
                setPlans(data.planos || data);
                if (data.status_counts) setStatusCounts(data.status_counts);
                if (data.vendas_por_dia) setVendasPorDiaRaw(data.vendas_por_dia);
            } else {
                console.error('Failed to fetch plans');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(l => ({ ...l, plans: false }));
        }
    };

    const fetchServicosTecnicos = async () => {
        try {
            const response = await fetch('/api/servicos-tecnicos');
            if (!response.ok) throw new Error('resposta inválida');
            const data = await response.json();
            if (data.dados && data.dados.length > 0) {
                setTechServices(data.dados.map(s => ({
                    id: Number(s.id),
                    service: s.servico,
                    value: s.valor || '',
                    deadline: s.prazo || '',
                    payment: s.pagamento || '',
                    icon: s.icon || 'build',
                    isFree: s.is_free,
                    isSpecial: s.is_special,
                })));
            }
            setErrors(e => ({ ...e, tech: false }));
        } catch (error) {
            console.error('Error fetching servicos tecnicos:', error);
            setErrors(e => ({ ...e, tech: true }));
        } finally {
            setLoading(l => ({ ...l, tech: false }));
        }
    };

    const fetchPacotesStreaming = async () => {
        try {
            const response = await fetch('/api/pacotes-streaming');
            if (!response.ok) throw new Error('resposta inválida');
            const data = await response.json();
            if (data.dados && data.dados.length > 0) {
                setStreamingServices(data.dados.map(s => ({
                    id: Number(s.id),
                    service: s.servico,
                    value: s.valor || '',
                    deadline: s.periodicidade || 'Mensal',
                    icon: s.icon || 'play_circle',
                })));
            }
            setErrors(e => ({ ...e, streaming: false }));
        } catch (error) {
            console.error('Error fetching pacotes streaming:', error);
            setErrors(e => ({ ...e, streaming: true }));
        } finally {
            setLoading(l => ({ ...l, streaming: false }));
        }
    };

    const fetchTopVendors = async () => {
        try {
            const response = await fetch('/api/top-vendedores');
            if (response.ok) {
                const data = await response.json();
                if (data.dados) setTopVendors(data.dados);
                if (data.topTicket) setTopTicket(data.topTicket);
            }
        } catch (error) {
            console.error('Error fetching top vendors:', error);
        } finally {
            setLoading(l => ({ ...l, ranking: false }));
        }
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleToggleCompare = (id) => {
        setComparingIds(prev => {
            if (prev.includes(id)) return prev.filter(item => item !== id);
            if (prev.length >= 3) {
                showToast('Máximo de 3 planos para comparação', 'error');
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        setEditForm({ prazo_instalacao: plan.prazo_instalacao || '', taxa_instalacao: plan.taxa_instalacao || '' });
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/planos-negociacoes/${editingPlan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prazo_instalacao: editForm.prazo_instalacao,
                    taxa_instalacao: editForm.taxa_instalacao,
                }),
            });
            if (response.ok) {
                setEditingPlan(null);
                fetchPlans();
            } else {
                showToast('Erro ao salvar o plano. Tente novamente.', 'error');
            }
        } catch (error) {
            showToast('Não foi possível salvar o plano. Tente novamente.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditTechClick = (service) => {
        setEditingTechService(service);
        setEditTechForm({
            service: service.service,
            value: service.value,
            deadline: service.deadline,
            payment: service.payment,
            icon: service.icon,
        });
    };

    const handleDeleteTechClick = (id) => {
        const item = techServices.find(s => s.id === id);
        setDeleteModal({ isOpen: true, id, title: item?.service || 'este serviço', type: 'tech' });
    };

    const handleSaveTechEdit = async () => {
        const payload = {
            servico: editTechForm.service || 'Novo Serviço',
            valor: editTechForm.value || '',
            prazo: editTechForm.deadline || '',
            pagamento: editTechForm.payment || '',
            icon: editTechForm.icon || 'build',
            is_free: editTechForm.value === 'R$ 0,00',
            is_special: false,
        };

        try {
            const isNovo = !editingTechService || !editingTechService.id;
            const response = await fetch(
                isNovo ? '/api/servicos-tecnicos' : `/api/servicos-tecnicos/${editingTechService.id}`,
                { method: isNovo ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
            if (response.ok) fetchServicosTecnicos();
            else showToast('Erro ao salvar o serviço. Tente novamente.', 'error');
        } catch (error) {
            showToast('Não foi possível salvar o serviço. Tente novamente.', 'error');
        }
        setEditingTechService(null);
        setEditTechForm({ service: '', value: '', deadline: '', payment: '', icon: 'build' });
    };

    const handleEditStreamingClick = (service) => {
        setEditingStreamingService(service);
        setEditStreamingForm({
            service: service.service,
            value: service.value,
            deadline: service.deadline,
            icon: service.icon,
        });
    };

    const handleDeleteStreamingClick = (id) => {
        const item = streamingServices.find(s => s.id === id);
        setDeleteModal({ isOpen: true, id, title: item?.service || 'este pacote', type: 'streaming' });
    };

    const handleSaveStreamingEdit = async () => {
        const payload = {
            servico: editStreamingForm.service || 'Novo Pacote',
            valor: editStreamingForm.value || '',
            periodicidade: editStreamingForm.deadline || 'Mensal',
            icon: editStreamingForm.icon || 'play_circle',
        };

        try {
            const isNovo = !editingStreamingService || !editingStreamingService.id;
            const response = await fetch(
                isNovo ? '/api/pacotes-streaming' : `/api/pacotes-streaming/${editingStreamingService.id}`,
                { method: isNovo ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
            if (response.ok) fetchPacotesStreaming();
            else showToast('Erro ao salvar o pacote. Tente novamente.', 'error');
        } catch (error) {
            showToast('Não foi possível salvar o pacote. Tente novamente.', 'error');
        }
        setEditingStreamingService(null);
        setEditStreamingForm({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModal;
        const url = type === 'tech' ? `/api/servicos-tecnicos/${id}` : `/api/pacotes-streaming/${id}`;
        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (response.ok) {
                if (type === 'tech') setTechServices(prev => prev.filter(s => s.id !== id));
                else setStreamingServices(prev => prev.filter(s => s.id !== id));
                showToast('Excluído com sucesso!', 'success');
            } else {
                const data = await response.json().catch(() => ({}));
                showToast(data.erro || 'Erro ao excluir. Tente novamente.', 'error');
            }
        } catch (error) {
            showToast('Não foi possível excluir. Tente novamente.', 'error');
        } finally {
            setDeleteModal({ isOpen: false, id: null, title: '', type: '' });
        }
    };

    // O diálogo de exclusão só fechava clicando no backdrop — sem Escape, sem
    // role="dialog" e sem trap de Tab. Mesmo padrão do ModalShell.jsx/OrgChartEditor.jsx.
    useDismissable(deleteDialogRef, {
        open: deleteModal.isOpen,
        onClose: () => setDeleteModal(d => ({ ...d, isOpen: false })),
        lockScroll: true,
        closeOnOutside: true,
    });

    const trapDeleteDialogTab = (e) => {
        if (e.key !== 'Tab' || !deleteDialogRef.current) return;
        const items = Array.from(deleteDialogRef.current.querySelectorAll(DELETE_DIALOG_FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'descending' ? 'ascending' : 'descending',
        }));
    };

    // ─── Derivados ────────────────────────────────────────────────────────────

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return val || 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // A busca do hero vence a global do header; limpar volta para a global.
    const termoBusca = busca || searchQuery || '';

    const maxVendas = useMemo(() => Math.max(...plans.map(p => p.vendas_mes || 0), 1), [plans]);

    const matchesSearch = (plan, term) => {
        if (!term) return true;
        const t = term.toLowerCase().trim();
        const velocidade = parseVelocidade(plan.descricao);
        return [
            plan.descricao,
            plan.valor_mensal,
            formatCurrency(plan.valor_mensal),
            plan.prazo_instalacao,
            plan.taxa_instalacao,
            plan.id,
            velocidade,
        ].some(campo => String(campo ?? '').toLowerCase().includes(t));
    };

    const planCounts = useMemo(() => {
        const base = { All: plans.length, PF: 0, PJ: 0, Link: 0, Technical: techServices.length, Streaming: streamingServices.length };
        plans.forEach(p => {
            const cat = classificarPlano(p.descricao);
            if (cat === CATEGORIA.PF) base.PF += 1;
            else if (cat === CATEGORIA.PJ) base.PJ += 1;
            else base.Link += 1;
        });
        return base;
    }, [plans, techServices.length, streamingServices.length]);

    const filteredPlans = useMemo(() => {
        const porCategoria = plans.filter(p => {
            if (filter === 'All') return true;
            return classificarPlano(p.descricao) === filter;
        }).filter(p => matchesSearch(p, termoBusca));

        if (!sortConfig.key) return porCategoria;

        const dir = sortConfig.direction === 'ascending' ? 1 : -1;
        return [...porCategoria].sort((a, b) => {
            let aValue;
            let bValue;
            if (sortConfig.key === 'velocidade') {
                aValue = parseVelocidade(a.descricao) || 0;
                bValue = parseVelocidade(b.descricao) || 0;
            } else if (sortConfig.key === 'valor_mensal' || sortConfig.key === 'vendas_mes') {
                aValue = parseFloat(a[sortConfig.key]) || 0;
                bValue = parseFloat(b[sortConfig.key]) || 0;
            } else {
                aValue = String(a[sortConfig.key] ?? '').toLowerCase();
                bValue = String(b[sortConfig.key] ?? '').toLowerCase();
            }
            if (aValue < bValue) return -dir;
            if (aValue > bValue) return dir;
            return 0;
        });
    }, [plans, filter, termoBusca, sortConfig]);

    // Comparação segue a lista completa, não a filtrada: um plano marcado não
    // some do comparador só porque a busca mudou.
    const comparingPlans = plans.filter(p => comparingIds.includes(p.id));

    const filtrarServicos = (lista, campos) => {
        if (!termoBusca) return lista;
        const t = termoBusca.toLowerCase().trim();
        return lista.filter(s => campos.some(c => String(s[c] ?? '').toLowerCase().includes(t)));
    };

    const techFiltrados = filtrarServicos(techServices, ['service', 'value', 'deadline', 'payment']);
    const streamingFiltrados = filtrarServicos(streamingServices, ['service', 'value', 'deadline']);

    const topPlans = useMemo(
        () => [...plans].sort((a, b) => (b.vendas_mes || 0) - (a.vendas_mes || 0)).slice(0, 3),
        [plans]
    );

    // Série do gráfico do hero. Não existe histórico temporal no backend — todas as
    // consultas de contrato são do mês corrente — então o eixo é a faixa de velocidade,
    // não o tempo. PF e PJ da mesma velocidade somam: a pergunta é "qual faixa vende mais".
    const vendasPorVelocidade = useMemo(() => {
        const porFaixa = new Map();
        plans.forEach(p => {
            const mbps = parseVelocidade(p.descricao);
            if (!mbps) return; // Link dedicado e afins não têm velocidade no nome
            porFaixa.set(mbps, (porFaixa.get(mbps) || 0) + (p.vendas_mes || 0));
        });
        return [...porFaixa.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([mbps, vendas]) => ({ mbps, vendas }));
    }, [plans]);

    // vendasTotais ≠ totalContratos: ambos contam só id_motivo_inclusao === '1', mas
    // vendas_mes só existe para planos com ativo='S'. Contrato de plano desativado entra
    // no status e some daqui. Por isso o ticket médio divide por vendasTotais.
    const vendasTotais = useMemo(
        () => plans.reduce((acc, p) => acc + (p.vendas_mes || 0), 0),
        [plans]
    );

    const receitaNova = useMemo(
        () => plans.reduce((acc, p) => acc + (p.vendas_mes || 0) * (parseFloat(p.valor_mensal) || 0), 0),
        [plans]
    );

    const ticketMedio = vendasTotais ? receitaNova / vendasTotais : 0;

    // Série densa do 1º ao dia corrente. Dia sem venda é 0, não é buraco —
    // um gap faria a linha pular e sugerir continuidade que não houve.
    const vendasPorDia = useMemo(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        return Array.from({ length: hoje.getDate() }, (_, i) => {
            const dia = i + 1;
            const chave = `${ano}-${mes}-${String(dia).padStart(2, '0')}`;
            return { dia, vendas: vendasPorDiaRaw[chave] || 0 };
        });
    }, [vendasPorDiaRaw]);

    const getStatusCount = (prefix) => Object.entries(statusCounts || {}).reduce(
        (acc, [key, count]) => (key.startsWith(prefix + '_') ? acc + count : acc), 0
    );

    const counts = {
        ativo: getStatusCount('A'),
        inativo: getStatusCount('I'),
        pre: getStatusCount('P'),
        negativado: getStatusCount('N'),
        desistiu: getStatusCount('D'),
    };
    const totalContratos = Object.values(counts).reduce((a, b) => a + b, 0);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
                <ServicesHero
                    counts={counts}
                    total={totalContratos}
                    isLoading={loading.plans}
                    busca={busca}
                    onBuscaChange={setBusca}
                    vendasPorVelocidade={vendasPorVelocidade}
                    vendasPorDia={vendasPorDia}
                    vendasTotais={vendasTotais}
                    receitaNova={receitaNova}
                    ticketMedio={ticketMedio}
                    planoCampeao={topPlans[0] || null}
                    formatCurrency={formatCurrency}
                />

                <ServicesFilterBar
                    filter={filter}
                    onFilterChange={setFilter}
                    counts={planCounts}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    showSort={!isAbaDeServico(filter)}
                />

                {!isAbaDeServico(filter) && (
                    <div className="relative min-h-[300px]">
                        <PlansGrid
                            plans={filteredPlans}
                            isLoading={loading.plans}
                            hasSearch={Boolean(termoBusca)}
                            isAdmin={isAdmin}
                            onEditClick={handleEditClick}
                            formatCurrency={formatCurrency}
                            maxVendas={maxVendas}
                            onToggleCompare={COMPARADOR_PLANOS_ATIVO ? handleToggleCompare : undefined}
                            onSelect={(item, type) => setDetailModal({ isOpen: true, data: item, type })}
                            comparingIds={comparingIds}
                        />
                    </div>
                )}

                {filter === 'Technical' && (
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-display text-xl font-bold text-foreground">Serviços Técnicos</h2>
                                <p className="mt-0.5 text-xs text-faint sm:text-sm">Valores, prazos e formas de pagamento</p>
                            </div>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingTechService({ id: null });
                                        setEditTechForm({ service: '', value: '', deadline: '', payment: '', icon: 'build' });
                                    }}
                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9A3412] to-[#EC7D23] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Novo Serviço
                                </button>
                            )}
                        </div>
                        {errors.tech && <AvisoDadosLocais />}
                        <div className={GRID}>
                            {techFiltrados.map(service => (
                                <TechBentoCard
                                    key={service.id}
                                    service={service}
                                    isAdmin={isAdmin}
                                    onEditClick={handleEditTechClick}
                                    onDeleteClick={handleDeleteTechClick}
                                    onSelect={(item, type) => setDetailModal({ isOpen: true, data: item, type })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {filter === 'Streaming' && (
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-display text-xl font-bold text-foreground">Pacotes de Streaming</h2>
                                <p className="mt-0.5 text-xs text-faint sm:text-sm">Combos de entretenimento e valores mensais</p>
                            </div>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingStreamingService({ id: null });
                                        setEditStreamingForm({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });
                                    }}
                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#9A3412] to-[#EC7D23] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(236,125,35,0.25)] transition-all hover:opacity-90"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Novo Pacote
                                </button>
                            )}
                        </div>
                        {errors.streaming && <AvisoDadosLocais />}
                        <div className={GRID}>
                            {streamingFiltrados.map(service => (
                                <StreamingBentoCard
                                    key={service.id}
                                    service={service}
                                    isAdmin={isAdmin}
                                    onEditClick={handleEditStreamingClick}
                                    onDeleteClick={handleDeleteStreamingClick}
                                    onSelect={(item, type) => setDetailModal({ isOpen: true, data: item, type })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!isAbaDeServico(filter) && (
                    <RankingsSection
                        topPlans={topPlans}
                        topVendors={topVendors}
                        topTicket={topTicket}
                        loadingPlans={loading.plans}
                        loadingRanking={loading.ranking}
                        formatCurrency={formatCurrency}
                    />
                )}
            </div>

            {editingPlan && (
                <PlanEditModal
                    plan={editingPlan}
                    form={editForm}
                    onChange={setEditForm}
                    onClose={() => setEditingPlan(null)}
                    onSave={handleSaveEdit}
                    isSaving={isSaving}
                />
            )}

            {editingTechService && (
                <TechServiceModal
                    service={editingTechService}
                    form={editTechForm}
                    onChange={setEditTechForm}
                    onClose={() => setEditingTechService(null)}
                    onSave={handleSaveTechEdit}
                />
            )}

            {editingStreamingService && (
                <StreamingServiceModal
                    service={editingStreamingService}
                    form={editStreamingForm}
                    onChange={setEditStreamingForm}
                    onClose={() => setEditingStreamingService(null)}
                    onSave={handleSaveStreamingEdit}
                />
            )}

            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} />
                    <div
                        ref={deleteDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={deleteDialogTituloId}
                        onKeyDown={trapDeleteDialogTab}
                        className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-border bg-surface p-6 text-left align-middle shadow-2xl transition-all"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger-bento)]">
                                <span className="material-symbols-outlined text-3xl">delete_forever</span>
                            </div>
                            <h3 id={deleteDialogTituloId} className="text-xl font-bold text-foreground">Confirmar Exclusão</h3>
                            <p className="mt-2 text-sm text-faint">
                                Tem certeza que deseja excluir <span className="font-bold text-foreground">"{deleteModal.title}"</span>? Esta ação não poderá ser desfeita.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-faint transition-all hover:bg-surface-raised"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {COMPARADOR_PLANOS_ATIVO && (
                <PlanoComparador
                    plans={comparingPlans}
                    isOpen={comparingIds.length >= 2 && !isAbaDeServico(filter)}
                    onClear={() => setComparingIds([])}
                    formatCurrency={formatCurrency}
                    streamingServices={streamingServices}
                />
            )}

            {toast.show && (
                <div className="fixed right-4 top-4 z-[9999] duration-300 animate-in fade-in slide-in-from-top-4 sm:right-8 sm:top-8">
                    <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-md ${
                        toast.type === 'success'
                            ? 'border-emerald-400 bg-emerald-500/90 text-white'
                            : 'border-red-400 bg-red-500/90 text-white'
                    }`}>
                        <span className="material-symbols-outlined text-2xl font-bold">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="font-bold tracking-wide">{toast.message}</p>
                    </div>
                </div>
            )}

            <ServiceDetailModal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, data: null, type: 'plan' })}
                data={detailModal.data}
                type={detailModal.type}
                formatCurrency={formatCurrency}
                onToggleCompare={COMPARADOR_PLANOS_ATIVO ? handleToggleCompare : undefined}
                isComparing={detailModal.data ? comparingIds.includes(detailModal.data.id) : false}
                isAdmin={isAdmin}
                maxVendas={maxVendas}
                onEditClick={(item) => {
                    if (detailModal.type === 'plan') handleEditClick(item);
                    else if (detailModal.type === 'tech') handleEditTechClick(item);
                    else if (detailModal.type === 'streaming') handleEditStreamingClick(item);
                }}
            />
        </main>
    );
}

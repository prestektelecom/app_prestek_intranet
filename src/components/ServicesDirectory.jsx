import React, { useState, useEffect, useRef } from 'react';
import PlanoBentoCard from './services/PlanoBentoCard';
import TechBentoCard from './services/TechBentoCard';
import StreamingBentoCard from './services/StreamingBentoCard';
import PlanoComparador from './services/PlanoComparador';
import { AVATAR_PNGS, resolveAvatarUrl } from '../utils/avatarPngs';
import { useBentoTheme } from '../hooks/useBentoTheme';


function tone(hex, a) {
    const h = hex.replace('#', '');
    const x = h.length === 3 ? h.replace(/./g, c => c + c) : h;
    return `rgba(${parseInt(x.slice(0, 2), 16)},${parseInt(x.slice(2, 4), 16)},${parseInt(x.slice(4, 6), 16)},${a})`;
}

export default function ServicesDirectory({ setCurrentView, user, searchQuery }) {
    const C = useBentoTheme();
    const isAdmin = user?.is_admin;
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', type: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [plans, setPlans] = useState([]);
    const [comparingIds, setComparingIds] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    
    // Modal State
    const [editingPlan, setEditingPlan] = useState(null);
    const [editForm, setEditForm] = useState({ prazo_instalacao: '', taxa_instalacao: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Technical Services State
    const [techServices, setTechServices] = useState([
        { id: 1, service: "Instalação de roteador", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "router", isFree: false },
        { id: 2, service: "Mudar roteador de local", value: "R$ 30,00 + custo material", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "swap_horiz", isFree: false },
        { id: 3, service: "Configurar roteador", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "settings", isFree: false },
        { id: 4, service: "Manutenção interna", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "build", isFree: false },
        { id: 5, service: "Mudar de titularidade", value: "R$ 0,00", deadline: "Até 24 horas", payment: "", icon: "people", isFree: true },
        { id: 6, service: "Mudar tecnologia", value: "â„¹ï¸ Consulte o NOC", deadline: "", payment: "", icon: "info", isSpecial: true },
        { id: 7, service: "Mudar senha no local", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "password", isFree: false },
        { id: 8, service: "Extensão de rede", value: "Custo de material", deadline: "Até 5 dias", payment: "À vista ou 1x Boleto", icon: "lan", isFree: false },
        { id: 9, service: "IP fixo", value: "R$ 99,90 À vista (ANUAL)", deadline: "24h", payment: "À vista (ANUAL) ou 12x R$9,90 junto mensalidade", icon: "dns", isFree: false },
        { id: 10, service: "Roteador 360Âº WI-FI", value: "R$ 50,00", deadline: "Até 5 dias", payment: "Adicional mensal fatura: R$ 20,00", icon: "wifi_tethering", isFree: false },
        { id: 11, service: "Alteração de senha WI-FI", value: "", deadline: "Até 5 dias", payment: "", icon: "wifi_lock", isFree: true },
        { id: 12, service: "Trocar Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "swap_vertical_circle", isFree: false },
        { id: 13, service: "Solicitação de Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "add_task", isFree: false }
    ]);
    const [editingTechService, setEditingTechService] = useState(null);
    const [editTechForm, setEditTechForm] = useState({ service: '', value: '', deadline: '', payment: '', icon: 'build' });

    // Streaming Services State
    const [streamingServices, setStreamingServices] = useState([
        { id: 1, service: "LEVEDUCA", value: "R$ 6,00", deadline: "Mensal", icon: "school" },
        { id: 2, service: "ITTV SMART MINI 32c", value: "R$ 10,00", deadline: "Mensal", icon: "smart_display" },
        { id: 3, service: "ITTV SMART TOTAL 108c", value: "R$ 20,00", deadline: "Mensal", icon: "smart_display" },
        { id: 4, service: "LEVEDUCA+WATCH+PARAMOUNT", value: "R$ 19,90", deadline: "Mensal", icon: "movie" },
        { id: 5, service: "LEVEDUCA+WATCH+PARAMOUNT+ITTV 108c", value: "R$ 29,90", deadline: "Mensal", icon: "movie" },
        { id: 6, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX", value: "R$ 39,90", deadline: "Mensal", icon: "movie" },
        { id: 7, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX+ITTV 108c", value: "R$ 66,00", deadline: "Mensal", icon: "movie" },
        { id: 8, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX+PREMIERE+ITTV 102c", value: "R$ 126,00", deadline: "Mensal", icon: "sports_soccer" }
    ]);
    const [editingStreamingService, setEditingStreamingService] = useState(null);
    const [editStreamingForm, setEditStreamingForm] = useState({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });

    const [topVendors, setTopVendors] = useState([]);
    const [topTicket, setTopTicket] = useState([]);

    const [activeSlide, setActiveSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Confetti and Gamification State
    const [confettiLoaded, setConfettiLoaded] = useState(false);
    const confettiLoadingRef = useRef(false);

    useEffect(() => {
        fetchPlans();
        fetchServicosTecnicos();
        fetchPacotesStreaming();
        fetchTopVendors();
    }, []);

    useEffect(() => {
        let interval;
        if (!isHovered) {
             interval = setInterval(() => {
                 setActiveSlide((prev) => (prev === 2 ? 0 : prev + 1));
             }, 3000);
        }
        return () => clearInterval(interval);
    }, [isHovered]);

    useEffect(() => {
        if (activeSlide === 1 || activeSlide === 2) {
            triggerConfetti();
        }
    }, [activeSlide]);

    const getDeterministicAvatar = (vendor) => {
        if (!vendor) return null;
        const name = vendor.nome || '';
        const id = vendor.id || 0;
        const firstName = name.trim().split(' ')[0].toLowerCase();
        const isFeminino = firstName.endsWith('a') || firstName.endsWith('e') || firstName.endsWith('i');
        
        if (isFeminino) {
            const idx = 32 + (id % 16);
            return AVATAR_PNGS[idx];
        } else {
            const idx = id % 32;
            return AVATAR_PNGS[idx];
        }
    };

    const triggerConfetti = () => {
        if (window.confetti) {
            runConfettiEffects();
        } else {
            if (confettiLoadingRef.current) return;
            confettiLoadingRef.current = true;
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
            script.async = true;
            script.onload = () => {
                setConfettiLoaded(true);
                confettiLoadingRef.current = false;
                runConfettiEffects();
            };
            script.onerror = () => {
                console.error("Erro ao carregar script de confetes via CDN");
                confettiLoadingRef.current = false;
            };
            document.body.appendChild(script);
        }
    };

    const runConfettiEffects = () => {
        if (!window.confetti) return;
        try {
            const duration = 2.5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 40 * (timeLeft / duration);
                window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        } catch (error) {
            console.error("Erro ao disparar confetes:", error);
        }
    };

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/planos-negociacoes');
            if (response.ok) {
                const data = await response.json();
                setPlans(data.planos || data);
                if (data.status_counts) setStatusCounts(data.status_counts);
            } else {
                console.error("Failed to fetch plans");
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServicosTecnicos = async () => {
        try {
            const response = await fetch('/api/servicos-tecnicos');
            if (response.ok) {
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
                        isSpecial: s.is_special
                    })));
                }
            }
        } catch (error) {
            console.error("Error fetching servicos tecnicos:", error);
        }
    };

    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleToggleCompare = (id) => {
        setComparingIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                if (prev.length >= 3) {
                    showToast('Máximo de 3 planos para comparação', 'error');
                    return prev;
                }
                return [...prev, id];
            }
        });
    };

    const handleClearCompare = () => {
        setComparingIds([]);
    };

    const fetchPacotesStreaming = async () => {
        try {
            const response = await fetch('/api/pacotes-streaming');
            if (response.ok) {
                const data = await response.json();
                if (data.dados && data.dados.length > 0) {
                    setStreamingServices(data.dados.map(s => ({
                        id: Number(s.id),
                        service: s.servico,
                        value: s.valor || '',
                        deadline: s.periodicidade || 'Mensal',
                        icon: s.icon || 'play_circle'
                    })));
                }
            }
        } catch (error) {
            console.error("Error fetching pacotes streaming:", error);
        }
    };

    const fetchTopVendors = async () => {
        try {
            const response = await fetch('/api/top-vendedores');
            if (response.ok) {
                const data = await response.json();
                if (data.dados) {
                    setTopVendors(data.dados);
                }
                if (data.topTicket) {
                    setTopTicket(data.topTicket);
                }
            }
        } catch (error) {
            console.error("Error fetching top vendors:", error);
        }
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
                    taxa_instalacao: editForm.taxa_instalacao
                })
            });
            if (response.ok) {
                setEditingPlan(null);
                fetchPlans();
            } else {
                console.error("Failed to save plan");
            }
        } catch (error) {
            console.error("Error saving plan:", error);
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
            icon: service.icon 
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
            is_special: false
        };

        try {
            if (!editingTechService || !editingTechService.id) {
                const response = await fetch('/api/servicos-tecnicos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    fetchServicosTecnicos();
                }
            } else {
                const response = await fetch(`/api/servicos-tecnicos/${editingTechService.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    fetchServicosTecnicos();
                }
            }
        } catch (error) {
            console.error("Error saving servico tecnico:", error);
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
            icon: service.icon 
        });
    };

        const handleDeleteStreamingClick = (id) => {
        const item = streamingServices.find(s => s.id === id);
        setDeleteModal({ isOpen: true, id, title: item?.service || 'este pacote', type: 'streaming' });
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
                showToast(data.erro || 'Erro ao excluir', 'error');
            }
        } catch (error) {
            showToast('Erro de conexão', 'error');
        } finally {
            setDeleteModal({ isOpen: false, id: null, title: '', type: '' });
        }
    };

    const handleSaveStreamingEdit = async () => {
        const payload = {
            servico: editStreamingForm.service || 'Novo Pacote',
            valor: editStreamingForm.value || '',
            periodicidade: editStreamingForm.deadline || 'Mensal',
            icon: editStreamingForm.icon || 'play_circle'
        };

        try {
            if (!editingStreamingService || !editingStreamingService.id) {
                const response = await fetch('/api/pacotes-streaming', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    fetchPacotesStreaming();
                }
            } else {
                const response = await fetch(`/api/pacotes-streaming/${editingStreamingService.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    fetchPacotesStreaming();
                }
            }
        } catch (error) {
            console.error("Error saving pacote streaming:", error);
        }
        setEditingStreamingService(null);
        setEditStreamingForm({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return val || 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const matchesSearch = (plan, term) => {
        if (!term) return true;
        const normalizedTerm = term.toLowerCase().trim();
        
        const desc = (plan.descricao || '').toLowerCase();
        const valorRaw = (plan.valor_mensal || '').toString();
        const valorFormatado = formatCurrency(plan.valor_mensal).toLowerCase();
        const id = (plan.id || '').toString();
        
        return desc.includes(normalizedTerm) || 
               valorRaw.includes(normalizedTerm) || 
               valorFormatado.includes(normalizedTerm) ||
               id.includes(normalizedTerm);
    };

    // Filter and Sort plans logic
    const maxVendas = Math.max(...plans.map(p => p.vendas_mes || 0), 1);
    
    const filteredPlans = plans.filter(p => {
        if (filter === 'All' || filter === 'Technical') return true;
        const desc = (p.descricao || '').toUpperCase();
        if (filter === 'PF' && !desc.includes('P. JURIDICA') && !desc.includes('P JURIDICA') && !desc.includes('LINK')) return true;
        if (filter === 'PJ' && (desc.includes('P. JURIDICA') || desc.includes('P JURIDICA'))) return true;
        if (filter === 'Link' && desc.includes('LINK')) return true;
        return false;
    }).filter(p => matchesSearch(p, searchQuery));

    const comparingPlans = plans.filter(p => comparingIds.includes(p.id));

    if (sortConfig.key) {
        filteredPlans.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'valor_mensal' || sortConfig.key === 'taxa_instalacao' || sortConfig.key === 'vendas_mes') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else {
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    const fiberPlans = [...plans]
        .sort((a, b) => (b.vendas_mes || 0) - (a.vendas_mes || 0))
        .slice(0, 3);

    const getStatusCount = (prefix) => {
        if (!statusCounts) return 0;
        return Object.entries(statusCounts).reduce((acc, [key, count]) => {
            if (key.startsWith(prefix + '_')) return acc + count;
            return acc;
        }, 0);
    };

    const countAtivo = getStatusCount('A');
    const countInativo = getStatusCount('I');
    const countPre = getStatusCount('P');
    const countNegativado = getStatusCount('N');
    const countDesistiu = getStatusCount('D');

    const totalVendasMes = countAtivo + countInativo + countPre + countNegativado + countDesistiu;

    return (
        <main className="flex-1 overflow-y-auto bg-[#F5F9FF] dark:bg-[#0B1B2E] py-8 px-4 md:px-10">
            <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
                {/* Hero Banner */}
                <div style={{
                    background: `linear-gradient(120deg, ${C.accentDeep} 0%, ${C.accentDark} 50%, ${C.accent} 100%)`,
                    borderRadius: 24, padding: '32px 36px', color: 'white',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: `0 20px 50px -20px ${tone(C.accentDeep, 0.45)}`,
                }}>
                    <svg style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }} width="100%" height="100%">
                        <defs><pattern id="svc-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#svc-grid)" />
                    </svg>
                    <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -100, right: 120, width: 220, height: 220, borderRadius: '50%', background: tone(C.cyan, 0.30), filter: 'blur(30px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                Diretório de Serviços Internos
                            </h1>
                            <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>
                                Gerencie planos de internet, detalhes de serviços e prazos de instalação.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Ativo', value: countAtivo, icon: 'check_circle' },
                                { label: 'Inativo', value: countInativo, icon: 'power_off' },
                                { label: 'Pré-contratos', value: countPre, icon: 'schedule' },
                                { label: 'Negativados', value: countNegativado, icon: 'gpp_maybe' },
                                { label: 'Desistiu', value: countDesistiu, icon: 'cancel' },
                                { label: 'Total no Mês', value: totalVendasMes, icon: 'trending_up' },
                            ].map(kpi => (
                                <div key={kpi.label} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '8px 16px', borderRadius: 999,
                                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
                                    WebkitBackdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255,255,255,0.25)', color: 'white',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, lineHeight: 1 }}>{kpi.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: 16 }}>{kpi.value}</span>
                                    <span style={{ fontSize: 12.5, opacity: 0.8, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em' }}>{kpi.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
                        {['All', 'PF', 'PJ', 'Link', 'Technical', 'Streaming'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer shrink-0 ${
                                    filter === f 
                                    ? 'bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white shadow-[0_4px_12px_rgba(74,158,245,0.25)]'
                                    : 'bg-[#EAF4FF] dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)]/40 text-[#1F5BA8] dark:text-[#7FD4E8] hover:opacity-90'
                                }`}
                            >
                                {f === 'All' && 'Todos os Serviços'}
                                {f === 'PF' && <><span className="material-symbols-outlined text-lg">person</span>Internet PF</>}
                                {f === 'PJ' && <><span className="material-symbols-outlined text-lg">business</span>Internet PJ</>}
                                {f === 'Link' && <><span className="material-symbols-outlined text-lg">router</span>Link Dedicado</>}
                                {f === 'Technical' && <><span className="material-symbols-outlined text-lg">build</span>Serviços Técnicos</>}
                                {f === 'Streaming' && <><span className="material-symbols-outlined text-lg">play_circle</span>Streaming's</>}
                            </button>
                        ))}
                    </div>

                    {filter !== 'Technical' && filter !== 'Streaming' && (
                        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:block">Ordenar por:</span>
                            <button 
                                onClick={() => handleSort('vendas_mes')}
                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                    sortConfig.key === 'vendas_mes' 
                                    ? 'bg-[#EAF4FF] text-[#1F5BA8] border-[#4A9EF5]/30 shadow-sm dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8] dark:border-[#4A9EF5]/40' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#0B1B2E] dark:text-slate-400 dark:border-[var(--border)] dark:bg-[#0B1B2E]'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                Vendas
                                {sortConfig.key === 'vendas_mes' && (
                                    <span className="material-symbols-outlined text-[14px]">
                                        {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={() => handleSort('valor_mensal')}
                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                    sortConfig.key === 'valor_mensal' 
                                    ? 'bg-[#EAF4FF] text-[#1F5BA8] border-[#4A9EF5]/30 shadow-sm dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8] dark:border-[#4A9EF5]/40' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-[#0B1B2E] dark:text-slate-400 dark:border-[var(--border)] dark:bg-[#0B1B2E]'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">payments</span>
                                Preço
                                {sortConfig.key === 'valor_mensal' && (
                                    <span className="material-symbols-outlined text-[14px]">
                                        {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Services Table - Não mostrar quando filter é Technical ou Streaming */}
                {filter !== 'Technical' && filter !== 'Streaming' && (
                <div className="relative min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0B1B2E] rounded-2xl border border-[#E4ECF5] dark:border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(74,158,245,0.04)] gap-3">
                            <span className="material-symbols-outlined animate-spin text-4xl text-[#4A9EF5]">autorenew</span>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando planos do IXC...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0B1B2E] rounded-2xl border border-[#E4ECF5] dark:border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(74,158,245,0.04)] gap-2">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                                {searchQuery ? 'search_off' : 'wifi_off'}
                            </span>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                {searchQuery ? 'Nenhum plano encontrado para essa busca.' : 'Nenhum plano encontrado.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlans.map((plan) => (
                                <PlanoBentoCard 
                                    key={plan.id}
                                    plan={plan}
                                    isAdmin={isAdmin}
                                    onEditClick={handleEditClick}
                                    formatCurrency={formatCurrency}
                                    maxVendas={maxVendas}
                                    isComparing={comparingIds.includes(plan.id)}
                                    onToggleCompare={handleToggleCompare}
                                />
                            ))}
                        </div>
                    )}
                </div>
                )}


                {/* Technical Services Section - Mostrar apenas quando filter é Technical */}
                {filter === 'Technical' && (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-[#0B1B2E] dark:text-[var(--foreground)] flex items-center gap-2">
                            <span className="material-symbols-outlined text-2xl text-[#4A9EF5] dark:text-[#7FD4E8]">build</span>
                            Serviços Técnicos e Complementares
                        </h2>
                        <p className="text-base text-slate-500 dark:text-slate-400">Serviços técnicos especializados para infraestrutura de rede e suporte de TI.</p>
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => {
                                setEditingTechService({ id: null });
                                setEditTechForm({ service: '', value: '', deadline: '', payment: '', icon: 'build' });
                            }}
                            className="self-start flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white rounded-xl hover:opacity-90 shadow-[0_4px_12px_rgba(74,158,245,0.25)] transition-all cursor-pointer font-semibold text-sm"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Novo Serviço
                        </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {techServices.map((item) => (
                            <TechBentoCard 
                                key={item.id}
                                service={item}
                                isAdmin={isAdmin}
                                onEditClick={handleEditTechClick}
                                onDeleteClick={handleDeleteTechClick}
                            />
                        ))}
                    </div>
                </div>
                )}

                {/* Streaming Services Section */}
                {filter === 'Streaming' && (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-[#0B1B2E] dark:text-[var(--foreground)] flex items-center gap-2">
                            <span className="material-symbols-outlined text-2xl text-[#4A9EF5] dark:text-[#7FD4E8]">play_circle</span>
                            Pacotes de Streaming
                        </h2>
                        <p className="text-base text-slate-500 dark:text-slate-400">Assinaturas de streaming inclusas nos planos combos.</p>
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => {
                                setEditingStreamingService({ id: null });
                                setEditStreamingForm({ service: '', value: '', deadline: 'Mensal', icon: 'play_circle' });
                            }}
                            className="self-start flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white rounded-xl hover:opacity-90 shadow-[0_4px_12px_rgba(74,158,245,0.25)] transition-all cursor-pointer font-semibold text-sm"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Novo Pacote
                        </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {streamingServices.map((item) => (
                            <StreamingBentoCard 
                                key={item.id}
                                service={item}
                                isAdmin={isAdmin}
                                onEditClick={handleEditStreamingClick}
                                onDeleteClick={handleDeleteStreamingClick}
                            />
                        ))}
                    </div>
                </div>
                )}

                {filter !== 'Technical' && filter !== 'Streaming' && (
                <div 
                    className="mt-8 relative overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Carousel Navigation */}
                    <div className="absolute top-2 sm:top-1 right-2 z-10 flex gap-2">
                        <button onClick={() => setActiveSlide(0)} className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${activeSlide === 0 ? 'bg-[#4A9EF5]' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 hover:dark:bg-slate-500'}`}></button>
                        <button onClick={() => setActiveSlide(1)} className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${activeSlide === 1 ? 'bg-[#4A9EF5]' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 hover:dark:bg-slate-500'}`}></button>
                        <button onClick={() => setActiveSlide(2)} className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${activeSlide === 2 ? 'bg-[#4A9EF5]' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 hover:dark:bg-slate-500'}`}></button>
                    </div>

                    <div 
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                    
                    {/* TOP 3 PLANOS */}
                    <div className="w-full shrink-0 flex flex-col gap-5 px-1 py-2">
                        <div className="flex items-center justify-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 3 Planos</h3>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#1F5BA8] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 1º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#2D7BD4] dark:bg-[#2D7BD4]/20 dark:text-[#E4ECF5] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 2º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#4A9EF5]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 3º Lugar
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end justify-center gap-3 sm:gap-5">
                            {isLoading ? (
                                <div className="flex justify-center py-10 w-full">
                                    <span className="material-symbols-outlined animate-spin text-3xl text-[#4A9EF5]">autorenew</span>
                                </div>
                            ) : (
                                (() => {
                                    // Reorder: [2nd, 1st, 3rd]
                                    const podiumOrder = fiberPlans.length >= 3
                                        ? [fiberPlans[1], fiberPlans[0], fiberPlans[2]]
                                        : fiberPlans;
                                    const displayRanks = fiberPlans.length >= 3 ? [2, 1, 3] : fiberPlans.map((_, i) => i + 1);

                                    return podiumOrder.map((plan, i) => {
                                        if (!plan) return null;
                                        const rank = displayRanks[i];
                                        const vendas = plan.vendas_mes || 0;
                                        const maxVendasLocal = Math.max(maxVendas, 10);
                                        const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);

                                        const isGold = rank === 1;

                                        const rc = {
                                            1: { border: 'border border-[#4A9EF5]/50', label: '1º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] via-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-2xl shadow-[#4A9EF5]/30 animate-glow-gold', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/70', numBg: 'bg-white text-[#1F5BA8]', badgeColor: 'bg-white/20 text-white' },
                                            2: { border: 'border border-[#1F5BA8]/30', label: '2º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] to-[#2D7BD4]', glow: 'shadow-lg shadow-[#1F5BA8]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#1F5BA8]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                            3: { border: 'border border-[#2D7BD4]/30', label: '3º Lugar', bg: 'bg-gradient-to-br from-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-lg shadow-[#4A9EF5]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#2D7BD4]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                        }[rank];

                                        return (
                                            <div key={'plan-'+plan.id} className={`relative flex flex-col rounded-2xl ${rc.bg} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${rc.border} ${rc.glow} ${isGold ? 'w-[180px] sm:w-[220px] p-4 sm:p-5 self-stretch' : 'w-[140px] sm:w-[180px] p-3 sm:p-4 mt-6'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`flex items-center justify-center rounded-full font-black ${rc.numBg} ${isGold ? 'w-8 h-8 text-sm sm:w-9 sm:h-9 sm:text-base' : 'w-6 h-6 text-[10px] sm:w-7 sm:h-7 sm:text-xs'}`}>{rank}</div>
                                                    <span className={`inline-flex items-center gap-0.5 rounded-full font-bold uppercase tracking-wider ${rc.badgeColor} ${isGold ? 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px]' : 'px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[9px]'}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: isGold ? 12 : 10 }}>workspace_premium</span>
                                                        <span className="hidden sm:inline">{rc.label}</span>
                                                    </span>
                                                </div>
                                                {isGold && (
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F5BA8] shadow-lg shadow-[#4A9EF5]/30 animate-float-crown">
                                                            <span className="material-symbols-outlined text-xl">crown</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <h4 className={`font-black ${rc.titleColor} truncate leading-tight ${isGold ? 'text-sm sm:text-base mt-1' : 'text-xs sm:text-sm'}`} title={plan.descricao}>{plan.descricao}</h4>
                                                <p className={`${rc.subColor} ${isGold ? 'text-[10px] sm:text-[11px] mt-1' : 'text-[9px] sm:text-[10px] mt-0.5'}`}>Sincronizado via IXC</p>
                                                
                                                <div className={`flex items-baseline gap-1 ${isGold ? 'mt-3 sm:mt-4' : 'mt-2 sm:mt-3'}`}>
                                                    <span className={`font-black ${rc.titleColor} ${isGold ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'}`}>{formatCurrency(plan.valor_mensal)}</span>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-[#E4ECF5]/70">/mês</span>
                                                </div>

                                                <div className={`flex flex-col border-t border-dashed border-white/10 ${isGold ? 'mt-3 sm:mt-4 gap-2 sm:gap-2.5 pt-2 sm:pt-3' : 'mt-2 sm:mt-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3'}`}>
                                                    <div className="flex justify-between text-[10px] sm:text-xs items-center">
                                                        <span className="text-[#E4ECF5]/80">Vendas</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden ${isGold ? 'w-10 sm:w-14' : 'w-8 sm:w-10'}`}>
                                                                <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(vendasRatio, vendas > 0 ? 10 : 0)}%` }}></div>
                                                            </div>
                                                            <span className="font-bold text-white">{vendas}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>


                    {/* TOP 3 COLABORADORAS */}
                    <div className="w-full shrink-0 flex flex-col gap-5 px-1 py-2">
                        <div className="flex items-center justify-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 3 Colaboradoras</h3>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#1F5BA8] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 1º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#2D7BD4] dark:bg-[#2D7BD4]/20 dark:text-[#E4ECF5] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 2º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#4A9EF5]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 3º Lugar
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end justify-center gap-3 sm:gap-5">
                            {isLoading ? (
                                <div className="flex justify-center py-10 w-full">
                                    <span className="material-symbols-outlined animate-spin text-3xl text-[#4A9EF5]">autorenew</span>
                                </div>
                            ) : topVendors.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 w-full">
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl mb-2">emoji_events</span>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhuma venda registrada.</p>
                                </div>
                            ) : (
                                (() => {
                                    const maxVendasVendor = topVendors.length > 0 ? Math.max(...topVendors.map(v => v.vendas_mes)) : 0;
                                    // Reordenar: [2º, 1º, 3º]
                                    const podiumOrder = topVendors.length >= 3
                                        ? [topVendors[1], topVendors[0], topVendors[2]]
                                        : topVendors;
                                    const displayRanks = topVendors.length >= 3 ? [2, 1, 3] : topVendors.map((_, i) => i + 1);

                                    return podiumOrder.map((vendor, i) => {
                                        if (!vendor) return null;
                                        const rank = displayRanks[i];
                                        const vendas = vendor.vendas_mes || 0;
                                        const maxVendasLocal = Math.max(maxVendasVendor, 5); 
                                        const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);

                                        const isGold = rank === 1;

                                        const rc = {
                                            1: { border: 'border border-[#4A9EF5]/50', label: '1º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] via-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-2xl shadow-[#4A9EF5]/30 animate-glow-gold', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/70', numBg: 'bg-white text-[#1F5BA8]', badgeColor: 'bg-white/20 text-white' },
                                            2: { border: 'border border-[#1F5BA8]/30', label: '2º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] to-[#2D7BD4]', glow: 'shadow-lg shadow-[#1F5BA8]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#1F5BA8]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                            3: { border: 'border border-[#2D7BD4]/30', label: '3º Lugar', bg: 'bg-gradient-to-br from-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-lg shadow-[#4A9EF5]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#2D7BD4]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                        }[rank];

                                        return (
                                            <div key={'colab-'+vendor.id} className={`relative flex flex-col rounded-2xl ${rc.bg} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${rc.border} ${rc.glow} ${isGold ? 'w-[180px] sm:w-[220px] p-4 sm:p-5 self-stretch' : 'w-[140px] sm:w-[180px] p-3 sm:p-4 mt-6'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`flex items-center justify-center rounded-full font-black ${rc.numBg} ${isGold ? 'w-8 h-8 text-sm sm:w-9 sm:h-9 sm:text-base' : 'w-6 h-6 text-[10px] sm:w-7 sm:h-7 sm:text-xs'}`}>{rank}</div>
                                                    <span className={`inline-flex items-center gap-0.5 rounded-full font-bold uppercase tracking-wider ${rc.badgeColor} ${isGold ? 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px]' : 'px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[9px]'}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: isGold ? 12 : 10 }}>workspace_premium</span>
                                                        <span className="hidden sm:inline">{rc.label}</span>
                                                    </span>
                                                </div>

                                                {isGold && (
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F5BA8] shadow-lg shadow-[#4A9EF5]/30 animate-float-crown">
                                                            <span className="material-symbols-outlined text-xl">crown</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {(() => {
                                                        const avatarUrl = getDeterministicAvatar(vendor);
                                                        return avatarUrl ? (
                                                            <div className={`flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-white/10 border border-white/20 ${isGold ? 'w-10 h-10' : 'w-8 h-8'}`}>
                                                                <img src={avatarUrl} alt={vendor.nome} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white ${isGold ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-8 sm:h-8'}`}>
                                                                <span className="material-symbols-outlined" style={{ fontSize: isGold ? 20 : 16 }}>person</span>
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="overflow-hidden">
                                                        <h4 className={`font-black text-white truncate leading-tight ${isGold ? 'text-sm sm:text-base mt-0' : 'text-xs sm:text-sm mt-0'}`} title={vendor.nome}>{vendor.nome.split(' ')[0]}</h4>
                                                        <p className={`text-[#E4ECF5]/70 ${isGold ? 'text-[9px] sm:text-[11px] mt-0.5' : 'text-[8px] sm:text-[10px] mt-0.5'}`}>Vendedora</p>
                                                    </div>
                                                </div>

                                                <div className={`flex flex-col border-t border-dashed border-white/10 ${isGold ? 'mt-3 sm:mt-4 gap-2 sm:gap-2.5 pt-2 sm:pt-3' : 'mt-2 sm:mt-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3'}`}>
                                                    <div className="flex justify-between text-[10px] sm:text-xs items-center">
                                                        <span className="text-[#E4ECF5]/80">Vendas</span>
                                                        <span className={`font-black text-white ${isGold ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'}`}>{vendas}</span>
                                                    </div>
                                                    <div className="w-full">
                                                        <div className={`h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden w-full mt-1`}>
                                                            <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(vendasRatio, vendas > 0 ? 10 : 0)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>


                    {/* TOP 3 COLABORADORAS (TICKET MÉDIO) */}
                    <div className="w-full shrink-0 flex flex-col gap-5 px-1 py-2">
                        <div className="flex items-center justify-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Médio</h3>
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#1F5BA8] dark:bg-[#1F5BA8]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 1º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#2D7BD4] dark:bg-[#2D7BD4]/20 dark:text-[#E4ECF5] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 2º Lugar
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4FF] text-[#4A9EF5] dark:bg-[#4A9EF5]/20 dark:text-[#7FD4E8] px-2.5 py-0.5 text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[12px]">workspace_premium</span> 3º Lugar
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end justify-center gap-3 sm:gap-5">
                            {isLoading ? (
                                <div className="flex justify-center py-10 w-full">
                                    <span className="material-symbols-outlined animate-spin text-3xl text-[#4A9EF5]">autorenew</span>
                                </div>
                            ) : topTicket.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 w-full">
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-5xl mb-2">request_quote</span>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhum ticket médio registrado.</p>
                                </div>
                            ) : (
                                (() => {
                                    const maxTicket = topTicket.length > 0 ? Math.max(...topTicket.map(v => v.ticket_medio)) : 0;
                                    // Reordenar: [2º, 1º, 3º]
                                    const podiumOrder = topTicket.length >= 3
                                        ? [topTicket[1], topTicket[0], topTicket[2]]
                                        : topTicket;
                                    const displayRanks = topTicket.length >= 3 ? [2, 1, 3] : topTicket.map((_, i) => i + 1);

                                    return podiumOrder.map((vendor, i) => {
                                        if (!vendor) return null;
                                        const rank = displayRanks[i];
                                        const ticket = vendor.ticket_medio || 0;
                                        const maxTicketLocal = Math.max(maxTicket, 50); 
                                        const ticketRatio = Math.min((ticket / maxTicketLocal) * 100, 100);

                                        const isGold = rank === 1;

                                        const rc = {
                                            1: { border: 'border border-[#4A9EF5]/50', label: '1º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] via-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-2xl shadow-[#4A9EF5]/30 animate-glow-gold', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/70', numBg: 'bg-white text-[#1F5BA8]', badgeColor: 'bg-white/20 text-white' },
                                            2: { border: 'border border-[#1F5BA8]/30', label: '2º Lugar', bg: 'bg-gradient-to-br from-[#1F5BA8] to-[#2D7BD4]', glow: 'shadow-lg shadow-[#1F5BA8]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#1F5BA8]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                            3: { border: 'border border-[#2D7BD4]/30', label: '3º Lugar', bg: 'bg-gradient-to-br from-[#2D7BD4] to-[#4A9EF5]', glow: 'shadow-lg shadow-[#4A9EF5]/15', titleColor: 'text-white', subColor: 'text-[#E4ECF5]/60', numBg: 'bg-[#E4ECF5] text-[#2D7BD4]', badgeColor: 'bg-white/15 text-[#E4ECF5]' },
                                        }[rank];

                                        return (
                                            <div key={'tmedio-'+vendor.id} className={`relative flex flex-col rounded-2xl ${rc.bg} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${rc.border} ${rc.glow} ${isGold ? 'w-[180px] sm:w-[220px] p-4 sm:p-5 self-stretch' : 'w-[140px] sm:w-[180px] p-3 sm:p-4 mt-6'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`flex items-center justify-center rounded-full font-black ${rc.numBg} ${isGold ? 'w-8 h-8 text-sm sm:w-9 sm:h-9 sm:text-base' : 'w-6 h-6 text-[10px] sm:w-7 sm:h-7 sm:text-xs'}`}>{rank}</div>
                                                    <span className={`inline-flex items-center gap-0.5 rounded-full font-bold uppercase tracking-wider ${rc.badgeColor} ${isGold ? 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px]' : 'px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[9px]'}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: isGold ? 12 : 10 }}>workspace_premium</span>
                                                        <span className="hidden sm:inline">{rc.label}</span>
                                                    </span>
                                                </div>

                                                {isGold && (
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F5BA8] shadow-lg shadow-[#4A9EF5]/30 animate-float-crown">
                                                            <span className="material-symbols-outlined text-xl">crown</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {(() => {
                                                        const avatarUrl = getDeterministicAvatar(vendor);
                                                        return avatarUrl ? (
                                                            <div className={`flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-white/10 border border-white/20 ${isGold ? 'w-10 h-10' : 'w-8 h-8'}`}>
                                                                <img src={avatarUrl} alt={vendor.nome} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white ${isGold ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-8 sm:h-8'}`}>
                                                                <span className="material-symbols-outlined" style={{ fontSize: isGold ? 20 : 16 }}>person</span>
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="overflow-hidden">
                                                        <h4 className={`font-black text-white truncate leading-tight ${isGold ? 'text-sm sm:text-base mt-0' : 'text-xs sm:text-sm mt-0'}`} title={vendor.nome}>{vendor.nome.split(' ')[0]}</h4>
                                                        <p className={`text-[#E4ECF5]/70 ${isGold ? 'text-[9px] sm:text-[11px] mt-0.5' : 'text-[8px] sm:text-[10px] mt-0.5'}`}>Vendedora</p>
                                                    </div>
                                                </div>

                                                <div className={`flex flex-col border-t border-dashed border-white/10 ${isGold ? 'mt-3 sm:mt-4 gap-2 sm:gap-2.5 pt-2 sm:pt-3' : 'mt-2 sm:mt-3 gap-1.5 sm:gap-2 pt-2 sm:pt-3'}`}>
                                                    <div className="flex justify-between text-[10px] sm:text-xs items-center">
                                                        <span className="text-[#E4ECF5]/80">Valor Médio</span>
                                                        <span className={`font-black text-white ${isGold ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'}`}>{formatCurrency(ticket)}</span>
                                                    </div>
                                                    <div className="w-full">
                                                        <div className={`h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden w-full mt-1`}>
                                                            <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(ticketRatio, ticket > 0 ? 10 : 0)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>

                    </div>
                </div>
                )}

                {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1B2E] rounded-2xl border border-[#E4ECF5] dark:border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#E4ECF5] dark:border-[var(--border)]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">Editar Plano</h3>
                                <button 
                                    onClick={() => setEditingPlan(null)}
                                    className="text-slate-400 hover:text-[#4A9EF5] dark:text-[#8896A8] dark:hover:text-[#4A9EF5] transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Serviço</label>
                                <input 
                                    type="text" 
                                    value={editingPlan.descricao || ''} 
                                    disabled 
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-[#F5F9FF] dark:bg-[#0B1B2E]/50 text-slate-400 dark:text-slate-500"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">O nome é puxado automaticamente do IXC.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo de Instalação</label>
                                <input 
                                    type="text" 
                                    value={editForm.prazo_instalacao} 
                                    onChange={(e) => setEditForm({...editForm, prazo_instalacao: e.target.value})}
                                    placeholder="Ex: 3 Dias, Imediato, 5 Dias Úteis..."
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Este dado será salvo nativamente no banco de dados local.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Taxa de Instalação</label>
                                <input 
                                    type="text" 
                                    value={editForm.taxa_instalacao} 
                                    onChange={(e) => setEditForm({...editForm, taxa_instalacao: e.target.value})}
                                    placeholder="Ex: 50.00"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Insira o valor apenas com números e ponto (ex: 50.00).</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#E4ECF5] dark:border-[var(--border)] flex justify-end gap-3 bg-[#F5F9FF] dark:bg-[#0B1B2E]/30">
                            <button 
                                onClick={() => setEditingPlan(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#8896A8] bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:opacity-90 rounded-xl shadow-[0_4px_12px_rgba(74,158,245,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9EF5] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                            >
                                {isSaving ? (
                                    <><span className="material-symbols-outlined animate-spin text-sm">autorenew</span> Salvando...</>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Tech Service Modal */}
            {editingTechService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1B2E] rounded-2xl border border-[#E4ECF5] dark:border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#E4ECF5] dark:border-[var(--border)]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">
                                    {editingTechService?.id ? 'Editar Serviço Técnico' : 'Novo Serviço Técnico'}
                                </h3>
                                <button 
                                    onClick={() => setEditingTechService(null)}
                                    className="text-slate-400 hover:text-[#4A9EF5] dark:text-[#8896A8] dark:hover:text-[#4A9EF5] transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Serviço</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.service} 
                                    onChange={(e) => setEditTechForm({...editTechForm, service: e.target.value})}
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.value} 
                                    onChange={(e) => setEditTechForm({...editTechForm, value: e.target.value})}
                                    placeholder="Ex: R$ 50,00"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.deadline} 
                                    onChange={(e) => setEditTechForm({...editTechForm, deadline: e.target.value})}
                                    placeholder="Ex: Até 5 dias úteis"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pagamento</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.payment} 
                                    onChange={(e) => setEditTechForm({...editTechForm, payment: e.target.value})}
                                    placeholder="Ex: À vista ou 2x Boleto"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ícone</label>
                                <div className="flex items-center gap-3">
                                    <div className="rounded bg-[#EAF4FF] dark:bg-[#1F5BA8]/20 text-[#4A9EF5] dark:text-[#7FD4E8] p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">{editTechForm.icon || 'build'}</span>
                                    </div>
                                    <select 
                                        value={editTechForm.icon} 
                                        onChange={(e) => setEditTechForm({...editTechForm, icon: e.target.value})}
                                        className="flex-1 px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                    >
                                        <option value="router">Router</option>
                                        <option value="swap_horiz">Swap Horizontal</option>
                                        <option value="settings">Settings</option>
                                        <option value="build">Build</option>
                                        <option value="people">People</option>
                                        <option value="info">Info</option>
                                        <option value="password">Password</option>
                                        <option value="lan">LAN</option>
                                        <option value="dns">DNS</option>
                                        <option value="wifi_tethering">Wi-Fi Tethering</option>
                                        <option value="wifi_lock">Wi-Fi Lock</option>
                                        <option value="swap_vertical_circle">Swap Circle</option>
                                        <option value="add_task">Add Task</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#E4ECF5] dark:border-[var(--border)] flex justify-end gap-3 bg-[#F5F9FF] dark:bg-[#0B1B2E]/30">
                            <button 
                                onClick={() => setEditingTechService(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#8896A8] bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveTechEdit}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:opacity-90 rounded-xl shadow-[0_4px_12px_rgba(74,158,245,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9EF5] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Streaming Service Modal */}
            {editingStreamingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0B1B2E] rounded-2xl border border-[#E4ECF5] dark:border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#E4ECF5] dark:border-[var(--border)]">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">
                                    {editingStreamingService?.id ? 'Editar Pacote de Streaming' : 'Novo Pacote de Streaming'}
                                </h3>
                                <button 
                                    onClick={() => setEditingStreamingService(null)}
                                    className="text-slate-400 hover:text-[#4A9EF5] dark:text-[#8896A8] dark:hover:text-[#4A9EF5] transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pacote</label>
                                <input 
                                    type="text" 
                                    value={editStreamingForm.service} 
                                    onChange={(e) => setEditStreamingForm({...editStreamingForm, service: e.target.value})}
                                    placeholder="Ex: LEVEDUCA+WATCH+PARAMOUNT"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Mensal</label>
                                <input 
                                    type="text" 
                                    value={editStreamingForm.value} 
                                    onChange={(e) => setEditStreamingForm({...editStreamingForm, value: e.target.value})}
                                    placeholder="Ex: R$ 19,90"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Período</label>
                                <input 
                                    type="text" 
                                    value={editStreamingForm.deadline} 
                                    onChange={(e) => setEditStreamingForm({...editStreamingForm, deadline: e.target.value})}
                                    placeholder="Ex: Mensal"
                                    className="w-full px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ícone</label>
                                <div className="flex items-center gap-3">
                                    <div className="rounded bg-[#EAF4FF] dark:bg-[#1F5BA8]/20 text-[#4A9EF5] dark:text-[#7FD4E8] p-2 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">{editStreamingForm.icon || 'play_circle'}</span>
                                    </div>
                                    <select 
                                        value={editStreamingForm.icon} 
                                        onChange={(e) => setEditStreamingForm({...editStreamingForm, icon: e.target.value})}
                                        className="flex-1 px-4 py-2 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] text-slate-900 dark:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#4A9EF5] focus:border-transparent transition-all"
                                    >
                                        <option value="play_circle">Play Circle</option>
                                        <option value="smart_display">Smart Display</option>
                                        <option value="movie">Movie</option>
                                        <option value="school">School</option>
                                        <option value="sports_soccer">Sports</option>
                                        <option value="tv">TV</option>
                                        <option value="subscriptions">Subscriptions</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#E4ECF5] dark:border-[var(--border)] flex justify-end gap-3 bg-[#F5F9FF] dark:bg-[#0B1B2E]/30">
                            <button 
                                onClick={() => setEditingStreamingService(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#8896A8] bg-white dark:bg-[#0B1B2E] border border-[#E4ECF5] dark:border-[var(--border)] rounded-xl hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveStreamingEdit}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] hover:opacity-90 rounded-xl shadow-[0_4px_12px_rgba(74,158,245,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A9EF5] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


            {/* Modal de Confirmação de Exclusão Premium */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}></div>
                    <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-[#0B1B2E] p-6 text-left align-middle shadow-2xl transition-all border border-[#E4ECF5] dark:border-[var(--border)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">Confirmar Exclusão</h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Tem certeza que deseja excluir <span className="font-bold text-[#0B1B2E] dark:text-[var(--foreground)]">"{deleteModal.title}"</span>? Esta ação não poderá ser desfeita.
                            </p>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="flex-1 rounded-xl border border-[#E4ECF5] dark:border-[var(--border)] bg-white dark:bg-[#0B1B2E] px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-[#8896A8] hover:bg-[#F5F9FF] dark:bg-[#0B1B2E] transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all active:scale-95 cursor-pointer"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparador de Planos */}
            <PlanoComparador 
                plans={comparingPlans}
                isOpen={comparingIds.length >= 2 && filter !== 'Technical' && filter !== 'Streaming'}
                onClear={handleClearCompare}
                formatCurrency={formatCurrency}
                streamingServices={streamingServices}
            />

            {/* Toast de Sucesso/Erro Premium */}
            {toast.show && (
                <div className="fixed top-8 right-8 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-md border ${
                        toast.type === 'success' 
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

        </main>
    )
}

import React, { useState, useEffect, useRef } from 'react';

export default function ServicesDirectory({ setCurrentView, user }) {
    const isAdmin = user?.is_admin;
    const [plans, setPlans] = useState([]);
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
        { id: 6, service: "Mudar tecnologia", value: "ℹ️ Consulte o NOC", deadline: "", payment: "", icon: "info", isSpecial: true },
        { id: 7, service: "Mudar senha no local", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "password", isFree: false },
        { id: 8, service: "Extensão de rede", value: "Custo de material", deadline: "Até 5 dias", payment: "À vista ou 1x Boleto", icon: "lan", isFree: false },
        { id: 9, service: "IP fixo", value: "R$ 99,90 À vista (ANUAL)", deadline: "24h", payment: "À vista (ANUAL) ou 12x R$9,90 junto mensalidade", icon: "dns", isFree: false },
        { id: 10, service: "Roteador 360º WI-FI", value: "R$ 50,00", deadline: "Até 5 dias", payment: "Adicional mensal fatura: R$ 20,00", icon: "wifi_tethering", isFree: false },
        { id: 11, service: "Alteração de senha WI-FI", value: "", deadline: "Até 5 dias", payment: "", icon: "wifi_lock", isFree: true },
        { id: 12, service: "Trocar Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "swap_vertical_circle", isFree: false },
        { id: 13, service: "Solicitação de Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "add_task", isFree: false }
    ]);
    const [editingTechService, setEditingTechService] = useState(null);
    const [editTechForm, setEditTechForm] = useState({ service: '', value: '', deadline: '', payment: '', icon: 'build' });

    useEffect(() => {
        fetchPlans();
    }, []);

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
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            setTechServices(techServices.filter(s => s.id !== id));
        }
    };

    const handleSaveTechEdit = () => {
        if (!editingTechService || !editingTechService.id) {
            const newId = Math.max(...techServices.map(s => s.id), 0) + 1;
            const newService = {
                id: newId,
                service: editTechForm.service || 'Novo Serviço',
                value: editTechForm.value || '',
                deadline: editTechForm.deadline || '',
                payment: editTechForm.payment || '',
                icon: editTechForm.icon || 'build',
                isFree: editTechForm.value === 'R$ 0,00'
            };
            setTechServices([...techServices, newService]);
        } else {
            setTechServices(techServices.map(s => 
                s.id === editingTechService.id ? { ...s, ...editTechForm } : s
            ));
        }
        setEditingTechService(null);
        setEditTechForm({ service: '', value: '', deadline: '', payment: '', icon: 'build' });
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

    // Filter and Sort plans logic
    const maxVendas = Math.max(...plans.map(p => p.vendas_mes || 0), 1);
    
    const filteredPlans = plans.filter(p => {
        if (filter === 'All' || filter === 'Technical') return true;
        const desc = (p.descricao || '').toUpperCase();
        if (filter === 'PF' && !desc.includes('P. JURIDICA') && !desc.includes('LINK')) return true;
        if (filter === 'PJ' && desc.includes('P. JURIDICA')) return true;
        if (filter === 'Link' && desc.includes('LINK')) return true;
        return false;
    });

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

    const totalVendasMes = plans.reduce((acc, p) => acc + (p.vendas_mes || 0), 0);

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

    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark py-8 px-4 md:px-10">
            <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                        <button 
                            onClick={() => setCurrentView('dashboard')}
                            className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">home</span>
                            Início
                        </button>
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                        <button 
                            onClick={() => setCurrentView('dashboard')}
                            className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                        >
                            Dashboard
                        </button>
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                        <span className="text-[#1d150c] dark:text-white text-sm font-bold">Serviços Internos</span>
                    </div>

                    <div className="flex flex-wrap justify-between items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">Diretório de Serviços Internos</h1>
                            <p className="text-base text-slate-500 dark:text-slate-400">Gerencie planos de internet, detalhes de serviços e prazos de instalação.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Ativo */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ativo</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{countAtivo}</p>
                                </div>
                            </div>
                            
                            {/* Inativo */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">power_off</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inativo</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{countInativo}</p>
                                </div>
                            </div>

                            {/* Pré-contratos */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">schedule</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pré-contratos</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{countPre}</p>
                                </div>
                            </div>
                            
                            {/* Negativados */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">gpp_maybe</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Negativados</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{countNegativado}</p>
                                </div>
                            </div>
                            
                            {/* Desistiu */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">cancel</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Desistiu</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{countDesistiu}</p>
                                </div>
                            </div>
                            
                            {/* Total no Mês */}
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">trending_up</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total no Mês</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{totalVendasMes}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'PF', 'PJ', 'Link', 'Technical'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                                filter === f 
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-white dark:bg-[#1a130b] border border-slate-200 text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary'
                            }`}
                        >
                            {f === 'All' && 'Todos os Serviços'}
                            {f === 'PF' && <><span className="material-symbols-outlined text-lg">person</span>Internet PF</>}
                            {f === 'PJ' && <><span className="material-symbols-outlined text-lg">business</span>Internet PJ</>}
                            {f === 'Link' && <><span className="material-symbols-outlined text-lg">router</span>Link Dedicado</>}
                            {f === 'Technical' && <><span className="material-symbols-outlined text-lg">build</span>Serviços Técnicos</>}
                        </button>
                    ))}
                </div>

                {/* Services Table - Não mostrar quando filter é Technical */}
                {filter !== 'Technical' && (
                <div className="rounded-xl border border-slate-200 bg-white dark:bg-[#1a130b] shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800 relative min-h-[300px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col" onClick={() => handleSort('descricao')}>
                                        <div className="flex items-center gap-1">
                                            NOME DO SERVIÇO
                                            {sortConfig.key === 'descricao' && (
                                                <span className="material-symbols-outlined text-[1rem]">
                                                    {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col" onClick={() => handleSort('valor_mensal')}>
                                        <div className="flex items-center gap-1">
                                            VALOR (R$)
                                            {sortConfig.key === 'valor_mensal' && (
                                                <span className="material-symbols-outlined text-[1rem]">
                                                    {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col" onClick={() => handleSort('taxa_instalacao')}>
                                        <div className="flex items-center gap-1">
                                            TAXA DE INSTALAÇÃO
                                            {sortConfig.key === 'taxa_instalacao' && (
                                                <span className="material-symbols-outlined text-[1rem]">
                                                    {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col" onClick={() => handleSort('prazo_instalacao')}>
                                        <div className="flex items-center gap-1">
                                            PRAZO INSTALAÇÃO
                                            {sortConfig.key === 'prazo_instalacao' && (
                                                <span className="material-symbols-outlined text-[1rem]">
                                                    {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col" onClick={() => handleSort('vendas_mes')}>
                                        <div className="flex items-center gap-1">
                                            VENDAS NO MÊS
                                            {sortConfig.key === 'vendas_mes' && (
                                                <span className="material-symbols-outlined text-[1rem]">
                                                    {sortConfig.direction === 'ascending' ? 'arrow_upward' : 'arrow_downward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-3xl text-primary">autorenew</span>
                                                <p>Carregando planos do IXC...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <p>Nenhum plano encontrado.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map(plan => {
                                        const vendas = plan.vendas_mes || 0;
                                        const maxVendasLocal = Math.max(maxVendas, 10); // scale up if total sales are very low
                                        const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);
                                        const barColor = vendasRatio >= 60 ? 'bg-green-500' : vendasRatio >= 25 ? 'bg-primary' : 'bg-orange-400';
                                        
                                        return (
                                            <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded bg-primary/10 p-2 text-primary dark:bg-primary/20">
                                                            <span className="material-symbols-outlined">wifi</span>
                                                        </div>
                                                        {plan.descricao}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{formatCurrency(plan.valor_mensal)}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                    {plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : <span className="text-slate-400 font-normal italic">Não definida</span>}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                    {plan.prazo_instalacao ? plan.prazo_instalacao : <span className="text-slate-400 font-normal italic">Não definido</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-600">
                                                            <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${vendasRatio}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vendas}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isAdmin && (
                                                        <button 
                                                            onClick={() => handleEditClick(plan)}
                                                            className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary cursor-pointer transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined">edit_square</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* Technical Services Section - Mostrar apenas quando filter é Technical */}
                {filter === 'Technical' && (
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-2xl text-[#a17745] dark:text-orange-300">build</span>
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
                            className="self-start flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium text-sm"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Novo Serviço
                        </button>
                    )}

                    <div className="rounded-xl border border-slate-200 bg-white dark:bg-[#1a130b] shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800 relative">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col">
                                            SERVIÇOS
                                        </th>
                                        <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col">
                                            VALOR
                                        </th>
                                        <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col">
                                            PRAZO
                                        </th>
                                        <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" scope="col">
                                            PAGAMENTO
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-right" scope="col">
                                            AÇÕES
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
                                    {techServices.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded bg-[#a17745]/10 p-2 text-[#a17745] dark:bg-[#a17745]/20 dark:text-[#a17745]">
                                                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                    </div>
                                                    {item.service}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.isFree ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-sm font-bold text-green-700 dark:text-green-400">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        GRÁTIS
                                                    </span>
                                                ) : item.isSpecial ? (
                                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                        {item.value}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                {item.deadline || <span className="text-slate-400 font-normal italic">Não definido</span>}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                {item.payment || <span className="text-slate-400 font-normal italic">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isAdmin ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleEditTechClick(item)}
                                                            className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary cursor-pointer transition-colors"
                                                            title={`Editar ${item.service}`}
                                                        >
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteTechClick(item.id)}
                                                            className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500 cursor-pointer transition-colors"
                                                            title={`Excluir ${item.service}`}
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => console.log(`Solicitar: ${item.service}`)}
                                                        className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary cursor-pointer transition-colors"
                                                        title={`Solicitar ${item.service}`}
                                                    >
                                                        <span className="material-symbols-outlined">edit_document</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}

                {/* Top 3 Podium - Não mostrar quando filter é Technical */}
                {filter !== 'Technical' && (
                <div className="mt-8 flex flex-col gap-5">
                    <div className="flex items-center justify-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 3 Planos Mais Vendidos</h3>
                        <div className="hidden sm:flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span> Ouro
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span> Prata
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span> Bronze
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end justify-center gap-5">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <span className="material-symbols-outlined animate-spin text-3xl text-primary">autorenew</span>
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
                                    const barColor = vendasRatio >= 60 ? 'bg-green-500' : vendasRatio >= 25 ? 'bg-primary' : 'bg-orange-400';

                                    const isGold = rank === 1;
                                    const isSilver = rank === 2;
                                    const isBronze = rank === 3;

                                    const rc = {
                                        1: {
                                            border: 'border-2 border-amber-400 dark:border-amber-500',
                                            label: 'OURO',
                                            glow: 'shadow-xl shadow-amber-500/20',
                                            titleColor: 'text-amber-600 dark:text-amber-400',
                                            btn: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600',
                                            numBg: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
                                            badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
                                        },
                                        2: {
                                            border: 'border-2 border-slate-300 dark:border-slate-600',
                                            label: 'PRATA',
                                            glow: 'shadow-md shadow-slate-400/10',
                                            titleColor: 'text-slate-600 dark:text-slate-300',
                                            btn: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white hover:from-slate-500 hover:to-slate-600',
                                            numBg: 'bg-gradient-to-br from-slate-400 to-slate-500 text-white',
                                            badgeColor: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
                                        },
                                        3: {
                                            border: 'border-2 border-orange-300 dark:border-orange-600',
                                            label: 'BRONZE',
                                            glow: 'shadow-md shadow-orange-500/10',
                                            titleColor: 'text-orange-600 dark:text-orange-400',
                                            btn: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700',
                                            numBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
                                            badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
                                        },
                                    }[rank];

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative flex flex-col rounded-xl bg-white dark:bg-slate-800 transition-all hover:-translate-y-1 ${rc.border} ${rc.glow} ${
                                                isGold
                                                    ? 'w-[260px] md:w-[290px] p-5 self-stretch'
                                                    : 'w-[230px] md:w-[250px] p-4 mt-6'
                                            }`}
                                        >
                                            {/* Rank + Badge row */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`flex items-center justify-center rounded-full font-extrabold ${rc.numBg} ${isGold ? 'w-9 h-9 text-base' : 'w-7 h-7 text-xs'}`}>
                                                    {rank}
                                                </div>
                                                <span className={`inline-flex items-center gap-0.5 rounded-full font-extrabold uppercase tracking-wider ${rc.badgeColor} ${isGold ? 'px-2.5 py-1 text-[10px]' : 'px-2 py-0.5 text-[9px]'}`}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: isGold ? 12 : 10 }}>workspace_premium</span>
                                                    {rc.label}
                                                </span>
                                            </div>

                                            {/* Crown icon for gold */}
                                            {isGold && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30">
                                                    <span className="material-symbols-outlined text-white text-xl">crown</span>
                                                </div>
                                            )}

                                            {/* Plan Name */}
                                            <h4 className={`font-bold ${rc.titleColor} truncate leading-tight ${isGold ? 'text-base mt-1' : 'text-sm'}`}>{plan.descricao}</h4>
                                            <p className={`text-slate-400 dark:text-slate-500 ${isGold ? 'text-[11px] mt-1' : 'text-[10px] mt-0.5'}`}>Sincronizado via IXC</p>

                                            {/* Price */}
                                            <div className={`flex items-baseline gap-1 ${isGold ? 'mt-4' : 'mt-3'}`}>
                                                <span className={`font-extrabold ${rc.titleColor} ${isGold ? 'text-2xl' : 'text-xl'}`}>{formatCurrency(plan.valor_mensal)}</span>
                                                <span className="text-xs font-medium text-slate-400">/mês</span>
                                            </div>

                                            {/* Details */}
                                            <div className={`flex flex-col border-t border-dashed border-slate-200 dark:border-slate-700 ${isGold ? 'mt-4 gap-2.5 pt-3' : 'mt-3 gap-2 pt-3'}`}>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400 dark:text-slate-500">Instalação</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'N/D'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400 dark:text-slate-500">Prazo</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate ml-2 max-w-[120px]" title={plan.prazo_instalacao}>{plan.prazo_instalacao || 'N/D'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs items-center">
                                                    <span className="text-slate-400 dark:text-slate-500">Vendas/mês</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`h-1.5 rounded-full bg-slate-100 dark:bg-slate-600 overflow-hidden ${isGold ? 'w-14' : 'w-10'}`}>
                                                            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.max(vendasRatio, vendas > 0 ? 10 : 0)}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{vendas}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Button - Admin Only */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleEditClick(plan)}
                                                    className={`w-full rounded-lg font-semibold transition-all cursor-pointer ${rc.btn} ${isGold ? 'mt-4 px-4 py-2.5 text-sm' : 'mt-3 px-3 py-2 text-xs'}`}
                                                >
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined" style={{ fontSize: isGold ? 16 : 14 }}>edit</span>
                                                        Editar
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                });
                            })()
                        )}
                    </div>
                </div>
                )}

                {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Plano</h3>
                                <button 
                                    onClick={() => setEditingPlan(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Serviço</label>
                                <input 
                                    type="text" 
                                    value={editingPlan.descricao || ''} 
                                    disabled 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                                />
                                <p className="text-xs text-slate-500 mt-1">O nome é puxado automaticamente do IXC.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo de Instalação</label>
                                <input 
                                    type="text" 
                                    value={editForm.prazo_instalacao} 
                                    onChange={(e) => setEditForm({...editForm, prazo_instalacao: e.target.value})}
                                    placeholder="Ex: 3 Dias, Imediato, 5 Dias Úteis..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-1">Este dado será salvo nativamente no banco de dados local.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Taxa de Instalação</label>
                                <input 
                                    type="text" 
                                    value={editForm.taxa_instalacao} 
                                    onChange={(e) => setEditForm({...editForm, taxa_instalacao: e.target.value})}
                                    placeholder="Ex: 50.00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-1">Insira o valor apenas com números e ponto (ex: 50.00).</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button 
                                onClick={() => setEditingPlan(null)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingTechService?.id ? 'Editar Serviço Técnico' : 'Novo Serviço Técnico'}
                                </h3>
                                <button 
                                    onClick={() => setEditingTechService(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serviço</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.service} 
                                    onChange={(e) => setEditTechForm({...editTechForm, service: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.value} 
                                    onChange={(e) => setEditTechForm({...editTechForm, value: e.target.value})}
                                    placeholder="Ex: R$ 50,00"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.deadline} 
                                    onChange={(e) => setEditTechForm({...editTechForm, deadline: e.target.value})}
                                    placeholder="Ex: Até 5 dias úteis"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pagamento</label>
                                <input 
                                    type="text" 
                                    value={editTechForm.payment} 
                                    onChange={(e) => setEditTechForm({...editTechForm, payment: e.target.value})}
                                    placeholder="Ex: À vista ou 2x Boleto"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ícone</label>
                                <div className="flex items-center gap-3">
                                    <div className="rounded bg-[#a17745]/10 p-2 text-[#a17745] dark:bg-[#a17745]/20 dark:text-[#a17745]">
                                        <span className="material-symbols-outlined text-lg">{editTechForm.icon || 'build'}</span>
                                    </div>
                                    <select 
                                        value={editTechForm.icon} 
                                        onChange={(e) => setEditTechForm({...editTechForm, icon: e.target.value})}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button 
                                onClick={() => setEditingTechService(null)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveTechEdit}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center gap-2"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        </main>
    )
}

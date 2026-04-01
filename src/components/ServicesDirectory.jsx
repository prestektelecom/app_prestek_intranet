import React, { useState, useEffect, useRef } from 'react';

export default function ServicesDirectory({ setCurrentView }) {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    
    // Modal State
    const [editingPlan, setEditingPlan] = useState(null);
    const [editForm, setEditForm] = useState({ prazo_instalacao: '', taxa_instalacao: '' });
    const [isSaving, setIsSaving] = useState(false);

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
                fetchPlans(); // Refresh the list
            } else {
                console.error("Failed to save plan");
            }
        } catch (error) {
            console.error("Error saving plan:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return val || 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
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
        if (filter === 'All') return true;
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
        .slice(0, 8); // top 8 plans by sales in carousel

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
                        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all">
                            <span className="material-symbols-outlined text-xl">sync</span>
                            Sincronizar Manual
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'PF', 'PJ', 'Link'].map(f => (
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
                        </button>
                    ))}
                </div>

                {/* Services Table */}
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
                                                    <button 
                                                        onClick={() => handleEditClick(plan)}
                                                        className="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary cursor-pointer transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined">edit_square</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plans Overview Carousel */}
                <div className="mt-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Visão Geral dos Planos de Fibra</h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => scrollCarousel('left')}
                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <button 
                                onClick={() => scrollCarousel('right')}
                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide smooth-scroll"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {isLoading ? (
                            <div className="w-full flex justify-center py-10">
                                <span className="material-symbols-outlined animate-spin text-3xl text-primary">autorenew</span>
                            </div>
                        ) : (
                            fiberPlans.map((plan, index) => {
                                const vendas = plan.vendas_mes || 0;
                                const maxVendasLocal = Math.max(maxVendas, 10);
                                const vendasRatio = Math.min((vendas / maxVendasLocal) * 100, 100);
                                const barColor = vendasRatio >= 60 ? 'bg-green-500' : vendasRatio >= 25 ? 'bg-primary' : 'bg-orange-400';

                                const isFeatured = index === 0; // Highlight the best seller
                                
                                return (
                                    <div key={plan.id} className={`group relative flex flex-col min-w-[300px] md:min-w-[320px] snap-center rounded-xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${isFeatured ? 'border-2 border-primary bg-white dark:bg-slate-800 dark:border-primary shadow-md' : 'border border-slate-200 bg-white dark:bg-[#1a130b] dark:border-slate-700 dark:bg-slate-800'}`}>
                                        {isFeatured && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                                                MAIS VENDIDO
                                            </div>
                                        )}
                                        <div className={`absolute right-4 top-4 rounded-full p-2 ${isFeatured ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                                            <span className="material-symbols-outlined">{isFeatured ? 'local_fire_department' : 'speed'}</span>
                                        </div>
                                        <h4 className={`text-lg font-bold pr-10 ${isFeatured ? 'text-primary' : 'text-slate-900 dark:text-white'} truncate`}>{plan.descricao}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Sincronizado via IXC</p>
                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(plan.valor_mensal)}</span>
                                            <span className="text-sm font-medium text-slate-500">/mês</span>
                                        </div>
                                        <div className="mt-6 flex flex-col gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400">Instalação</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{plan.taxa_instalacao ? formatCurrency(plan.taxa_instalacao) : 'Não definida'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-slate-400">Prazo</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{plan.prazo_instalacao || 'Não definido'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-slate-500 dark:text-slate-400">Vendas no Mês</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-12 rounded-full bg-slate-100 dark:bg-slate-600">
                                                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${vendasRatio}%` }}></div>
                                                    </div>
                                                    <span className={`font-bold ${barColor.replace('bg-', 'text-').replace('-500', isFeatured ? '-100' : '-600').replace('-400', '-500')} ${isFeatured ? '' : 'dark:text-slate-200'}`}>
                                                        {vendas}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleEditClick(plan)}
                                            className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${isFeatured ? 'bg-primary text-white shadow-sm hover:bg-orange-600 focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800' : 'bg-slate-50 text-slate-900 hover:bg-slate-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'}`}
                                        >
                                            Editar Plano
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

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

        </main>
    )
}

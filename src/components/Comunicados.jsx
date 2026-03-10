import { useState, useEffect } from 'react';

export default function Comunicados({ user }) {
    const [comunicados, setComunicados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filtro, setFiltro] = useState('Todas');
    const [ordenacao, setOrdenacao] = useState('recentes');
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        tipo: 'Geral',
        departamento_autor: '',
        link_opcional: ''
    });

    const fetchComunicados = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3001/api/comunicados');
            const data = await res.json();
            if (data.sucesso) {
                setComunicados(data.comunicados);
            }
        } catch (error) {
            console.error("Erro ao carregar comunicados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComunicados();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({
                titulo: item.titulo,
                descricao: item.descricao,
                tipo: item.tipo,
                departamento_autor: item.departamento_autor,
                link_opcional: item.link_opcional || ''
            });
            setEditingId(item.id);
        } else {
            setFormData({ titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ titulo: '', descricao: '', tipo: 'Geral', departamento_autor: '', link_opcional: '' });
        setEditingId(null);
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const id = itemToDelete;
        setItemToDelete(null);
        try {
            const res = await fetch(`http://localhost:3001/api/comunicados/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.sucesso) {
                fetchComunicados();
            } else {
                alert('Erro ao excluir: ' + data.erro);
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir comunicado.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = {
                ...formData,
                criado_por: user?.nome || user?.funcionario?.funcionario || 'Admin'
            };

            const url = editingId ? `http://localhost:3001/api/comunicados/${editingId}` : 'http://localhost:3001/api/comunicados';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.sucesso) {
                handleCloseModal();
                fetchComunicados();
            } else {
                alert('Erro ao salvar: ' + data.erro);
            }
        } catch (err) {
            alert('Erro ao salvar comunicado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' ');
    };

    const comunicadosFiltrados = comunicados
        .filter(item => filtro === 'Todas' ? true : item.tipo === filtro)
        .sort((a, b) => {
            if (ordenacao === 'recentes') return new Date(b.criado_em) - new Date(a.criado_em);
            if (ordenacao === 'antigos') return new Date(a.criado_em) - new Date(b.criado_em);
            if (ordenacao === 'autor') return a.departamento_autor.localeCompare(b.departamento_autor);
            return 0;
        });

    return (
        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1024px] mx-auto w-full overflow-y-auto no-scrollbar relative">
            <div className="mb-10 mt-4 flex justify-between items-end gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#1d150c] dark:text-white mb-3 leading-tight tracking-[-0.033em]">Comunicados da Empresa</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-lg max-w-2xl leading-relaxed">Fique atualizado com as últimas notícias, alertas urgentes e diretrizes importantes da diretoria da Prestek.</p>
                </div>
                {user?.is_admin && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#e67e00] text-white font-bold transition-colors shadow-md shadow-primary/20">
                        <span className="material-symbols-outlined">add_circle</span>
                        Novo Comunicado
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-[#1a130b] p-4 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltro('Todas')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtro === 'Todas' ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-[#e67e00]' : 'bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-primary/10 hover:text-primary hover:border-primary/30'}`}>
                        Todas as Atualizações
                    </button>
                    <button
                        onClick={() => setFiltro('Urgente')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filtro === 'Urgente' ? 'bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600' : 'bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}>
                        Urgente
                    </button>
                    <button
                        onClick={() => setFiltro('Importante')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filtro === 'Importante' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20 hover:bg-yellow-600' : 'bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200'}`}>
                        Importante
                    </button>
                    <button
                        onClick={() => setFiltro('Geral')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filtro === 'Geral' ? 'bg-green-500 text-white shadow-md shadow-green-500/20 hover:bg-green-600' : 'bg-[#fcfaf8] dark:bg-[#2c2217] text-[#635c55] dark:text-gray-300 border border-[#eaddcd] dark:border-gray-800 hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`}>
                        Geral
                    </button>
                </div>
                <div className="w-full md:w-auto relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a17745] dark:text-orange-300 text-xl">filter_list</span>
                    <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="pl-10 pr-8 py-2 w-full md:w-48 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm text-[#1d150c] dark:text-white focus:ring-2 focus:ring-primary/50 cursor-pointer outline-none transition-all">
                        <option value="recentes">Mais recentes primeiro</option>
                        <option value="antigos">Mais antigos primeiro</option>
                        <option value="autor">Ordenar por Autor</option>
                    </select>
                </div>
            </div>

            <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 sm:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#eaddcd] before:to-transparent">

                {loading && (
                    <div className="flex items-center justify-center p-8 bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">autorenew</span>
                        <span className="ml-3 text-[#635c55] dark:text-gray-300">Carregando avisos...</span>
                    </div>
                )}

                {!loading && comunicadosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm text-center">
                        <span className="material-symbols-outlined text-gray-400 text-5xl mb-3">search_off</span>
                        <h3 className="text-lg font-bold text-[#1d150c] dark:text-white">Nenhum aviso encontrado</h3>
                        <p className="text-[#635c55] dark:text-gray-400 max-w-sm mt-1">Nenhum comunicado corresponde aos filtros selecionados.</p>
                    </div>
                )}

                {!loading && comunicadosFiltrados.map((item) => {
                    const isUrgente = item.tipo === 'Urgente';
                    const isImportante = item.tipo === 'Importante';
                    const isGeral = item.tipo === 'Geral';

                    let icon = 'article';
                    let badgeBg = 'bg-gray-500';
                    let borderLeft = 'border-l-gray-500';
                    let badgeText = 'text-gray-700';
                    let badgeBgLight = 'bg-gray-100';
                    let badgeBorderLight = 'border-gray-200';

                    if (isUrgente) {
                        icon = 'priority_high';
                        badgeBg = 'bg-red-500';
                        borderLeft = 'border-l-red-500';
                        badgeText = 'text-red-700';
                        badgeBgLight = 'bg-red-100';
                        badgeBorderLight = 'border-red-200';
                    } else if (isImportante) {
                        icon = 'notification_important';
                        badgeBg = 'bg-yellow-500';
                        borderLeft = 'border-l-yellow-500';
                        badgeText = 'text-yellow-800';
                        badgeBgLight = 'bg-yellow-100';
                        badgeBorderLight = 'border-yellow-200';
                    } else if (isGeral) {
                        icon = 'article';
                        badgeBg = 'bg-green-500';
                        borderLeft = 'border-l-green-500';
                        badgeText = 'text-green-800';
                        badgeBgLight = 'bg-green-100';
                        badgeBorderLight = 'border-green-200';
                    }

                    return (
                        <div key={item.id} className="relative group">
                            <div className={`absolute -left-4 sm:-left-8 mt-1.5 h-8 w-8 rounded-full border-4 border-[#fcfaf8] ${badgeBg} flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110`}>
                                <span className="material-symbols-outlined text-white text-[16px]">{icon}</span>
                            </div>
                            <div className={`bg-white dark:bg-[#1a130b] rounded-xl p-6 border border-l-4 ${borderLeft} border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-all`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeBgLight} ${badgeText} border ${badgeBorderLight}`}>{item.tipo}</span>
                                        <span className="text-xs text-[#a17745] dark:text-orange-300 flex items-center gap-1 font-medium">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span> {formatarData(item.criado_em)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-[#635c55] dark:text-gray-300 uppercase tracking-wider">Pelo Departamento de {item.departamento_autor}</span>
                                        {user?.is_admin && (
                                            <div className="flex items-center gap-1 border-l border-[#eaddcd] dark:border-gray-800 pl-3">
                                                <button onClick={() => handleOpenModal(item)} className="p-1 rounded text-[#a17745] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors" title="Editar">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button onClick={() => confirmDelete(item.id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2 group-hover:text-primary transition-colors">{item.titulo}</h3>
                                <p className="text-[#635c55] dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{item.descricao}</p>

                                {item.link_opcional && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                                        <div className="flex -space-x-2"></div>
                                        <a href={item.link_opcional} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-primary hover:text-[#e67e00] transition-colors group/btn">
                                            Link adicional <span className="material-symbols-outlined text-lg ml-1 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Adicionar/Editar Comunicado */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-[#eaddcd] dark:border-gray-800 flex justify-between items-center bg-[#fcfaf8] dark:bg-[#150f08]">
                            <h2 className="text-xl font-bold text-[#1d150c] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">{editingId ? 'edit' : 'campaign'}</span>
                                {editingId ? 'Editar Comunicado' : 'Novo Comunicado'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-[#a17745] hover:text-red-500 transition-colors rounded-lg p-1 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#1d150c] dark:text-white mb-1.5">Título do Aviso *</label>
                                <input required type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full p-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#1d150c] dark:text-white" placeholder="Ex: Atualização do Sistema" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#1d150c] dark:text-white mb-1.5">Tipo *</label>
                                    <select required value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full p-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#1d150c] dark:text-white">
                                        <option value="Geral">Geral (Verde)</option>
                                        <option value="Importante">Importante (Amarelo)</option>
                                        <option value="Urgente">Urgente (Vermelho)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#1d150c] dark:text-white mb-1.5">Depto. Autor *</label>
                                    <input required type="text" value={formData.departamento_autor} onChange={e => setFormData({ ...formData, departamento_autor: e.target.value })} className="w-full p-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#1d150c] dark:text-white" placeholder="Ex: Diretoria" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1d150c] dark:text-white mb-1.5">Mensagem/Descrição *</label>
                                <textarea required rows="4" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full p-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#1d150c] dark:text-white resize-none" placeholder="Detalhes completos do comunicado..."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1d150c] dark:text-white mb-1.5">Link Adicional (Opcional)</label>
                                <input type="url" value={formData.link_opcional} onChange={e => setFormData({ ...formData, link_opcional: e.target.value })} className="w-full p-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none text-[#1d150c] dark:text-white" placeholder="https://..." />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#eaddcd] dark:border-gray-800">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-sm font-bold text-[#635c55] hover:text-red-500 hover:bg-red-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#e67e00] shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isSubmitting ? (
                                        <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Salvando...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[18px]">send</span> {editingId ? 'Salvar Aviso' : 'Publicar Aviso'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a130b] border border-red-200 dark:border-red-900/30 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1d150c] dark:text-white mb-2">Excluir Comunicado?</h3>
                        <p className="text-[#635c55] dark:text-gray-300 text-sm mb-6">Esta ação não pode ser desfeita. O comunicado será removido permanentemente.</p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-[#635c55] dark:text-gray-300 bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-colors">
                                Sim, excluir!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

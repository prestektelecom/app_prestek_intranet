import { useState, useMemo, useEffect } from 'react';
import { CATEGORIAS, PROCESSOS, STATUS_CONFIG } from '../data/processosData';

// ─── Helpers ────────────────────────────────────────────────────────────────

function contarPorCategoria(lista) {
    return lista.reduce((acc, p) => { acc[p.categoria] = (acc[p.categoria] || 0) + 1; return acc; }, {});
}

function percentualAtivosPorCategoria(lista) {
    const total = {};
    const ativos = {};
    lista.forEach(p => {
        total[p.categoria] = (total[p.categoria] || 0) + 1;
        if (p.status === 'ativo') ativos[p.categoria] = (ativos[p.categoria] || 0) + 1;
    });
    return Object.fromEntries(Object.keys(total).map(c => [c, Math.round(((ativos[c] || 0) / total[c]) * 100)]));
}

function gerarId(categoria, lista) {
    const cat = CATEGORIAS.find(c => c.id === categoria);
    const prefixo = cat?.prefixo || 'OP';
    const existentes = lista.filter(p => p.id.startsWith(prefixo + '-')).map(p => parseInt(p.id.split('-')[1], 10)).filter(n => !isNaN(n));
    const proximo = existentes.length ? Math.max(...existentes) + 1 : 1;
    return `${prefixo}-${String(proximo).padStart(3, '0')}`;
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho;
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

const FORM_VAZIO = {
    nome: '',
    descricao: '',
    categoria: 'atendimento',
    status: 'ativo',
    versao: '1.0',
    docUrl: '',
    responsavelNome: '',
    etapas: '',
    tempoEstimado: '',
    tags: '',
};

function ProcessoModal({ processo, onSalvar, onFechar }) {
    const isEdicao = Boolean(processo?.id);
    const [form, setForm] = useState(() => {
        if (!processo) return FORM_VAZIO;
        return {
            nome: processo.nome,
            descricao: processo.descricao,
            categoria: processo.categoria,
            status: processo.status,
            versao: processo.versao,
            docUrl: processo.docUrl || '',
            responsavelNome: processo.responsavel?.nome || '',
            etapas: processo.etapas ?? '',
            tempoEstimado: processo.tempoEstimado || '',
            tags: (processo.tags || []).join(', '),
        };
    });
    const [erro, setErro] = useState('');

    function set(campo, valor) {
        setForm(f => ({ ...f, [campo]: valor }));
        setErro('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.nome.trim()) return setErro('O nome do processo é obrigatório.');
        if (!form.descricao.trim()) return setErro('A descrição é obrigatória.');
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        const payload = {
            ...(processo || {}),
            nome: form.nome.trim(),
            descricao: form.descricao.trim(),
            categoria: form.categoria,
            status: form.status,
            versao: form.versao.trim() || '1.0',
            docUrl: form.docUrl.trim() || null,
            responsavel: {
                nome: form.responsavelNome.trim() || 'Não informado',
                setor: CATEGORIAS.find(c => c.id === form.categoria)?.label || '',
                funcionario_id: processo?.responsavel?.funcionario_id ?? null,
            },
            etapas: form.etapas !== '' ? Number(form.etapas) : null,
            tempoEstimado: form.tempoEstimado.trim() || '—',
            tags,
            ultimaAtualizacao: new Date().toISOString().split('T')[0],
        };
        onSalvar(payload);
    }

    const inputCls = "w-full px-3 py-2 border border-[#eaddcd] dark:border-gray-700 rounded bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary";
    const labelCls = "block text-xs font-semibold text-[#a17745] dark:text-orange-300 uppercase tracking-wide mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onFechar} />
            <div className="relative bg-white dark:bg-[#1a130b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#eaddcd] dark:border-gray-700">
                {/* Header do modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaddcd] dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-xl">
                                {isEdicao ? 'edit' : 'add_circle'}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-[#1d150c] dark:text-white font-bold text-lg">
                                {isEdicao ? 'Editar Processo' : 'Novo Processo'}
                            </h2>
                            {isEdicao && (
                                <p className="text-xs text-[#a17745] dark:text-orange-300 font-mono">{processo.id}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onFechar} className="text-[#a17745] hover:text-[#1d150c] dark:hover:text-white transition-colors p-1 rounded">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Corpo do formulário */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Nome do Processo *</label>
                            <input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Onboarding de Clientes" />
                        </div>

                        <div>
                            <label className={labelCls}>Categoria *</label>
                            <select className={inputCls} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                                {CATEGORIAS.filter(c => c.id !== 'todos').map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Status *</label>
                            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Descrição *</label>
                            <textarea className={`${inputCls} resize-none`} rows={3} value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva o objetivo e escopo deste processo..." />
                        </div>

                        <div>
                            <label className={labelCls}>Versão</label>
                            <input className={inputCls} value={form.versao} onChange={e => set('versao', e.target.value)} placeholder="1.0" />
                        </div>

                        <div>
                            <label className={labelCls}>Responsável</label>
                            <input className={inputCls} value={form.responsavelNome} onChange={e => set('responsavelNome', e.target.value)} placeholder="Ex: Coordenador de TI" />
                        </div>

                        <div>
                            <label className={labelCls}>Nº de Etapas</label>
                            <input className={inputCls} type="number" min="0" value={form.etapas} onChange={e => set('etapas', e.target.value)} placeholder="Ex: 5" />
                        </div>

                        <div>
                            <label className={labelCls}>Tempo Estimado</label>
                            <input className={inputCls} value={form.tempoEstimado} onChange={e => set('tempoEstimado', e.target.value)} placeholder="Ex: 30min" />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Link do Google Docs (POP)</label>
                            <input className={inputCls} type="url" value={form.docUrl} onChange={e => set('docUrl', e.target.value)} placeholder="https://docs.google.com/..." />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelCls}>Tags (separadas por vírgula)</label>
                            <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Ex: IXC, cadastro, ativação" />
                        </div>
                    </div>

                    {erro && (
                        <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">error</span>
                            {erro}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#eaddcd] dark:border-gray-800 flex justify-end gap-3">
                    <button type="button" onClick={onFechar} className="px-4 py-2 text-sm font-medium text-[#1d150c] dark:text-white border border-[#eaddcd] dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-[#2c2217] transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 text-sm font-bold bg-primary hover:bg-[#e67e00] text-white rounded shadow transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">{isEdicao ? 'save' : 'add'}</span>
                        {isEdicao ? 'Salvar Alterações' : 'Criar Processo'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

export default function Processos({ setCurrentView }) {
    const [lista, setLista] = useState(PROCESSOS);
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
    const [pagina, setPagina] = useState(1);
    const [modal, setModal] = useState(null); // null | { modo: 'novo' } | { modo: 'editar', processo }

    const contagem = useMemo(() => contarPorCategoria(lista), [lista]);
    const percentuaisAtivos = useMemo(() => percentualAtivosPorCategoria(lista), [lista]);

    const processosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return lista.filter(p => {
            const matchCategoria = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
            const matchBusca = !termo
                || p.id.toLowerCase().includes(termo)
                || p.nome.toLowerCase().includes(termo)
                || p.descricao.toLowerCase().includes(termo)
                || p.tags.some(t => t.toLowerCase().includes(termo));
            return matchCategoria && matchBusca;
        });
    }, [busca, categoriaAtiva, lista]);

    const totalPaginas = Math.max(1, Math.ceil(processosFiltrados.length / ROWS_PER_PAGE));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const inicio = (paginaSegura - 1) * ROWS_PER_PAGE;
    const processosPagina = processosFiltrados.slice(inicio, inicio + ROWS_PER_PAGE);

    function handleCategoria(id) { setCategoriaAtiva(id); setPagina(1); }
    function handleBusca(e) { setBusca(e.target.value); setPagina(1); }

    function abrirNovo() { setModal({ modo: 'novo' }); }
    function abrirEditar(p) { setModal({ modo: 'editar', processo: p }); }
    function fecharModal() { setModal(null); }

    function salvarProcesso(payload) {
        if (modal.modo === 'novo') {
            const novoId = gerarId(payload.categoria, lista);
            setLista(prev => [{ ...payload, id: novoId }, ...prev]);
        } else {
            setLista(prev => prev.map(p => p.id === payload.id ? payload : p));
        }
        setModal(null);
    }

    // Fechar modal com Escape
    useEffect(() => {
        if (!modal) return;
        function onKey(e) { if (e.key === 'Escape') fecharModal(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modal]);

    const categoriasComContagem = CATEGORIAS.filter(c => c.id !== 'todos');

    return (
        <>
        {modal && (
            <ProcessoModal
                processo={modal.modo === 'editar' ? modal.processo : null}
                onSalvar={salvarProcesso}
                onFechar={fecharModal}
            />
        )}

        <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1400px] mx-auto w-full overflow-y-auto no-scrollbar">
            {/* Cabeçalho */}
            <div className="flex flex-wrap justify-between gap-6 mb-8 items-end">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="text-[#a17745] dark:text-orange-300 text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">home</span>
                            Início
                        </button>
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                        <span className="text-[#a17745] dark:text-orange-300 font-medium">Recursos Internos</span>
                        <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-sm">chevron_right</span>
                        <span className="text-[#1d150c] dark:text-white text-sm font-bold">Processos</span>
                    </div>
                    <h1 className="text-[#1d150c] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Processos Operacionais</h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-base font-normal leading-normal max-w-2xl">Gerencie e visualize procedimentos internos documentados, fluxos de trabalho e POPs para todos os departamentos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded text-[#1d150c] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#2c2217] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Exportar Lista</span>
                    </button>
                    <button
                        onClick={abrirNovo}
                        className="flex items-center gap-2 px-4 h-10 bg-primary hover:bg-[#e67e00] text-white rounded text-sm font-bold shadow-md transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Novo Processo</span>
                    </button>
                </div>
            </div>

            {/* Barra de busca e filtros */}
            <div className="bg-white dark:bg-[#1a130b] p-4 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a17745] dark:text-orange-300">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-[#eaddcd] dark:border-gray-800 rounded leading-5 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white placeholder:text-[#a17745] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Buscar por Nome, ID (ex: TI-001) ou tag..."
                            type="text"
                            value={busca}
                            onChange={handleBusca}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {CATEGORIAS.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoria(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                                    categoriaAtiva === cat.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-[#fcfaf8] dark:bg-[#2c2217] border border-[#eaddcd] dark:border-gray-800 text-[#1d150c] dark:text-white hover:bg-gray-100 dark:hover:bg-[#3a2d22]'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${categoriaAtiva === cat.id ? 'text-white' : 'text-[#a17745] dark:text-orange-300'}`}>
                                    {cat.icon}
                                </span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#fcfaf8] dark:bg-[#2c2217] border-b border-[#eaddcd] dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-28">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-1/4">PROCESSO</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider">DESCRIÇÃO</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-24 text-center">VERSÃO</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-36 text-center">STATUS</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-44 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaddcd] dark:divide-gray-800 bg-white dark:bg-[#1a130b]">
                            {processosPagina.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#a17745] dark:text-orange-300 text-sm">
                                        Nenhum processo encontrado para os filtros aplicados.
                                    </td>
                                </tr>
                            ) : processosPagina.map(p => {
                                const podeAbrirDoc = p.status !== 'rascunho' && p.docUrl;
                                return (
                                    <tr key={p.id} className="hover:bg-[#fcfaf8] dark:hover:bg-[#2c2217] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-primary">{p.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-[#1d150c] dark:text-white">{p.nome}</div>
                                            <div className="text-xs text-[#a17745] dark:text-orange-400 mt-0.5">{p.responsavel.setor}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#a17745] dark:text-orange-300 max-w-xs">
                                            <span className="line-clamp-2">{p.descricao}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#1d150c] dark:text-white font-medium">
                                            v{p.versao}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => abrirEditar(p)}
                                                    title="Editar processo"
                                                    className="text-[#a17745] hover:text-primary dark:text-orange-400 dark:hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                {podeAbrirDoc ? (
                                                    <a
                                                        href={p.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Abrir POP no Google Docs"
                                                        className="text-primary hover:text-[#e67e00] font-bold inline-flex items-center gap-1 text-sm group-hover:underline"
                                                    >
                                                        <span>Ver POP</span>
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 inline-flex items-center gap-1 text-sm cursor-default">
                                                        <span>Rascunho</span>
                                                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="px-6 py-4 border-t border-[#eaddcd] dark:border-gray-800 flex items-center justify-between bg-[#fcfaf8] dark:bg-[#2c2217]">
                    <span className="text-sm text-[#a17745] dark:text-orange-300">
                        Mostrando{' '}
                        <span className="font-medium text-[#1d150c] dark:text-white">
                            {processosFiltrados.length === 0 ? 0 : inicio + 1}
                        </span>{' '}
                        a{' '}
                        <span className="font-medium text-[#1d150c] dark:text-white">
                            {Math.min(inicio + ROWS_PER_PAGE, processosFiltrados.length)}
                        </span>{' '}
                        de{' '}
                        <span className="font-medium text-[#1d150c] dark:text-white">{processosFiltrados.length}</span>{' '}
                        resultado{processosFiltrados.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={paginaSegura === 1}
                            className="px-3 py-1 border border-[#eaddcd] dark:border-gray-800 rounded text-sm text-[#a17745] dark:text-orange-300 hover:bg-gray-100 dark:hover:bg-[#3a2d22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaSegura === totalPaginas}
                            className="px-3 py-1 border border-[#eaddcd] dark:border-gray-800 rounded text-sm text-[#1d150c] dark:text-white hover:bg-gray-100 dark:hover:bg-[#3a2d22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de resumo por categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoriasComContagem.map(cat => {
                    const total = contagem[cat.id] || 0;
                    const pct = percentuaisAtivos[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => { handleCategoria(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="bg-white dark:bg-[#1a130b] p-6 rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group text-left"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <span className="text-3xl font-bold text-[#1d150c] dark:text-white">{total}</span>
                            </div>
                            <h3 className="text-base font-bold text-[#1d150c] dark:text-white mb-1">{cat.label}</h3>
                            <p className="text-[#a17745] dark:text-orange-300 text-xs">
                                {total === 0 ? 'Nenhum processo cadastrado' : `${total} processo${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
                            </p>
                            <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-[#a17745] dark:text-orange-300 mt-2 text-right">{pct}% Ativos</p>
                        </button>
                    );
                })}
            </div>
        </main>
        </>
    );
}

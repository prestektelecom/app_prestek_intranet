import { useState, useMemo } from 'react';
import { CATEGORIAS, PROCESSOS, STATUS_CONFIG, getContagemPorCategoria, getPercentualAtivosPorCategoria } from '../data/processosData';

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho;
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

const ROWS_PER_PAGE = 10;

export default function Processos({ setCurrentView }) {
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
    const [pagina, setPagina] = useState(1);

    const contagem = useMemo(() => getContagemPorCategoria(), []);
    const percentuaisAtivos = useMemo(() => getPercentualAtivosPorCategoria(), []);

    const processosFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return PROCESSOS.filter(p => {
            const matchCategoria = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
            const matchBusca = !termo
                || p.id.toLowerCase().includes(termo)
                || p.nome.toLowerCase().includes(termo)
                || p.descricao.toLowerCase().includes(termo)
                || p.tags.some(t => t.toLowerCase().includes(termo));
            return matchCategoria && matchBusca;
        });
    }, [busca, categoriaAtiva]);

    const totalPaginas = Math.max(1, Math.ceil(processosFiltrados.length / ROWS_PER_PAGE));
    const paginaSegura = Math.min(pagina, totalPaginas);
    const inicio = (paginaSegura - 1) * ROWS_PER_PAGE;
    const processosPagina = processosFiltrados.slice(inicio, inicio + ROWS_PER_PAGE);

    function handleCategoria(id) {
        setCategoriaAtiva(id);
        setPagina(1);
    }

    function handleBusca(e) {
        setBusca(e.target.value);
        setPagina(1);
    }

    const categoriasComContagem = CATEGORIAS.filter(c => c.id !== 'todos');

    return (
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
                    <button className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-800 rounded text-[#1d150c] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Exportar Lista</span>
                    </button>
                    <button
                        disabled
                        title="Em breve"
                        className="flex items-center gap-2 px-4 h-10 bg-primary/50 text-white rounded text-sm font-bold shadow-md cursor-not-allowed opacity-60"
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
                                <th className="px-6 py-4 text-xs font-bold text-[#a17745] dark:text-orange-300 uppercase tracking-wider w-36 text-right">AÇÕES</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {podeAbrirDoc ? (
                                                <a
                                                    href={p.docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-[#e67e00] font-bold inline-flex items-center justify-end gap-1 group-hover:underline"
                                                >
                                                    <span>Ver POP</span>
                                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 inline-flex items-center justify-end gap-1 cursor-default">
                                                    <span>Rascunho</span>
                                                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                </span>
                                            )}
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
                        <span className="font-medium text-[#1d150c] dark:text-white">{processosFiltrados.length}</span> resultado{processosFiltrados.length !== 1 ? 's' : ''}
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
    );
}

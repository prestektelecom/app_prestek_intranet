import { useState, useEffect, useMemo } from 'react';
import LottieAvatar from './common/LottieAvatar';
import defaultAvatar from '../image/avatar/4472613.json';

// Quantidade de colaboradores por página
const POR_PAGINA = 8;

export default function Directory() {
    const [colaboradores, setColaboradores] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [deptosEmpresa, setDeptosEmpresa] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [deptoFiltro, setDeptoFiltro] = useState('');
    const [pagina, setPagina] = useState(1);

    // Carrega colaboradores e departamentos em paralelo
    useEffect(() => {
        const carregar = async () => {
            try {
                const [resColab, resDept, resCargo, resDeptTicket] = await Promise.all([
                    fetch('http://localhost:3001/api/colaboradores').catch(() => null),
                    fetch('http://localhost:3001/api/departamentos-empresa').catch(() => null),
                    fetch('http://localhost:3001/api/cargos').catch(() => null),
                    fetch('http://localhost:3001/api/departamentos').catch(() => null)
                ]);

                if (resColab?.ok) {
                    const data = await resColab.json();
                    if (data.sucesso) setColaboradores(data.colaboradores || []);
                }
                if (resDept?.ok) {
                    const data = await resDept.json();
                    if (data.sucesso) setDepartamentos(data.departamentos || []);
                }
                if (resCargo?.ok) {
                    const data = await resCargo.json();
                    if (data.sucesso) setCargos(data.cargos || []);
                }
                if (resDeptTicket?.ok) {
                    const data = await resDeptTicket.json();
                    if (data.sucesso) setDeptosEmpresa(data.departamentos || []);
                }
            } catch (err) {
                console.error('Erro ao carregar diretório:', err);
            } finally {
                setIsLoading(false);
            }
        };
        carregar();
    }, []);

    // Resolve nome do departamento pelo ID — mesma lógica de cascata do Header.jsx
    const resolverDepartamento = (idDepto) => {
        if (!idDepto) return 'N/D';
        const id = String(idDepto).trim();
        // Prioridade 1: departamento organizacional (departamentos-empresa)
        const foundDeptEmp = departamentos.find(d => String(d.id).trim() === id);
        if (foundDeptEmp?.departamento) return foundDeptEmp.departamento;
        // Prioridade 2: setores de empresa (empresa_setor / cargos)
        const foundCargo = cargos.find(c => String(c.id).trim() === id);
        if (foundCargo?.setor) return foundCargo.setor;
        // Prioridade 3: setor de ticket (su_ticket_setor)
        const foundTicket = deptosEmpresa.find(d => String(d.id).trim() === id);
        if (foundTicket?.setor) return foundTicket.setor;
        return 'N/D';
    };

    // Lista dos departamentos únicos para o filtro do select
    const departamentosUnicos = useMemo(() => {
        const ids = [...new Set(colaboradores.map(c => c.id_departamento).filter(Boolean))];
        return ids.map(id => ({ id, nome: resolverDepartamento(id) })).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [colaboradores, departamentos]);

    // Filtragem por busca e departamento
    const colaboradoresFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        return colaboradores.filter(c => {
            const matchBusca = !termo
                || (c.funcionario_nome || '').toLowerCase().includes(termo)
                || (c.usuario_email || '').toLowerCase().includes(termo)
                || (c.ramal || '').toLowerCase().includes(termo);
            const matchDepto = !deptoFiltro || String(c.id_departamento) === deptoFiltro;
            return matchBusca && matchDepto;
        });
    }, [colaboradores, busca, deptoFiltro]);

    // Paginação
    const totalPaginas = Math.max(1, Math.ceil(colaboradoresFiltrados.length / POR_PAGINA));
    const paginaAtual = Math.min(pagina, totalPaginas);
    const inicio = (paginaAtual - 1) * POR_PAGINA;
    const colaboradoresPagina = colaboradoresFiltrados.slice(inicio, inicio + POR_PAGINA);

    // Reseta para página 1 ao filtrar
    useEffect(() => { setPagina(1); }, [busca, deptoFiltro]);

    // Botões de paginação (máx. 5 páginas visíveis)
    const paginasVisiveis = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(p => {
        if (totalPaginas <= 5) return true;
        if (p === 1 || p === totalPaginas) return true;
        return Math.abs(p - paginaAtual) <= 1;
    });

    return (
        <main className="layout-container flex h-full grow flex-col px-4 md:px-10 lg:px-40 py-8 overflow-y-auto">
            <div className="layout-content-container flex flex-col max-w-[1200px] mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[#1d150c] dark:text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                        Diretório de Colaboradores
                    </h1>
                    <p className="text-[#a17745] dark:text-orange-300 text-lg">
                        Busque e conecte-se com seus colegas em todos os departamentos.
                    </p>
                </div>

                {/* Busca e Filtros */}
                <div className="bg-white dark:bg-[#1a130b] p-6 rounded-xl shadow-sm border border-[#eaddcd] dark:border-gray-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1">
                        <label className="block text-sm font-semibold text-[#1d150c] dark:text-white mb-2">Buscar Colaborador</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a17745] dark:text-orange-300">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                type="text"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-[#eaddcd] dark:border-gray-800 rounded-lg leading-5 bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white placeholder:text-[#a17745] dark:placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm"
                                placeholder="Buscar por nome, ramal ou e-mail"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-semibold text-[#1d150c] dark:text-white mb-2">Departamento</label>
                        <div className="relative">
                            <select
                                value={deptoFiltro}
                                onChange={e => setDeptoFiltro(e.target.value)}
                                className="block w-full pl-3 pr-10 py-3 text-base border border-[#eaddcd] dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-[#fcfaf8] dark:bg-[#2c2217] text-[#1d150c] dark:text-white shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="">Todos os Departamentos</option>
                                {departamentosUnicos.map(d => (
                                    <option key={d.id} value={String(d.id)}>{d.nome}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#a17745] dark:text-orange-300">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>
                    {(busca || deptoFiltro) && (
                        <button
                            onClick={() => { setBusca(''); setDeptoFiltro(''); }}
                            className="w-full md:w-auto h-[46px] px-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#635c55] dark:text-gray-300 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                            Limpar
                        </button>
                    )}
                </div>

                {/* Contagem */}
                {!isLoading && (
                    <p className="text-sm text-[#a17745] dark:text-orange-300 mb-4 font-medium">
                        {colaboradoresFiltrados.length === 0
                            ? 'Nenhum colaborador encontrado'
                            : `${colaboradoresFiltrados.length} colaborador${colaboradoresFiltrados.length !== 1 ? 'es' : ''} encontrado${colaboradoresFiltrados.length !== 1 ? 's' : ''}`
                        }
                    </p>
                )}

                {/* Grid de Colaboradores */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#1a130b] rounded-xl border border-[#eaddcd] dark:border-gray-800 shadow-sm p-6 flex flex-col items-center animate-pulse">
                                <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : colaboradoresPagina.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="size-16 rounded-full bg-[#f4eee6] dark:bg-gray-800 flex items-center justify-center text-[#a17745] dark:text-orange-300">
                            <span className="material-symbols-outlined text-[36px]">person_search</span>
                        </div>
                        <p className="text-[#1d150c] dark:text-white font-bold text-lg">Nenhum resultado</p>
                        <p className="text-[#635c55] dark:text-gray-400 text-sm">Tente buscar com outros termos ou limpe os filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                        {colaboradoresPagina.map((colab) => (
                            <EmployeeCard
                                key={colab.usuario_id || colab.funcionario_id}
                                colab={colab}
                                departamentoNome={resolverDepartamento(colab.id_departamento)}
                            />
                        ))}
                    </div>
                )}

                {/* Paginação */}
                {!isLoading && totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-auto pb-10">
                        <button
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={paginaAtual === 1}
                            className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        {paginasVisiveis.map((p, idx, arr) => (
                            <span key={p} className="flex items-center gap-2">
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                    <span className="text-[#a17745] dark:text-orange-300 px-1">...</span>
                                )}
                                <button
                                    onClick={() => setPagina(p)}
                                    className={`flex items-center justify-center size-10 rounded-lg font-semibold transition-colors ${paginaAtual === p
                                        ? 'bg-primary text-white shadow-md'
                                        : 'border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#1d150c] dark:text-white hover:text-primary hover:border-primary'
                                    }`}
                                >
                                    {p}
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaAtual === totalPaginas}
                            className="flex items-center justify-center size-10 rounded-lg border border-[#eaddcd] dark:border-gray-800 bg-white dark:bg-[#1a130b] text-[#a17745] dark:text-orange-300 hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

// Card de cada colaborador
function EmployeeCard({ colab, departamentoNome }) {
    const nome = colab.funcionario_nome || 'Colaborador';
    const email = colab.usuario_email || '';
    const ramal = colab.ramal || '—';
    const isAtivo = colab.ativo === 'S';
    const statusColor = isAtivo ? 'bg-green-500' : 'bg-gray-400';
    const avatarSrc = colab.foto_perfil || defaultAvatar;

    return (
        <div className="bg-white dark:bg-[#1a130b] rounded-xl overflow-hidden border border-[#eaddcd] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full hover:border-[#ff8c00]/50">
            <div className="p-6 flex flex-col items-center text-center flex-grow">
                <div className="relative mb-4">
                    <LottieAvatar
                        src={avatarSrc}
                        className="size-24 rounded-full border-4 border-white dark:border-[#1a130b] shadow-sm bg-gradient-to-br from-primary/20 to-orange-100"
                    />
                    <div className={`absolute bottom-0 right-0 ${statusColor} border-2 border-white dark:border-[#1a130b] size-4 rounded-full`} title={isAtivo ? 'Ativo' : 'Inativo'} />
                </div>
                <h3 className="text-base font-bold text-[#1d150c] dark:text-white mb-0.5 leading-tight">{nome}</h3>
                <p className="text-primary font-medium text-xs mb-4">{departamentoNome}</p>
                <div className="w-full space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-[#a17745] dark:text-orange-300 bg-[#fcfaf8] dark:bg-[#2c2217] p-2 rounded-lg border border-[#f4eee6] dark:border-gray-800">
                        <span className="material-symbols-outlined text-[16px] shrink-0">call</span>
                        <span className="font-medium truncate">Telefone IP / Ramal: {ramal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#a17745] dark:text-orange-300 bg-[#fcfaf8] dark:bg-[#2c2217] p-2 rounded-lg border border-[#f4eee6] dark:border-gray-800">
                        <span className="material-symbols-outlined text-[16px] shrink-0">mail</span>
                        <span className="truncate">{email || '—'}</span>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 pt-0">
                <span className={`inline-flex w-full items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isAtivo ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                    <span className={`size-1.5 rounded-full ${statusColor}`} />
                    {isAtivo ? 'Ativo' : 'Inativo'}
                </span>
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback, useMemo } from 'react';

// Componente para definir manualmente o responsável de cada setor
export default function ResponsaveisManual() {
    const [setores, setSetores] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [responsaveisManuais, setResponsaveisManuais] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(null);
    const [erro, setErro] = useState(null);
    const [busca, setBusca] = useState('');
    // Controla qual setor está com o dropdown aberto
    const [setorAberto, setSetorAberto] = useState(null);
    // Busca de funcionário dentro do dropdown
    const [buscaFunc, setBuscaFunc] = useState('');

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const [resSetores, resFunc, resManuais] = await Promise.all([
                fetch('/api/setores'),
                fetch('/api/colaboradores?all=true'),
                fetch('/api/admin/responsaveis-manuais')
            ]);
            const dSetores = await resSetores.json();
            const dFunc = await resFunc.json();
            const dManuais = await resManuais.json();

            if (dSetores.sucesso) setSetores(dSetores.setores || []);
            if (dFunc.sucesso) setFuncionarios(dFunc.colaboradores || []);
            if (dManuais.sucesso) {
                // Mapeia id_setor -> entrada completa
                const mapa = {};
                (dManuais.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
            }
        } catch {
            setErro('Erro ao carregar dados. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    // Define manualmente um responsável para um setor
    const definirResponsavel = async (id_setor, funcionario) => {
        setSalvando(id_setor);
        try {
            const res = await fetch('/api/admin/responsaveis-manuais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_setor: String(id_setor),
                    id_funcionario: String(funcionario.funcionario_id),
                    nome: funcionario.funcionario_nome,
                    acao: 'definir'
                })
            });
            const data = await res.json();
            if (data.sucesso) {
                const mapa = {};
                (data.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
                setSetorAberto(null);
                setBuscaFunc('');
            } else {
                setErro('Erro ao salvar. Tente novamente.');
            }
        } catch {
            setErro('Erro ao salvar. Tente novamente.');
        } finally {
            setSalvando(null);
        }
    };

    // Remove a definição manual de um setor (volta ao automático)
    const limparResponsavel = async (id_setor) => {
        setSalvando(id_setor);
        try {
            const res = await fetch('/api/admin/responsaveis-manuais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_setor: String(id_setor), acao: 'limpar' })
            });
            const data = await res.json();
            if (data.sucesso) {
                const mapa = {};
                (data.responsaveis || []).forEach(r => { mapa[String(r.id_setor)] = r; });
                setResponsaveisManuais(mapa);
            } else {
                setErro('Erro ao limpar. Tente novamente.');
            }
        } catch {
            setErro('Erro ao limpar. Tente novamente.');
        } finally {
            setSalvando(null);
        }
    };

    // Funcionários ativos filtrados pela busca no dropdown
    const funcionariosFiltrados = useMemo(() => {
        const termo = buscaFunc.toLowerCase().trim();
        return funcionarios
            .filter(f => f.ativo === 'S' || f.ativo === true)
            .filter(f => !termo || (f.funcionario_nome || '').toLowerCase().includes(termo))
            .slice(0, 30);
    }, [funcionarios, buscaFunc]);

    // Setores filtrados pela busca principal
    const setoresFiltrados = useMemo(() => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return setores;
        return setores.filter(s => s.nome.toLowerCase().includes(termo));
    }, [setores, busca]);

    const totalManuais = Object.keys(responsaveisManuais).length;

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
                <p className="text-sm text-[#a17745] dark:text-orange-300">Carregando setores e funcionários...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-bold text-[#1d150c] dark:text-white">Responsável Manual por Setor</h2>
                    <p className="text-sm text-[#a17745] dark:text-orange-300 mt-0.5">
                        Defina manualmente o responsável exibido em cada card do Diretório de Setores. Tem prioridade sobre os Grupos de Supervisor.
                    </p>
                </div>
                <button
                    onClick={carregarDados}
                    className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-[#eaddcd] dark:bg-[#2a1d0f] text-[#1d150c] dark:text-white hover:bg-primary hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Atualizar
                </button>
            </div>

            {/* Erro */}
            {erro && (
                <div className="flex items-center gap-2 p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <span className="material-symbols-outlined text-base">error</span>
                    {erro}
                </div>
            )}

            {/* Resumo */}
            {totalManuais > 0 && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                        {totalManuais} setor(es) com responsável definido manualmente
                    </p>
                </div>
            )}

            {/* Aviso informativo */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs">
                <span className="material-symbols-outlined text-base shrink-0">info</span>
                <span>Setores <strong>sem definição manual</strong> continuam usando a lógica automática dos <strong>Grupos de Supervisor</strong> configurados acima.</span>
            </div>

            {/* Busca de setor */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-700">
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-xl">search</span>
                <input
                    type="text"
                    placeholder="Buscar setor..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#1d150c] dark:text-white placeholder:text-[#a17745] dark:placeholder:text-orange-300 outline-none"
                />
                {busca && (
                    <button onClick={() => setBusca('')} className="text-[#a17745] hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                )}
            </div>

            {/* Lista de setores */}
            <div className="flex flex-col gap-2">
                {setoresFiltrados.length === 0 && (
                    <p className="text-sm text-[#a17745] dark:text-orange-300 text-center py-8">Nenhum setor encontrado.</p>
                )}
                {setoresFiltrados.map(setor => {
                    const manual = responsaveisManuais[String(setor.id)];
                    const isAberto = setorAberto === setor.id;
                    const isSalvando = salvando === setor.id;
                    // Responsável atual: manual (do estado) ou automático (do /api/setores)
                    const responsavelAtual = manual
                        ? { nome: manual.nome, isManual: true }
                        : setor.responsavel
                            ? { nome: setor.responsavel.nome, isManual: false }
                            : null;

                    return (
                        <div
                            key={setor.id}
                            className={`rounded-xl border transition-all ${manual ? 'bg-primary/5 border-primary/30 dark:border-primary/40' : 'bg-white dark:bg-[#1a130b] border-[#eaddcd] dark:border-gray-700'}`}
                        >
                            {/* Linha principal */}
                            <div className="flex items-center justify-between gap-4 p-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    {/* Ícone do setor */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${manual ? 'bg-primary text-white' : 'bg-[#eaddcd] dark:bg-[#2a1d0f] text-[#a17745] dark:text-orange-300'}`}>
                                        <span className="material-symbols-outlined text-[18px]">domain</span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-[#1d150c] dark:text-white">{setor.nome}</span>
                                            <span className="text-xs text-[#a17745] dark:text-orange-300">{setor.totalMembros} membro{setor.totalMembros !== 1 ? 's' : ''}</span>
                                            {manual && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                                    <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>edit_note</span>
                                                    MANUAL
                                                </span>
                                            )}
                                        </div>
                                        {/* Responsável atual */}
                                        <p className="text-xs text-[#1d150c] dark:text-gray-400 mt-0.5">
                                            {responsavelAtual ? (
                                                <>
                                                    <span className={`font-medium ${responsavelAtual.isManual ? 'text-primary' : 'text-[#a17745] dark:text-orange-400'}`}>
                                                        {responsavelAtual.nome}
                                                    </span>
                                                    <span className="text-[10px] ml-1 opacity-60">
                                                        ({responsavelAtual.isManual ? 'definido manualmente' : 'automático'})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="italic opacity-60">Sem responsável definido</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {manual && (
                                        <button
                                            onClick={() => limparResponsavel(setor.id)}
                                            disabled={isSalvando}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSalvando ? (
                                                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">undo</span>
                                            )}
                                            <span className="hidden sm:inline">Resetar</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSetorAberto(isAberto ? null : setor.id);
                                            setBuscaFunc('');
                                        }}
                                        disabled={isSalvando}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                        <span className="hidden sm:inline">{manual ? 'Alterar' : 'Definir'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dropdown de seleção de funcionário */}
                            {isAberto && (
                                <div className="px-4 pb-4">
                                    <div className="border border-[#eaddcd] dark:border-gray-700 rounded-xl overflow-hidden">
                                        {/* Campo de busca do funcionário */}
                                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fcfaf8] dark:bg-[#2c2217] border-b border-[#eaddcd] dark:border-gray-700">
                                            <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-lg">search</span>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Buscar funcionário ativo..."
                                                value={buscaFunc}
                                                onChange={e => setBuscaFunc(e.target.value)}
                                                className="flex-1 bg-transparent text-sm text-[#1d150c] dark:text-white placeholder:text-[#a17745] dark:placeholder:text-orange-300 outline-none"
                                            />
                                        </div>
                                        {/* Lista de funcionários */}
                                        <div className="max-h-56 overflow-y-auto">
                                            {funcionariosFiltrados.length === 0 && (
                                                <p className="text-xs text-[#a17745] dark:text-orange-300 text-center py-6">
                                                    Nenhum funcionário encontrado.
                                                </p>
                                            )}
                                            {funcionariosFiltrados.map(func => (
                                                <button
                                                    key={func.funcionario_id}
                                                    onClick={() => definirResponsavel(setor.id, func)}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/10 transition-colors border-b border-[#f4eee6] dark:border-gray-800 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-[#1d150c] dark:text-white truncate">{func.funcionario_nome}</p>
                                                        {func.usuario_email && (
                                                            <p className="text-xs text-[#a17745] dark:text-orange-300 truncate">{func.usuario_email}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

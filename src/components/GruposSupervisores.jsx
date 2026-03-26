import { useState, useEffect, useCallback } from 'react';

export default function GruposSupervisores() {
    const [grupos, setGrupos] = useState([]);
    const [supervisores, setSupervisores] = useState(new Set());
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(null);
    const [busca, setBusca] = useState('');
    const [erro, setErro] = useState(null);

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const [resGrupos, resSup] = await Promise.all([
                fetch('/api/debug/grupos-membros'),
                fetch('/api/admin/grupos-supervisores')
            ]);
            const dGrupos = await resGrupos.json();
            const dSup = await resSup.json();

            if (dGrupos.sucesso) setGrupos(dGrupos.grupos || []);
            if (dSup.sucesso) setSupervisores(new Set(dSup.ids.map(String)));
        } catch {
            setErro('Erro ao carregar dados. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    const toggleGrupo = async (id_grupo) => {
        const ehSupervisor = supervisores.has(String(id_grupo));
        setSalvando(id_grupo);
        try {
            const res = await fetch('/api/admin/grupos-supervisores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_grupo: String(id_grupo), acao: ehSupervisor ? 'remover' : 'adicionar' })
            });
            const data = await res.json();
            if (data.sucesso) {
                setSupervisores(new Set(data.ids.map(String)));
            }
        } catch {
            setErro('Erro ao salvar. Tente novamente.');
        } finally {
            setSalvando(null);
        }
    };

    const gruposFiltrados = grupos.filter(g => {
        if (!busca.trim()) return true;
        const termo = busca.toLowerCase();
        return (
            String(g.id_grupo).includes(termo) ||
            g.membros.some(m => m.nome?.toLowerCase().includes(termo))
        );
    });

    const gruposSupervisoresAtivos = grupos.filter(g => supervisores.has(String(g.id_grupo)));

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
                <p className="text-sm text-[#a17745] dark:text-orange-300">Carregando grupos do IXC...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-bold text-[#1d150c] dark:text-white">Grupos de Supervisor(a)</h2>
                    <p className="text-sm text-[#a17745] dark:text-orange-300 mt-0.5">
                        Marque os grupos do IXC que representam supervisores. Eles aparecerão como Responsável no Diretório de Setores.
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

            {erro && (
                <div className="flex items-center gap-2 p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <span className="material-symbols-outlined text-base">error</span>
                    {erro}
                </div>
            )}

            {/* Resumo dos grupos configurados */}
            {gruposSupervisoresAtivos.length > 0 && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">verified</span>
                        {gruposSupervisoresAtivos.length} grupo(s) configurado(s) como Supervisor(a):
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {gruposSupervisoresAtivos.map(g => {
                            const membroAtivo = g.membros.find(m => !m.nome?.includes('INATIVO') && !m.nome?.includes('AFASTAD'));
                            const nome = membroAtivo?.nome || g.membros[0]?.nome || '—';
                            return (
                                <span key={g.id_grupo} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                    Grupo {g.id_grupo} · {nome.split(' ').slice(0, 2).join(' ')}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Campo de busca */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a130b] border border-[#eaddcd] dark:border-gray-700">
                <span className="material-symbols-outlined text-[#a17745] dark:text-orange-300 text-xl">search</span>
                <input
                    type="text"
                    placeholder="Buscar por nº do grupo ou nome de membro..."
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

            {/* Lista de grupos */}
            <div className="flex flex-col gap-2">
                {gruposFiltrados.length === 0 && (
                    <p className="text-sm text-[#a17745] dark:text-orange-300 text-center py-8">Nenhum grupo encontrado.</p>
                )}
                {gruposFiltrados.map(grupo => {
                    const isSup = supervisores.has(String(grupo.id_grupo));
                    const salvandoEste = salvando === grupo.id_grupo;
                    const membrosAtivos = grupo.membros.filter(m => m.status === 'A');
                    const membrosExibidos = grupo.membros.slice(0, 4);

                    return (
                        <div
                            key={grupo.id_grupo}
                            className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                                isSup
                                    ? 'bg-primary/5 border-primary/30 dark:border-primary/40'
                                    : 'bg-white dark:bg-[#1a130b] border-[#eaddcd] dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isSup ? 'bg-primary text-white' : 'bg-[#eaddcd] dark:bg-[#2a1d0f] text-[#a17745] dark:text-orange-300'
                                }`}>
                                    {grupo.id_grupo}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-[#1d150c] dark:text-white">
                                            Grupo {grupo.id_grupo}
                                        </span>
                                        <span className="text-xs text-[#a17745] dark:text-orange-300">
                                            {grupo.total} membro{grupo.total !== 1 ? 's' : ''} · {membrosAtivos.length} ativo{membrosAtivos.length !== 1 ? 's' : ''}
                                        </span>
                                        {isSup && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                                                <span className="material-symbols-outlined text-xs" style={{fontSize:'12px'}}>verified</span>
                                                SUPERVISOR(A)
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#1d150c] dark:text-gray-400 mt-1 truncate">
                                        {membrosExibidos.map(m => m.nome?.split(' ').slice(0,2).join(' ')).join(', ')}
                                        {grupo.membros.length > 4 && ` e mais ${grupo.membros.length - 4}...`}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleGrupo(grupo.id_grupo)}
                                disabled={salvandoEste}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isSup
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {salvandoEste ? (
                                    <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                                ) : (
                                    <span className="material-symbols-outlined text-base">
                                        {isSup ? 'remove_circle' : 'add_circle'}
                                    </span>
                                )}
                                <span className="hidden sm:inline">{isSup ? 'Remover' : 'Marcar'}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useOrgChartData } from '../hooks/useOrgChartData';
import OrgChartEditor from './OrgChartEditor';
import SectorsHero from './sectors/SectorsHero';
import SectorsToolbar from './sectors/SectorsToolbar';
import SectorCard from './sectors/SectorCard';
import SectorRow from './sectors/SectorRow';
import OrgChart from './sectors/OrgChart';
import { SkeletonCard, SkeletonRow, ErrorState, EmptyState } from './sectors/SectorsStates';
import { semAcento } from './directory/statusColaborador';

const CHAVE_VISAO = '@Stitch:sectorsView';

// 8 esqueletos, não 6: o grid de ~28 setores em 3 colunas tem primeira dobra
// de ~2–3 fileiras, e o esqueleto deve prever a massa real.
const ESQUELETOS = 8;

export default function Sectors({ user, setCurrentView }) {
    const C = useBentoTheme();
    const [setores, setSetores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacao] = useState('nome');
    const [visao, setVisao] = useState(() => localStorage.getItem(CHAVE_VISAO) || 'grid');
    const [showEditor, setShowEditor] = useState(false);
    const { data: orgData, loaded: orgLoaded, save: saveOrgData, reset: resetOrgData } = useOrgChartData();

    const isAdmin = user?.is_admin;

    useEffect(() => { localStorage.setItem(CHAVE_VISAO, visao); }, [visao]);

    const carregar = useCallback(async () => {
        setLoading(true);
        setErro(false);
        try {
            const res = await fetch('/api/setores');
            const data = await res.json();
            if (data.sucesso) setSetores(data.setores);
            else setErro(true);
        } catch (e) {
            console.error('Erro ao buscar setores:', e);
            setErro(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    /**
     * Retorna { ok, mensagem } para o card exibir a falha inline — o `alert()`
     * anterior bloqueava a página e não dizia em qual card falhou.
     */
    const handleSaveDescription = useCallback(async (id_setor, descricao) => {
        try {
            const res = await fetch('/api/admin/setores-descricoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_setor,
                    descricao,
                    atualizado_por: user?.funcionario || user?.email || 'Sistema',
                }),
            });
            const data = await res.json();
            if (data.sucesso) {
                setSetores(prev => prev.map(s =>
                    s.id === id_setor ? { ...s, descricao_customizada: descricao } : s
                ));
                return { ok: true };
            }
            return { ok: false, mensagem: data.erro || 'O servidor recusou a alteração.' };
        } catch (e) {
            console.error('Erro salvar descricao:', e);
            return { ok: false, mensagem: 'Erro de conexão ao salvar.' };
        }
    }, [user]);

    const setoresFiltrados = useMemo(() => {
        const termo = semAcento(busca.trim());
        const filtrados = termo
            ? setores.filter(s =>
                semAcento(s.nome).includes(termo)
                || semAcento(s.responsavel?.nome || '').includes(termo))
            : [...setores];
        return filtrados.sort((a, b) =>
            ordenacao === 'membros'
                ? (Number(b.totalMembros) || 0) - (Number(a.totalMembros) || 0)
                    || a.nome.localeCompare(b.nome, 'pt-BR')
                : a.nome.localeCompare(b.nome, 'pt-BR'));
    }, [setores, busca, ordenacao]);

    const kpis = useMemo(() => {
        const totalColaboradores = setores.reduce((acc, s) => acc + (Number(s.totalMembros) || 0), 0);
        const comResponsavel = setores.filter(s => s.responsavel?.nome).length;
        return [
            { label: 'Setores', valor: setores.length },
            { label: 'Colaboradores', valor: totalColaboradores },
            {
                label: 'Com responsável',
                valor: comResponsavel,
                sub: setores.length - comResponsavel > 0 ? `${setores.length - comResponsavel} sem` : undefined,
            },
        ];
    }, [setores]);

    const textoContador = setoresFiltrados.length === 0
        ? 'Nenhum setor encontrado'
        : busca.trim()
            ? `Exibindo ${setoresFiltrados.length} de ${setores.length} setores`
            : `${setores.length} setor${setores.length !== 1 ? 'es' : ''}`;

    const emGrid = visao === 'grid';
    // gap-8 no grid: as sombras neumórficas se estendem ~36px além da caixa;
    // com calha menor as sombras de cards vizinhos viram borrão. 3 colunas máx
    // — o container é ~330px mais estreito que a viewport (sidebar + px-10).
    const classeLista = emGrid
        ? 'grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3'
        : 'flex list-none flex-col gap-2 p-0';

    return (
        // flex-1 é obrigatório: o shell do App é um flex row e, sem ele, o
        // <main> congela em max-content. px-4 md:px-10 / py-8 / max-w-[1200px]
        // / gap-8 é o sistema da Central de Vendas, a referência de espaçamento.
        <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
                <SectorsHero kpis={kpis} isLoading={loading} />

                <OrgChart
                    data={orgData}
                    loaded={orgLoaded}
                    isAdmin={isAdmin}
                    onEdit={() => setShowEditor(true)}
                />

                {showEditor && orgData && (
                    <OrgChartEditor
                        data={orgData}
                        onSave={next => { saveOrgData(next); setShowEditor(false); }}
                        onClose={() => setShowEditor(false)}
                        onReset={() => { if (confirm('Restaurar organograma padrão?')) { resetOrgData(); setShowEditor(false); } }}
                    />
                )}

                <section className="flex flex-col gap-6">
                    <div className="border-b pb-4" style={{ borderColor: C.line }}>
                        <h2 className="m-0 text-2xl font-extrabold tracking-[-0.02em]" style={{ color: C.ink }}>
                            Diretório de Setores
                        </h2>
                    </div>

                    {erro ? (
                        <ErrorState onRetry={carregar} />
                    ) : (
                        <>
                            <SectorsToolbar
                                busca={busca}
                                setBusca={setBusca}
                                ordenacao={ordenacao}
                                setOrdenacao={setOrdenacao}
                                visao={visao}
                                setVisao={setVisao}
                                isLoading={loading}
                                textoContador={textoContador}
                            />

                            {loading ? (
                                <ul className={classeLista}>
                                    {Array.from({ length: ESQUELETOS }, (_, i) =>
                                        emGrid ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />)}
                                </ul>
                            ) : setoresFiltrados.length === 0 ? (
                                <EmptyState temFiltro={!!busca.trim()} onClear={() => setBusca('')} />
                            ) : (
                                // <ul>/<li>: um diretório de setores É uma lista —
                                // o leitor de tela anuncia "lista com N itens".
                                <ul className={classeLista}>
                                    {setoresFiltrados.map(setor => (
                                        emGrid ? (
                                            <SectorCard
                                                key={setor.id}
                                                setor={setor}
                                                isAdmin={isAdmin}
                                                onSaveDescription={handleSaveDescription}
                                                setCurrentView={setCurrentView}
                                            />
                                        ) : (
                                            <SectorRow
                                                key={setor.id}
                                                setor={setor}
                                                setCurrentView={setCurrentView}
                                            />
                                        )
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import DirectoryHero from './directory/DirectoryHero';
import DirectoryToolbar from './directory/DirectoryToolbar';
import EmployeeCard from './directory/EmployeeCard';
import EmployeeRow from './directory/EmployeeRow';
import { SkeletonCard, SkeletonRow, EmptyState, ErrorState, AvisoTaxonomia } from './directory/DirectoryStates';
import GrupoSecao from './directory/GrupoSecao';
import { situacaoColaborador, semAcento, nomeProprio, SITUACOES_FILTRO } from './directory/statusColaborador';

// Quantidade por lote do scroll infinito. O esqueleto usa o MESMO número —
// antes eram 8 esqueletos para um primeiro lote de 16, e o grid dobrava de
// altura no instante em que os dados chegavam.
const LOTE = 16;

const CHAVE_VISAO = '@Stitch:directoryView';

// O IXC mantém três ids de departamento para o que a empresa trata como um
// setor só (13 = Atendimento, com 15 e 68 como desdobramentos herdados de
// migrações antigas). Filtrar por 13 precisa trazer os três — e, desde esta
// change, o CHIP também precisa contar os três, senão o número no chip
// contradiz o "Exibindo X de Y" logo abaixo dele.
const DEPTOS_MESCLADOS = { '13': ['15', '68'] };

// Mesma ordem do chip de situação (statusColaborador.js), transformada num
// mapa de prioridade: quem está na empresa hoje aparece antes de quem não
// está mais — a base real tem quase 2/3 de gente afastada/inativa, e a busca
// dominante desta tela é achar um colega que trabalha aqui.
const PRIORIDADE_SITUACAO = new Map(SITUACOES_FILTRO.map((rotulo, i) => [rotulo, i]));

/** Ids que o filtro `id` deve aceitar, já com as mesclagens aplicadas. */
function idsDoFiltro(id) {
    return [id, ...(DEPTOS_MESCLADOS[id] || [])];
}

/** Id sob o qual um colaborador deve ser contado nos chips. */
function idCanonico(id) {
    const alvo = String(id || '').trim();
    for (const [canonico, alias] of Object.entries(DEPTOS_MESCLADOS)) {
        if (alias.includes(alvo)) return canonico;
    }
    return alvo;
}

// Teto de segurança do agrupamento. Hoje o maior setor tem 53 pessoas, então
// agrupar significa renderizar tudo de uma vez — o que é justamente o que
// permite o cabeçalho de cada grupo anunciar um total que confere com o que está
// na tela. Se um setor crescer além disto, o custo de render passa a pesar mais
// que o ganho e a tela volta ao scroll infinito sem agrupar.
const TETO_AGRUPAMENTO = 120;

/**
 * Ordena as seções: supervisão primeiro, depois as maiores, "Sem grupo" por
 * último. Espelha `ordenarGrupos` do backend — as duas telas mostram a mesma
 * equipe e divergir na ordem faria parecer times diferentes.
 */
function ordenarSecoes(a, b) {
    if (!a.id !== !b.id) return a.id ? -1 : 1;
    if (a.supervisor !== b.supervisor) return a.supervisor ? -1 : 1;
    return b.itens.length - a.itens.length;
}

export default function Directory({ user }) {
    const isAdmin = user?.is_admin;

    const [colaboradores, setColaboradores] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [deptosEmpresa, setDeptosEmpresa] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const [erroTaxonomia, setErroTaxonomia] = useState(false);

    const [busca, setBusca] = useState('');
    // Inicializador lazy: `sessionStorage.getItem` no corpo do componente
    // rodava a cada render, não só na montagem.
    const [deptoFiltro, setDeptoFiltro] = useState(() => {
        const salvo = sessionStorage.getItem('@Stitch:directoryFilter');
        if (salvo) sessionStorage.removeItem('@Stitch:directoryFilter');
        return salvo || '';
    });
    const [situacaoFiltro, setSituacaoFiltro] = useState('');
    const [visao, setVisao] = useState(() => localStorage.getItem(CHAVE_VISAO) || 'grid');
    const [visibleCount, setVisibleCount] = useState(LOTE);
    const observerRef = useRef(null);

    useEffect(() => { localStorage.setItem(CHAVE_VISAO, visao); }, [visao]);

    // Reseta o scroll infinito quando o conjunto filtrado muda.
    useEffect(() => { setVisibleCount(LOTE); }, [busca, deptoFiltro, situacaoFiltro]);

    const carregar = useCallback(async () => {
        setIsLoading(true);
        setErro(false);
        setErroTaxonomia(false);
        try {
            const [resColab, resDept, resCargo, resDeptTicket] = await Promise.all([
                fetch(`/api/colaboradores${isAdmin ? '?all=true' : ''}`).catch(() => null),
                fetch('/api/departamentos-empresa').catch(() => null),
                fetch('/api/cargos').catch(() => null),
                fetch('/api/departamentos').catch(() => null),
            ]);

            if (resColab?.ok) {
                const d = await resColab.json();
                if (d.sucesso) setColaboradores(d.colaboradores || []);
                else setErro(true);
            } else {
                // Sem este ramo, queda de backend caía no EmptyState e a tela
                // dizia "Nenhum colaborador encontrado" — falha de
                // infraestrutura apresentada como fato de negócio.
                setErro(true);
            }

            let taxonomiaOk = false;
            if (resDept?.ok)       { const d = await resDept.json();       if (d.sucesso) { setDepartamentos(d.departamentos || []); taxonomiaOk = true; } }
            if (resCargo?.ok)      { const d = await resCargo.json();      if (d.sucesso) { setCargos(d.cargos || []);               taxonomiaOk = true; } }
            if (resDeptTicket?.ok) { const d = await resDeptTicket.json(); if (d.sucesso) { setDeptosEmpresa(d.departamentos || []); taxonomiaOk = true; } }

            // Falha parcial: os colaboradores vieram, mas nenhuma tabela de
            // departamento respondeu. Sem aviso, todo card fica "N/D" e cinza e
            // a tela parece funcionar.
            setErroTaxonomia(!taxonomiaOk);
        } catch (err) {
            console.error('Erro ao carregar diretório:', err);
            setErro(true);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin]);

    // Deps corretas: a versão anterior usava `isAdmin` com deps `[]`, então não
    // refazia o fetch quando o usuário resolvia de forma assíncrona — um admin
    // podia acabar vendo só os ativos.
    useEffect(() => { carregar(); }, [carregar]);

    const resolverDepartamento = useCallback((idDepto) => {
        if (!idDepto) return 'N/D';
        const id = String(idDepto).trim();
        const bruto = departamentos.find(d => String(d.id).trim() === id)?.departamento
            || cargos.find(c => String(c.id).trim() === id)?.setor
            || deptosEmpresa.find(d => String(d.id).trim() === id)?.setor;
        // Mesmo problema dos nomes de pessoa (CAIXA ALTA crua do IXC), e mesma
        // função resolve os dois — nomeProprio já lida com partícula em
        // minúscula ("Atendimento ao Cliente"), útil aqui também. O filtro de
        // "(INATIVO)" duas linhas abaixo continua funcionando porque ele
        // reconverte para maiúscula antes de comparar.
        return bruto ? nomeProprio(bruto) : 'N/D';
    }, [departamentos, cargos, deptosEmpresa]);

    // Enriquecimento numa passada só: situação extraída do nome, nome do
    // departamento CANÔNICO e um índice de busca sem acento.
    //
    // O departamento canônico corrige uma incoerência que só aparecia com dados
    // reais: o chip agrega 15 e 68 sob 13 e mostra "ATENDIMENTO", mas o card
    // chamava `resolverDepartamento(c.id_departamento)` com o id CRU e exibia
    // "SUPORTE" ou "RELACIONAMENTO". Clicar em "ATENDIMENTO (68)" devolvia 68
    // cards rotulados com três nomes diferentes, nenhum deles o do chip.
    const enriquecidos = useMemo(() => colaboradores.map(c => {
        const situacao = situacaoColaborador(c.funcionario_nome, c.ativo);
        return {
            ...c,
            _situacao: situacao,
            _deptoNome: resolverDepartamento(idCanonico(c.id_departamento)),
            // Busca sem acento: "JOSE" tem que achar "José", e vice-versa. Com
            // `toLowerCase().includes()` puro, metade dos nomes da base — que
            // são acentuados — só era encontrável digitando o acento certo.
            _busca: semAcento([situacao.nome, c.funcionario_nome, c.usuario_email, c.ramal].filter(Boolean).join(' ')),
        };
    }), [colaboradores, resolverDepartamento]);

    // Filtro só de busca — é a base das contagens dos chips, para que elas
    // reflitam a busca ativa em vez de números estáticos.
    const colaboradoresPorBusca = useMemo(() => {
        const termo = semAcento(busca.trim());
        if (!termo) return enriquecidos;
        return enriquecidos.filter(c => c._busca.includes(termo));
    }, [enriquecidos, busca]);

    const colaboradoresFiltrados = useMemo(() => {
        const aceitos = deptoFiltro ? new Set(idsDoFiltro(deptoFiltro)) : null;
        const base = (!aceitos && !situacaoFiltro)
            ? colaboradoresPorBusca
            : colaboradoresPorBusca.filter(c =>
                (!aceitos || aceitos.has(String(c.id_departamento).trim()))
                && (!situacaoFiltro || c._situacao.rotulo === situacaoFiltro)
            );
        // Com um chip de situação ativo todo mundo já está na mesma situação —
        // ordenar seria custo sem efeito. Ordenação estável: dentro de cada
        // situação, a ordem que o backend já manda (por nome) é preservada.
        if (situacaoFiltro) return base;
        return [...base].sort((a, b) =>
            (PRIORIDADE_SITUACAO.get(a._situacao.rotulo) ?? 9) - (PRIORIDADE_SITUACAO.get(b._situacao.rotulo) ?? 9));
    }, [colaboradoresPorBusca, deptoFiltro, situacaoFiltro]);

    // Contagem por situação, calculada ANTES do filtro de situação — senão o
    // chip selecionado mostraria o próprio total e os outros zerariam.
    const contagemSituacao = useMemo(() => {
        const acc = {};
        // Set criado uma vez, fora do filter — dentro dele seriam 478
        // alocações a cada mudança de filtro.
        const aceitos = deptoFiltro ? new Set(idsDoFiltro(deptoFiltro)) : null;
        const base = aceitos
            ? colaboradoresPorBusca.filter(c => aceitos.has(String(c.id_departamento).trim()))
            : colaboradoresPorBusca;
        base.forEach(c => { acc[c._situacao.rotulo] = (acc[c._situacao.rotulo] || 0) + 1; });
        return acc;
    }, [colaboradoresPorBusca, deptoFiltro]);

    // Chips e KPIs saem do MESMO useMemo. Antes eram três fontes independentes
    // e os números se contradiziam na tela ao mesmo tempo: o chip do
    // departamento 13 mostrava N e exibia N+15+68, e o KPI "Departamentos"
    // contava ids brutos enquanto a faixa de chips filtrava os "(INATIVO)".
    const { chips, kpiDeptos } = useMemo(() => {
        const map = new Map();
        colaboradoresPorBusca.forEach(c => {
            const id = idCanonico(c.id_departamento);
            if (!id) return;
            if (!map.has(id)) map.set(id, { id, nome: resolverDepartamento(id), count: 0 });
            map.get(id).count++;
        });
        const lista = [...map.values()]
            .filter(d => isAdmin || !d.nome.toUpperCase().includes('(INATIVO)'))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        return { chips: lista, kpiDeptos: lista.length };
    }, [colaboradoresPorBusca, resolverDepartamento, isAdmin]);

    const kpis = useMemo(() => {
        // Antes este KPI vinha da flag crua `ativo`, e o chip de situação vinha
        // do prefixo no nome — as duas fontes discordam em pessoas reais da
        // base (Joyce: ativo='S' mas "(AFASTADO)"; Michele: o inverso). A tela
        // mostrava dois números de "quem está ativo" ao mesmo tempo. Contar a
        // partir de `_situacao.rotulo`, a mesma fonte do chip, resolve os dois
        // de uma vez — e escopar por `colaboradoresPorBusca`, não pelo total
        // bruto, resolve a segunda contradição: "Departamentos" já reagia à
        // busca, "Colaboradores"/"Ativos" ficavam congelados.
        const ativos = colaboradoresPorBusca.filter(c => c._situacao.rotulo === 'Ativo').length;
        return [
            // Para não-admin a API não manda ?all=true, então total e ativos
            // seriam o mesmo número em duas pílulas vizinhas. Nesse caso a
            // segunda vira "Com ramal", que é informação de verdade.
            { label: 'Colaboradores', valor: colaboradoresPorBusca.length },
            isAdmin
                ? { label: 'Ativos', valor: ativos, sub: `${colaboradoresPorBusca.length - ativos} inativos` }
                : { label: 'Com ramal', valor: colaboradoresPorBusca.filter(c => c.ramal && c.ramal !== '0').length },
            { label: 'Departamentos', valor: kpiDeptos },
        ];
    }, [colaboradoresPorBusca, kpiDeptos, isAdmin]);

    // Agrupar por grupo IXC só faz sentido DENTRO de um setor: o grupo atravessa
    // setores (o de supervisão aparece em 10), então na lista completa ele
    // juntaria dez chefias sem relação entre si sob um mesmo rótulo.
    const agrupado = !!deptoFiltro && colaboradoresFiltrados.length <= TETO_AGRUPAMENTO;

    // Fatiar por LOTE e agrupar em seguida faria as seções crescerem enquanto o
    // usuário rola, e o total no cabeçalho contradiria os cards abaixo dele.
    // Quando agrupa, renderiza o conjunto inteiro e dispensa o scroll infinito.
    const visiveis = agrupado ? colaboradoresFiltrados : colaboradoresFiltrados.slice(0, visibleCount);
    const temMais = !agrupado && visibleCount < colaboradoresFiltrados.length;

    const secoes = useMemo(() => {
        if (!agrupado) return null;
        const mapa = new Map();
        for (const c of colaboradoresFiltrados) {
            const chave = c.id_grupo || 'sem';
            if (!mapa.has(chave)) {
                mapa.set(chave, {
                    id: c.id_grupo || null,
                    // `grupo_nome` já chega resolvido do backend (nome cadastrado
                    // em grupos_nomes, ou "Grupo <id>").
                    nome: c.grupo_nome || 'Sem grupo',
                    supervisor: !!c.grupo_supervisor,
                    itens: [],
                });
            }
            mapa.get(chave).itens.push(c);
        }
        return [...mapa.values()].sort(ordenarSecoes);
    }, [agrupado, colaboradoresFiltrados]);

    const sentinelRef = useCallback(node => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (node && temMais) {
            observerRef.current = new IntersectionObserver(
                entries => { if (entries[0].isIntersecting) setVisibleCount(v => v + LOTE); },
                { threshold: 0.1, rootMargin: '0px 0px 200px 0px' }
            );
            observerRef.current.observe(node);
        }
    }, [temMais]);

    useEffect(() => () => observerRef.current?.disconnect(), []);

    const textoContador = colaboradoresFiltrados.length === 0
        ? 'Nenhum colaborador encontrado'
        : `Exibindo ${visiveis.length} de ${colaboradoresFiltrados.length} colaborador${colaboradoresFiltrados.length !== 1 ? 'es' : ''}`;

    const temFiltroAtivo = !!busca || !!deptoFiltro || !!situacaoFiltro;
    const limparFiltros = useCallback(() => {
        setBusca('');
        setDeptoFiltro('');
        setSituacaoFiltro('');
    }, []);

    const emGrid = visao === 'grid';
    // 3 colunas, não 4: os breakpoints do Tailwind medem a viewport, mas o
    // conteúdo vive num container ~330px mais estreito (sidebar de 248px +
    // px-10 do main). Com 4 colunas o card ficava com ~289px e truncava o
    // e-mail, que é justamente o dado que o usuário veio buscar.
    // gap-8 no grid, e não gap-6: as sombras neumórficas do card se estendem
    // ~36px além da caixa (deslocamento 12 + desfoque 24). Com 24px de calha as
    // sombras de cards vizinhos se sobrepõem e o relevo vira borrão.
    const classeLista = emGrid
        ? 'grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3'
        : 'flex list-none flex-col gap-2 p-0';

    const renderItem = colab => {
        const Item = emGrid ? EmployeeCard : EmployeeRow;
        return (
            <Item
                key={colab.usuario_id || colab.funcionario_id}
                colab={colab}
                situacao={colab._situacao}
                departamentoNome={colab._deptoNome}
                // Agrupado: o nome fica sob o h2 do GrupoSecao (departamento),
                // então vira h3. Sem agrupamento não existe esse nível
                // intermediário — o nome É o próximo nível real depois do h1
                // do hero, então vira h2. EmployeeRow ignora a prop (não tem
                // heading, é uma linha de tabela).
                headingLevel={agrupado ? 3 : 2}
            />
        );
    };

    return (
        // flex-1 é obrigatório: o shell do App é um flex row e, sem ele, o
        // <main> congela em max-content e cola na sidebar — mx-auto e max-w
        // ficam inertes. px-4 md:px-10 / py-8 / max-w-[1200px] / gap-8 é o
        // sistema da Central de Vendas, a referência de espaçamento do projeto.
        <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">
                <DirectoryHero busca={busca} setBusca={setBusca} kpis={kpis} isLoading={isLoading} />

                {erroTaxonomia && !erro && <AvisoTaxonomia />}

                {erro ? (
                    <ErrorState onRetry={carregar} />
                ) : (
                    <div className="flex flex-col gap-6">
                        <DirectoryToolbar
                            chips={chips}
                            deptoFiltro={deptoFiltro}
                            setDeptoFiltro={setDeptoFiltro}
                            situacaoFiltro={situacaoFiltro}
                            setSituacaoFiltro={setSituacaoFiltro}
                            contagemSituacao={contagemSituacao}
                            totalPorBusca={colaboradoresPorBusca.length}
                            visao={visao}
                            setVisao={setVisao}
                            isLoading={isLoading}
                            textoContador={textoContador}
                            onLimpar={limparFiltros}
                        />

                        {isLoading ? (
                            <ul className={classeLista}>
                                {Array.from({ length: LOTE }, (_, i) =>
                                    emGrid ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />)}
                            </ul>
                        ) : colaboradoresFiltrados.length === 0 ? (
                            <EmptyState temFiltro={temFiltroAtivo} onClear={limparFiltros} />
                        ) : (
                            <>
                                {/* <ul>/<li>: um diretório de pessoas É uma lista.
                                    O leitor de tela passa a anunciar "lista com N
                                    itens" e a dar os limites de cada item. Quando
                                    agrupado, cada seção traz a sua própria <ul>,
                                    para a contagem anunciada bater com a do
                                    cabeçalho do grupo. */}
                                {agrupado ? (
                                    <div className="flex flex-col gap-8">
                                        {secoes.map(s => (
                                            <GrupoSecao
                                                key={s.id ?? 'sem'}
                                                nome={s.nome}
                                                total={s.itens.length}
                                                supervisor={s.supervisor}
                                                classeLista={classeLista}
                                            >
                                                {s.itens.map(renderItem)}
                                            </GrupoSecao>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className={classeLista}>{visiveis.map(renderItem)}</ul>
                                )}

                                {temMais && (
                                    <div ref={sentinelRef} className="flex items-center justify-center gap-2.5 py-8 text-faint">
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-[var(--accent)]" aria-hidden="true" />
                                        <span className="font-mono text-[13px]">carregando mais...</span>
                                    </div>
                                )}

                                {!temMais && colaboradoresFiltrados.length > LOTE && (
                                    <p className="m-0 py-6 text-center font-mono text-[13px] text-faint">
                                        <span className="material-symbols-outlined mr-1 align-middle text-[16px]" aria-hidden="true">check_circle</span>
                                        Todos os {colaboradoresFiltrados.length} colaboradores exibidos
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

        </main>
    );
}

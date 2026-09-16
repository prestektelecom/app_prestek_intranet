import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CoverageMap from './CoverageMap';
import CoverageHero from './coverage/CoverageHero';
import CoverageFilters from './coverage/CoverageFilters';
import RegionPanel from './coverage/RegionPanel';
import MapLegend from './coverage/MapLegend';
import OverrideModal from './coverage/OverrideModal';
import { chaveRegiao } from './coverage/constants';

// A tela era uma camada só: título, filtros, lista e estatísticas todos
// flutuando sobre o mapa em painéis translúcidos. Isso custava contraste
// (texto de 9–10px sobre imagem de satélite), escondia o título da página
// atrás de vidro fosco e, no mobile, empilhava tudo num painel com
// max-h-[70vh] e rolagem própria por cima do conteúdo.
//
// Agora a página tem hierarquia vertical — hero → filtros → lista + mapa —
// e o mapa carrega só o que é do mapa: marcadores e legenda.
export default function Coverage({ user }) {
    const isAdmin = user?.is_admin;

    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [busca, setBusca] = useState('');
    const [filtroTec, setFiltroTec] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [ordem, setOrdem] = useState('contratos');
    const [modalOverride, setModalOverride] = useState(null);
    const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
    const [vistaMobile, setVistaMobile] = useState('mapa');
    const [metaAuditoria, setMetaAuditoria] = useState(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(false);
        try {
            const resp = await fetch('/api/cobertura-ixc');
            const json = await resp.json();
            if (json.sucesso) {
                setDados(json.dados || []);
                if (json.meta) setMetaAuditoria(json.meta);
            } else {
                // Sem este ramo, uma resposta sem `sucesso` caía no mesmo
                // "Nenhuma região retornada pelo IXC" de uma consulta que
                // genuinamente não achou nada — uma falha do IXC apresentada
                // como fato de negócio.
                setErro(true);
            }
        } catch (e) {
            console.error('Erro ao carregar cobertura IXC:', e);
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    // Filtro + ordenação em useMemo: antes um useEffect copiava o resultado
    // para outro state, o que rodava um render extra a cada tecla digitada.
    const regioes = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        const filtrado = dados.filter(r => {
            if (termo && !(
                r.cidade?.toLowerCase().includes(termo) ||
                r.bairro?.toLowerCase().includes(termo)
            )) return false;
            if (filtroTec && r.tecnologia !== filtroTec) return false;
            if (filtroStatus && r.status !== filtroStatus) return false;
            return true;
        });

        return filtrado.sort((a, b) => ordem === 'alfabetica'
            ? `${a.cidade} ${a.bairro}`.localeCompare(`${b.cidade} ${b.bairro}`, 'pt-BR')
            // Maior volume primeiro: quem abre esta tela procura onde estão os
            // contratos, não a primeira região em ordem alfabética.
            : (parseInt(b.total_contratos) || 0) - (parseInt(a.total_contratos) || 0));
    }, [dados, busca, filtroTec, filtroStatus, ordem]);

    const limparFiltros = () => { setBusca(''); setFiltroTec(''); setFiltroStatus(''); };

    const handleSelecionar = useCallback((row) => {
        setRegiaoSelecionada(chaveRegiao(row));
        // No mobile a lista ocupa a tela inteira; sem isso o usuário clicava e
        // o mapa voava para a região atrás da lista, sem feedback nenhum.
        setVistaMobile('mapa');
    }, []);

    const handleSalvarOverride = () => {
        setModalOverride(null);
        carregar();
    };

    const semLocalizacao = metaAuditoria?.total_sem_localizacao || 0;

    return (
        // O shell (App.jsx) entrega um contêiner de altura fixa. Tratar esta
        // página como documento que rola desperdiçava a tela: o mapa ganhava
        // 70vh sem descontar os ~460px de hero/alerta/filtros acima dele, então
        // sobrava abaixo da dobra enquanto sobrava espaço morto no hero.
        // Agora é coluna de altura total — o mapa recebe exatamente o que resta.
        // Abaixo de lg volta a rolar, porque lá lista e mapa se empilham.
        //
        // O <main> era o único da aplicação sem flex-1. Como o shell é um flex
        // row, ele encolhia até o max-content (~1188px) e parava, colado na
        // sidebar — toda a sobra virava faixa morta à direita, e mx-auto e
        // max-w ficavam inertes (não há o que centralizar num container que já
        // tem o tamanho do conteúdo). Em zoom 100% o defeito se esconde, porque
        // o espaço disponível é ≈ o max-content; só aparece ao reduzir o zoom.
        <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-background px-4 py-4 text-foreground md:px-10 xl:overflow-hidden">
            {/* Mesmo sistema da Central de Vendas (ServicesDirectory.jsx): md:px-10
                e teto de 1200px. Contraintuitivamente a cap menor é a que resolve
                a queixa de "muito espaço em branco" — o incômodo não era a
                quantidade de margem (a Central de Vendas tem mais), era ela estar
                toda de um lado só. Simetria acima de largura.

                gap-6 e não o gap-8 de lá: a Central de Vendas é documento rolável,
                esta página tem altura travada, e cada pixel aqui sai da altura do
                mapa. O orçamento é o que o corte da BarraStatus liberou. */}
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 xl:min-h-0 xl:flex-1">

                <CoverageHero
                    dados={dados}
                    isLoading={carregando}
                    busca={busca}
                    onBuscaChange={setBusca}
                    onSincronizar={carregar}
                    isAdmin={isAdmin}
                />

                {/* Uma linha, não um bloco: é um aviso permanente (o dado não
                    muda de um dia para o outro) e gastava 50px de altura fixa
                    em cima do mapa toda vez que a página abria. */}
                {isAdmin && !carregando && semLocalizacao > 0 && (
                    <p className="flex shrink-0 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] leading-snug text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-200">
                        <span className="material-symbols-outlined shrink-0 text-[16px] text-amber-700 dark:text-amber-400">
                            location_off
                        </span>
                        <span>
                            <b className="tabular-nums">{semLocalizacao.toLocaleString('pt-BR')} contratos</b> sem
                            localização no IXC (cidade_id = 0) — não aparecem no mapa.
                        </span>
                    </p>
                )}

                <CoverageFilters
                    dados={dados}
                    filtroTec={filtroTec}
                    setFiltroTec={setFiltroTec}
                    filtroStatus={filtroStatus}
                    setFiltroStatus={setFiltroStatus}
                    busca={busca}
                    onLimpar={limparFiltros}
                />

                {/* Alternância mapa/lista — abaixo de xl, onde não cabem lado a
                    lado. De 1024 a 1279 este controle deixa de ser "coisa de
                    mobile": é o único acesso à lista em notebook. */}
                <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-2xl bg-surface-raised p-1 xl:hidden">
                    {[
                        { key: 'mapa', label: 'Mapa', icon: 'map' },
                        { key: 'lista', label: 'Lista', icon: 'format_list_bulleted' },
                    ].map(v => {
                        const ativo = vistaMobile === v.key;
                        return (
                            <button
                                key={v.key}
                                type="button"
                                onClick={() => setVistaMobile(v.key)}
                                aria-pressed={ativo}
                                // `text-[var(--accent)]` é tom de marca (~500), não
                                // de texto — media 2,63:1 sobre `--accent-soft` no
                                // claro (mesmo bug já corrigido em ChipButton.jsx e
                                // SectorsToolbar.jsx, Fases 6/7). `--accent-dark`
                                // inverte por tema e resolve nos cinco.
                                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                                    ativo
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent-dark)] ring-1 ring-inset ring-[var(--accent)]/50'
                                        : 'text-faint hover:bg-background'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[17px]">{v.icon}</span>
                                {v.label}
                            </button>
                        );
                    })}
                </div>

                {/* O split é em xl, não em lg. Os breakpoints do Tailwind medem a
                    viewport, mas o conteúdo vive num container ~330px mais estreito
                    (sidebar de 248px + px-10). Em lg isso fazia duas coisas ao
                    mesmo tempo — revelar a sidebar e dividir em duas colunas — e o
                    mapa despencava de 975px para 396px ao aumentar a janela em 1px.
                    Em xl o conteúdo já tem ~950px: lista 320 + mapa 620. */}
                <div className="grid gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(320px,380px)_1fr]">
                    {/* Lista de regiões */}
                    <section
                        className={`h-[58vh] min-h-[380px] overflow-hidden rounded-2xl border border-border bg-surface xl:h-full xl:min-h-0 ${
                            vistaMobile === 'lista' ? 'flex' : 'hidden'
                        } xl:flex`}
                        aria-label="Regiões de cobertura"
                    >
                        <RegionPanel
                            regioes={regioes}
                            carregando={carregando}
                            selecionada={regiaoSelecionada}
                            onSelecionar={handleSelecionar}
                            onConfigurar={setModalOverride}
                            isAdmin={isAdmin}
                            ordem={ordem}
                            setOrdem={setOrdem}
                        />
                    </section>

                    {/* Mapa */}
                    <section
                        className={`relative h-[58vh] min-h-[380px] overflow-hidden rounded-2xl border border-border bg-slate-900 xl:h-full xl:min-h-0 ${
                            vistaMobile === 'mapa' ? 'block' : 'hidden'
                        } xl:block`}
                        aria-label="Mapa de cobertura"
                    >
                        {carregando ? (
                            <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface">
                                <span className="material-symbols-outlined animate-spin text-3xl text-[var(--accent)]">autorenew</span>
                                <p className="text-[13px] font-semibold text-faint">Buscando regiões no IXC...</p>
                            </div>
                        ) : erro ? (
                            <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-[var(--danger-bento)]">cloud_off</span>
                                <p className="text-[13px] font-semibold text-foreground">Não foi possível carregar as regiões</p>
                                <p className="max-w-xs text-[12px] leading-relaxed text-faint">
                                    O IXC não respondeu. Isso costuma ser temporário.
                                </p>
                                <button
                                    type="button"
                                    onClick={carregar}
                                    className="mt-1 cursor-pointer rounded-xl border border-border px-4 py-2 text-[12.5px] font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : dados.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
                                <span className="material-symbols-outlined text-4xl text-muted">public_off</span>
                                <p className="text-[13px] font-semibold text-foreground">Nenhuma região retornada pelo IXC</p>
                                <button
                                    type="button"
                                    onClick={carregar}
                                    className="mt-1 cursor-pointer rounded-xl border border-border px-4 py-2 text-[12.5px] font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : (
                            <>
                                <CoverageMap
                                    dados={dados}
                                    cidadeSelecionada={regiaoSelecionada}
                                    onCidadeClick={setRegiaoSelecionada}
                                />
                                <MapLegend />
                            </>
                        )}
                    </section>
                </div>
            </div>

            {modalOverride && (
                <OverrideModal
                    registro={modalOverride}
                    onFechar={() => setModalOverride(null)}
                    onSalvar={handleSalvarOverride}
                />
            )}
        </main>
    );
}

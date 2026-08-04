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
        try {
            const resp = await fetch('/api/cobertura-ixc');
            const json = await resp.json();
            if (json.sucesso) {
                setDados(json.dados || []);
                if (json.meta) setMetaAuditoria(json.meta);
            }
        } catch (e) {
            console.error('Erro ao carregar cobertura IXC:', e);
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
        <main className="flex h-full min-h-0 flex-col overflow-y-auto bg-background px-4 py-4 text-foreground md:px-6 lg:overflow-hidden">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 lg:min-h-0 lg:flex-1">

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
                    onLimpar={limparFiltros}
                />

                {/* Alternância mapa/lista — só abaixo de lg, onde não cabem lado a lado */}
                <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-2xl bg-surface-raised p-1 lg:hidden">
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
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                                    ativo
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/50'
                                        : 'text-muted hover:bg-background'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[17px]">{v.icon}</span>
                                {v.label}
                            </button>
                        );
                    })}
                </div>

                {/* A coluna da lista só ganha largura em xl. Em lg ela fica no
                    piso de 288px — abaixo disso o card de região perde o nome do
                    bairro para o truncate. */}
                <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(288px,320px)_1fr] xl:grid-cols-[minmax(320px,380px)_1fr]">
                    {/* Lista de regiões */}
                    <section
                        className={`h-[58vh] min-h-[380px] overflow-hidden rounded-2xl border border-border bg-surface lg:h-full lg:min-h-0 ${
                            vistaMobile === 'lista' ? 'flex' : 'hidden'
                        } lg:flex`}
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
                        className={`relative h-[58vh] min-h-[380px] overflow-hidden rounded-2xl border border-border bg-slate-900 lg:h-full lg:min-h-0 ${
                            vistaMobile === 'mapa' ? 'block' : 'hidden'
                        } lg:block`}
                        aria-label="Mapa de cobertura"
                    >
                        {carregando ? (
                            <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface">
                                <span className="material-symbols-outlined animate-spin text-3xl text-[var(--accent)]">autorenew</span>
                                <p className="text-[13px] font-semibold text-muted">Buscando regiões no IXC...</p>
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

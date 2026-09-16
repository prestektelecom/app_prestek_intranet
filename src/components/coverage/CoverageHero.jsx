import React, { useMemo } from 'react';
import { HeroShell, HeroKpiTile, HeroKpiSkeleton } from '../ui/HeroShell';
import HeroSearchInput from '../ui/HeroSearchInput';

const nf = (n) => Number(n || 0).toLocaleString('pt-BR');

// Rótulos são estáticos e conhecidos em tempo de build, então o estado de
// carregamento mostra a legenda real e pulsa só o número (HeroKpiSkeleton com
// `label`). Duas razões:
//  - a caixa já nasce com a altura final, então não há salto quando os dados
//    chegam (numa página de altura travada, o salto sai do mapa);
//  - o usuário lê o que está vindo em vez de olhar barras cinzas.
const TILES = [
    { chave: 'cidades',   label: 'Cidades',        sub: 'atendidas' },
    { chave: 'regioes',   label: 'Regiões',        sub: 'cidade + bairro' },
    { chave: 'contratos', label: 'Contratos',      sub: 'ativos no IXC' },
    { chave: 'cobertura', label: 'Cobertura méd.', sub: 'das regiões com dados' },
];

export default function CoverageHero({
    dados = [],
    isLoading,
    busca,
    onBuscaChange,
    onSincronizar,
    isAdmin,
}) {
    const stats = useMemo(() => {
        const cidades = new Set(dados.map(d => d.cidade_ixc_id)).size;
        const contratos = dados.reduce((acc, d) => acc + (parseInt(d.total_contratos) || 0), 0);
        const comConfig = dados.filter(d => d.tem_override).length;
        const mapeadas = dados.filter(d => d.latitude != null && d.longitude != null).length;

        const configuradas = dados.filter(d => d.percentual_cobertura != null);
        const coberturaMedia = configuradas.length
            ? Math.round(configuradas.reduce((a, d) => a + Number(d.percentual_cobertura), 0) / configuradas.length)
            : null;

        // A distribuição por status saiu daqui: os chips de CoverageFilters já
        // publicam as mesmas contagens, e lá elas são clicáveis. Duplicar a
        // informação custava uma fileira inteira do hero — ~74px de altura fixa
        // roubados do mapa, numa página de altura travada.
        return { cidades, contratos, comConfig, mapeadas, coberturaMedia };
    }, [dados]);

    const mostraCuradoria = isAdmin && !isLoading && dados.length > 0;

    // A contagem de colunas segue isAdmin, e não `mostraCuradoria`: se dependesse
    // de !isLoading, a grade refluiria de 4 para 5 no instante em que os dados
    // chegam e TODOS os tiles mudariam de largura.
    const colunas = isAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4';

    // Quando quase nada está mapeado, o contador deixa de ser rodapé e vira
    // alerta. Era a informação mais grave da tela publicada na menor e mais
    // apagada tipografia do componente — hierarquia invertida.
    const proporcaoMapeada = dados.length ? stats.mapeadas / dados.length : 1;
    const poucoMapeado = !isLoading && dados.length > 0 && proporcaoMapeada < 0.5;

    return (
        // Retícula de pontos no lugar da grade quadrada de 40px: a grade é o
        // fundo padrão de todo dashboard, e só aparecia à esquerda mesmo (à
        // direita o painel a cobre). Os dois <div> com filter:blur() que
        // existiam antes saíram pelo mesmo motivo — os anéis vêm no próprio
        // background (`fundoHero`, dentro de HeroShell), sem DOM extra.
        <HeroShell patternId="cov-grid">
            {/* Divide já em xl (5/7), não em 2xl. O cálculo anterior estimava
                ~700px para a coluna esquerda, mas esse número incluía o botão
                Sincronizar — que agora vive no cabeçalho do painel. Sem ele a
                esquerda cabe em ~383px, e a faixa 1280–1535px (onde a altura da
                página TRAVA) deixa de renderizar o hero empilhado.

                ⚠️ Medir: a estimativa é de ~88px devolvidos ao mapa nessa faixa. */}
            <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-center xl:gap-8">
                {/* ─── Identidade + busca ─── */}
                <div className="flex flex-col gap-4 xl:col-span-5 2xl:col-span-6">
                    <div>
                        {/* O selo "Sincronizado com o IXC" saiu: custava ~34px de
                            altura para repetir o que o botão Sincronizar e o
                            contador "N de M no mapa" já dizem. */}
                        {/* Mesma escala do ServicesHero — as duas telas são irmãs
                            e liam como produtos diferentes só por causa disto. */}
                        <h1 className="m-0 font-display text-3xl font-extrabold tracking-tight leading-[1.1] text-white">
                            Central de Cobertura de Rede
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                            Gestão e monitoramento por região dos contratos do IXC.
                        </p>
                    </div>

                    {/* A busca fica sozinha na linha. Antes dividia espaço com o
                        Sincronizar, e o maxWidth nunca era atingido: 560 + 8 +
                        ~150 = 718px numa coluna de ~584px, então resolvia para
                        ~426px — a paridade de 560px com a Central de Vendas era
                        ficção. */}
                    <HeroSearchInput
                        value={busca}
                        onChange={onBuscaChange}
                        placeholder="Buscar cidade ou bairro..."
                        maxWidth={560}
                    />
                </div>

                {/* ─── Painel de instrumentos ─── */}
                {/* bg-black/60 em vez de /55, e sem backdrop-blur: vidro só lê
                    como vidro quando há conteúdo de alta frequência atrás, e
                    atrás daqui há um gradiente suave. O blur ficou só no input,
                    onde de fato cobre a retícula e os anéis. */}
                <section
                    aria-labelledby="cov-painel-titulo"
                    className="rounded-2xl border border-white/15 bg-black/60 p-4 xl:col-span-7 2xl:col-span-6"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.15] pb-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
                            <span id="cov-painel-titulo" className="truncate text-[11px] font-bold text-white">
                                Malha de cobertura
                            </span>
                        </span>

                        <div className="flex shrink-0 items-center gap-1.5">
                            <span
                                aria-live="polite"
                                className={
                                    poucoMapeado
                                        ? 'flex items-center gap-1 font-mono text-[10px] font-bold text-amber-200'
                                        : 'font-mono text-[10px] text-white/75'
                                }
                            >
                                {poucoMapeado && (
                                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">warning</span>
                                )}
                                {isLoading ? 'carregando' : `${nf(stats.mapeadas)} de ${nf(dados.length)} no mapa`}
                            </span>

                            {/* Sincronizar mora aqui, e não ao lado da busca: é
                                ação cara (refaz a coleta inteira e o mapa vira
                                spinner) que estava a 8px do controle de maior
                                frequência da tela. Aqui fica junto do contador
                                que ele atualiza — e custa zero altura, porque a
                                fileira já existia.

                                after:-inset-2 dá o alvo de toque de 44×44 sem
                                ocupar layout. */}
                            <button
                                type="button"
                                onClick={onSincronizar}
                                disabled={isLoading}
                                aria-label={isLoading ? 'Sincronizando com o IXC' : 'Sincronizar com o IXC'}
                                className="relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-white/85 transition-colors after:absolute after:-inset-2 after:content-[''] hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                            </button>
                        </div>
                    </div>

                    {/* Fileira única. A curadoria virou o 5º tile em vez de uma
                        segunda faixa com borda própria — a página tem altura
                        travada, então cada linha aqui sai da altura do mapa.
                        2×N até md: em 640px os 4 tiles davam 136px cada e o
                        subtítulo ("das regiões com dados") truncava em todos. */}
                    <dl className={`mt-3 grid grid-cols-2 gap-3 ${colunas}`}>
                        {isLoading ? (
                            TILES.map(t => <HeroKpiSkeleton key={t.chave} label={t.label} sub={t.sub} />)
                        ) : (
                            <>
                                <HeroKpiTile label="Cidades" valor={nf(stats.cidades)} sub="atendidas" />
                                <HeroKpiTile label="Regiões" valor={nf(dados.length)} sub="cidade + bairro" />
                                <HeroKpiTile label="Contratos" valor={nf(stats.contratos)} sub="ativos no IXC" />
                                <HeroKpiTile
                                    label="Cobertura méd."
                                    valor={stats.coberturaMedia != null ? `${stats.coberturaMedia}%` : '—'}
                                    sub={stats.coberturaMedia != null ? 'das regiões com dados' : 'sem dados'}
                                />
                                {/* Curadoria só interessa a quem edita os overrides. */}
                                {mostraCuradoria && (
                                    <HeroKpiTile
                                        label="Configuradas"
                                        valor={`${nf(stats.comConfig)} / ${nf(dados.length)}`}
                                        progresso={(stats.comConfig / dados.length) * 100}
                                    />
                                )}
                            </>
                        )}
                        {/* Reserva o 5º slot durante o loading para admin, senão a
                            grade de 5 colunas fica com um buraco. */}
                        {isLoading && isAdmin && <HeroKpiSkeleton label="Configuradas" sub="regiões com override" />}
                    </dl>
                </section>
            </div>
        </HeroShell>
    );
}

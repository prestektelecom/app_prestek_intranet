import React from 'react';
import ChipButton from '../ui/ChipButton';
import { TECNOLOGIAS, STATUS_OPCOES, STATUS_META, TECH_META } from './constants';

// `ChipButton` usa a cor recebida como TEXTO direto quando ela não é
// `C.accent` (pressupõe cor já calibrada, como em deptColors.js) — mas
// `TECH_META`/`STATUS_META` usam `cor` para casar com o marcador do Leaflet,
// nunca calibrada para texto. `corTexto` (mais clara) evita reprovar 4,5:1 no
// AMOLED (achado da auditoria global, Fase 16).

// Fora do componente de propósito: definido inline, `Grupo` vira um tipo novo
// a cada render e o React remonta a subárvore — o que zerava a rolagem
// horizontal dos chips justamente ao clicar num deles.
function Grupo({ titulo, children }) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <span className="hidden shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint sm:block">
                {titulo}
            </span>
            <div className="min-w-0 snap-x overflow-x-auto scroll-smooth py-1 scrollbar-hide">
                <div className="inline-flex items-center gap-2">{children}</div>
            </div>
        </div>
    );
}

// Os filtros eram dois <select> dentro da barra flutuante sobre o mapa: duas
// interações (abrir + escolher) para uma escolha de 3 opções, e sem mostrar
// quantos resultados cada uma tem. Chips resolvem em um toque e expõem a
// contagem antes do clique — o usuário não descobre "0 resultados" depois.
export default function CoverageFilters({
    dados = [],
    filtroTec,
    setFiltroTec,
    filtroStatus,
    setFiltroStatus,
    busca,
    onLimpar,
}) {
    // `busca` entra na conta porque `limparFiltros` também a zera (Coverage.jsx).
    // Sem isto: digitar uma busca não fazia aparecer nenhum affordance de limpar,
    // e clicar em "Limpar filtros" apagava o texto de um campo que o usuário não
    // estava olhando — estado mudando fora do campo visual.
    const temFiltro = Boolean(filtroTec || filtroStatus || busca);
    const contaTec = (t) => dados.filter(d => d.tecnologia === t).length;
    const contaStatus = (s) => dados.filter(d => d.status === s).length;

    return (
        // Os dois grupos só ficam lado a lado em 2xl. Somados eles pedem ~960px,
        // e o espaço real aqui dentro é a viewport menos a sidebar (248px) e o
        // px-10 do main: em xl isso dá 952px — falta por 8px, e qualquer contagem
        // de dois dígitos nos chips quebrava a linha de forma imprevisível. Só a
        // partir de 2xl o conteúdo bate no teto de 1200px e sobra folga.
        <div className="flex shrink-0 flex-col gap-2 2xl:flex-row 2xl:items-center 2xl:gap-6">
            <Grupo titulo="Tecnologia">
                <ChipButton
                    label="Todas"
                    active={!filtroTec}
                    onClick={() => setFiltroTec('')}
                />
                {TECNOLOGIAS.map(t => (
                    <ChipButton
                        key={t}
                        label={t}
                        icon={TECH_META[t]?.icon}
                        color={TECH_META[t]?.corTexto || TECH_META[t]?.cor}
                        count={contaTec(t)}
                        active={filtroTec === t}
                        onClick={() => setFiltroTec(filtroTec === t ? '' : t)}
                    />
                ))}
            </Grupo>

            <Grupo titulo="Status">
                <ChipButton
                    label="Todos"
                    active={!filtroStatus}
                    onClick={() => setFiltroStatus('')}
                />
                {STATUS_OPCOES.map(s => (
                    <ChipButton
                        key={s}
                        label={s}
                        icon={STATUS_META[s]?.icon}
                        color={STATUS_META[s]?.corTexto || STATUS_META[s]?.cor}
                        count={contaStatus(s)}
                        active={filtroStatus === s}
                        onClick={() => setFiltroStatus(filtroStatus === s ? '' : s)}
                    />
                ))}
            </Grupo>

            {/* A contagem de resultados vive no cabeçalho do painel de regiões,
                logo abaixo — repetir aqui só custava largura na linha. */}
            {temFiltro && (
                <button
                    type="button"
                    onClick={onLimpar}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 self-start rounded-xl px-2.5 py-1.5 text-xs font-bold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] 2xl:ml-auto 2xl:self-auto"
                >
                    <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                    Limpar filtros
                </button>
            )}
        </div>
    );
}

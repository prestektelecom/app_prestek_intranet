import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import ChipButton from '../ui/ChipButton';
import { useDeptColor } from './deptColors';
import { coresSituacao } from './EmployeeCard';
import { SITUACOES_FILTRO } from './statusColaborador';

// Quantos departamentos ficam na faixa antes do resto ir para o seletor.
//
// Não é um número redondo escolhido no olho. Na base real são 25 departamentos
// para 478 pessoas, e a distribuição é uma cauda longa clássica:
//
//   os 8 maiores            → 424 pessoas (89%)
//   os 15 menores (≤6 cada) →  46 pessoas (9,6%)
//
// Ou seja: 60% dos chips disputavam espaço horizontal para servir menos de 10%
// dos usuários da busca. E como a ordenação era alfabética, os TRÊS primeiros
// chips depois de "Todos" eram "(INATIVO) ATENDIMENTO", "(INATIVO) SUPERVISÃO
// TÉCNICA" e "(INATIVO) TECNICO" — os parênteses ordenam antes das letras.
const VISIVEIS = 8;

const SEG_BASE = 'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const SEG_ATIVO = 'bg-[var(--accent-soft)] text-[var(--accent-dark)] ring-1 ring-inset ring-[var(--accent)]/50';
const SEG_INATIVO = 'text-muted hover:bg-background';

export default function DirectoryToolbar({
    chips,
    deptoFiltro,
    setDeptoFiltro,
    situacaoFiltro,
    setSituacaoFiltro,
    contagemSituacao,
    totalPorBusca,
    visao,
    setVisao,
    isLoading,
    textoContador,
    onLimpar,
}) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const [abertoMais, setAbertoMais] = useState(false);

    // A faixa mostra os maiores; o seletor recebe o resto. Se o departamento
    // selecionado estiver na cauda, ele sobe para a faixa — senão o filtro
    // ativo ficaria invisível, escondido atrás de um botão.
    const { naFaixa, naCauda } = useMemo(() => {
        const ordenados = [...chips].sort((a, b) => b.count - a.count || a.nome.localeCompare(b.nome, 'pt-BR'));
        const faixa = ordenados.slice(0, VISIVEIS);
        const cauda = ordenados.slice(VISIVEIS);
        const iSel = cauda.findIndex(c => String(c.id) === deptoFiltro);
        if (iSel >= 0) faixa.push(cauda.splice(iSel, 1)[0]);
        return { naFaixa: faixa, naCauda: cauda };
    }, [chips, deptoFiltro]);

    const deptoAtivo = chips.find(c => String(c.id) === deptoFiltro);
    const temFiltro = !!deptoFiltro || !!situacaoFiltro;

    return (
        <div className="flex flex-col gap-4">
            {/* ── Linha 1: situação + visão ──────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Filtro de situação. Não existia, e é mais útil que a maioria
                    dos 25 departamentos: "quem está de férias" é pergunta
                    corrente, e a informação já estava na base — presa dentro do
                    nome, como prefixo em caixa alta. */}
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por situação">
                    {SITUACOES_FILTRO.map(rotulo => {
                        const n = contagemSituacao[rotulo] || 0;
                        if (!n && situacaoFiltro !== rotulo) return null;
                        const ativo = situacaoFiltro === rotulo;
                        const cor = coresSituacao(
                            rotulo === 'Ativo' ? 'ok' : rotulo === 'Férias' ? 'info' : rotulo === 'Afastado' ? 'aviso' : 'neutro',
                            C
                        );
                        return (
                            <button
                                key={rotulo}
                                type="button"
                                aria-pressed={ativo}
                                onClick={() => setSituacaoFiltro(ativo ? '' : rotulo)}
                                className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                style={{
                                    background: ativo ? cor.fundo : C.surface,
                                    color: ativo ? cor.texto : C.ink2,
                                    border: `1.5px solid ${ativo ? cor.borda : C.line}`,
                                }}
                            >
                                {rotulo}
                                <span className="font-mono text-[11px] font-bold tabular-nums opacity-70">{n}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-2xl bg-surface-raised p-1 sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setVisao('grid')}
                        aria-pressed={visao === 'grid'}
                        className={`${SEG_BASE} ${visao === 'grid' ? SEG_ATIVO : SEG_INATIVO}`}
                    >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">grid_view</span>
                        Cards
                    </button>
                    <button
                        type="button"
                        onClick={() => setVisao('lista')}
                        aria-pressed={visao === 'lista'}
                        className={`${SEG_BASE} ${visao === 'lista' ? SEG_ATIVO : SEG_INATIVO}`}
                    >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">format_list_bulleted</span>
                        Lista
                    </button>
                </div>
            </div>

            {/* ── Linha 2: departamentos ─────────────────────────────────── */}
            <div className="flex min-w-0 items-start gap-2">
                <nav
                    aria-label="Filtrar por departamento"
                    className="scrollbar-hide -mx-1 min-w-0 flex-1 snap-x snap-mandatory scroll-smooth overflow-x-auto px-1 py-1"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 24px), transparent 100%)',
                    }}
                >
                    {isLoading ? (
                        <div className="flex gap-2" aria-hidden="true">
                            {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="h-[38px] w-28 shrink-0 animate-pulse rounded-full bg-surface-raised" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <ChipButton
                                label="Todos"
                                count={totalPorBusca}
                                active={!deptoFiltro}
                                onClick={() => setDeptoFiltro('')}
                                color={C.accent}
                            />
                            {naFaixa.map(chip => (
                                <ChipButton
                                    key={chip.id}
                                    label={chip.nome}
                                    count={chip.count}
                                    active={deptoFiltro === String(chip.id)}
                                    onClick={() => setDeptoFiltro(String(chip.id))}
                                    color={corDe(chip.nome).tinta}
                                />
                            ))}
                        </div>
                    )}
                </nav>

                {!isLoading && naCauda.length > 0 && (
                    <SeletorCauda
                        aberto={abertoMais}
                        setAberto={setAbertoMais}
                        itens={naCauda}
                        onEscolher={id => { setDeptoFiltro(id); setAbertoMais(false); }}
                        C={C}
                    />
                )}
            </div>

            {/* ── Linha 3: contador + resumo do filtro ───────────────────── */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {/* aria-live é o que faz o scroll infinito existir para leitor de
                    tela: sem isso, 16 itens entram no DOM sem anúncio nenhum. */}
                {/* 12px não existe na rampa (rótulo/mono é 13px); `muted` como
                    texto real reprova a 2,8:1 — mesmo par corrigido em outras
                    fases (ink2 é o token seguro para texto pequeno). */}
                <p
                    aria-live="polite"
                    className="m-0 min-h-[18px] font-mono text-[13px] tracking-[0.05em]"
                    style={{ color: C.ink2 }}
                >
                    {isLoading ? '' : textoContador}
                </p>

                {temFiltro && !isLoading && (
                    <>
                        <span className="text-[13px]" style={{ color: C.ink2 }} aria-hidden="true">·</span>
                        {situacaoFiltro && <Pilula rotulo={situacaoFiltro} onRemover={() => setSituacaoFiltro('')} C={C} />}
                        {deptoAtivo && <Pilula rotulo={deptoAtivo.nome} onRemover={() => setDeptoFiltro('')} C={C} />}
                        <button
                            type="button"
                            onClick={onLimpar}
                            className="cursor-pointer rounded text-[13px] font-semibold underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            style={{ color: C.ink2 }}
                        >
                            limpar tudo
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

/** Pílula do filtro ativo, com o × que remove aquele filtro específico. */
function Pilula({ rotulo, onRemover, C }) {
    return (
        <span
            className="inline-flex max-w-[220px] items-center gap-1 rounded-full py-0.5 pl-2.5 pr-1 text-[13px] font-semibold"
            style={{ background: tone(C.accent, 0.1), color: C.accentDark, border: `1px solid ${tone(C.accent, 0.25)}` }}
        >
            <span className="truncate">{rotulo}</span>
            <button
                type="button"
                onClick={onRemover}
                aria-label={`Remover filtro ${rotulo}`}
                // after:-inset-1.5 leva o alvo de ~20px para 44px sem ocupar
                // layout — o × visual continua do mesmo tamanho.
                className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors after:absolute after:-inset-1.5 after:content-[''] hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
            </button>
        </span>
    );
}

/**
 * Seletor dos departamentos da cauda, com busca.
 *
 * Um <select> nativo resolveria o overflow, mas não mostra contagem nem permite
 * busca — e a cauda tem 15 entradas com nomes longos ("SEGURANÇA ELETRÔNICA E
 * MONITORAMENTO"). O popover mantém a contagem visível, que é o que diz ao
 * usuário se vale a pena clicar.
 */
function SeletorCauda({ aberto, setAberto, itens, onEscolher, C }) {
    const [busca, setBusca] = useState('');
    const caixaRef = useRef(null);
    const botaoRef = useRef(null);

    useEffect(() => {
        if (!aberto) return;
        const clique = e => {
            if (!caixaRef.current?.contains(e.target) && !botaoRef.current?.contains(e.target)) setAberto(false);
        };
        const tecla = e => {
            if (e.key === 'Escape') { setAberto(false); botaoRef.current?.focus(); }
        };
        document.addEventListener('mousedown', clique);
        document.addEventListener('keydown', tecla);
        return () => {
            document.removeEventListener('mousedown', clique);
            document.removeEventListener('keydown', tecla);
        };
    }, [aberto, setAberto]);

    useEffect(() => { if (!aberto) setBusca(''); }, [aberto]);

    const filtrados = useMemo(() => {
        const t = busca
            .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
        if (!t) return itens;
        return itens.filter(i =>
            i.nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(t));
    }, [itens, busca]);

    return (
        <div className="relative shrink-0">
            <button
                ref={botaoRef}
                type="button"
                onClick={() => setAberto(a => !a)}
                aria-expanded={aberto}
                aria-haspopup="dialog"
                className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{ background: C.surface, color: C.ink2, border: `1.5px dashed ${C.line}` }}
            >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">more_horiz</span>
                <span className="hidden sm:inline">Mais {itens.length}</span>
                <span className="sm:hidden">{itens.length}</span>
            </button>

            {aberto && (
                <div
                    ref={caixaRef}
                    role="dialog"
                    aria-label="Outros departamentos"
                    className="absolute right-0 z-[1050] mt-2 flex max-h-[340px] w-[280px] flex-col overflow-hidden rounded-2xl shadow-xl"
                    style={{ background: C.surface, border: `1px solid ${C.line}` }}
                >
                    <div className="shrink-0 p-2" style={{ borderBottom: `1px solid ${C.line}` }}>
                        <input
                            type="text"
                            autoFocus
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            placeholder="Filtrar departamento..."
                            aria-label="Filtrar departamento"
                            className="w-full rounded-xl px-3 py-2 text-[13px] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            style={{ background: C.surfaceSoft, color: C.ink, border: `1px solid ${C.line}` }}
                        />
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
                        {filtrados.length === 0 ? (
                            <p className="m-0 px-2 py-6 text-center text-[13px]" style={{ color: C.ink2 }}>
                                Nenhum departamento com esse nome.
                            </p>
                        ) : filtrados.map(i => (
                            <button
                                key={i.id}
                                type="button"
                                onClick={() => onEscolher(String(i.id))}
                                className="flex w-full min-h-[40px] cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[var(--surface-raised)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                style={{ color: C.ink2 }}
                            >
                                <span className="min-w-0 flex-1 truncate">{i.nome}</span>
                                <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums" style={{ color: C.ink2 }}>
                                    {i.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

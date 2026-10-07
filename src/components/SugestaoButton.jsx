import { useState, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { useDismissable, makeTrapTab } from '../hooks/useDismissable';
import { tone } from '../utils/tone';
import { Icons } from './common/Icons';
import { TIPOS, LIMITES } from '../constants/sugestoes';

const FOCO = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const CAMPO = `min-h-[44px] w-full rounded-xl border px-3 py-2 text-base sm:text-sm ${FOCO}`;

// Borda de campo é componente de interface: precisa de 3:1 (WCAG 1.4.11); `line` rende ~1,2:1.
const estiloCampo = (C, comErro) => ({ backgroundColor: C.surfaceSoft, color: C.ink, borderColor: comErro ? C.danger : C.ink2 });

async function enviarSugestao(corpo) {
    const res = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || dados.sucesso === false) {
        const erro = new Error(dados.erro || 'Não foi possível enviar. Tente de novo.');
        erro.campo = dados.campo;
        throw erro;
    }
}

function Contador({ valor, max }) {
    const C = useBentoTheme();
    return <span className="text-xs tabular-nums" style={{ color: valor > max ? C.dangerStrong : C.ink2 }}>{valor}/{max}</span>;
}

function Campo({ id, rotulo, erro, contador, children }) {
    const C = useBentoTheme();
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-sm font-semibold" style={{ color: C.ink }}>{rotulo}</label>
                {contador}
            </div>
            {children}
            {erro && <p id={`${id}-erro`} role="alert" className="m-0 text-sm" style={{ color: C.dangerStrong }}>{erro}</p>}
        </div>
    );
}

// ─── Popup ──────────────────────────────────────────────────────────────────
// Mesmo padrão do TiSupportModal: Escape, clique fora, foco de entrada/retorno
// (useDismissable) e trap de Tab. Camada 1100 (DESIGN.md §6, "Drawers e modais").

function SugestaoModal({ onClose }) {
    const C = useBentoTheme();
    const uid = useId();
    const ref = useRef(null);
    const trapTab = makeTrapTab(ref);
    const [tipo, setTipo] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [erros, setErros] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [falha, setFalha] = useState(null);
    const [enviada, setEnviada] = useState(false);

    useDismissable(ref, { open: true, onClose, lockScroll: true });

    const validar = () => {
        const e = {};
        if (!tipo) e.tipo = 'Escolha o tipo da sugestão.';
        const t = titulo.trim().length;
        if (t < LIMITES.titulo.min || t > LIMITES.titulo.max) e.titulo = `O título precisa ter de ${LIMITES.titulo.min} a ${LIMITES.titulo.max} caracteres.`;
        const d = descricao.trim().length;
        if (d < LIMITES.descricao.min || d > LIMITES.descricao.max) e.descricao = `A descrição precisa ter de ${LIMITES.descricao.min} a ${LIMITES.descricao.max} caracteres.`;
        return e;
    };

    const enviar = async (ev) => {
        ev.preventDefault();
        setFalha(null);
        const e = validar();
        setErros(e);
        const primeiro = ['tipo', 'titulo', 'descricao'].find((k) => e[k]);
        if (primeiro) {
            document.getElementById(`${uid}-${primeiro}`)?.focus();
            return;
        }
        setEnviando(true);
        try {
            await enviarSugestao({ tipo, titulo, descricao });
            setEnviada(true);
        } catch (err) {
            if (err.campo) {
                setErros({ [err.campo]: err.message });
                document.getElementById(`${uid}-${err.campo}`)?.focus();
            } else {
                setFalha(err.message);
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4"
            style={{ zIndex: 1100, background: C.scrim, backdropFilter: 'blur(6px)' }}
        >
            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${uid}-titulo-modal`}
                onKeyDown={trapTab}
                className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border sm:max-h-[90dvh] sm:rounded-[24px]"
                style={{
                    background: C.popover,
                    borderColor: C.line,
                    color: C.ink,
                    boxShadow: `0 32px 80px ${tone(C.accentDeep, 0.18)}, 0 4px 16px ${tone(C.ink, 0.08)}`,
                }}
            >
                <div className="flex items-start justify-between gap-3 border-b p-4 sm:p-5" style={{ borderColor: C.line }}>
                    <div>
                        <h2 id={`${uid}-titulo-modal`} className="m-0 font-display text-xl font-extrabold tracking-tight">
                            {enviada ? 'Sugestão enviada' : 'Enviar sugestão'}
                        </h2>
                        {!enviada && (
                            <p className="m-0 mt-1 text-sm" style={{ color: C.ink2 }}>
                                Viu algo que pode melhorar na intranet? Conte para a TI.
                            </p>
                        )}
                    </div>
                    <button
                        type="button" onClick={onClose} aria-label="Fechar"
                        className={`-m-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${FOCO}`}
                        style={{ color: C.ink2 }}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                </div>

                {enviada ? (
                    <div className="flex flex-col items-start gap-4 overflow-y-auto p-4 sm:p-5">
                        <p role="status" className="m-0 text-sm leading-relaxed" style={{ color: C.ink }}>
                            Obrigado! A TI recebeu sua sugestão por e-mail e vai avaliar.
                        </p>
                        <button
                            type="button" onClick={onClose}
                            className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-extrabold ${FOCO}`}
                            style={{ backgroundColor: C.accent, color: C.onAccent }}
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={enviar} noValidate className="flex flex-col gap-4 overflow-y-auto p-4 sm:p-5">
                        <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
                            <legend className="mb-1.5 p-0 text-sm font-semibold" style={{ color: C.ink }}>Tipo</legend>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {TIPOS.map((t, i) => {
                                    const ativo = tipo === t.id;
                                    return (
                                        <label
                                            key={t.id}
                                            className="flex min-h-[44px] cursor-pointer flex-col items-start rounded-xl border px-3 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]"
                                            style={{ backgroundColor: ativo ? C.accentSoft : C.surfaceSoft, borderColor: ativo ? C.accent : C.ink2, color: C.ink }}
                                        >
                                            <input
                                                id={i === 0 ? `${uid}-tipo` : undefined}
                                                type="radio" name={`${uid}-tipo`} value={t.id} checked={ativo}
                                                onChange={() => setTipo(t.id)} className="sr-only"
                                            />
                                            <span className="text-sm font-bold" style={{ color: ativo ? C.accentDark : C.ink }}>{t.rotulo}</span>
                                            <span className="text-xs" style={{ color: C.ink2 }}>{t.dica}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {erros.tipo && <p role="alert" className="m-0 text-sm" style={{ color: C.dangerStrong }}>{erros.tipo}</p>}
                        </fieldset>

                        <Campo id={`${uid}-titulo`} rotulo="Título" erro={erros.titulo} contador={<Contador valor={titulo.length} max={LIMITES.titulo.max} />}>
                            <input
                                id={`${uid}-titulo`} type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                                aria-invalid={Boolean(erros.titulo)} aria-describedby={erros.titulo ? `${uid}-titulo-erro` : undefined}
                                autoComplete="off" className={CAMPO} style={estiloCampo(C, erros.titulo)}
                            />
                        </Campo>

                        <Campo id={`${uid}-descricao`} rotulo="Descrição" erro={erros.descricao} contador={<Contador valor={descricao.length} max={LIMITES.descricao.max} />}>
                            <textarea
                                id={`${uid}-descricao`} rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)}
                                aria-invalid={Boolean(erros.descricao)} aria-describedby={erros.descricao ? `${uid}-descricao-erro` : `${uid}-ajuda`}
                                className={`${CAMPO} resize-y`} style={estiloCampo(C, erros.descricao)}
                            />
                            <p id={`${uid}-ajuda`} className="m-0 text-xs" style={{ color: C.ink2 }}>
                                Seu nome vai junto com a sugestão. Não escreva senhas nem dados de clientes.
                            </p>
                        </Campo>

                        {falha && <p role="alert" className="m-0 text-sm" style={{ color: C.dangerStrong }}>{falha}</p>}

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button" onClick={onClose}
                                className={`inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 text-sm font-bold ${FOCO}`}
                                style={{ borderColor: C.ink2, color: C.ink2 }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit" disabled={enviando}
                                className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-extrabold disabled:opacity-60 ${FOCO}`}
                                style={{ backgroundColor: C.accent, color: C.onAccent }}
                            >
                                {enviando ? 'Enviando…' : 'Enviar sugestão'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Botão no Header ────────────────────────────────────────────────────────
// Fixo na borda direita, no meio da altura (montado no App.jsx, não no Header:
// o backdrop-filter do Header prende elementos fixed). Camada 50; o popup abre na 1100. Chama atenção em loop contínuo
// (index.css, `sug-btn-*`), ciclo de 3 s com respiro.

// Leque de raios para a esquerda: inclinação (graus) em relação ao eixo horizontal.
const RAIOS = [
    { x: -2, a: -50 }, { x: -1, a: -25 }, { x: 0, a: 0 }, { x: 1, a: 25 }, { x: 2, a: 50 },
];

export default function SugestaoButton() {
    const C = useBentoTheme();
    const [aberto, setAberto] = useState(false);

    const abrir = () => setAberto(true);

    return (
        <>
            {/* O wrapper carrega o quique; o botão, o hover/press. */}
            {/* Posição: borda direita, meio da altura. Camada 50 (flutuante leve), abaixo do chrome. */}
            <div className="fixed right-3 top-1/2 -mt-4" style={{ zIndex: 50 }}>
            <div className="sug-btn-wrap">
                <button
                    type="button"
                    onClick={abrir}
                    aria-haspopup="dialog"
                    aria-expanded={aberto}
                    aria-label="Enviar sugestão"
                    // 32 px visíveis; o `after` estende a área de toque para 44 px (AGENTS.md, princípio 5).
                    className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 ease-out after:absolute after:-inset-1.5 after:content-[''] hover:scale-110 active:scale-95 ${FOCO}`}
                    style={{
                        backgroundColor: C.accent,
                        color: C.onAccent,
                        boxShadow: `0 4px 10px -4px ${tone(C.accentDeep, 0.55)}`,
                    }}
                >
                    <span className="sug-btn-ring" aria-hidden="true" />
                    <span className="sug-btn-ring sug-btn-ring--2" aria-hidden="true" />
                    {RAIOS.map((r, i) => (
                        <span key={r.x} className="sug-btn-ray" aria-hidden="true" style={{ '--a': `${r.a}deg`, animationDelay: `${(i % 2) * 0.3}s` }} />
                    ))}
                    <span className="sug-btn-bulb">
                        <Icons.Lightbulb />
                    </span>
                </button>
                <span
                    className="sug-btn-balao"
                    aria-hidden="true"
                    style={{ background: C.popover, color: C.ink, border: `1.5px solid ${C.accent}`, boxShadow: `0 6px 16px -8px ${tone(C.accentDeep, 0.45)}` }}
                >
                    Tem uma ideia?
                </span>
            </div>
            </div>
            {/* Portal no body: o Header tem backdrop-filter, que prende descendentes fixed dentro dele. */}
            {aberto && createPortal(<SugestaoModal onClose={() => setAberto(false)} />, document.body)}
        </>
    );
}

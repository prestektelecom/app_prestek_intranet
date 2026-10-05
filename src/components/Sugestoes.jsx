import { useState, useEffect, useCallback, useId } from 'react';
import { useBentoTheme } from '../hooks/useBentoTheme';
import { Icons } from './common/Icons';
import { TIPOS, STATUS, LIMITES, rotuloTipo, infoStatus, podeGerirSugestoes } from '../constants/sugestoes';

const FOCO = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const CAMPO = `min-h-[44px] w-full rounded-xl border px-3 py-2 text-base sm:text-sm ${FOCO}`;

function formatarDataHora(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function chamar(url, opcoes) {
    const res = await fetch(url, opcoes);
    const corpo = await res.json().catch(() => ({}));
    if (!res.ok || corpo.sucesso === false) {
        const erro = new Error(corpo.erro || 'Não foi possível concluir. Tente de novo.');
        erro.campo = corpo.campo;
        throw erro;
    }
    return corpo;
}

// ─── Peças ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const C = useBentoTheme();
    const { rotulo, tom } = infoStatus(status);
    const cor = {
        neutro: { bg: C.lineSoft, texto: C.ink2 },
        aviso: { bg: C.warningSoft, texto: C.warningStrong },
        destaque: { bg: C.accentSoft, texto: C.accentDark },
        sucesso: { bg: C.successSoft, texto: C.successStrong },
        perigo: { bg: C.dangerSoft, texto: C.dangerStrong },
    }[tom];
    return (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider" style={{ backgroundColor: cor.bg, color: cor.texto }}>
            {rotulo}
        </span>
    );
}

function Contador({ valor, max, id }) {
    const C = useBentoTheme();
    const estourou = valor > max;
    return (
        <span id={id} className="text-xs tabular-nums" style={{ color: estourou ? C.dangerStrong : C.ink2 }}>
            {valor}/{max}
        </span>
    );
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

function estiloCampo(C, comErro) {
    // Borda de campo é componente de interface: precisa de 3:1 (WCAG 1.4.11); `line` rende ~1,2:1.
    return { backgroundColor: C.surfaceSoft, color: C.ink, borderColor: comErro ? C.danger : C.ink2 };
}

// ─── Formulário de envio ────────────────────────────────────────────────────

function FormularioSugestao({ onEnviada }) {
    const C = useBentoTheme();
    const uid = useId();
    const [tipo, setTipo] = useState('');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [erros, setErros] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [aviso, setAviso] = useState(null);

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
        setAviso(null);
        const e = validar();
        setErros(e);
        const primeiro = ['tipo', 'titulo', 'descricao'].find((k) => e[k]);
        if (primeiro) {
            document.getElementById(`${uid}-${primeiro}`)?.focus();
            return;
        }

        setEnviando(true);
        try {
            const { sugestao } = await chamar('/api/sugestoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo, titulo, descricao }),
            });
            setTipo(''); setTitulo(''); setDescricao(''); setErros({});
            setAviso({ ok: true, texto: 'Sugestão enviada. Obrigado! Você acompanha o andamento na lista abaixo.' });
            onEnviada(sugestao);
        } catch (err) {
            if (err.campo) setErros({ [err.campo]: err.message });
            else setAviso({ ok: false, texto: err.message });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4 rounded-[20px] border p-4 sm:p-6" style={{ backgroundColor: C.surface, borderColor: C.line }} aria-labelledby={`${uid}-titulo-form`}>
            <h2 id={`${uid}-titulo-form`} className="m-0 text-lg font-extrabold" style={{ color: C.ink }}>Nova sugestão</h2>

            <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-describedby={erros.tipo ? `${uid}-tipo-erro` : undefined}>
                <legend className="mb-1.5 p-0 text-sm font-semibold" style={{ color: C.ink }}>Tipo</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {TIPOS.map((t, i) => {
                        const ativo = tipo === t.id;
                        return (
                            <label
                                key={t.id}
                                className="flex min-h-[44px] cursor-pointer flex-col items-start rounded-xl border px-3 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]"
                                style={{
                                    backgroundColor: ativo ? C.accentSoft : C.surfaceSoft,
                                    borderColor: ativo ? C.accent : C.ink2,
                                    color: C.ink,
                                }}
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
                {erros.tipo && <p id={`${uid}-tipo-erro`} role="alert" className="m-0 text-sm" style={{ color: C.dangerStrong }}>{erros.tipo}</p>}
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
                    Seu nome aparece para a equipe que avalia. Não escreva senhas nem dados de clientes.
                </p>
            </Campo>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="submit" disabled={enviando}
                    className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-extrabold disabled:opacity-60 ${FOCO}`}
                    style={{ backgroundColor: C.accent, color: C.onAccent }}
                >
                    {enviando ? 'Enviando…' : 'Enviar sugestão'}
                </button>
                <p role="status" className="m-0 text-sm" style={{ color: aviso?.ok ? C.successStrong : C.dangerStrong }}>
                    {aviso?.texto}
                </p>
            </div>
        </form>
    );
}

// ─── Cartão de sugestão (autor e gestão) ────────────────────────────────────

function CartaoSugestao({ s, gestao, onAtualizada }) {
    const C = useBentoTheme();
    const uid = useId();
    const [status, setStatus] = useState(s.status);
    const [resposta, setResposta] = useState(s.resposta || '');
    const [salvando, setSalvando] = useState(false);
    const [msg, setMsg] = useState(null);

    const mudou = status !== s.status || resposta.trim() !== (s.resposta || '');

    const salvar = async () => {
        setSalvando(true);
        setMsg(null);
        try {
            const corpo = {};
            if (status !== s.status) corpo.status = status;
            if (resposta.trim() !== (s.resposta || '')) corpo.resposta = resposta;
            const { sugestao } = await chamar(`/api/sugestoes/${s.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpo),
            });
            onAtualizada(sugestao);
            setMsg({ ok: true, texto: 'Salvo.' });
        } catch (err) {
            setMsg({ ok: false, texto: err.message });
        } finally {
            setSalvando(false);
        }
    };

    return (
        <li className="flex flex-col gap-3 rounded-[20px] border p-4 sm:p-5" style={{ backgroundColor: C.surface, borderColor: C.line }}>
            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={s.status} />
                <span className="text-xs font-semibold" style={{ color: C.ink2 }}>{rotuloTipo(s.tipo)}</span>
                <span className="text-xs" style={{ color: C.ink2 }}>
                    · {gestao && s.usuario_nome ? `${s.usuario_nome} · ` : ''}{formatarDataHora(s.criado_em)}
                </span>
            </div>
            <h3 className="m-0 break-words text-base font-extrabold" style={{ color: C.ink }}>{s.titulo}</h3>
            <p className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ color: C.ink2 }}>{s.descricao}</p>

            {!gestao && s.resposta && (
                <div className="rounded-xl border p-3" style={{ backgroundColor: C.accentSoft, borderColor: C.accent }}>
                    <p className="m-0 text-xs font-bold uppercase tracking-wider" style={{ color: C.accentDark }}>Resposta da equipe</p>
                    <p className="m-0 mt-1 whitespace-pre-wrap break-words text-sm" style={{ color: C.ink }}>{s.resposta}</p>
                </div>
            )}

            {gestao && (
                <div className="flex flex-col gap-3 border-t pt-3" style={{ borderColor: C.line }}>
                    <div className="flex flex-col gap-1.5 sm:max-w-xs">
                        <label htmlFor={`${uid}-status`} className="text-sm font-semibold" style={{ color: C.ink }}>Status</label>
                        <select id={`${uid}-status`} value={status} onChange={(e) => setStatus(e.target.value)} className={CAMPO} style={estiloCampo(C, false)}>
                            {STATUS.map((o) => <option key={o.id} value={o.id}>{o.rotulo}</option>)}
                        </select>
                    </div>
                    <Campo id={`${uid}-resposta`} rotulo="Resposta ao autor" contador={<Contador valor={resposta.length} max={LIMITES.resposta.max} />}>
                        <textarea id={`${uid}-resposta`} rows={2} value={resposta} onChange={(e) => setResposta(e.target.value)} className={`${CAMPO} resize-y`} style={estiloCampo(C, resposta.length > LIMITES.resposta.max)} />
                    </Campo>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button" onClick={salvar} disabled={!mudou || salvando || resposta.length > LIMITES.resposta.max}
                            className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-extrabold disabled:opacity-50 ${FOCO}`}
                            style={{ backgroundColor: C.accent, color: C.onAccent }}
                        >
                            {salvando ? 'Salvando…' : 'Salvar'}
                        </button>
                        <p role="status" className="m-0 text-sm" style={{ color: msg?.ok ? C.successStrong : C.dangerStrong }}>{msg?.texto}</p>
                    </div>
                </div>
            )}
        </li>
    );
}

function Vazio({ icone, titulo, texto }) {
    const C = useBentoTheme();
    return (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed px-6 py-10 text-center" style={{ borderColor: C.line, backgroundColor: C.surface }}>
            <span style={{ color: C.ink2 }}>{icone}</span>
            <p className="m-0 text-base font-extrabold" style={{ color: C.ink }}>{titulo}</p>
            <p className="m-0 max-w-sm text-sm" style={{ color: C.ink2 }}>{texto}</p>
        </div>
    );
}

// ─── Listas ─────────────────────────────────────────────────────────────────

function useLista(url) {
    const [itens, setItens] = useState(null);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        setErro(null);
        try {
            const { sugestoes } = await chamar(url);
            setItens(sugestoes);
        } catch (err) {
            setErro(err.message);
        }
    }, [url]);

    useEffect(() => { carregar(); }, [carregar]);
    return { itens, setItens, erro, carregar };
}

function EstadoLista({ lista, vazio, children }) {
    const C = useBentoTheme();
    if (lista.erro) {
        return (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-[20px] border p-4" style={{ borderColor: C.danger, backgroundColor: C.dangerSoft, color: C.dangerStrong }}>
                <span className="text-sm font-semibold">{lista.erro}</span>
                <button type="button" onClick={lista.carregar} className={`inline-flex min-h-[44px] items-center rounded-xl border px-4 text-sm font-bold ${FOCO}`} style={{ borderColor: C.dangerStrong, color: C.dangerStrong }}>
                    Tentar de novo
                </button>
            </div>
        );
    }
    if (!lista.itens) return <p role="status" className="m-0 text-sm" style={{ color: C.ink2 }}>Carregando…</p>;
    if (!lista.itens.length) return vazio;
    return children;
}

function MinhasSugestoes({ lista }) {
    return (
        <EstadoLista lista={lista} vazio={<Vazio icone={<Icons.Lightbulb />} titulo="Você ainda não enviou sugestões" texto="Use o formulário acima. Quando a equipe responder, a resposta aparece aqui." />}>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {lista.itens?.map((s) => <CartaoSugestao key={s.id} s={s} onAtualizada={() => {}} />)}
            </ul>
        </EstadoLista>
    );
}

function TodasSugestoes() {
    const C = useBentoTheme();
    const uid = useId();
    const [status, setStatus] = useState('');
    const [tipo, setTipo] = useState('');
    const query = new URLSearchParams({ ...(status && { status }), ...(tipo && { tipo }) }).toString();
    const lista = useLista(`/api/sugestoes${query ? `?${query}` : ''}`);

    const atualizar = (nova) => lista.setItens((atual) => atual.map((x) => (x.id === nova.id ? nova : x)));

    const filtro = (id, rotulo, valor, setValor, opcoes) => (
        <div className="flex flex-col gap-1.5 sm:w-52">
            <label htmlFor={`${uid}-${id}`} className="text-sm font-semibold" style={{ color: C.ink }}>{rotulo}</label>
            <select id={`${uid}-${id}`} value={valor} onChange={(e) => setValor(e.target.value)} className={CAMPO} style={estiloCampo(C, false)}>
                <option value="">Todos</option>
                {opcoes.map((o) => <option key={o.id} value={o.id}>{o.rotulo}</option>)}
            </select>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {filtro('status', 'Status', status, setStatus, STATUS)}
                {filtro('tipo', 'Tipo', tipo, setTipo, TIPOS)}
            </div>
            <EstadoLista lista={lista} vazio={<Vazio icone={<Icons.Lightbulb />} titulo="Nenhuma sugestão encontrada" texto={status || tipo ? 'Nenhuma sugestão combina com esses filtros.' : 'Quando alguém enviar, ela aparece aqui.'} />}>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {lista.itens?.map((s) => <CartaoSugestao key={s.id} s={s} gestao onAtualizada={atualizar} />)}
                </ul>
            </EstadoLista>
        </div>
    );
}

// ─── Tela ───────────────────────────────────────────────────────────────────

export default function Sugestoes({ user }) {
    const C = useBentoTheme();
    const gestor = podeGerirSugestoes(user);
    const [aba, setAba] = useState('minhas');
    const minhas = useLista('/api/sugestoes/minhas');

    const abas = [{ id: 'minhas', rotulo: 'Minhas sugestões' }, ...(gestor ? [{ id: 'todas', rotulo: 'Todas as sugestões' }] : [])];

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <header>
                <h1 className="m-0 font-display text-3xl font-extrabold tracking-tight" style={{ color: C.ink }}>Sugestões</h1>
                <p className="m-0 mt-2 text-sm leading-relaxed sm:text-base" style={{ color: C.ink2 }}>
                    Viu algo que pode melhorar na intranet? Conte para a TI. Você acompanha o andamento aqui mesmo.
                </p>
            </header>

            <FormularioSugestao onEnviada={(nova) => minhas.setItens((atual) => [nova, ...(atual || [])])} />

            <section className="flex flex-col gap-4">
                <h2 className="sr-only">Lista de sugestões</h2>
                {gestor ? (
                    <div role="tablist" aria-label="Listas de sugestões" className="flex flex-wrap gap-2">
                        {abas.map((a) => {
                            const ativa = aba === a.id;
                            return (
                                <button
                                    key={a.id} id={`aba-${a.id}`} type="button" role="tab" aria-selected={ativa} aria-controls={`painel-${a.id}`}
                                    onClick={() => setAba(a.id)}
                                    className={`min-h-[44px] rounded-xl border px-4 text-sm font-bold ${FOCO}`}
                                    style={{ backgroundColor: ativa ? C.accentSoft : 'transparent', borderColor: ativa ? C.accent : C.ink2, color: ativa ? C.accentDark : C.ink2 }}
                                >
                                    {a.rotulo}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="m-0 text-lg font-extrabold" style={{ color: C.ink }} aria-hidden="true">Minhas sugestões</p>
                )}
                <div id={`painel-${aba}`} role={gestor ? 'tabpanel' : undefined} aria-labelledby={gestor ? `aba-${aba}` : undefined}>
                    {aba === 'minhas' ? <MinhasSugestoes lista={minhas} /> : <TodasSugestoes />}
                </div>
            </section>
        </div>
    );
}

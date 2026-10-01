import { useState, useMemo, useRef, useEffect, useId } from 'react';
import BentoAvatar from '../common/Avatar';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { setoresDaPessoa, idCanonico } from '../../utils/setoresDaPessoa';
import { semAcento, situacaoColaborador } from '../directory/statusColaborador';

// Equipe de um setor, ajustada SÓ na intranet (change setores-membros-manuais).
// O IXC continua sendo a base: aqui se INCLUI quem o IXC não colocou no setor ou
// se EXCLUI quem ele colocou. Cada ajuste é reversível e pede confirmação nominal
// antes de gravar (lista curta = confirmação inline, o mesmo padrão do
// responsável manual).
//
// Suporte (15) e Relacionamento (68) têm cartão em Setores, mas Colaboradores só
// mostra o chip ATENDIMENTO, que os agrega; o backend recusa ajuste neles.
const SEM_AJUSTE_PROPRIO = ['15', '68'];

const ROTULO_ORIGEM = { ixc: 'IXC', intranet: 'definido na intranet' };

// Nome limpo: o IXC guarda a situação como prefixo no nome ("(FÉRIAS) Fulano").
// Sem isto a lista começa por "(" e o nome some atrás do prefixo em telas estreitas.
const situacaoDe = (f) => situacaoColaborador(f.funcionario_nome || f.nome, f.ativo);
const nomeDe = (f) => situacaoDe(f).nome;
const idDe = (f) => String(f.funcionario_id ?? f.id);

export default function EquipeSetor({ setor, colaboradores, onAjustes }) {
    const C = useBentoTheme();
    const tituloId = useId();
    const idSetor = String(setor.id);
    const bloqueado = SEM_AJUSTE_PROPRIO.includes(idSetor);

    const [busca, setBusca] = useState('');
    const [pendente, setPendente] = useState(null); // { tipo: 'excluir'|'incluir'|'desfazer', pessoa }
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);
    const cancelarRef = useRef(null);

    useEffect(() => { if (pendente) cancelarRef.current?.focus(); }, [pendente]);

    // Só ativos contam, igual a /api/setores.
    const ativos = useMemo(() => colaboradores.filter((f) => f.ativo === 'S' || f.ativo === true), [colaboradores]);

    const { equipe, removidos } = useMemo(() => {
        const equipe = [];
        const removidos = [];
        for (const f of ativos) {
            const efetivos = setoresDaPessoa(f.id_departamento, f.ajustes_setores);
            const doIxc = idCanonico(f.id_departamento) === idSetor;
            if (efetivos.includes(idSetor)) {
                equipe.push({ pessoa: f, origem: doIxc ? 'ixc' : 'intranet' });
            } else if (doIxc && (f.ajustes_setores || []).some((a) => String(a.id_setor) === idSetor && a.acao === 'excluir')) {
                removidos.push(f);
            }
        }
        const porNome = (a, b) => nomeDe(a.pessoa ?? a).localeCompare(nomeDe(b.pessoa ?? b), 'pt-BR');
        equipe.sort(porNome);
        removidos.sort((a, b) => nomeDe(a).localeCompare(nomeDe(b), 'pt-BR'));
        return { equipe, removidos };
    }, [ativos, idSetor]);

    // Todos os ajustes deste setor, mesmo os de pessoas hoje inativas: "Restaurar"
    // precisa devolver o setor exatamente ao que o IXC indica.
    const ajustesDoSetor = useMemo(() => colaboradores.flatMap((f) =>
        (f.ajustes_setores || []).filter((a) => String(a.id_setor) === idSetor).map((a) => ({ pessoa: f, acao: a.acao }))
    ), [colaboradores, idSetor]);

    const pedirRemoverTodos = () => setPendente({
        tipo: 'remover_todos',
        quantidade: equipe.length,
        lote: equipe.map(({ pessoa, origem }) => ({
            id_funcionario: idDe(pessoa), nome: nomeDe(pessoa), acao: origem === 'ixc' ? 'excluir' : 'desfazer',
        })),
    });
    const pedirRestaurar = () => setPendente({
        tipo: 'restaurar',
        quantidade: ajustesDoSetor.length,
        lote: ajustesDoSetor.map(({ pessoa }) => ({ id_funcionario: idDe(pessoa), nome: nomeDe(pessoa), acao: 'desfazer' })),
    });

    const candidatos = useMemo(() => {
        const termo = semAcento(busca.trim());
        if (!termo) return [];
        const idsFora = new Set([...equipe.map((e) => idDe(e.pessoa)), ...removidos.map(idDe)]);
        return ativos
            .filter((f) => !idsFora.has(idDe(f)) && semAcento(nomeDe(f)).includes(termo))
            .slice(0, 30);
    }, [busca, ativos, equipe, removidos]);

    const textoConfirmacao = (p) => {
        if (p.tipo === 'remover_todos') return <>Remover <strong>{p.quantidade === 1 ? 'a única pessoa' : `todas as ${p.quantidade} pessoas`}</strong> da equipe de <strong>{setor.nome}</strong>? Vale só nesta intranet: no IXC {p.quantidade === 1 ? 'ela continua' : 'elas continuam'} no setor. Depois, "Restaurar equipe do IXC" devolve tudo.</>;
        if (p.tipo === 'restaurar') return <>Desfazer <strong>{p.quantidade} {p.quantidade === 1 ? 'ajuste' : 'ajustes'}</strong> da equipe de <strong>{setor.nome}</strong>? A equipe volta exatamente ao que o IXC indica.</>;
        const nome = nomeDe(p.pessoa);
        if (p.tipo === 'excluir') return <>Remover <strong>{nome}</strong> da equipe de <strong>{setor.nome}</strong>? Vale só nesta intranet: no IXC, a pessoa continua no setor.</>;
        if (p.tipo === 'incluir') return <>Incluir <strong>{nome}</strong> na equipe de <strong>{setor.nome}</strong>? Vale só nesta intranet: o IXC não muda.</>;
        return <>Desfazer o ajuste de <strong>{nome}</strong> em <strong>{setor.nome}</strong>? Ela volta ao que o IXC indica.</>;
    };

    const confirmar = async () => {
        if (!pendente || salvando) return;
        setSalvando(true);
        setErro(null);
        try {
            // Lote (remover todos / restaurar) vai numa única transação; o ajuste
            // individual segue na rota unitária.
            const emLote = Array.isArray(pendente.lote);
            const res = await fetch(emLote ? '/api/admin/setores-membros-manuais/lote' : '/api/admin/setores-membros-manuais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emLote
                    ? { id_setor: idSetor, ajustes: pendente.lote }
                    : { id_setor: idSetor, id_funcionario: idDe(pendente.pessoa), nome: nomeDe(pendente.pessoa), acao: pendente.tipo }),
            });
            const data = await res.json();
            if (!data.sucesso) throw new Error(data.erro || 'Erro ao salvar.');
            onAjustes(data.ajustes);
            setPendente(null);
            setBusca('');
        } catch (e) {
            // Só atualiza o estado no sucesso: o que aparece continua sendo o anterior.
            setErro(`Não foi possível salvar: ${e.message}`);
        } finally {
            setSalvando(false);
        }
    };

    // min-w-[44px]: abaixo de sm o botão fica só com o ícone e precisa de 44px também na largura.
    const btnBase = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-bold transition-colors';

    if (bloqueado) {
        return (
            <div className="px-4 pb-4">
                <p className="rounded-xl border p-3 text-sm" style={{ background: C.surfaceSoft, borderColor: C.line, color: C.ink2 }}>
                    A equipe de <strong style={{ color: C.ink }}>{setor.nome}</strong> se ajusta pelo setor <strong style={{ color: C.ink }}>ATENDIMENTO</strong>, que reúne Suporte e Relacionamento.
                </p>
            </div>
        );
    }

    return (
        <section className="px-4 pb-4" aria-labelledby={tituloId}>
            <div className="flex flex-col gap-4 rounded-xl border p-4" style={{ background: C.surface, borderColor: C.line }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 id={tituloId} className="text-sm font-bold" style={{ color: C.ink }}>
                            Equipe de {setor.nome} <span className="font-normal" style={{ color: C.ink2 }}>({equipe.length})</span>
                        </h2>
                        <p className="mt-0.5 text-[13px]" style={{ color: C.ink2 }}>
                            Os ajustes valem só nesta intranet. O IXC não muda e cada ajuste pode ser desfeito.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={pedirRestaurar}
                            disabled={ajustesDoSetor.length === 0 || !!pendente}
                            className={`${btnBase} disabled:cursor-not-allowed disabled:opacity-50`}
                            style={{ background: C.surfaceSoft, color: C.ink2, border: `1px solid ${C.line}` }}
                        >
                            <span className="material-symbols-outlined text-base" aria-hidden="true">history</span>
                            Restaurar equipe do IXC
                        </button>
                        <button
                            type="button"
                            onClick={pedirRemoverTodos}
                            disabled={equipe.length === 0 || !!pendente}
                            className={`${btnBase} disabled:cursor-not-allowed disabled:opacity-50`}
                            style={{ background: C.dangerSoft, color: C.dangerStrong, border: `1px solid ${C.dangerStrong}` }}
                        >
                            <span className="material-symbols-outlined text-base" aria-hidden="true">group_remove</span>
                            Remover todos
                        </button>
                    </div>
                </div>

                {erro && (
                    <div role="alert" className="rounded-lg p-3 text-sm" style={{ background: C.dangerSoft, color: C.dangerStrong }}>
                        {erro}
                    </div>
                )}

                {pendente && (
                    <div role="alertdialog" aria-label="Confirmar ajuste de equipe" className="flex flex-col gap-3 rounded-xl border p-4" style={{ background: C.accentSoft, borderColor: C.accent }}>
                        <p className="text-sm" style={{ color: C.ink }}>{textoConfirmacao(pendente)}</p>
                        <div className="flex items-center gap-2">
                            <button
                                ref={cancelarRef}
                                type="button"
                                onClick={() => { if (!salvando) setPendente(null); }}
                                aria-disabled={salvando}
                                className="min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                                style={{ background: C.popover, color: C.ink, borderColor: C.line }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmar}
                                aria-disabled={salvando}
                                className="min-h-[44px] flex-1 rounded-lg px-3 text-sm font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                                style={{ background: C.accent, color: C.onAccent }}
                            >
                                {salvando ? 'Salvando…' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Equipe efetiva */}
                <ul className="m-0 flex max-h-72 list-none flex-col overflow-y-auto p-0">
                    {equipe.length === 0 && (
                        <li className="py-4 text-center text-sm" style={{ color: C.ink2 }}>Ninguém na equipe deste setor.</li>
                    )}
                    {equipe.map(({ pessoa, origem }) => (
                        <li key={idDe(pessoa)} className="flex items-center gap-3 border-b py-2 last:border-0" style={{ borderColor: C.lineSoft }}>
                            <BentoAvatar name={nomeDe(pessoa)} size={32} color={[C.accent, C.onAccent]} />
                            <div className="min-w-0 flex-1">
                                <p className="m-0 break-words text-sm font-semibold" style={{ color: C.ink }}>{nomeDe(pessoa)}</p>
                                <p className="m-0 text-[13px]" style={{ color: C.ink2 }}>
                                    {ROTULO_ORIGEM[origem]}
                                    {situacaoDe(pessoa).rotulo !== 'Ativo' && ` · ${situacaoDe(pessoa).rotulo}`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPendente({ tipo: origem === 'ixc' ? 'excluir' : 'desfazer', pessoa })}
                                aria-label={`Remover ${nomeDe(pessoa)} da equipe de ${setor.nome}`}
                                className={btnBase}
                                style={{ background: C.surfaceSoft, color: C.ink2, border: `1px solid ${C.line}` }}
                            >
                                <span className="material-symbols-outlined text-base" aria-hidden="true">person_remove</span>
                                <span className="hidden sm:inline">Remover</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Removidos do que o IXC indica */}
                {removidos.length > 0 && (
                    <div>
                        <h3 className="m-0 text-[13px] font-bold" style={{ color: C.ink }}>Removidos da equipe na intranet</h3>
                        <ul className="m-0 mt-1 flex list-none flex-col p-0">
                            {removidos.map((pessoa) => (
                                <li key={idDe(pessoa)} className="flex items-center gap-3 py-1.5">
                                    <span className="min-w-0 flex-1 truncate text-sm" style={{ color: C.ink2 }}>{nomeDe(pessoa)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPendente({ tipo: 'desfazer', pessoa })}
                                        aria-label={`Desfazer a remoção de ${nomeDe(pessoa)} da equipe de ${setor.nome}`}
                                        className={btnBase}
                                        style={{ background: C.surfaceSoft, color: C.ink2, border: `1px solid ${C.line}` }}
                                    >
                                        <span className="material-symbols-outlined text-base" aria-hidden="true">undo</span>
                                        <span className="hidden sm:inline">Desfazer</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Incluir alguém */}
                <div>
                    <label htmlFor={`${tituloId}-busca`} className="text-[13px] font-bold" style={{ color: C.ink }}>
                        Incluir colaborador na equipe
                    </label>
                    <div className="mt-1 flex items-center gap-2 rounded-xl border px-3" style={{ background: C.surfaceSoft, borderColor: C.line }}>
                        <span className="material-symbols-outlined text-lg" style={{ color: C.ink2 }} aria-hidden="true">search</span>
                        <input
                            id={`${tituloId}-busca`}
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar colaborador ativo pelo nome..."
                            className="min-h-[44px] flex-1 bg-transparent text-sm outline-none"
                            style={{ color: C.ink }}
                        />
                    </div>
                    {busca.trim() && (
                        <ul className="m-0 mt-1 flex max-h-56 list-none flex-col overflow-y-auto p-0">
                            {candidatos.length === 0 && (
                                <li className="py-3 text-center text-sm" style={{ color: C.ink2 }}>Nenhum colaborador encontrado.</li>
                            )}
                            {candidatos.map((pessoa) => (
                                <li key={idDe(pessoa)} className="flex items-center gap-3 border-b py-1.5 last:border-0" style={{ borderColor: C.lineSoft }}>
                                    <BentoAvatar name={nomeDe(pessoa)} size={28} color={[C.accent, C.onAccent]} />
                                    <span className="min-w-0 flex-1 truncate text-sm" style={{ color: C.ink }}>{nomeDe(pessoa)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPendente({ tipo: 'incluir', pessoa })}
                                        aria-label={`Incluir ${nomeDe(pessoa)} na equipe de ${setor.nome}`}
                                        className={btnBase}
                                        style={{ background: C.accent, color: C.onAccent }}
                                    >
                                        <span className="material-symbols-outlined text-base" aria-hidden="true">person_add</span>
                                        Incluir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}

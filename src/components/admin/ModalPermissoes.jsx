import { useState, useRef, useEffect, useId, useMemo } from 'react';
import { useDismissable, makeTrapTab } from '../../hooks/useDismissable';
import { BENTO_LIGHT } from '../../hooks/useBentoTheme';
import { CAPACIDADES } from '../../constants/permissoes';

// Atribuição de permissões por capacidade. Mesmo cuidado do diálogo de
// conceder/revogar admin (AdminUsuarios): confirmação nominal antes de gravar,
// erro anunciado dentro do próprio diálogo, nunca window.confirm/alert.
//
// Duas etapas no mesmo diálogo — escolher e revisar. O foco vai para o botão
// não destrutivo da etapa nova, senão trocar de etapa deixaria o foco no botão
// que acabou de sumir.

const sIconBox = (color, bg) => ({
    width: 34,
    height: 34,
    borderRadius: 10,
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    flexShrink: 0,
});

export default function ModalPermissoes({ usuario, salvando, erro, onCancelar, onSalvar, C }) {
    const modalRef = useRef(null);
    const acaoInicialRef = useRef(null);
    const salvarRef = useRef(null);
    const tituloId = useId();
    const [etapa, setEtapa] = useState('editar');

    useDismissable(modalRef, {
        open: true,
        onClose: () => { if (!salvando) onCancelar(); },
        lockScroll: true,
        closeOnOutside: true,
    });
    const trapTab = makeTrapTab(modalRef);

    const isDark = C.bg !== BENTO_LIGHT.bg;
    const nome = usuario.funcionario_nome || usuario.usuario_nome || usuario.usuario_email;
    const atuais = useMemo(() => new Set(usuario.permissoes ?? []), [usuario.permissoes]);
    const [selecionadas, setSelecionadas] = useState(() => new Set(usuario.permissoes ?? []));

    // Ids que o backend conhece e esta tela não lista: preservados ao salvar,
    // porque o PUT substitui o conjunto inteiro e eles sumiriam calados.
    const desconhecidas = useMemo(
        () => [...atuais].filter((id) => !CAPACIDADES.some((c) => c.id === id)),
        [atuais]
    );

    const concedidas = CAPACIDADES.filter((c) => selecionadas.has(c.id) && !atuais.has(c.id));
    const revogadas = CAPACIDADES.filter((c) => !selecionadas.has(c.id) && atuais.has(c.id));
    const total = concedidas.length + revogadas.length;
    const mudou = total > 0;

    const alternar = (id) => {
        setSelecionadas((prev) => {
            const prox = new Set(prev);
            if (prox.has(id)) prox.delete(id); else prox.add(id);
            return prox;
        });
    };

    useEffect(() => {
        if (etapa === 'confirmar') acaoInicialRef.current?.focus();
    }, [etapa]);

    // Depois de uma falha o foco volta ao botão de salvar, para tentar de novo
    // sem sair do diálogo.
    useEffect(() => {
        if (erro) salvarRef.current?.focus();
    }, [erro]);

    // `aria-disabled` em vez de `disabled` durante o salvamento: um botão
    // desabilitado perde o foco e o teclado cairia fora do diálogo modal.
    const confirmar = () => {
        if (salvando) return;
        onSalvar([...selecionadas, ...desconhecidas]);
    };

    const btnSecundario = {
        borderColor: C.line, background: C.popover, color: C.ink2,
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" style={{ background: C.scrim, backdropFilter: 'blur(4px)' }}>
            <div
                ref={modalRef}
                onKeyDown={trapTab}
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
                style={{ background: C.popover, borderColor: C.line }}
            >
                <div className="flex items-center gap-3 px-5 py-4">
                    <div style={sIconBox(isDark ? C.accentDark : C.accentDeep, C.accentSoft)}>
                        <span className="material-symbols-outlined" aria-hidden="true">key</span>
                    </div>
                    <h2 id={tituloId} className="text-base font-bold" style={{ color: C.ink }}>
                        {etapa === 'editar' ? 'Permissões de gestão' : 'Confirmar permissões'}
                    </h2>
                </div>

                {etapa === 'editar' ? (
                    <>
                        <div className="overflow-y-auto px-5 pb-2">
                            <fieldset>
                                <legend className="mb-2 text-sm" style={{ color: C.ink2 }}>
                                    O que <b style={{ color: C.ink }}>{nome}</b> pode gerenciar, além do que já vê como colaborador:
                                </legend>
                                <div className="flex flex-col gap-1">
                                    {CAPACIDADES.map((c) => {
                                        const marcada = selecionadas.has(c.id);
                                        const inputId = `${tituloId}-${c.id}`;
                                        return (
                                            <label
                                                key={c.id}
                                                htmlFor={inputId}
                                                className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors"
                                                style={{
                                                    borderColor: marcada ? C.accent : C.line,
                                                    background: marcada ? C.accentSoft : C.surface,
                                                }}
                                            >
                                                <input
                                                    id={inputId}
                                                    type="checkbox"
                                                    checked={marcada}
                                                    onChange={() => alternar(c.id)}
                                                    className="mt-0.5 h-5 w-5 shrink-0"
                                                    style={{ accentColor: C.accent }}
                                                />
                                                <span className="flex flex-col">
                                                    <span className="text-sm font-semibold" style={{ color: C.ink }}>{c.rotulo}</span>
                                                    <span className="text-[13px]" style={{ color: C.ink2 }}>{c.descricao}</span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </div>
                        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-[13px]" style={{ color: C.ink2 }} aria-live="polite">
                                {mudou ? (total === 1 ? '1 alteração pendente' : `${total} alterações pendentes`) : 'Nenhuma alteração'}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onCancelar}
                                    className="min-h-[44px] flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors sm:flex-none"
                                    style={btnSecundario}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEtapa('confirmar')}
                                    disabled={!mudou}
                                    className="min-h-[44px] flex-1 rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                    style={{ background: C.accent, color: C.onAccent }}
                                >
                                    Revisar alterações
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="overflow-y-auto px-5 pb-2 text-sm" style={{ color: C.ink2 }}>
                            <p>
                                Isto muda o que <b style={{ color: C.ink }}>{nome}</b> pode fazer na gestão, a partir da próxima ação.
                            </p>
                            <ul className="mt-3 flex flex-col gap-2">
                                {concedidas.map((c) => (
                                    <li key={c.id} className="flex items-center gap-2" style={{ color: C.ink }}>
                                        <span className="material-symbols-outlined text-lg" style={{ color: C.success }} aria-hidden="true">add_circle</span>
                                        <span><b>Concede</b> {c.rotulo}</span>
                                    </li>
                                ))}
                                {revogadas.map((c) => (
                                    <li key={c.id} className="flex items-center gap-2" style={{ color: C.ink }}>
                                        <span className="material-symbols-outlined text-lg" style={{ color: C.danger }} aria-hidden="true">do_not_disturb_on</span>
                                        <span><b>Retira</b> {c.rotulo}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {erro && (
                            <div role="alert" className="mx-5 mt-3 rounded-lg p-3 text-sm" style={{ background: C.dangerSoft, color: C.dangerStrong }}>
                                {erro}
                            </div>
                        )}
                        <div className="flex justify-end gap-3 px-5 py-4">
                            <button
                                ref={acaoInicialRef}
                                type="button"
                                onClick={() => { if (!salvando) setEtapa('editar'); }}
                                aria-disabled={!!salvando}
                                className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                                style={btnSecundario}
                            >
                                Voltar
                            </button>
                            <button
                                ref={salvarRef}
                                type="button"
                                onClick={confirmar}
                                aria-disabled={!!salvando}
                                className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-bold aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                                style={{ background: C.accent, color: C.onAccent }}
                            >
                                {salvando ? 'Salvando…' : 'Salvar permissões'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

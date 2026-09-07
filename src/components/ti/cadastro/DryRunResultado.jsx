import React, { useState } from 'react';
import { CARD, BTN_SECUNDARIO } from './estilos';

function scrollParaCampo(nome) {
    if (!nome) return;
    const el = document.getElementById(`campo-${nome}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus?.();
}

function ListaProblemas({ titulo, itens, cor }) {
    if (!itens.length) return null;
    return (
        <div className="border-t border-border px-5 py-3">
            <p className={`mb-2 text-xs font-semibold ${cor}`}>{titulo}</p>
            <ul className="flex flex-col gap-1.5">
                {itens.map((item, i) => (
                    <li key={i}>
                        {item.campo ? (
                            <button
                                type="button"
                                onClick={() => scrollParaCampo(item.campo)}
                                className={`text-left text-xs underline decoration-dotted underline-offset-2 hover:no-underline ${cor}`}
                            >
                                {item.mensagem}
                            </button>
                        ) : (
                            <p className={`text-xs ${cor}`}>{item.mensagem}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Resultado do dry-run: banner verde/vermelho, erros e avisos clicáveis que
 * rolam até o campo, os payloads que seriam enviados, e a faixa fixa
 * lembrando que nada foi gravado no IXC.
 */
export default function DryRunResultado({ resultado }) {
    const [copiado, setCopiado] = useState(false);
    const [senhaRevelada, setSenhaRevelada] = useState(false);

    if (!resultado) return null;
    const { valido, erros = [], avisos = [], plano = [], senhaHash } = resultado;

    const copiarJson = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(plano, null, 2));
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            // Clipboard indisponível (ex.: contexto não-seguro) — sem crash, sem feedback.
        }
    };

    return (
        <div className={CARD}>
            <header
                className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-bold ${
                    valido
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
            >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {valido ? 'check_circle' : 'error'}
                </span>
                {valido ? 'Simulação: nenhum erro encontrado' : `Simulação: ${erros.length} erro(s) encontrado(s)`}
            </header>

            <ListaProblemas titulo="Erros" itens={erros} cor="text-red-600 dark:text-red-400" />
            <ListaProblemas titulo="Avisos" itens={avisos} cor="text-amber-700 dark:text-amber-400" />

            {senhaHash ? (
                <div className="border-t border-border px-5 py-3">
                    <p className="mb-1 text-xs font-semibold text-muted">Senha do usuário (SHA-256)</p>
                    <button
                        type="button"
                        onClick={() => setSenhaRevelada(v => !v)}
                        className="font-mono text-[11px] text-muted underline decoration-dotted underline-offset-2 hover:no-underline"
                    >
                        {senhaRevelada ? senhaHash : `sha256(${'•'.repeat(12)})`}
                    </button>
                </div>
            ) : null}

            {plano.length > 0 && (
                <div className="border-t border-border px-5 py-3">
                    <p className="mb-2 text-xs font-semibold text-foreground">
                        Payloads que seriam enviados ({plano.length} passo{plano.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex flex-col gap-2">
                        {plano.map(passo => (
                            <details key={passo.passo} className="rounded-xl border border-border">
                                <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-muted">
                                    {passo.passo}. {passo.titulo} — {passo.metodo}
                                </summary>
                                <pre className="max-h-[280px] overflow-auto border-t border-border bg-surface-raised p-3 font-mono text-[11px] whitespace-pre-wrap text-muted">
                                    {JSON.stringify(passo, null, 2)}
                                </pre>
                            </details>
                        ))}
                    </div>
                    <button type="button" onClick={copiarJson} className={`${BTN_SECUNDARIO} mt-2 w-full`}>
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">content_copy</span>
                        {copiado ? 'Copiado!' : 'Copiar JSON do plano'}
                    </button>
                </div>
            )}

            <div className="border-t border-amber-300/40 bg-amber-400/15 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
                Simulação · nenhuma requisição foi enviada ao IXC
            </div>
        </div>
    );
}

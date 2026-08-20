import React from 'react';
import { CARD, BTN_PRIMARIO, BTN_SECUNDARIO } from './estilos';
import { OBRIGATORIOS } from './campos';
import DryRunResultado from './DryRunResultado';

/**
 * Painel lateral do cadastro. Mostra resumo, botão de simulação, resultado do
 * dry-run, texto bruto da ficha e o log compartilhado com o shell da aba TI.
 */
export default function PainelLateral({ form, erros, onSimular, simulando, onRecarregar, log, textoBruto, naoReconhecido, resultadoDryRun }) {
    const preenchidos = OBRIGATORIOS.filter(nome => {
        const v = String(form[nome] ?? '').trim();
        return v.length > 0;
    }).length;

    const errosVisiveis = Object.entries(erros)
        .filter(([, erro]) => erro)
        .map(([nome, erro]) => ({ nome, erro }));

    return (
        <aside className="flex flex-col gap-6 xl:sticky xl:top-4">
            <div className={CARD}>
                <header className="border-b border-border px-5 py-3.5">
                    <h3 className="text-[13px] font-bold text-foreground">Resumo</h3>
                </header>
                <div className="flex flex-col gap-3 px-5 py-4">
                    <p className="text-xs text-muted">
                        Obrigatórios preenchidos: <b className="text-foreground">{preenchidos} de {OBRIGATORIOS.length}</b>
                    </p>
                    <p className="text-xs text-muted">
                        Erros de validação: <b className={errosVisiveis.length ? 'text-red-600' : 'text-foreground'}>{errosVisiveis.length}</b>
                    </p>
                    <button
                        type="button"
                        onClick={onSimular}
                        disabled={simulando}
                        className={`${BTN_PRIMARIO} w-full`}
                    >
                        <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                            {simulando ? 'hourglass_top' : 'science'}
                        </span>
                        {simulando ? 'Validando…' : 'Simular cadastro'}
                    </button>
                    <button
                        type="button"
                        onClick={onRecarregar}
                        className={`${BTN_SECUNDARIO} w-full`}
                    >
                        <span className="material-symbols-outlined text-[17px]" aria-hidden="true">refresh</span>
                        Recarregar listas do IXC
                    </button>
                    <p className="text-xs text-muted">
                        "Simular cadastro" consulta o IXC de verdade (taxonomias e duplicidade), mas nenhuma
                        requisição de gravação é enviada — é sempre dry-run.
                    </p>
                </div>
            </div>

            <DryRunResultado resultado={resultadoDryRun} />

            {textoBruto && (
                <div className={CARD}>
                    <header className="border-b border-border px-5 py-3.5">
                        <h3 className="text-[13px] font-bold text-foreground">Texto extraído da ficha</h3>
                    </header>
                    <details className="px-5 py-3">
                        <summary className="cursor-pointer text-xs font-semibold text-muted">Ver texto bruto</summary>
                        <pre className="mt-2 max-h-[320px] overflow-auto rounded-xl bg-surface-raised p-3 font-mono text-[11px] whitespace-pre-wrap text-muted">
                            {textoBruto}
                        </pre>
                    </details>
                    {naoReconhecido?.length > 0 && (
                        <div className="border-t border-border px-5 py-3">
                            <p className="mb-2 text-xs font-semibold text-muted">Rótulos não reconhecidos</p>
                            <ul className="flex flex-col gap-1 text-[11px] text-muted">
                                {naoReconhecido.map((linha, i) => (
                                    <li key={i} className="truncate">{linha}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {log.length > 0 && (
                <div className={CARD}>
                    <header className="border-b border-border px-5 py-3.5">
                        <h3 className="text-[13px] font-bold text-foreground">Log</h3>
                    </header>
                    <div className="max-h-64 overflow-y-auto px-5 py-3">
                        <ul className="flex flex-col gap-1.5">
                            {log.map((item, i) => (
                                <li key={i} className="flex gap-2 text-xs">
                                    <span className="text-muted shrink-0">{item.hora}</span>
                                    <span className={
                                        item.nivel === 'erro' ? 'text-red-600' :
                                        item.nivel === 'sucesso' ? 'text-emerald-600' : 'text-foreground'
                                    }>
                                        {item.mensagem}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </aside>
    );
}

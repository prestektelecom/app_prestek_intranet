import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TiHero from './ti/TiHero';
import { FERRAMENTAS_TI, FERRAMENTA_PADRAO, CHAVE_FERRAMENTA } from './ti/registry';

/**
 * Aba TI — casca do hub.
 *
 * Não conhece nenhuma ferramenta: percorre o registry, monta a bandeja e
 * renderiza a ativa. Adicionar a próxima ferramenta não toca neste arquivo.
 *
 * O gate de admin acontece em duas camadas: App.jsx decide se a aba renderiza,
 * e aqui `somenteAdmin` filtra ferramenta a ferramenta — uma futura ferramenta
 * de TI pode ser aberta a todos sem que a aba deixe de ser restrita.
 */
export default function Ti({ user }) {
    const ferramentas = useMemo(
        () => FERRAMENTAS_TI.filter(f => !f.somenteAdmin || user?.is_admin),
        [user?.is_admin]
    );

    const [ferramentaId, setFerramentaId] = useState(() => {
        try {
            return localStorage.getItem(CHAVE_FERRAMENTA) || FERRAMENTA_PADRAO;
        } catch {
            return FERRAMENTA_PADRAO;
        }
    });

    // Cai na primeira disponível se a persistida sumiu do registry ou ficou
    // fora do alcance deste usuário. Sem isto, remover uma ferramenta deixaria
    // a aba em branco para quem a tivesse aberta por último.
    const ativa = ferramentas.find(f => f.id === ferramentaId) ?? ferramentas[0];

    useEffect(() => {
        if (!ativa) return;
        try {
            localStorage.setItem(CHAVE_FERRAMENTA, ativa.id);
        } catch { /* modo privado do navegador — a persistência é conveniência */ }
    }, [ativa]);

    // Log compartilhado: as ferramentas relatam o que fizeram e a casca guarda.
    // Fica aqui para que uma futura ferramenta herde o mesmo painel sem
    // reimplementar.
    const [log, setLog] = useState([]);
    const registrarLog = useCallback((mensagem, nivel = 'info') => {
        setLog(anterior => [
            ...anterior.slice(-199),
            { hora: new Date().toLocaleTimeString('pt-BR'), mensagem, nivel },
        ]);
    }, []);

    const [hero, setHero] = useState({ kpis: [], isLoading: false, etapa: '' });

    if (!ativa) {
        return (
            <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
                <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
                    <span className="material-symbols-outlined mb-2 text-4xl text-muted" aria-hidden="true">construction</span>
                    <p className="text-sm font-medium text-muted">Nenhuma ferramenta de TI disponível para o seu perfil.</p>
                </div>
            </main>
        );
    }

    const Ferramenta = ativa.Component;

    return (
        // flex-1 é obrigatório: o shell do App é um flex row, e sem ele o <main>
        // congela no max-content e toda a sobra vira faixa morta à direita.
        // Ver openspec/changes/coverage-layout-proporcional/.
        <main className="flex-1 overflow-y-auto bg-background px-4 py-8 text-foreground md:px-10">
            {/* py-8 / gap-8 / max-w-1200: o sistema da Central de Vendas, que é a
                referência do projeto para páginas roláveis. O gap-6 da Cobertura
                é exceção justificada pela altura travada do mapa. */}
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8">

                <TiHero ferramenta={ativa} {...hero} />

                {/* Bandeja de ferramentas. Renderiza mesmo com uma só: anuncia a
                    extensibilidade e evita um caso especial que teria de sair
                    quando a segunda chegar. */}
                <nav aria-label="Ferramentas de TI">
                    <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-2xl bg-surface-raised p-1">
                        {ferramentas.map(f => {
                            const selecionada = f.id === ativa.id;
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFerramentaId(f.id)}
                                    aria-current={selecionada ? 'page' : undefined}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                                        selecionada
                                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/50'
                                            : 'text-muted hover:bg-background'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[17px]" aria-hidden="true">{f.icon}</span>
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <Ferramenta
                    user={user}
                    log={log}
                    onLog={registrarLog}
                    onHero={setHero}
                />
            </div>
        </main>
    );
}

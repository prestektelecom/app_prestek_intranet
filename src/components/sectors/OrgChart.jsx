import React, { useEffect, useRef } from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { gradienteHero } from '../ui/heroGradiente';

const LABEL_MONO = 'font-mono text-[11px] font-semibold uppercase tracking-[0.14em]';

/**
 * Organograma estático (JSON + localStorage, via useOrgChartData).
 *
 * A hierarquia NÃO deriva de /api/setores — é conteúdo editorial, conforme
 * openspec/specs/organograma-prestek/spec.md. A edição continua por navegador
 * (localStorage), aberta pelo botão do cabeçalho — que agora só existe para
 * admin: a versão anterior mostrava "Editar" para todo mundo.
 */
export default function OrgChart({ data, loaded, isAdmin, onEdit }) {
    const C = useBentoTheme();
    const connectorColor = tone(C.accent, 0.35);
    const scrollRef = useRef(null);

    // O CEO fica centralizado na largura TOTAL do diagrama (1144px+), não na
    // borda esquerda — com `scrollLeft` padrão em 0, a viewport de um celular
    // (~345px) mostrava só a metade esquerda das áreas e o CEO inteiro ficava
    // fora da tela, sem nenhuma pista de que a raiz do organograma não estava
    // ali. Centralizar a rolagem na montagem resolve os dois lados de uma vez:
    // o CEO some para o meio da viewport, e "arraste para ver as áreas" passa
    // a valer para os dois sentidos, não só para a direita.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }, [data]);

    if (!loaded || !data) {
        return (
            <section className="flex min-h-[200px] items-center justify-center rounded-[24px] border border-border bg-surface p-6 sm:p-8">
                <p className="m-0 animate-pulse font-semibold text-faint">Carregando organograma...</p>
            </section>
        );
    }

    const root = data.root;
    const areas = data.areas || [];

    // `lastUpdated` é gravado pelo hook a cada save; substitui a pílula
    // decorativa "Trimestre Atual", que era hardcoded e não informava nada.
    const atualizadoEm = (() => {
        if (!data.lastUpdated) return null;
        const dt = new Date(data.lastUpdated);
        return Number.isNaN(dt.getTime()) ? null : dt.toLocaleDateString('pt-BR');
    })();

    return (
        <section className="relative overflow-hidden rounded-[24px] border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className={`m-0 ${LABEL_MONO}`} style={{ color: C.accent }}>Hierarquia Organizacional</p>
                    <h2 className="font-display m-0 mt-1 text-xl font-bold tracking-[-0.02em] text-foreground">Estrutura Prestek</h2>
                </div>
                <div className="flex items-center gap-3">
                    {atualizadoEm && (
                        <span className="font-mono text-[11px] text-faint">Atualizado em {atualizadoEm}</span>
                    )}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-[12.5px] font-bold text-faint transition-colors hover:border-[var(--accent)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                            Editar
                        </button>
                    )}
                </div>
            </div>

            {/* Fade na borda direita como affordance de que há mais conteúdo.
                O pr-6 interno mantém o conteúdo fora da zona de 24px do fade
                quando NÃO há overflow — sem ele, a máscara apagaria a borda
                direita da última coluna em telas largas. */}
            <div
                ref={scrollRef}
                className="w-full overflow-x-auto pb-2 pl-1 pt-6"
                style={{
                    maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent 100%)',
                }}
            >
                <div className="flex min-w-[1144px] flex-col items-center pr-6">
                    {/* CEO */}
                    <div
                        className="relative z-[2] w-[240px] rounded-[18px] px-4 py-5 text-center text-white"
                        style={{
                            background: gradienteHero(C),
                            boxShadow: `0 16px 36px -16px ${tone(C.accentDeep, 0.55)}`,
                        }}
                    >
                        {root.photo ? (
                            <div
                                className="mx-auto mb-3 h-16 w-16 rounded-full border-[3px] border-white/60 bg-cover bg-center"
                                style={{ backgroundImage: `url('${root.photo}')` }}
                            />
                        ) : (
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/60 bg-white/20">
                                <span className="material-symbols-outlined text-[32px] text-white" aria-hidden="true">person</span>
                            </div>
                        )}
                        <p className="m-0 text-[18px] font-extrabold">{root.name}</p>
                        <p className="m-0 mt-0.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/85">{root.role}</p>
                    </div>

                    {/* Conectores do CEO */}
                    <div className="h-7 w-0.5" style={{ background: connectorColor }} />
                    <div className="h-0.5 w-[88%]" style={{ background: connectorColor }} />
                    <div className="-mt-px flex w-[88%] justify-around">
                        {areas.map((_, i) => (
                            <div key={i} className="h-6 w-0.5" style={{ background: connectorColor }} />
                        ))}
                    </div>

                    {/* Áreas */}
                    <div
                        className="grid w-full items-start gap-3"
                        style={{ gridTemplateColumns: `repeat(${areas.length}, 1fr)` }}
                    >
                        {areas.map(area => (
                            <AreaColumn key={area.title} area={area} />
                        ))}
                    </div>
                </div>
            </div>

            <p className="m-0 mt-1 text-center font-mono text-[11px] text-faint sm:hidden">
                ← arraste para ver todas as áreas →
            </p>
        </section>
    );
}

function AreaColumn({ area }) {
    const C = useBentoTheme();
    const connectorColor = tone(C.accent, 0.35);
    const hasChildren = area.children && area.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <OrgAreaNode icon={area.icon} title={area.title} name={area.name} isStaff={area.isStaff} />

            {hasChildren && (
                <>
                    <div className="h-[18px] w-0.5" style={{ background: connectorColor }} />
                    <div className="flex w-full flex-col items-center gap-2.5">
                        {area.children.map((child, idx) => (
                            <div key={idx} className="flex w-full flex-col items-center">
                                {idx > 0 && <div className="mb-2.5 h-2.5 w-0.5" style={{ background: connectorColor }} />}
                                <OrgLeafNode title={child} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Sem cursor-pointer: os nós não têm ação, e afirmar affordance que não
// existe é pior do que não ter hover nenhum. O realce fica como leitura.
function OrgAreaNode({ icon, title, name, isStaff = false }) {
    const C = useBentoTheme();
    return (
        <div
            className="flex w-full flex-col items-center rounded-2xl px-2 py-4 text-center transition-all duration-200 hover:-translate-y-[3px]"
            style={{
                background: isStaff ? tone(C.accentSoft, 0.35) : C.surface,
                border: `1px ${isStaff ? 'dashed' : 'solid'} ${isStaff ? tone(C.accent, 0.25) : C.line}`,
                boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
            }}
        >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.accentSoft }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: C.accent }} aria-hidden="true">{icon}</span>
            </div>
            <p className="m-0 text-[12.5px] font-bold leading-[1.25]" style={{ color: C.ink }}>{title}</p>
            {name && (
                <p className="m-0 mt-1 font-mono text-[11px] font-extrabold uppercase tracking-[0.07em]" style={{ color: C.ink2 }}>{name}</p>
            )}
        </div>
    );
}

function OrgLeafNode({ title }) {
    const C = useBentoTheme();
    return (
        <div
            className="w-[92%] rounded-xl px-1.5 py-2 text-center transition-colors duration-200"
            style={{
                background: C.surface,
                border: `1px solid ${C.line}`,
                boxShadow: `0 1px 2px ${tone(C.accentDeep, 0.04)}`,
            }}
        >
            <p className="m-0 text-[11px] font-bold leading-[1.25]" style={{ color: C.ink2 }}>{title}</p>
        </div>
    );
}

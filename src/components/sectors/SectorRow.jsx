import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';
import { useDeptColor } from '../directory/deptColors';
import { getIconForSetor } from './sectorMeta';

/**
 * Linha compacta da visão em lista — antes a "lista" era o mesmo card em uma
 * coluna, o que só espalhava os 28 setores por três telas de altura. A linha
 * responde à pergunta dominante ("quem é o responsável / qual o ramal?") com
 * ~14 setores na dobra.
 */
export default function SectorRow({ setor, setCurrentView }) {
    const C = useBentoTheme();
    const corDe = useDeptColor();
    const { tinta, marca } = corDe(setor.nome);

    const ramal = setor.responsavel?.ramal && setor.responsavel.ramal !== '0' ? setor.responsavel.ramal : '';
    const managerName = setor.responsavel?.nome || '';

    const handleVerEquipe = () => {
        sessionStorage.setItem('@Stitch:directoryFilter', setor.id);
        setCurrentView('directory');
    };

    return (
        <li
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5 transition-colors sm:flex-nowrap"
            // Longhand só, mesmo motivo do EmployeeRow: `border` + `borderLeft`
            // no mesmo objeto quebra na atualização — o shorthand zera a tarja.
            style={{
                background: C.surface,
                borderStyle: 'solid',
                borderColor: C.line,
                borderWidth: '1px 1px 1px 3px',
                borderLeftColor: marca,
            }}
        >
            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: tone(marca, 0.12) }}
            >
                <span className="material-symbols-outlined text-[18px]" style={{ color: tinta }} aria-hidden="true">
                    {getIconForSetor(setor.nome)}
                </span>
            </div>

            <div className="min-w-0 flex-1 basis-40">
                <p className="m-0 truncate text-[15px] font-bold leading-tight" style={{ color: C.ink }}>
                    {setor.nome}
                </p>
            </div>

            <span className="hidden min-w-0 max-w-[220px] flex-1 basis-40 truncate text-[13px] md:block" style={{ color: managerName ? C.ink2 : C.muted }}>
                {managerName || '—'}
            </span>

            <span className="w-[92px] shrink-0 font-mono text-[13px] tabular-nums tracking-[0.05em]" style={{ color: ramal ? C.ink2 : C.muted }}>
                {ramal ? `R. ${ramal}` : '—'}
            </span>

            <span className="w-[86px] shrink-0 text-right font-mono text-[12px] tabular-nums" style={{ color: C.muted }}>
                {setor.totalMembros} {Number(setor.totalMembros) === 1 ? 'pessoa' : 'pessoas'}
            </span>

            <div className="ml-auto flex shrink-0 items-center gap-1">
                <AcaoIcone
                    onClick={handleVerEquipe}
                    icone="groups"
                    rotulo={`Ver equipe do setor ${setor.nome}`}
                    ativo
                    C={C}
                />
                <AcaoIcone
                    href={ramal ? `tel:${ramal}` : undefined}
                    icone="call"
                    rotulo={ramal ? `Ligar para o ramal ${ramal}` : 'Ramal indisponível'}
                    ativo={!!ramal}
                    C={C}
                />
            </div>
        </li>
    );
}

/** Ação só-ícone de 44×44 — o alvo de projeto, não os 24×24 do mínimo da SC 2.5.8. */
function AcaoIcone({ href, onClick, icone, rotulo, ativo, C }) {
    const Tag = onClick ? 'button' : 'a';
    return (
        <Tag
            href={onClick ? undefined : (ativo ? href : undefined)}
            type={onClick ? 'button' : undefined}
            onClick={onClick || (ativo ? undefined : e => e.preventDefault())}
            aria-disabled={ativo ? undefined : 'true'}
            aria-label={rotulo}
            title={rotulo}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{
                background: 'none',
                border: 'none',
                color: ativo ? C.ink2 : C.muted,
                cursor: ativo ? 'pointer' : 'not-allowed',
                opacity: ativo ? 1 : 0.5,
            }}
        >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icone}</span>
        </Tag>
    );
}

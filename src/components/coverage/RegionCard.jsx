import React from 'react';
import { tone } from '../../utils/tone';
import { STATUS_META, TECH_META, STATUS_COR_PADRAO, STATUS_COR_TEXTO_PADRAO } from './constants';

// O card inteiro é um <button> e a ação de admin fica como irmão posicionado
// por cima — botão dentro de botão é HTML inválido e quebra a navegação por
// Tab. A versão anterior usava div + onClick, sem foco nem tecla Enter.
export default function RegionCard({ row, selecionada, onSelecionar, onConfigurar, isAdmin }) {
    const status = STATUS_META[row.status];
    const tech = TECH_META[row.tecnologia];
    const cor = status?.cor || STATUS_COR_PADRAO;
    // Tom só para texto — mais claro que `cor`, que precisa continuar igual
    // ao marcador do Leaflet. `cor` sozinha reprovava 4,5:1 no AMOLED.
    const corTexto = status?.corTexto || STATUS_COR_TEXTO_PADRAO;
    const semLocal = row.latitude == null || row.longitude == null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => onSelecionar(row)}
                aria-pressed={selecionada}
                className="w-full cursor-pointer rounded-2xl border p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{
                    borderColor: selecionada ? cor : 'var(--border)',
                    background: selecionada ? tone(cor, 0.08) : 'var(--surface)',
                    boxShadow: selecionada ? `0 0 0 3px ${tone(cor, 0.12)}` : 'none',
                }}
            >
                <div className="flex items-start gap-2.5">
                    <span
                        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold"
                        style={{ background: tone(cor, 0.14), color: corTexto }}
                    >
                        {row.estado}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold leading-tight text-foreground">
                            {row.bairro || row.cidade}
                        </p>
                        <p className="truncate text-[11.5px] text-faint">
                            {row.bairro ? row.cidade : 'Sede do município'}
                        </p>
                    </div>

                    {/* Reserva só a faixa do botão de configurar (admin). A
                        contagem de contratos desceu para a linha dos chips: na
                        coluna de 288px ela roubava 90px e o nome do bairro
                        sobrava com ~110px, truncando em quase todos. */}
                    {isAdmin && <span aria-hidden="true" className="w-8 shrink-0" />}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {tech ? (
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{ background: tone(tech.cor, 0.12), color: tech.corTexto || tech.cor }}
                        >
                            <span className="material-symbols-outlined text-[12px] leading-none">{tech.icon}</span>
                            {row.tecnologia}
                        </span>
                    ) : (
                        <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-semibold text-faint">
                            Sem tecnologia
                        </span>
                    )}

                    {/* Status com ícone + texto: a cor sozinha não pode ser o sinal. */}
                    {status && (
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{ background: tone(cor, 0.12), color: corTexto }}
                        >
                            <span className="material-symbols-outlined text-[12px] leading-none">{status.icon}</span>
                            {row.status}
                        </span>
                    )}

                    {/* Vira pílula na linha dos chips em vez de linha própria:
                        193 das 196 regiões estão sem coordenada, então o aviso
                        aparecia em quase todo card e custava ~20px de altura
                        cada — encolhia a lista sem informar mais nada. */}
                    {semLocal && (
                        <span
                            className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-semibold text-faint"
                            title="Sem coordenadas cadastradas — esta região não aparece no mapa"
                        >
                            <span className="material-symbols-outlined text-[12px] leading-none">location_off</span>
                            sem mapa
                        </span>
                    )}

                    <span className="ml-auto flex shrink-0 items-center gap-2">
                        {row.velocidade_maxima && (
                            <span className="font-mono text-[11px] font-bold text-foreground">
                                {row.velocidade_maxima}
                            </span>
                        )}
                        <span className="font-mono text-[11px] font-bold tabular-nums text-faint">
                            {row.total_contratos}
                            <span className="ml-0.5 font-sans font-medium">contr.</span>
                        </span>
                    </span>
                </div>

                {status && row.percentual_cobertura != null && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                            <div
                                className="h-full rounded-full transition-[width] duration-500"
                                style={{ width: `${row.percentual_cobertura}%`, background: cor }}
                            />
                        </div>
                        <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: cor }}>
                            {row.percentual_cobertura}%
                        </span>
                    </div>
                )}

            </button>

            {isAdmin && (
                <button
                    type="button"
                    onClick={() => onConfigurar(row)}
                    title={row.tem_override ? 'Editar configuração' : 'Configurar cobertura'}
                    aria-label={`${row.tem_override ? 'Editar' : 'Configurar'} cobertura de ${row.bairro || row.cidade}${row.bairro && row.cidade ? `, ${row.cidade}` : ''}`}
                    // after:-inset-1.5 leva o alvo de 32px para 44px sem crescer
                    // visualmente — mesma técnica de Pilula/SectorCard (Fases 6/7).
                    className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-lg transition-colors after:absolute after:-inset-1.5 after:content-[''] hover:bg-[var(--accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    style={{ color: row.tem_override ? 'var(--foreground-muted)' : 'var(--accent)' }}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {row.tem_override ? 'edit' : 'tune'}
                    </span>
                </button>
            )}
        </div>
    );
}

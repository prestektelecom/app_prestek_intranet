import React, { useState } from 'react';
import { STATUS_META } from './constants';

// O mapa pinta marcadores verde/azul/vermelho sem dizer o que cada cor
// significa em lugar nenhum da tela — cor como único sinal, e sem chave.
// Colapsável porque a legenda competia com o próprio mapa.
export default function MapLegend() {
    // Sempre recolhida ao abrir a tela. Expandida ela ocupa ~250×120px sobre o
    // mapa, e é consulta pontual: uma vez entendido o código de cores, ela vira
    // obstrução permanente. Quem precisar, clica.
    const [aberta, setAberta] = useState(false);

    return (
        <div className="pointer-events-auto absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-border bg-surface/95 shadow-lg backdrop-blur-sm">
            <button
                type="button"
                onClick={() => setAberta(v => !v)}
                aria-expanded={aberta}
                className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-foreground transition-colors hover:bg-surface-raised"
            >
                <span className="material-symbols-outlined text-[15px] text-[var(--accent)]">legend_toggle</span>
                Legenda
                {/* Aberta → seta para cima (recolher); fechada → para baixo
                    (expandir). Estava invertido. */}
                <span className="material-symbols-outlined text-[15px] text-muted">
                    {aberta ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {aberta && (
                <div className="flex flex-col gap-1.5 border-t border-border px-3 py-2.5">
                    {Object.entries(STATUS_META).map(([nome, meta]) => (
                        <span key={nome} className="flex items-center gap-2 text-[11.5px] text-foreground">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: meta.cor }} />
                            <span className="material-symbols-outlined text-[13px] leading-none" style={{ color: meta.cor }}>
                                {meta.icon}
                            </span>
                            <b className="font-semibold">{nome}</b>
                            <span className="text-faint">— {meta.descricao}</span>
                        </span>
                    ))}

                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-faint">
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            Cidade
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rotate-45 bg-current" />
                            Bairro
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}

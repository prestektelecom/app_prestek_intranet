import React from 'react';
import { CARD, FAIXA } from './estilos';

/**
 * Card de seção do formulário. Copia a anatomia de Configuracoes.jsx:
 * faixa de 4px no topo, header com ícone, corpo em grid responsivo.
 */
export default function SecaoForm({ secao, children }) {
    return (
        <section className={CARD}>
            <div className={FAIXA} />
            <header className="flex items-center gap-2.5 border-b border-border px-6 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-dark)]">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        {secao.icone}
                    </span>
                </span>
                <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-foreground">{secao.titulo}</h3>
                    {secao.subtitulo ? (
                        <p className="text-xs text-faint">{secao.subtitulo}</p>
                    ) : null}
                </div>
            </header>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

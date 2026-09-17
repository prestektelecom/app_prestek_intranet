import React, { useState } from 'react';

// Campo de busca "glass" para dentro dos heroes com gradiente.
// O padrão já existia duplicado em Directory.jsx e Comunicados.jsx; extraído
// aqui no terceiro uso. Aquelas duas páginas migram num commit à parte, para
// que um bug aqui não derrube três telas de uma vez.
export default function HeroSearchInput({ value, onChange, placeholder = 'Buscar...', maxWidth = 560 }) {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth }}>
            <span
                className="material-symbols-outlined"
                style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 20,
                    pointerEvents: 'none',
                }}
            >
                search
            </span>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                aria-label={placeholder}
                style={{
                    width: '100%',
                    padding: '14px 48px 14px 50px',
                    background: focused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid rgba(255,255,255,${focused ? 0.6 : 0.3})`,
                    borderRadius: 14,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 500,
                    // Sem isso, o placeholder é cortado cru no meio da palavra em
                    // telas estreitas (achado ~390px) — texto/overflow explícitos
                    // dão as reticências que o corte automático do input não dá.
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    // O foco era só a borda passando de rgba(255,255,255,.3) para
                    // .6 — 2,19:1 contra o preenchimento do input, abaixo dos 3:1
                    // que a WCAG 1.4.11 exige de indicador não-textual. Outline
                    // branco sólido dá 5,18:1 sobre a rampa e casa com o
                    // focus-visible:ring-2 ring-white que os botões vizinhos usam.
                    outline: focused ? '2px solid #FFFFFF' : '2px solid transparent',
                    outlineOffset: 2,
                    transition: 'background .2s, border-color .2s, outline-color .2s',
                }}
            />

            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Limpar busca"
                    // after:-inset-2.5 expande o alvo de toque de ~24px para 44px
                    // sem ocupar layout — o ✕ visual continua do mesmo tamanho.
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white after:absolute after:-inset-2.5 after:content-['']"
                    style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        fontSize: 16,
                        lineHeight: 1,
                        padding: 4,
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    );
}

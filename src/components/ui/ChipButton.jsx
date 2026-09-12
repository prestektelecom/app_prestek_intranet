import React from 'react';
import { useBentoTheme, BENTO_LIGHT } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';

// Chip de filtro com contagem. Mesmo padrão de Directory.jsx / Comunicados.jsx,
// extraído aqui no terceiro uso.
export default function ChipButton({ label, count, active, onClick, color, icon }) {
    const C = useBentoTheme();
    const accent = color || C.accent;
    // Chip "Todos" passa `color={C.accent}` explicitamente (DirectoryToolbar),
    // então checar só "veio prop?" não distingue os casos — precisa comparar o
    // valor. `C.accent` é tom de marca (~500), não de texto: reprova sozinho
    // (medido 2,48:1). Cor por departamento (deptColors.js) já vem calibrada a
    // ≥4,5:1 contra fundo opaco e serve como texto direto.
    //
    // `accentDark` (claro→escuro, escuro→claro, mesmo idioma da Sidebar) cobre
    // os temas escuros com folga (9,8-11,1:1), mas contra ESTE fundo específico
    // (tone(accent, .12) sobre o bg real da página, não branco puro) mede só
    // 4,38:1 no claro — abaixo do piso por uma margem pequena. `accentDeep`
    // resolve o claro (7,92:1) mas zera no escuro (seria escuro sobre escuro).
    const isDark = C.bg !== BENTO_LIGHT.bg;
    const textoAtivo = accent === C.accent ? (isDark ? C.accentDark : C.accentDeep) : accent;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="shrink-0 whitespace-nowrap snap-start cursor-pointer"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 14px',
                minHeight: 44,
                borderRadius: 999,
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                border: `1.5px solid ${active ? accent : C.line}`,
                background: active ? tone(accent, 0.12) : C.surface,
                // Mesmo problema do badge abaixo: sem `color` custom, `accent`
                // é tom de marca (~500) e reprova como texto (medido 2,48:1).
                color: active ? textoAtivo : C.ink2,
                boxShadow: active ? `0 0 0 3px ${tone(accent, 0.12)}` : 'none',
                transition: 'background .2s, border-color .2s, color .2s, box-shadow .2s',
            }}
        >
            {icon && <span className="material-symbols-outlined text-base sm:text-lg">{icon}</span>}
            {label}
            {typeof count === 'number' && (
                <span
                    className="font-mono"
                    style={{
                        borderRadius: 999,
                        padding: '1px 7px',
                        fontSize: 11,
                        fontWeight: 700,
                        // `muted` reprovava os 4,5:1 de texto aqui (medido 2,87:1
                        // ao vivo) — mesmo padrão já corrigido em Comunicados.jsx.
                        background: active ? tone(accent, 0.12) : C.surfaceSoft,
                        color: active ? textoAtivo : C.ink2,
                    }}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

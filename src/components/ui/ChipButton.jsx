import React from 'react';
import { useBentoTheme } from '../../hooks/useBentoTheme';
import { tone } from '../../utils/tone';

// Chip de filtro com contagem. Mesmo padrão de Directory.jsx / Comunicados.jsx,
// extraído aqui no terceiro uso.
export default function ChipButton({ label, count, active, onClick, color, icon }) {
    const C = useBentoTheme();
    const accent = color || C.accent;

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
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                border: `1.5px solid ${active ? accent : C.line}`,
                background: active ? tone(accent, 0.12) : C.surface,
                color: active ? accent : C.ink2,
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
                        background: active ? tone(accent, 0.18) : C.surfaceSoft,
                        color: active ? accent : C.muted,
                    }}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

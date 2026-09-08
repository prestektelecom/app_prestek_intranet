import React from 'react';
import { useTheme, type Theme } from '../hooks/useTheme';
import { useBentoTheme, DARK_VARIANTS, BENTO_LIGHT, BENTO_DARK_DEFAULT } from '../hooks/useBentoTheme';

// Seletor de aparência da página Configurações. Antes era todo em hex com
// classes `dark:`; agora lê os mesmos tokens que o resto do chrome, e oferece
// as quatro variantes escuras (Default Dark incluída).

type Palette = typeof BENTO_LIGHT;

function Preview({ palette, mixed }: { palette: Palette; mixed?: boolean }) {
    const bg = mixed ? `linear-gradient(135deg, ${BENTO_LIGHT.bg}, ${BENTO_DARK_DEFAULT.bg})` : palette.bg;
    return (
        <div aria-hidden="true" style={{ height: 72, borderRadius: 8, background: bg, border: `1px solid ${palette.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!mixed && (
                <>
                    <div style={{ height: 14, background: palette.surface, borderBottom: `1px solid ${palette.line}` }} />
                    <div style={{ flex: 1, padding: 6, display: 'flex', gap: 4 }}>
                        <div style={{ width: '25%', background: palette.surfaceSoft, borderRadius: 3 }} />
                        <div style={{ flex: 1, background: palette.surface, borderRadius: 3 }} />
                    </div>
                </>
            )}
        </div>
    );
}

export default function ThemeSwitcher() {
    const C = useBentoTheme();
    const { theme, setTheme, darkVariant, setDarkVariant } = useTheme();

    const opcoes: { id: Theme; label: string; palette: Palette; mixed?: boolean }[] = [
        { id: 'light', label: 'Claro', palette: BENTO_LIGHT },
        { id: 'dark', label: 'Escuro', palette: BENTO_DARK_DEFAULT },
        { id: 'system', label: 'Sistema', palette: C, mixed: true },
    ];

    const cardStyle = (ativo: boolean): React.CSSProperties => ({
        display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, cursor: 'pointer',
        border: ativo ? `1.5px solid ${C.accent}` : `1px solid ${C.line}`,
        boxShadow: ativo ? `0 0 0 3px ${C.accentSoft}` : 'none',
        background: C.surfaceSoft, transition: 'border-color .15s, box-shadow .15s',
    });

    return (
        <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Aparência</h4>

            <div role="radiogroup" aria-label="Tema" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {opcoes.map((op) => {
                    const ativo = theme === op.id;
                    return (
                        <label key={op.id} style={cardStyle(ativo)}>
                            <input
                                className="sr-only"
                                name="theme"
                                type="radio"
                                value={op.id}
                                checked={ativo}
                                onChange={() => setTheme(op.id)}
                            />
                            <Preview palette={op.palette} mixed={op.mixed} />
                            <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: C.ink }}>{op.label}</span>
                        </label>
                    );
                })}
            </div>

            {(theme === 'dark' || theme === 'system') && (
                <div style={{ marginTop: 24, borderTop: `1px solid ${C.line}`, paddingTop: 20 }}>
                    <h5 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.ink2, marginBottom: 12 }}>
                        Estilo do tema escuro
                    </h5>
                    <div role="group" aria-label="Estilo do tema escuro" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DARK_VARIANTS.map((v) => {
                            const ativo = darkVariant === v.id;
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    aria-pressed={ativo}
                                    onClick={() => setDarkVariant(v.id)}
                                    style={{
                                        ...cardStyle(ativo), alignItems: 'center', textAlign: 'center',
                                        color: ativo ? C.ink : C.ink2, fontWeight: ativo ? 700 : 500, fontSize: 12, fontFamily: 'inherit',
                                    }}
                                >
                                    <span>{v.label}</span>
                                    <span aria-hidden="true" style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                        <span title="Fundo" style={{ width: 14, height: 14, borderRadius: '50%', background: v.theme.bg, border: `1px solid ${v.theme.line}` }} />
                                        <span title="Destaque" style={{ width: 14, height: 14, borderRadius: '50%', background: v.theme.accent }} />
                                        <span title="Sucesso" style={{ width: 14, height: 14, borderRadius: '50%', background: v.theme.success }} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

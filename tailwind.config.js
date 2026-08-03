/**
 * Cor semântica com suporte a modificador de opacidade.
 *
 * Antes as cores eram só "var(--x)". Sem o placeholder <alpha-value>, o Tailwind
 * não conseguia montar o rgba e classes como `bg-surface/95` resolviam para
 * transparente — silenciosamente, sem erro de build.
 *
 * Quando NÃO há modificador devolve a var original, preservando alfas embutidos
 * no design (ex.: --surface no tema cyber é rgba(...,.85) de propósito).
 * Quando há, usa os canais em --x-rgb.
 */
const cor = (nome) => ({ opacityValue }) =>
    opacityValue === undefined
        ? `var(--${nome})`
        : `rgb(var(--${nome}-rgb) / ${opacityValue})`;

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        extend: {
            colors: {
                /* ── Semânticas (CSS vars) ─────────────────────────── */
                background:      cor("background"),
                "background-alt":cor("background-alt"),
                card:            cor("card"),
                surface:         cor("surface"),
                "surface-raised":cor("surface-raised"),
                border:          cor("border"),
                "border-subtle": cor("border-subtle"),
                foreground:      cor("foreground"),
                muted:           cor("foreground-muted"),
                faint:           cor("foreground-faint"),
                primary:         cor("primary"),
                input:           cor("input"),
                ring:            cor("ring"),

                /* Tokens legados — mantidos para não quebrar componentes */
                "surface-container-lowest": cor("card"),
                "surface-container-low":    cor("surface"),
                "surface-container-high":   cor("surface-raised"),
                "on-surface":               cor("foreground"),
                "on-surface-variant":       cor("foreground-faint"),
                "secondary-container":      cor("surface-raised"),
                "on-secondary-container":   cor("foreground-faint"),
                "tertiary-container":       cor("surface"),
                "on-tertiary-container":    cor("foreground-muted"),
                "secondary-fixed":          cor("border"),
                "on-secondary-fixed":       cor("foreground"),
            },
            fontFamily: {
                display:  ["Manrope", "sans-serif"],
                jakarta:  ['"Plus Jakarta Sans"', "sans-serif"],
                mono:     ['"JetBrains Mono"', "monospace"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                lg:      "0.5rem",
                xl:      "0.75rem",
                "2xl":   "1rem",
                full:    "9999px",
            },
            boxShadow: {
                sm:  "var(--shadow-sm)",
                DEFAULT: "var(--shadow-md)",
                md:  "var(--shadow-md)",
                lg:  "var(--shadow-lg)",
                xl:  "var(--shadow-xl)",
            },
            transitionDuration: {
                DEFAULT: "200ms",
            },
        },
    },
    plugins: [],
}

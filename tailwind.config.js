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
                background:      "var(--background)",
                "background-alt":"var(--background-alt)",
                card:            "var(--card)",
                surface:         "var(--surface)",
                "surface-raised":"var(--surface-raised)",
                border:          "var(--border)",
                "border-subtle": "var(--border-subtle)",
                foreground:      "var(--foreground)",
                muted:           "var(--foreground-muted)",
                faint:           "var(--foreground-faint)",
                primary:         "var(--primary)",
                input:           "var(--input)",
                ring:            "var(--ring)",

                /* Tokens legados — mantidos para não quebrar componentes */
                "surface-container-lowest": "var(--card)",
                "surface-container-low":    "var(--surface)",
                "surface-container-high":   "var(--surface-raised)",
                "on-surface":               "var(--foreground)",
                "on-surface-variant":       "var(--foreground-faint)",
                "secondary-container":      "var(--surface-raised)",
                "on-secondary-container":   "var(--foreground-faint)",
                "tertiary-container":       "var(--surface)",
                "on-tertiary-container":    "var(--foreground-muted)",
                "secondary-fixed":          "var(--border)",
                "on-secondary-fixed":       "var(--foreground)",
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

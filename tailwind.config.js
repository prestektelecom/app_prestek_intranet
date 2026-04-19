/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ff8c00",
                "background-light": "#f8f7f5",
                "background-dark": "#231a0f",
                "surface-container-lowest": "var(--surface-lowest)",
                "surface-container-low": "var(--surface-low)",
                "surface-container-high": "var(--surface-high)",
                "on-surface": "var(--on-surface)",
                "on-surface-variant": "var(--on-surface-variant)",
                "secondary": "#a17745",
                "secondary-container": "var(--secondary-container)",
                "on-secondary-container": "var(--on-secondary-container)",
                "tertiary-container": "var(--tertiary-container)",
                "on-tertiary-container": "var(--on-tertiary-container)",
                "secondary-fixed": "var(--secondary-fixed)",
                "on-secondary-fixed": "var(--on-secondary-fixed)",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px",
            },
        },
    },
    plugins: [],
}

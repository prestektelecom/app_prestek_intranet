import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type DarkVariant = 'cyber' | 'aurora' | 'amoled';

interface ThemeContextType {
    theme: Theme;
    setTheme: (t: Theme) => void;
    darkVariant: DarkVariant;
    setDarkVariant: (v: DarkVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyThemeClasses(theme: Theme, darkVariant: DarkVariant) {
    const root = window.document.documentElement;
    // Remove variantes de escuridão existentes
    root.classList.remove('dark-cyber', 'dark-aurora', 'dark-amoled');

    const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        root.classList.add('dark');
        root.classList.add(`dark-${darkVariant}`);
    } else {
        root.classList.remove('dark');
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        return saved || 'system';
    });

    const [darkVariant, setDarkVariantState] = useState<DarkVariant>(() => {
        const saved = localStorage.getItem('dark_theme_variant') as DarkVariant | null;
        return saved || 'cyber';
    });

    // Aplica classes no root e persiste no localStorage
    useEffect(() => {
        applyThemeClasses(theme, darkVariant);
        if (theme === 'light' || theme === 'dark') {
            localStorage.setItem('theme', theme);
        } else {
            localStorage.removeItem('theme');
        }
        localStorage.setItem('dark_theme_variant', darkVariant);
    }, [theme, darkVariant]);

    // Reage a mudanças de preferência do sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyThemeClasses('system', darkVariant);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, darkVariant]);

    const setTheme = (t: Theme) => setThemeState(t);
    const setDarkVariant = (v: DarkVariant) => setDarkVariantState(v);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, darkVariant, setDarkVariant }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    }
    return ctx;
}

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type DarkVariant = 'cyber' | 'aurora' | 'amoled';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        return saved || 'system';
    });

    const [darkVariant, setDarkVariant] = useState<DarkVariant>(() => {
        const saved = localStorage.getItem('dark_theme_variant') as DarkVariant | null;
        return saved || 'cyber';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove existing theme variant classes
        root.classList.remove('dark-cyber', 'dark-aurora', 'dark-amoled');

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.add(`dark-${darkVariant}`);
            localStorage.setItem('theme', 'dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
                root.classList.add(`dark-${darkVariant}`);
            } else {
                root.classList.remove('dark');
            }
        }
        localStorage.setItem('dark_theme_variant', darkVariant);
    }, [theme, darkVariant]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                const root = window.document.documentElement;
                root.classList.remove('dark-cyber', 'dark-aurora', 'dark-amoled');
                if (e.matches) {
                    root.classList.add('dark');
                    root.classList.add(`dark-${darkVariant}`);
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, darkVariant]);

    return { theme, setTheme, darkVariant, setDarkVariant };
}

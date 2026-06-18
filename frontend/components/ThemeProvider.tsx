'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'quantum-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw === 'dark' || raw === 'light') {
                setThemeState(raw);
            }
        } catch {
            /* ignore */
        }
    }, []);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        try {
            localStorage.setItem(STORAGE_KEY, t);
        } catch {
            /* ignore */
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                /* ignore */
            }
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            <div
                suppressHydrationWarning
                className={`min-h-dvh w-full transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}
                style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
}

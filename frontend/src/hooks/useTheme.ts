import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'aura-glow';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    // For the very first visit, respect OS preference
    if (!storedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return storedTheme;
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'aura-glow');
    
    // Add theme class to html element
    document.documentElement.classList.add(theme);

    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme };
}

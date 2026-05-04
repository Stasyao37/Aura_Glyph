import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'aura-glow';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('aura-glow');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || 'aura-glow'; // Default to aura-glow
    setThemeState(initialTheme);
  }, []);

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

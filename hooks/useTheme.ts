import { useState, useEffect } from 'react';
import { Theme } from '../types';

export interface UseThemeReturn {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
  effectiveTheme: 'light' | 'dark';
}

export const useTheme = (): UseThemeReturn => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' || storedTheme === 'jw') {
      return storedTheme as Theme;
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('is-dark-mode');
    if (stored) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const effectiveTheme = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let darkMode = false;
        
      if (theme === 'jw') {
        root.classList.add('theme-jw');
        darkMode = isDarkMode; // Respect manual toggle for JW theme
      } else {
        root.classList.remove('theme-jw');
        if (theme === 'dark') {
          darkMode = true;
        } else if (theme === 'light') {
          darkMode = false;
        } else { // System
          darkMode = mediaQuery.matches;
        }
      }

      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setIsDarkMode(darkMode);
    };

    applyTheme();
    localStorage.setItem('theme', theme);
    
    const mediaQueryListener = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', mediaQueryListener);
    
    return () => {
      mediaQuery.removeEventListener('change', mediaQueryListener);
    };
  }, [theme, isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('is-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    if (theme === 'system' || theme === 'jw') {
      setIsDarkMode(prev => !prev);
    } else {
      setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
    }
  };

  return {
    theme,
    setTheme,
    isDarkMode,
    setIsDarkMode,
    toggleTheme,
    effectiveTheme
  };
};

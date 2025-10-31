'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  actualTheme: 'light',
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage on mount
    if (globalThis.window !== undefined) {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });
  const [actualTheme, setActualTheme] = useState(() => {
    if (globalThis.window !== undefined) {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (currentTheme) => {
      let themeToApply = currentTheme;
      
      // If system theme, detect user's preference
      if (currentTheme === 'system') {
        const systemTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        themeToApply = systemTheme;
      }
      
      // Apply theme by toggling class on root element
      if (themeToApply === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setActualTheme(themeToApply);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, actualTheme }),
    [theme, actualTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

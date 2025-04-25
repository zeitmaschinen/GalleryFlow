import { useState, useCallback, useEffect } from 'react';
import { createTheme, Theme } from '@mui/material/styles';
import { customLightTheme, customDarkTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

export const useTheme = (defaultMode: ThemeMode = 'light') => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || defaultMode;
  });

  const [theme, setTheme] = useState<Theme>(() => 
    mode === 'light' ? createTheme(customLightTheme) : createTheme(customDarkTheme)
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    setTheme(mode === 'light' ? createTheme(customLightTheme) : createTheme(customDarkTheme));
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return {
    theme,
    mode,
    setMode,
    toggleTheme,
    isDarkMode: mode === 'dark'
  };
};
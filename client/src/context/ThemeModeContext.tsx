import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

const STORAGE_KEY = 'themeMode';

const readInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return stored === 'dark' || stored === 'light' ? stored : 'light';
};

export const ThemeModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(readInitialMode);

  const setMode = (nextMode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, nextMode);
    setModeState(nextMode);
  };

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#FF5722',
          },
          secondary: {
            main: '#616161',
          },
          background: mode === 'light'
            ? { default: '#F7F7F9', paper: '#FFFFFF' }
            : { default: '#0F1115', paper: '#151821' },
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

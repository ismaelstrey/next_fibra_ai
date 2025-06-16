'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  sidebarVisible: boolean;
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  sidebarVisible: true,
  toggleSidebar: () => null,
  setSidebarVisible: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Recupera o estado da sidebar do localStorage ao iniciar
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarVisible');
    if (savedSidebarState !== null) {
      setSidebarVisible(savedSidebarState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    localStorage.setItem('sidebarVisible', String(newState));
    setSidebarVisible(newState);
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    },
    sidebarVisible,
    toggleSidebar,
    setSidebarVisible: (visible: boolean) => {
      localStorage.setItem('sidebarVisible', String(visible));
      setSidebarVisible(visible);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

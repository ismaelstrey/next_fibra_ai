'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook para utilizar o contexto de tema
 * @returns {ThemeContextType} Objeto com o tema atual e funções para alterá-lo
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

/**
 * Provedor de contexto de tema para a aplicação
 * Gerencia o estado do tema (claro/escuro) e sincroniza com localStorage e preferências do sistema
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Estado para armazenar o tema atual (inicializado com 'light' para evitar diferenças entre SSR e cliente)
  const [theme, setThemeState] = useState<Theme>('light');
  // Estado para controlar se o componente está montado no cliente
  const [isMounted, setIsMounted] = useState(false);

  // Efeito para carregar o tema do localStorage ou preferências do sistema
  // Este efeito só é executado no cliente, não no servidor
  useEffect(() => {
    // Marca o componente como montado
    setIsMounted(true);
    
    // Verifica se há um tema salvo no localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Se houver um tema salvo, usa-o
    if (storedTheme) {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } 
    // Caso contrário, verifica as preferências do sistema
    else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    }
  }, []);

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      if (isMounted) {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
      return newTheme;
    });
  };

  // Função para definir um tema específico
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (isMounted) {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ duration: 0.15 }}
          className="min-h-screen"
          suppressHydrationWarning
        > 

             
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
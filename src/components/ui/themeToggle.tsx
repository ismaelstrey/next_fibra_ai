'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Componente para alternar entre os temas claro e escuro
 * Inclui animações suaves e ícones representativos
 */
export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`flex items-center gap-2 rounded-full bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-secondary/80 ${className}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className="relative h-6 w-6"
      >
        <motion.div
          initial={false}
          animate={{ opacity: theme === 'dark' ? 1 : 0, scale: theme === 'dark' ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="h-5 w-5 text-primary" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{ opacity: theme === 'light' ? 1 : 0, scale: theme === 'light' ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </motion.div>
      </motion.div>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </motion.button>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { XIcon, MenuIcon, LogOutIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { menuItems } from '@/constants/menuItems';

/**
 * Componente de menu móvel para o dashboard
 * Exibe um botão de menu que, quando clicado, abre um menu deslizante
 */
export default function MobileMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { fazerLogout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu quando a rota muda
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await fazerLogout();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Ocorreu um erro ao fazer logout');
    }
  };

  return (
    <>
      {/* Botão de menu para dispositivos móveis */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Menu"
        >
          {menuAberto ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu deslizante para dispositivos móveis */}
      <AnimatePresence>
        {menuAberto && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-lg md:hidden"
            suppressHydrationWarning
          >
            <div className="flex flex-col h-full px-4 py-5">
              <div className="flex items-center justify-between h-14 mb-8">
                <h1 className="text-2xl font-bold text-primary">FibraDoc</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuAberto(false)}
                  aria-label="Fechar menu"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto">
                <div className="border-t border-border pt-4">
                  <div className="flex items-center px-4 py-2">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground" suppressHydrationWarning>
                        {session?.user?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium" suppressHydrationWarning>{session?.user?.name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{session?.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-2 justify-start"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="h-5 w-5 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar o menu em dispositivos móveis */}
      {menuAberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black z-30 md:hidden"
          onClick={() => setMenuAberto(false)}
          suppressHydrationWarning
        />
      )}
    </>
  );
}
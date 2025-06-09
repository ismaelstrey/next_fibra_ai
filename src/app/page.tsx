'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

/**
 * Página inicial do sistema
 * Redireciona para o dashboard se o usuário estiver autenticado
 * ou para a página de login caso contrário
 */
export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  // Efeito para redirecionar com base no status de autenticação
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Animações para a tela de carregamento
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.3,
        duration: 0.8
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.5,
        duration: 0.8,
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col items-center gap-8"
        variants={logoVariants}
      >
        {/* Aqui você pode adicionar o logo da sua empresa */}
        <div className="relative w-32 h-32 mb-4">
          <Image 
            src="/logo-fibra.svg" 
            alt="Logo Fibra" 
            fill
            priority
            className="object-contain"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-primary">Sistema de Gerenciamento de Fibra Óptica</h1>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando...</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

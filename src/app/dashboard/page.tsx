// src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { MapIcon, BoxIcon, CableIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Página principal do dashboard
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  // Redireciona para a página de login se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setCarregando(false);
    }
  }, [status, router]);

  // Exibe um indicador de carregamento enquanto verifica a autenticação
  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Animação para os cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        delay: 0.1
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Bem-vindo, {session?.user?.name || 'Usuário'}</h1>
        <p className="text-muted-foreground">Painel de controle do sistema FibraDoc</p>
      </header>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants as Variants}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/mapa')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-medium">Mapa</CardTitle>
              <MapIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Visualize e gerencie a infraestrutura no mapa</CardDescription>
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/dashboard/mapa')}>Acessar mapa</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants as Variants}>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/caixas')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-medium">Caixas</CardTitle>
              <BoxIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gerencie caixas de atendimento e emenda</CardDescription>
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/dashboard/caixas')}>Gerenciar caixas</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants as Variants}>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/rotas')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-medium">Rotas</CardTitle>
              <CableIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gerencie rotas de cabos de fibra óptica</CardDescription>
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/dashboard/rotas')}>Gerenciar rotas</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants as Variants}>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/usuarios')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-medium">Usuários</CardTitle>
              <UsersIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Gerencie usuários e permissões</CardDescription>
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/dashboard/usuarios')}>Gerenciar usuários</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants as Variants}>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/configuracoes')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-medium">Configurações</CardTitle>
              <SettingsIcon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>Configure parâmetros do sistema</CardDescription>
              <Button variant="link" className="p-0 mt-2" onClick={() => router.push('/dashboard/configuracoes')}>Acessar configurações</Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
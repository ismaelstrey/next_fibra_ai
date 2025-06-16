// src/app/dashboard/layout.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';
import { useTheme } from '@/context/ThemeContext';
import { DashboardHeader } from '@/components/layout/dashboardHeader';

/**
 * Layout do dashboard
 * @param props - Propriedades do layout
 * @returns Layout do dashboard com barra lateral e conteúdo
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sidebarVisible } = useTheme();
  const [carregando, setCarregando] = useState(true);
  const [menu, setMenu] = useState<"top" | "left">("left");

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
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" suppressHydrationWarning></div>
      </div>
    );
  }

  // Links da barra lateral


  return (
    <div className="flex w-full h-screen bg-background">
      {/* Menu móvel */}
      <MobileMenu />

      {/* Barra lateral para desktop */}
      {menu === "left" && <Sidebar />}
      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 transition-all duration-200" style={{ paddingLeft: menu === "left" ? (sidebarVisible ? '16rem' : '4rem') : '0' }}>
        {/* Header do Dashboard */}
        {menu === "top" && <DashboardHeader />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


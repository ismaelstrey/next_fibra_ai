'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { ThemeToggle } from '@/components/ui/themeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';

/**
 * Componente de cabeçalho para o dashboard
 * Inclui navegação, notificações, alternância de tema e menu de usuário
 */
export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Links de navegação
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/mapa', label: 'Mapa' },
    { href: '/dashboard/caixas', label: 'Caixas' },
    { href: '/dashboard/rotas', label: 'Rotas' },
    { href: '/dashboard/fusoes', label: 'Fusões' },
    { href: '/dashboard/manutencoes', label: 'Manutenções' },
    { href: '/dashboard/relatorios', label: 'Relatórios' },
    { href: '/dashboard/configuracoes', label: 'Configurações' },
    { href: '/dashboard/manutencoes', label: 'Manutenções' },
  ];

  // Função para verificar se um link está ativo
  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo e título */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo-fibra.svg" alt="FibraDoc" className="h-8 w-8" />
            <span className="hidden font-bold text-primary md:inline-block">FibraDoc</span>
          </Link>
        </div>

        {/* Navegação desktop */}
        <nav className="hidden md:flex md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Ações do cabeçalho */}
        <div className="flex items-center gap-2">
          {/* Alternância de tema */}
          <ThemeToggle />

          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="@usuario" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Usuário</p>
                  <p className="text-xs text-muted-foreground">usuario@exemplo.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracoes" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex cursor-pointer items-center text-destructive focus:text-destructive"
                onSelect={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão do menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t bg-background md:hidden"
        >
          <div className="container space-y-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex w-full rounded-md px-3 py-2 text-sm font-medium ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}
import {
  MapIcon,
  BoxIcon,
  CableIcon,
  SettingsIcon,
  UsersIcon,
  HomeIcon,
  FileTextIcon,
  WrenchIcon
} from 'lucide-react';

/**
 * Itens do menu de navegação do dashboard
 */
export const menuItems = [
  { href: '/dashboard', label: 'Início', icon: <HomeIcon className="h-5 w-5" /> },
  { href: '/dashboard/mapa', label: 'Mapa', icon: <MapIcon className="h-5 w-5" /> },
  { href: '/dashboard/caixas', label: 'Caixas', icon: <BoxIcon className="h-5 w-5" /> },
  { href: '/dashboard/rotas', label: 'Rotas', icon: <CableIcon className="h-5 w-5" /> },
  { href: '/dashboard/manutencoes', label: 'Manutenções', icon: <WrenchIcon className="h-5 w-5" /> },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: <FileTextIcon className="h-5 w-5" /> },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: <UsersIcon className="h-5 w-5" /> },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: <SettingsIcon className="h-5 w-5" /> },

];
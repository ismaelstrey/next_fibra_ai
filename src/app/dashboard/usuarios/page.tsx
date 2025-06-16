'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  FilterIcon,
  ArrowUpDownIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ShieldIcon,
  MailIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Tipo para os dados de um usuário
 */
type Usuario = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  cidades: string[];
  criadoEm: string;
};

/**
 * Página de gerenciamento de usuários
 * Permite visualizar, criar, editar e excluir usuários do sistema
 */
export default function UsuariosPage() {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'email' | 'cargo'>('nome');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');

  // Dados de exemplo para usuários
  const usuariosExemplo: Usuario[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao.silva@exemplo.com',
      cargo: 'Engenheiro',
      cidades: ['Cidade 1', 'Cidade 2'],
      criadoEm: '2023-01-15'
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@exemplo.com',
      cargo: 'Técnico',
      cidades: ['Cidade 1'],
      criadoEm: '2023-02-20'
    },
    {
      id: '3',
      nome: 'Pedro Santos',
      email: 'pedro.santos@exemplo.com',
      cargo: 'Gerente',
      cidades: ['Cidade 1', 'Cidade 2'],
      criadoEm: '2023-03-10'
    },
    {
      id: '4',
      nome: 'Ana Costa',
      email: 'ana.costa@exemplo.com',
      cargo: 'Técnico',
      cidades: ['Cidade 2'],
      criadoEm: '2023-04-05'
    },
    {
      id: '5',
      nome: 'Carlos Ferreira',
      email: 'carlos.ferreira@exemplo.com',
      cargo: 'Engenheiro',
      cidades: ['Cidade 1'],
      criadoEm: '2023-05-12'
    },
  ];

  /**
   * Função para lidar com a busca de usuários
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      toast.success(`Buscando por: ${busca}`);
      // Aqui seria a lógica de busca de usuários
    }
  };

  /**
   * Função para alternar a ordenação da tabela
   * @param campo - Campo a ser ordenado
   */
  const alternarOrdenacao = (campo: 'nome' | 'email' | 'cargo') => {
    if (ordenacao === campo) {
      setOrdem(ordem === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(campo);
      setOrdem('asc');
    }
  };

  /**
   * Função para visualizar detalhes de um usuário
   * @param id - ID do usuário
   */
  const visualizarUsuario = (id: string) => {
    toast.success(`Visualizando usuário ${id}`);
    // Aqui seria a navegação para a página de detalhes do usuário
  };

  /**
   * Função para editar um usuário
   * @param id - ID do usuário
   */
  const editarUsuario = (id: string) => {
    toast.success(`Editando usuário ${id}`);
    // Aqui seria a navegação para a página de edição do usuário
  };

  /**
   * Função para excluir um usuário
   * @param id - ID do usuário
   */
  const excluirUsuario = (id: string) => {
    toast.success(`Excluindo usuário ${id}`);
    // Aqui seria a lógica para excluir o usuário
  };

  /**
   * Função para formatar a data de criação
   * @param dataString - Data em formato string
   * @returns Data formatada
   */
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  /**
   * Função para obter a cor de fundo do cargo
   * @param cargo - Cargo do usuário
   * @returns Classes CSS para o cargo
   */
  const getCorCargo = (cargo: string): string => {
    switch (cargo) {
      case 'Gerente':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Engenheiro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Técnico':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="container mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <UsersIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Gerenciamento de Usuários</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleBusca} className="flex">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar usuários..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Buscar</Button>
          </form>
          <Button className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Painel de filtros */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cargo</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="gerente">Gerente</option>
                  <option value="engenheiro">Engenheiro</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cidade</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todas</option>
                  <option value="cidade1">Cidade 1</option>
                  <option value="cidade2">Cidade 2</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Data de Criação</label>
                <div className="flex items-center gap-2">
                  <Input type="date" className="w-full" />
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de usuários */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('nome')}
                      >
                        <div className="flex items-center">
                          Nome
                          {ordenacao === 'nome' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {ordenacao === 'email' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('cargo')}
                      >
                        <div className="flex items-center">
                          Cargo
                          {ordenacao === 'cargo' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Cidades</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Criado em</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosExemplo.map((usuario) => (
                      <tr key={usuario.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{usuario.nome}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <MailIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                            {usuario.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCorCargo(usuario.cargo)}`}>
                            <ShieldIcon className="h-3 w-3 mr-1" />
                            {usuario.cargo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {usuario.cidades.join(', ')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatarData(usuario.criadoEm)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => visualizarUsuario(usuario.id)}
                              title="Visualizar"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editarUsuario(usuario.id)}
                              title="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => excluirUsuario(usuario.id)}
                              title="Excluir"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
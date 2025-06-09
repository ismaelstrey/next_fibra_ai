'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  BoxIcon, 
  SearchIcon, 
  PlusIcon, 
  FilterIcon,
  ArrowUpDownIcon,
  EditIcon,
  TrashIcon,
  EyeIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Tipo para os dados de uma caixa
 */
type Caixa = {
  id: string;
  nome: string;
  tipo: 'CTO' | 'CEO';
  modelo: string;
  capacidade: number;
  cidade: string;
  coordenadas: { lat: number; lng: number };
};

/**
 * Página de gerenciamento de caixas
 * Permite visualizar, criar, editar e excluir caixas de fibra óptica
 */
export default function CaixasPage() {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'tipo' | 'cidade'>('nome');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');
  
  // Dados de exemplo para caixas
  const caixasExemplo: Caixa[] = [
    {
      id: '1',
      nome: 'CTO-001',
      tipo: 'CTO',
      modelo: 'FK-OTO-16M',
      capacidade: 16,
      cidade: 'Cidade 1',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    {
      id: '2',
      nome: 'CEO-001',
      tipo: 'CEO',
      modelo: 'FK-CEO-48F',
      capacidade: 48,
      cidade: 'Cidade 1',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    {
      id: '3',
      nome: 'CTO-002',
      tipo: 'CTO',
      modelo: 'FK-OTO-16M',
      capacidade: 16,
      cidade: 'Cidade 2',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    {
      id: '4',
      nome: 'CEO-002',
      tipo: 'CEO',
      modelo: 'FK-CEO-24F',
      capacidade: 24,
      cidade: 'Cidade 2',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
    {
      id: '5',
      nome: 'CTO-003',
      tipo: 'CTO',
      modelo: 'FK-OTO-8M',
      capacidade: 8,
      cidade: 'Cidade 1',
      coordenadas: { lat: -23.5505, lng: -46.6333 }
    },
  ];

  /**
   * Função para lidar com a busca de caixas
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      toast.success(`Buscando por: ${busca}`);
      // Aqui seria a lógica de busca de caixas
    }
  };

  /**
   * Função para alternar a ordenação da tabela
   * @param campo - Campo a ser ordenado
   */
  const alternarOrdenacao = (campo: 'nome' | 'tipo' | 'cidade') => {
    if (ordenacao === campo) {
      setOrdem(ordem === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(campo);
      setOrdem('asc');
    }
  };

  /**
   * Função para visualizar detalhes de uma caixa
   * @param id - ID da caixa
   */
  const visualizarCaixa = (id: string) => {
    toast.success(`Visualizando caixa ${id}`);
    // Aqui seria a navegação para a página de detalhes da caixa
  };

  /**
   * Função para editar uma caixa
   * @param id - ID da caixa
   */
  const editarCaixa = (id: string) => {
    toast.success(`Editando caixa ${id}`);
    // Aqui seria a navegação para a página de edição da caixa
  };

  /**
   * Função para excluir uma caixa
   * @param id - ID da caixa
   */
  const excluirCaixa = (id: string) => {
    toast.success(`Excluindo caixa ${id}`);
    // Aqui seria a lógica para excluir a caixa
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
          <BoxIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Gerenciamento de Caixas</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleBusca} className="flex">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar caixas..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Buscar</Button>
          </form>
          <Button className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Nova Caixa
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
                <label className="text-sm font-medium">Tipo de Caixa</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="cto">CTO</option>
                  <option value="ceo">CEO</option>
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
                <label className="text-sm font-medium">Capacidade</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todas</option>
                  <option value="8">8 portas</option>
                  <option value="16">16 portas</option>
                  <option value="24">24 portas</option>
                  <option value="48">48 portas</option>
                </select>
              </div>
              <Button className="w-full" variant="outline">
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de caixas */}
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
                        onClick={() => alternarOrdenacao('tipo')}
                      >
                        <div className="flex items-center">
                          Tipo
                          {ordenacao === 'tipo' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Modelo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Capacidade</th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('cidade')}
                      >
                        <div className="flex items-center">
                          Cidade
                          {ordenacao === 'cidade' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caixasExemplo.map((caixa) => (
                      <tr key={caixa.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{caixa.nome}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${caixa.tipo === 'CTO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                            {caixa.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{caixa.modelo}</td>
                        <td className="px-4 py-3 text-sm">{caixa.capacidade}</td>
                        <td className="px-4 py-3 text-sm">{caixa.cidade}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => visualizarCaixa(caixa.id)}
                              title="Visualizar"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => editarCaixa(caixa.id)}
                              title="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => excluirCaixa(caixa.id)}
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
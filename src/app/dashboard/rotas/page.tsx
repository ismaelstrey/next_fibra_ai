'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  CableIcon,
  SearchIcon,
  PlusIcon,
  FilterIcon,
  ArrowUpDownIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  RulerIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Tipo para os dados de uma rota
 */
type Rota = {
  id: string;
  nome: string;
  tipoCabo: string;
  distancia: number;
  tipoPassagem: string;
  cidade: string;
  cor: string;
};

/**
 * Página de gerenciamento de rotas
 * Permite visualizar, criar, editar e excluir rotas de cabos de fibra óptica
 */
export default function RotasPage() {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'tipoCabo' | 'cidade'>('nome');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');

  // Dados de exemplo para rotas
  const rotasExemplo: Rota[] = [
    {
      id: '1',
      nome: 'ROTA-001',
      tipoCabo: '12 vias',
      distancia: 1250,
      tipoPassagem: 'Posteado',
      cidade: 'Cidade 1',
      cor: '#FF5733'
    },
    {
      id: '2',
      nome: 'ROTA-002',
      tipoCabo: '24 vias',
      distancia: 850,
      tipoPassagem: 'Subterrâneo',
      cidade: 'Cidade 1',
      cor: '#33FF57'
    },
    {
      id: '3',
      nome: 'ROTA-003',
      tipoCabo: '48 vias',
      distancia: 2100,
      tipoPassagem: 'Posteado',
      cidade: 'Cidade 2',
      cor: '#3357FF'
    },
    {
      id: '4',
      nome: 'ROTA-004',
      tipoCabo: '96 vias',
      distancia: 3500,
      tipoPassagem: 'Posteado',
      cidade: 'Cidade 2',
      cor: '#F3FF33'
    },
    {
      id: '5',
      nome: 'ROTA-005',
      tipoCabo: '6 vias',
      distancia: 450,
      tipoPassagem: 'Aéreo',
      cidade: 'Cidade 1',
      cor: '#FF33F6'
    },
  ];

  /**
   * Função para lidar com a busca de rotas
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      toast.success(`Buscando por: ${busca}`);
      // Aqui seria a lógica de busca de rotas
    }
  };

  /**
   * Função para alternar a ordenação da tabela
   * @param campo - Campo a ser ordenado
   */
  const alternarOrdenacao = (campo: 'nome' | 'tipoCabo' | 'cidade') => {
    if (ordenacao === campo) {
      setOrdem(ordem === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(campo);
      setOrdem('asc');
    }
  };

  /**
   * Função para visualizar detalhes de uma rota
   * @param id - ID da rota
   */
  const visualizarRota = (id: string) => {
    toast.success(`Visualizando rota ${id}`);
    // Aqui seria a navegação para a página de detalhes da rota
  };

  /**
   * Função para editar uma rota
   * @param id - ID da rota
   */
  const editarRota = (id: string) => {
    toast.success(`Editando rota ${id}`);
    // Aqui seria a navegação para a página de edição da rota
  };

  /**
   * Função para excluir uma rota
   * @param id - ID da rota
   */
  const excluirRota = (id: string) => {
    toast.success(`Excluindo rota ${id}`);
    // Aqui seria a lógica para excluir a rota
  };

  /**
   * Função para formatar a distância em metros ou quilômetros
   * @param distancia - Distância em metros
   * @returns Distância formatada
   */
  const formatarDistancia = (distancia: number): string => {
    if (distancia >= 1000) {
      return `${(distancia / 1000).toFixed(2)} km`;
    }
    return `${distancia} m`;
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
          <CableIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Gerenciamento de Rotas</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleBusca} className="flex">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar rotas..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Buscar</Button>
          </form>
          <Button className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Nova Rota
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
                <label className="text-sm font-medium">Tipo de Cabo</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="6">6 vias</option>
                  <option value="12">12 vias</option>
                  <option value="24">24 vias</option>
                  <option value="48">48 vias</option>
                  <option value="96">96 vias</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo de Passagem</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="posteado">Posteado</option>
                  <option value="subterraneo">Subterrâneo</option>
                  <option value="aereo">Aéreo</option>
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
                <label className="text-sm font-medium">Distância</label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="w-1/2" />
                  <Input type="number" placeholder="Max" className="w-1/2" />
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de rotas */}
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
                        onClick={() => alternarOrdenacao('tipoCabo')}
                      >
                        <div className="flex items-center">
                          Tipo de Cabo
                          {ordenacao === 'tipoCabo' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Distância</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Passagem</th>
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
                      <th className="px-4 py-3 text-left text-sm font-medium">Cor</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotasExemplo.map((rota) => (
                      <tr key={rota.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{rota.nome}</td>
                        <td className="px-4 py-3 text-sm">{rota.tipoCabo}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <RulerIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                            {formatarDistancia(rota.distancia)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{rota.tipoPassagem}</td>
                        <td className="px-4 py-3 text-sm">{rota.cidade}</td>
                        <td className="px-4 py-3 text-sm">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: rota.cor }}
                            title={rota.cor}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => visualizarRota(rota.id)}
                              title="Visualizar"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editarRota(rota.id)}
                              title="Editar"
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => excluirRota(rota.id)}
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
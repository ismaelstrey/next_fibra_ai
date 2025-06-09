'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MapIcon, SearchIcon, LayersIcon, FilterIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de visualização do mapa de fibra óptica
 * Permite visualizar e gerenciar a infraestrutura de fibra óptica no mapa
 */
export default function MapaPage() {
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Simula o carregamento do mapa
  useEffect(() => {
    // Aqui seria a inicialização da API do Google Maps
    const timer = setTimeout(() => {
      setCarregando(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * Função para lidar com a busca no mapa
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      toast.success(`Buscando por: ${busca}`);
      // Aqui seria a lógica de busca no mapa
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
          <MapIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Mapa de Infraestrutura</h1>
        </div>
        
        <form onSubmit={handleBusca} className="flex w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar no mapa..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Button type="submit" className="ml-2">Buscar</Button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Painel lateral */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <LayersIcon className="h-4 w-4 mr-2" />
                Camadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="caixas" className="mr-2" defaultChecked />
                <label htmlFor="caixas" className="text-sm">Caixas (CTO/CEO)</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="rotas" className="mr-2" defaultChecked />
                <label htmlFor="rotas" className="text-sm">Rotas de Cabos</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="fusoes" className="mr-2" defaultChecked />
                <label htmlFor="fusoes" className="text-sm">Pontos de Fusão</label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo de Caixa</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todos</option>
                  <option value="cto">CTO</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
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
                <label className="text-sm font-medium">Cidade</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="">Todas</option>
                  <option value="cidade1">Cidade 1</option>
                  <option value="cidade2">Cidade 2</option>
                </select>
              </div>
              <Button className="w-full mt-2" variant="outline" size="sm">
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área do mapa */}
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardContent className="p-0 h-full">
              {carregando ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="relative h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Mapa do Google será carregado aqui</p>
                    <p className="text-xs text-muted-foreground">É necessário configurar a API do Google Maps</p>
                  </div>
                  {/* Aqui seria renderizado o componente do Google Maps */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
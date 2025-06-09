'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MapIcon, SearchIcon, LayersIcon, FilterIcon, PencilIcon, MapPinIcon, BoxIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import GoogleMapsComponent from '@/components/mapa/GoogleMapsComponent';
import useMapa, { CamadasVisiveis, FiltrosMapa } from '@/hooks/useMapa';
import ToolsMap from '@/components/mapa/ToolsMap';

/**
 * Página de visualização do mapa de fibra óptica
 * Permite visualizar e gerenciar a infraestrutura de fibra óptica no mapa
 */
export default function MapaPage() {
  // Chave da API do Google Maps
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Estado para a busca
  const [busca, setBusca] = useState('');

  // Hook personalizado para gerenciar o estado do mapa
  const {
    rotas,
    caixas,
    filtros,
    camadasVisiveis,
    modoEdicao,
    tipoCaboSelecionado,
    adicionarRota,
    adicionarCaixa,
    atualizarFiltros,
    atualizarCamadasVisiveis,
    setModoEdicao,
    setTipoCaboSelecionado,
    buscarNoMapa
  } = useMapa();

  /**
   * Função para lidar com a busca no mapa
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      const resultados = buscarNoMapa(busca);

      if (resultados.rotas.length > 0 || resultados.caixas.length > 0) {
        toast.success(`Encontrados: ${resultados.rotas.length} rotas e ${resultados.caixas.length} caixas`);
        // Aqui poderia centralizar o mapa no primeiro resultado
      } else {
        toast.error(`Nenhum resultado encontrado para: ${busca}`);
      }
    }
  };

  /**
   * Função para atualizar as camadas visíveis
   */
  const handleToggleCamada = (tipo: keyof CamadasVisiveis, valor: boolean) => {
    atualizarCamadasVisiveis({ [tipo]: valor });
  };

  /**
   * Função para atualizar os filtros
   */
  const handleAtualizarFiltro = (tipo: keyof FiltrosMapa, valor: any) => {
    atualizarFiltros({ [tipo]: valor });
  };

  /**
   * Função para lidar com o desenho de uma nova rota
   */
  const handleRotaDesenhada = (path: google.maps.LatLng[]) => {
    // Converte o path para o formato esperado
    const pathFormatado = path.map(ponto => ({
      lat: ponto.lat(),
      lng: ponto.lng()
    }));

    // Adiciona a nova rota
    adicionarRota({
      nome: `Rota ${rotas.length + 1}`,
      tipoCabo: tipoCaboSelecionado,
      path: pathFormatado
    });
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
                <input
                  type="checkbox"
                  id="caixas"
                  className="mr-2"
                  checked={camadasVisiveis.caixas}
                  onChange={(e) => handleToggleCamada('caixas', e.target.checked)}
                />
                <label htmlFor="caixas" className="text-sm">Caixas (CTO/CEO)</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rotas"
                  className="mr-2"
                  checked={camadasVisiveis.rotas}
                  onChange={(e) => handleToggleCamada('rotas', e.target.checked)}
                />
                <label htmlFor="rotas" className="text-sm">Rotas de Cabos</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fusoes"
                  className="mr-2"
                  checked={camadasVisiveis.fusoes}
                  onChange={(e) => handleToggleCamada('fusoes', e.target.checked)}
                />
                <label htmlFor="fusoes" className="text-sm">Pontos de Fusão</label>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Tipo de Cabo</p>
                <ToggleGroup type="single" value={tipoCaboSelecionado} onValueChange={(value) => value && setTipoCaboSelecionado(value as any)}>
                  <ToggleGroupItem value="6" size="sm" className="text-xs">6</ToggleGroupItem>
                  <ToggleGroupItem value="12" size="sm" className="text-xs">12</ToggleGroupItem>
                  <ToggleGroupItem value="24" size="sm" className="text-xs">24</ToggleGroupItem>
                  <ToggleGroupItem value="48" size="sm" className="text-xs">48</ToggleGroupItem>
                  <ToggleGroupItem value="96" size="sm" className="text-xs">96</ToggleGroupItem>
                </ToggleGroup>
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
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtros.tipoCaixa || ''}
                  onChange={(e) => handleAtualizarFiltro('tipoCaixa', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="CTO">CTO</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo de Cabo</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtros.tipoCabo || ''}
                  onChange={(e) => handleAtualizarFiltro('tipoCabo', e.target.value)}
                >
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
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtros.cidade || ''}
                  onChange={(e) => handleAtualizarFiltro('cidade', e.target.value)}
                >
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
              <div className="relative h-full">
                {/* Barra de ferramentas de edição */}
                <ToolsMap />

                {/* Componente do Google Maps */}
                <GoogleMapsComponent
                  apiKey={apiKey}
                  onRotaDesenhada={handleRotaDesenhada}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
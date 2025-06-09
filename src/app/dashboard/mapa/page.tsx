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
import FiltrosMaps from './_filtros';
import CamadasMaps from './_camadas';

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
    tipoCaboSelecionado,
    adicionarRota,
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
          <CamadasMaps />
          <FiltrosMaps />
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
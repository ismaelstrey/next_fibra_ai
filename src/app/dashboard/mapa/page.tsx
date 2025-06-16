'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MapIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import GoogleMapsComponent from '@/components/mapa/GoogleMapsComponent';
import useMapa from '@/hooks/useMapa';
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
    tipoCaboSelecionado,
    adicionarRota,
    buscarNoMapa,
    filtros,

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
      path: pathFormatado,
      cidadeId: filtros?.cidade || '', // Substitua pelo ID da cidade

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="flex flex-col md:flex-row md:items-center md:justify-between p-2 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center mb-4 md:mb-0">
          <MapIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl text-primary font-bold">Mapa de Infraestrutura</h1>
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

      <div className="grid grid-cols-1">
        <div className="w-full">
          <Card className="h-[calc(100vh-3.5rem)] w-full border-0 rounded-none shadow-none">
            <CardContent className="p-0 h-full">
              <div className="relative h-full">
                {/* Barra de ferramentas de edição */}
                <div className="absolute top-2 right-2 z-10">
                  <ToolsMap />
                </div>

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
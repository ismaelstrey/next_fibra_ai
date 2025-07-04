import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import useMapa from '@/hooks/useMapa';

/**
 * Hook para gerenciar as rotas no mapa
 */
export const useRotas = (mapRef: React.RefObject<google.maps.Map | null>) => {
  // Estado para armazenar as rotas
  const [rotas, setRotas] = useState<any[]>([]);
  
  // Estado para controlar o modo de desenho
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);

  // Obtém o estado do mapa do hook useMapa
  const {
    modoEdicao,
    filtros,   
    rotas: rotasGlobais,
    adicionarRota: adicionarRotaGlobal,
    removerRota: removerRotaGlobal,
    tipoCaboSelecionado
  } = useMapa();

  /**
   * Efeito para sincronizar as rotas locais com as rotas globais
   */
  useEffect(() => {
    setRotas(rotasGlobais);
  }, [rotasGlobais]);

  /**
   * Adiciona uma nova rota ao mapa
   */
  const adicionarRota = useCallback((path: google.maps.LatLng[]) => {
    if (!mapRef.current) return;

    // Converte o caminho para um array de coordenadas
    const pathArray = path.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));

    // Verifica se há uma cidade selecionada nos filtros
    if (!filtros.cidade) {
      toast.error('Selecione uma cidade antes de adicionar uma rota');
      return;
    }

    // Adiciona a rota ao estado global do mapa
    adicionarRotaGlobal({
      nome: `Rota ${new Date().toLocaleTimeString()}`,
      path: pathArray,
      tipoCabo: tipoCaboSelecionado,
      cidadeId: filtros.cidade
    });
  }, [adicionarRotaGlobal, filtros.cidade, mapRef, tipoCaboSelecionado]);

  /**
   * Callback para quando uma rota é desenhada
   */
  const handlePolylineComplete = useCallback((polyline: google.maps.Polyline) => {
    if (!mapRef.current) return;

    // Configura as opções da polyline
    polyline.setOptions({
      strokeColor: '#FF0000',
      strokeWeight: 3,
      editable: true,
      draggable: true,
    });

    // Obtém o caminho da polyline
    const path = polyline.getPath().getArray();

    // Adiciona a rota ao estado local e global
    adicionarRota(path);

    // Remove a polyline temporária do mapa
    polyline.setMap(null);

    // Desativa o modo de desenho
    setDrawingMode(null);
  }, [adicionarRota, mapRef]);

  /**
   * Ativa o modo de edição para uma rota
   */
  const ativarEdicaoRota = useCallback((rota: any) => {
    if (!mapRef.current) return;

    // Implementação da lógica de edição de rota
    toast.info(`Modo de edição ativado para a rota ${rota.nome}`);
  }, [mapRef]);

  /**
   * Remove uma rota do mapa
   */
  const removerRota = useCallback((rotaId: string) => {
    if (!mapRef.current) return;

    // Remove a rota do estado global
    removerRotaGlobal(rotaId);
    toast.success('Rota removida com sucesso');
  }, [removerRotaGlobal]);

  /**
   * Efeito para controlar a visibilidade do DrawingManager
   */
  useEffect(() => {
    if (modoEdicao === 'rota') {
      setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
    } else {
      setDrawingMode(null);
    }
  }, [modoEdicao]);

  return {
    rotas,
    setRotas,
    drawingMode,
    setDrawingMode,
    adicionarRota,
    handlePolylineComplete,
    ativarEdicaoRota,
    removerRota
  };
};
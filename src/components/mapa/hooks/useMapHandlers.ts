import { useCallback } from 'react';
import { toast } from 'sonner';
import useMapa from '@/hooks/useMapa';

/**
 * Hook para gerenciar os manipuladores de eventos do mapa
 */
export const useMapHandlers = (
  mapRef: React.RefObject<google.maps.Map | null>,
  adicionarMarcador: (posicao: google.maps.LatLng, tipo: 'CTO' | 'CEO') => void,
  adicionarMarcadorNaRota: (event: google.maps.PolyMouseEvent, rota: any) => void,
  setModalAberto: (aberto: boolean) => void,
  setPosicaoClicada: (posicao: google.maps.LatLngLiteral | null) => void,
  setRotaAssociada: (rotaId: string | undefined) => void
) => {
  // Obtém o estado do mapa do hook useMapa
  const { modoEdicao } = useMapa();

  /**
   * Manipulador para o evento de clique no mapa
   */
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !mapRef.current) return;

    // Verifica se está no modo de adicionar CTO ou CEO
    if (modoEdicao === 'cto' || modoEdicao === 'ceo') {
      const tipo = modoEdicao === 'cto' ? 'CTO' : 'CEO';
      adicionarMarcador(event.latLng, tipo);
      toast.success(`${tipo} adicionada com sucesso`);
    }
  }, [modoEdicao, adicionarMarcador, mapRef]);

  /**
   * Manipulador para o evento de clique em uma polyline (rota)
   */
  const handlePolylineClick = useCallback((event: google.maps.PolyMouseEvent, rota: any) => {
    adicionarMarcadorNaRota(event, rota);
  }, [adicionarMarcadorNaRota]);

  /**
   * Manipulador para o evento de duplo clique em uma polyline (rota)
   */
  const handlePolylineDblClick = useCallback((event: google.maps.PolyMouseEvent, rota: any) => {
    if (!event.latLng || !mapRef.current) return;
    
    // Implementação para ativar o modo de edição da rota
    toast.info(`Modo de edição ativado para a rota ${rota.nome}`);
  }, [mapRef]);

  /**
   * Manipulador para o evento de clique com o botão direito em uma polyline (rota)
   */
  const handlePolylineRightClick = useCallback((event: google.maps.PolyMouseEvent, rota: any) => {
    if (!event.latLng || !mapRef.current) return;
    
    // Abre o modal para edição da rota
    setPosicaoClicada({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
    setRotaAssociada(rota.id);
    setModalAberto(true);
    
    toast.info(`Clique com botão direito na rota ${rota.nome}`);
  }, [mapRef, setPosicaoClicada, setRotaAssociada, setModalAberto]);

  /**
   * Manipulador para o evento de carregamento do mapa
   */
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    if (mapRef.current) return;
    mapRef.current = map;
  }, [mapRef]);

  return {
    handleMapClick,
    handlePolylineClick,
    handlePolylineDblClick,
    handlePolylineRightClick,
    handleMapLoad
  };
};
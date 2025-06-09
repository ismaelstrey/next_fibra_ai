'use client';

import { useMapContext } from '@/context/MapContext';

/**
 * Hook para utilizar o contexto do mapa
 * Este hook é um wrapper para o useMapContext para manter compatibilidade com o código existente
 */
export const useMapa = () => {
  // Utiliza o contexto do mapa
  return useMapContext();
};

export default useMapa;

// Exporta os tipos do MapContext para manter compatibilidade
export type { 
  Rota, 
  Caixa, 
  PontoFusao, 
  FiltrosMapa, 
  CamadasVisiveis 
} from '@/context/MapContext';
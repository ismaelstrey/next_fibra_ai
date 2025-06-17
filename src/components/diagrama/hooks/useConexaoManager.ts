'use client';

import { useCallback } from 'react';
import { Connection, Edge, addEdge } from 'reactflow';

interface UseConexaoManagerProps {
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  onConexaoRealizada?: (sourceId: string, targetId: string) => void;
}

/**
 * Hook para gerenciar as conexões entre elementos do diagrama
 */
export function useConexaoManager({ setEdges, onConexaoRealizada }: UseConexaoManagerProps) {
  const onConnect = useCallback(
    (params: Connection) => {
      // Adiciona a aresta com o tipo personalizado
      const newEdge = {
        ...params,
        type: 'conexao',
        data: { cor: '#333' },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // Notifica sobre a conexão realizada
      if (onConexaoRealizada && params.source && params.target) {
        onConexaoRealizada(params.source, params.target);
      }
    },
    [setEdges, onConexaoRealizada]
  );

  return {
    onConnect,
  };
}
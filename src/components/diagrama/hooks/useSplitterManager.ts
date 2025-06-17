'use client';

import { useState, useCallback } from 'react';
import { Node } from 'reactflow';

interface UseSplitterManagerProps {
  nodeCounter: number;
  setNodeCounter: (counter: number) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
}

/**
 * Hook para gerenciar a criação de splitters
 */
export function useSplitterManager({ nodeCounter, setNodeCounter, setNodes }: UseSplitterManagerProps) {
  const [tipoSplitterSelecionado, setTipoSplitterSelecionado] = useState<'1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64'>('1/8');
  const [splitterBalanceado, setSplitterBalanceado] = useState(true);

  const adicionarSplitter = useCallback(() => {
    const id = `splitter-${Date.now()}`;

    // Determina o número de saídas com base no tipo de splitter
    const numSaidas = parseInt(tipoSplitterSelecionado.split('/')[1]);

    // Cria as portas de saída
    const portasSaida = Array.from({ length: numSaidas }, (_, i) => `${id}-saida-${i + 1}`);

    // Cria o nó do splitter
    const newNode: Node = {
      id,
      type: 'splitter',
      position: { x: 500, y: 100 + nodeCounter * 150 },
      data: {
        tipo: tipoSplitterSelecionado,
        balanceado: splitterBalanceado,
        portaEntrada: `${id}-entrada`,
        portasSaida,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeCounter(nodeCounter + 1);
  }, [tipoSplitterSelecionado, splitterBalanceado, nodeCounter, setNodes, setNodeCounter]);

  return {
    tipoSplitterSelecionado,
    setTipoSplitterSelecionado,
    splitterBalanceado,
    setSplitterBalanceado,
    adicionarSplitter,
  };
}
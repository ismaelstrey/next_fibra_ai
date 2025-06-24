'use client';

import { useEffect } from 'react';
import { Node } from 'reactflow';
import { Cabo, Splitter } from '../types';

interface UseDiagramaInitializerProps {
  cabos: Cabo[];
  splitters: Splitter[];
  setNodes: (nodes: Node[]) => void;
  setNodeCounter: (counter: number) => void;
}

/**
 * Hook para inicializar o diagrama com os cabos e splitters fornecidos
 */
export function useDiagramaInitializer({ cabos, splitters, setNodes, setNodeCounter }: UseDiagramaInitializerProps) {
  useEffect(() => {
    const initialNodes: Node[] = [];
    let maxIndex = 0;

    // Adiciona os cabos fornecidos
    cabos.forEach((cabo, index) => {
      initialNodes.push({
        id: cabo.id,
        type: 'cabo',
        position: { x: 100, y: 100 + index * 150 },
        data: cabo,
      });
      maxIndex = Math.max(maxIndex, index);
    });

    // Adiciona os splitters fornecidos
    splitters.forEach((splitter, index) => {
      initialNodes.push({
        id: splitter.id,
        type: 'splitter',
        position: { x: 500, y: 100 + index * 150 },
        data: splitter,
      });
      maxIndex = Math.max(maxIndex, index);
    });

    setNodes(initialNodes);
    
    // Atualiza o contador para que novos elementos sejam posicionados após os existentes
    if (initialNodes.length > 0) {
      setNodeCounter(maxIndex + 1);
    }
  }, [cabos, splitters, setNodes, setNodeCounter]);
}

// No hook useDiagramaInitializer

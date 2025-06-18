'use client';

import { useState, useCallback } from 'react';
import { Node } from 'reactflow';
import { TuboLoose, Fibra } from '../types';
import { CORES_FIBRAS, CORES_TUBOS } from '../constants/cores';

interface UseCaboManagerProps {
  nodeCounter: number;
  setNodeCounter: (counter: number) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
}

/**
 * Hook para gerenciar a criação de cabos
 */
export function useCaboManager({ nodeCounter, setNodeCounter, setNodes }: UseCaboManagerProps) {
  const [tipoCaboSelecionado, setTipoCaboSelecionado] = useState<'6' | '12' | '24' | '48' | '96'>('12');
  const [nomeCabo, setNomeCabo] = useState('');

  const adicionarCabo = useCallback(() => {
    const id = `cabo-${Date.now()}`;
    const nome = nomeCabo || `Cabo ${nodeCounter + 1}`;
    const numFibras = parseInt(tipoCaboSelecionado);

    // Determina a configuração de tubos com base no número de fibras
    let numTubos = 1;
    let fibrasPerTubo = numFibras;

    // Configuração específica para cada tipo de cabo
    switch (tipoCaboSelecionado) {
      case '6':
        // Cabo de 6 FO: 1 tubo com 6 fibras
        numTubos = 1;
        fibrasPerTubo = 6;
        break;
      case '12':
        // Cabo de 12 FO: 1 tubo com 12 fibras
        numTubos = 1;
        fibrasPerTubo = 12;
        break;
      case '24':
        // Cabo de 24 FO: 2 tubos com 12 fibras cada
        numTubos = 2;
        fibrasPerTubo = 12;
        break;
      case '48':
        // Cabo de 48 FO: 4 tubos com 12 fibras cada
        numTubos = 4;
        fibrasPerTubo = 12;
        break;
      case '96':
        // Cabo de 96 FO: 8 tubos com 12 fibras cada
        numTubos = 8;
        fibrasPerTubo = 12;
        break;
      default:
        // Configuração padrão
        numTubos = Math.ceil(numFibras / 12);
        fibrasPerTubo = 12;
    }

    // Cria os tubos e fibras
    const tubos: TuboLoose[] = [];
    let fibraCount = 1;

    for (let i = 1; i <= numTubos; i++) {
      const tuboId = `${id}-tubo-${i}`;
      const fibras: Fibra[] = [];

      for (let j = 1; j <= fibrasPerTubo && fibraCount <= numFibras; j++, fibraCount++) {
        fibras.push({
          id: `${tuboId}-fibra-${j}`,
          cor: CORES_FIBRAS[((fibraCount - 1) % 12 + 1) as keyof typeof CORES_FIBRAS].hex,
          numero: (fibraCount - 1) % 12 + 1,
        });
      }

      tubos.push({
        id: tuboId,
        cor: i <= 2 ? CORES_TUBOS[i as keyof typeof CORES_TUBOS].hex : CORES_TUBOS[3 as keyof typeof CORES_TUBOS].hex,
        numero: i,
        fibras,
      });
    }

    // Cria o nó do cabo
    const newNode: Node = {
      id,
      type: 'cabo',
      position: { x: 100, y: 100 + nodeCounter * 150 },
      data: {
        nome,
        tipo: tipoCaboSelecionado,
        tubos,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeCounter(nodeCounter + 1);
    setNomeCabo('');
  }, [tipoCaboSelecionado, nomeCabo, nodeCounter, setNodes, setNodeCounter]);

  return {
    tipoCaboSelecionado,
    setTipoCaboSelecionado,
    nomeCabo,
    setNomeCabo,
    adicionarCabo,
  };
}
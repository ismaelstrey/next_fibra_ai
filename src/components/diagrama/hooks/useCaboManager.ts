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

    if (numFibras <= 12) {
      // Cabos de 2 a 12 fibras: 2 fibras por tubo loose (exceto cabos de tubo único)
      if (numFibras === 6 || numFibras === 12) {
        // Caso especial: cabo de tubo único (muito usado no Brasil)
        numTubos = 1;
        fibrasPerTubo = numFibras;
      } else {
        numTubos = Math.ceil(numFibras / 2);
        fibrasPerTubo = 2;
      }
    } else if (numFibras <= 36) {
      // Cabos de 18 a 36 fibras: 6 fibras por tubo loose
      numTubos = Math.ceil(numFibras / 6);
      fibrasPerTubo = 6;
    } else {
      // Cabos de 48 a 288 fibras: 12 fibras por tubo loose
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
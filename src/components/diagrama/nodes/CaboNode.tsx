'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TuboLoose, Fibra } from '../types';
import { CORES_FIBRAS, CORES_TUBOS } from '../constants/cores';

/**
 * Componente de nó personalizado para Cabo
 */
export function CaboNode({ data, id }: NodeProps) {
  // Inicializa o estado com todos os tubos expandidos
  const [expandedTubos, setExpandedTubos] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    data.tubos.forEach((tubo: TuboLoose) => {
      initialState[tubo.id] = true; // Todos os tubos começam expandidos
    });
    return initialState;
  });

  const toggleTubo = (tuboId: string) => {
    setExpandedTubos((prev) => ({
      ...prev,
      [tuboId]: !prev[tuboId],
    }));
  };

  // Função para expandir ou recolher todos os tubos
  const toggleAllTubos = () => {
    // Verifica se todos os tubos estão expandidos
    const allExpanded = data.tubos.every((tubo: TuboLoose) => expandedTubos[tubo.id]);

    // Cria um novo estado com todos expandidos ou todos recolhidos
    const newState: Record<string, boolean> = {};
    data.tubos.forEach((tubo: TuboLoose) => {
      newState[tubo.id] = !allExpanded;
    });

    setExpandedTubos(newState);
  };


  console.log(data)

  return (
    <div className="border-2 border-gray-300 rounded-md p-2 bg-white shadow-md w-72">
      <div className="font-bold text-center bg-blue-100 p-1 rounded mb-2">
        Cabo: {data.nome} ({data.tipo} FO)
      </div>
      <div className="flex justify-end mb-1">
        <button
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          onClick={toggleAllTubos}
        >
          {data.tubos.every((tubo: TuboLoose) => expandedTubos[tubo.id]) ? 'Recolher Todos' : 'Expandir Todos'}
        </button>
      </div>
      <div className="space-y-2">
        {data.tubos.map((tubo: TuboLoose) => (
          <div key={tubo.id} className="border border-gray-200 rounded p-1">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => toggleTubo(tubo.id)}
            >
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: tubo.numero <= 2 ? CORES_TUBOS[tubo.numero as keyof typeof CORES_TUBOS].hex : CORES_TUBOS[3 as keyof typeof CORES_TUBOS].hex }}
              />
              <span className="text-xs font-medium">Tubo {tubo.numero} ({tubo.fibras.length} FO)</span>
              <span className="ml-auto text-xs">{expandedTubos[tubo.id] ? '▼' : '▶'}</span>
            </div>

            {expandedTubos[tubo.id] && (
              <div className="mt-1 pl-6 grid grid-cols-4 gap-1">

                {tubo.fibras.map((fibra) => (
                  <div key={fibra.id} className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex }}
                    />
                    <span className="text-[10px]">{fibra.numero}</span>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={fibra.id}
                      style={{
                        backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                        border: '1px solid black',
                        width: 10,
                        height: 10,
                        top: 'auto',
                        bottom: 'auto',
                      }}
                    />
                    <span className="text-[10px]">{fibra.numero}</span>
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={fibra.id}
                      style={{
                        backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                        border: '1px solid black',
                        width: 10,
                        height: 10,
                        top: 'auto',
                        bottom: 'auto',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
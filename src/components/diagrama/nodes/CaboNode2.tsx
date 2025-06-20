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
    <div className="flex flex-col h-auto border-2 border-gray-300 rounded-md p-2 bg-background tetx-primary shadow-md w-72">
      <div className="border-2 border-gray-300 rounded-md font-bold text-center bg-foreground/10 p-1 mb-2">
        Cabo: {data.nome} ({data.tipo} FO)
      </div>
      <div className=" flex justify-end mb-1">
        <button
          className="border-2 border-gray-300 text-xs hover:bg-foreground/20 px-2 py-1 rounded"
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
              <div className="flex">

                {tubo.fibras.map((fibra: Fibra, key:number) => (  
               <Handle
               onClick={(e)=>console.log(e)}
               key={key}
                      type="source"
                      position={Position.Right}
                      id={fibra.id}
                      className='hover:scale-125 rounded-4xl'
                      style={{
                        backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                        border: '2px solid black',
                        width: 20,
                        height: 20,
                        top: 20*(key+10),
                        bottom: 20*(key+10),              

                      }}
                    />
             
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
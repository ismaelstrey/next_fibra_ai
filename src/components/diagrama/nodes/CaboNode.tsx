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
    <div>    
        {data.tubos.map((tubo: TuboLoose) => (    
             <div style={{
                backgroundColor:"red", 
                width:90, 
                height:"auto",
                display:"flex", 
                flexDirection:"column",               
                gap:8, 
                justifyContent:"flex-start",
                padding: 8
              }}>


                 {tubo.fibras.map((fibra: Fibra, key:number) => (  
           <div key={key} style={{ marginBottom: 6 }}>    
            <Handle
           onClick={(e)=>console.log(e)}
           
                  type="source"
                  position={Position.Right}
                  id={fibra.id}
                  className='hover:scale-125 rounded-4xl w-40 bg-red-500'
                  style={{
                    backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                    border: '2px solid black',
                    width: 20,
                    height: 20,
                  }}
                />
                </div>
                ))}
             </div>
                ))}
    </div>
  );
}
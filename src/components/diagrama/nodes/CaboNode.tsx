'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TuboLoose, Fibra } from '../types';
import { CORES_FIBRAS, CORES_TUBOS } from '../constants/cores';

/**
 * Componente de nó personalizado para Cabo
 */
export function CaboNode({ data, id }: NodeProps) {
  return (
    <div className="border-2 border-gray-300 rounded-md p-2 bg-white shadow-md w-64">
      <div className="font-bold text-center bg-blue-100 p-1 rounded mb-2">
        Cabo: {data.nome} ({data.tipo} FO)
      </div>
      <div className="space-y-1">
        {data.tubos.map((tubo: TuboLoose) => (
          <div key={tubo.id} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: tubo.numero <= 2 ? CORES_TUBOS[tubo.numero as keyof typeof CORES_TUBOS].hex : CORES_TUBOS[3 as keyof typeof CORES_TUBOS].hex }}
            />
            <span className="text-xs">Tubo {tubo.numero}</span>
            <div className="ml-auto flex space-x-1">
              {tubo.fibras.map((fibra) => (
                <div key={fibra.id}>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={fibra.id}
                    style={{
                      backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                      border: '1px solid black',
                      width: 8,
                      height: 8,
                      top: 'auto',
                      bottom: 'auto',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
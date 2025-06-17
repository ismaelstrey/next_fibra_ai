'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

/**
 * Componente de nó personalizado para Splitter
 */
export function SplitterNode({ data, id }: NodeProps) {
  return (
    <div className="border-2 border-gray-300 rounded-md p-2 bg-white shadow-md w-48">
      <div className="font-bold text-center bg-green-100 p-1 rounded mb-2">
        Splitter {data.tipo} {data.balanceado ? '(Balanceado)' : '(Desbalanceado)'}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Handle
            type="target"
            position={Position.Left}
            id={data.portaEntrada}
            style={{ backgroundColor: '#FF0000' }}
          />
          <span className="text-xs ml-2">Entrada</span>
        </div>
        <div className="flex flex-col space-y-1">
          {data.portasSaida.map((porta: string, index: number) => (
            <div key={porta} className="flex items-center">
              <span className="text-xs mr-2">{index + 1}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={porta}
                style={{ backgroundColor: '#0000FF' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
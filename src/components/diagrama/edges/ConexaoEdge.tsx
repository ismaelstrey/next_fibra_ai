'use client';

import React from 'react';
import { EdgeProps } from 'reactflow';

/**
 * Componente de aresta personalizada para conexões
 */
export function ConexaoEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={`M${sourceX},${sourceY} C ${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`}
        strokeWidth={2}
        stroke={data?.cor || '#999'}
      />
    </g>
  );
}
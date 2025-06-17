'use client';

import React from 'react';
import { Panel } from 'reactflow';

/**
 * Componente para exibir a legenda do diagrama
 */
export function DiagramaLegenda() {
  return (
    <Panel position="top-right">
      <div className="bg-white p-2 rounded shadow-md">
        <h3 className="font-bold mb-2">Legenda</h3>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 mr-2" />
            <span className="text-xs">Cabo</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 mr-2" />
            <span className="text-xs">Splitter</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
'use client';

import React, { useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Importação de tipos
import { DiagramaFusaoProps } from './types';

// Importação de configurações
import { nodeTypes, edgeTypes } from './config/nodeTypes';

// Importação de hooks personalizados
import { useCaboManager } from './hooks/useCaboManager';
import { useSplitterManager } from './hooks/useSplitterManager';
import { useConexaoManager } from './hooks/useConexaoManager';
import { useDiagramaInitializer } from './hooks/useDiagramaInitializer';

// Importação de componentes
import { DiagramaControles } from './controls/DiagramaControles';
import { DiagramaLegenda } from './controls/DiagramaLegenda';

/**
 * Componente para criação de diagramas de fusão de cabos de fibra óptica
 */
export function DiagramaFusao({ cabos = [], splitters = [], onConexaoRealizada }: DiagramaFusaoProps) {
  // Estado para controlar os nós e arestas do diagrama
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Contador para posicionar novos elementos
  const [nodeCounter, setNodeCounter] = useState(0);

  // Gerenciamento de cabos
  const {
    tipoCaboSelecionado,
    setTipoCaboSelecionado,
    nomeCabo,
    setNomeCabo,
    adicionarCabo,
  } = useCaboManager({ nodeCounter, setNodeCounter, setNodes });

  // Gerenciamento de splitters
  const {
    tipoSplitterSelecionado,
    setTipoSplitterSelecionado,
    splitterBalanceado,
    setSplitterBalanceado,
    adicionarSplitter,
  } = useSplitterManager({ nodeCounter, setNodeCounter, setNodes });

  // Gerenciamento de conexões
  const { onConnect } = useConexaoManager({ setEdges, onConexaoRealizada });

  // Inicialização do diagrama
  useDiagramaInitializer({ cabos, splitters, setNodes, setNodeCounter });

  return (
    <Card className="w-full h-[800px] shadow-lg">
      <CardHeader>
        <CardTitle>Diagrama de Fusão de Cabos</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        <DiagramaControles
          nomeCabo={nomeCabo}
          setNomeCabo={setNomeCabo}
          tipoCaboSelecionado={tipoCaboSelecionado}
          setTipoCaboSelecionado={setTipoCaboSelecionado}
          adicionarCabo={adicionarCabo}
          tipoSplitterSelecionado={tipoSplitterSelecionado}
          setTipoSplitterSelecionado={setTipoSplitterSelecionado}
          splitterBalanceado={splitterBalanceado}
          setSplitterBalanceado={setSplitterBalanceado}
          adicionarSplitter={adicionarSplitter}
        />

        <div className="flex-grow">
          <ReactFlow

            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <DiagramaLegenda />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
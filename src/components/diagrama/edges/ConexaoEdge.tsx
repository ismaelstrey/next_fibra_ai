'use client';

import React from 'react';
import { EdgeProps, getBezierPath, getMarkerEnd, MarkerType } from 'reactflow';

// Tipos personalizados para dados da aresta
interface ConexaoEdgeData {
  cor?: string;
  tipo?: 'fibra' | 'cobre' | 'wireless';
  larguraBanda?: string;
  status?: 'ativo' | 'inativo' | 'manutencao';
  animado?: boolean;
  bidirecional?: boolean;
  label?: string;
}

interface ConexaoEdgeProps extends EdgeProps {
  data?: ConexaoEdgeData;
}

/**
 * Componente de aresta personalizada para conexões de rede
 * Suporta diferentes tipos de conexão, animações e estados
 */
export function ConexaoEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd
}: ConexaoEdgeProps) {
  // Gera o caminho da aresta usando a função do ReactFlow
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Gera o marcador de fim usando a função do ReactFlow
  const markerEndId = getMarkerEnd(markerEnd as MarkerType | undefined, id);

  // Determina a cor baseada no tipo e status
  const getCor = () => {
    if (data?.status === 'inativo') return '#ef4444'; // vermelho
    if (data?.status === 'manutencao') return '#f59e0b'; // amarelo
    
    switch (data?.tipo) {
      case 'fibra':
        return data?.cor || '#10b981'; // verde
      case 'cobre':
        return data?.cor || '#f97316'; // laranja
      case 'wireless':
        return data?.cor || '#3b82f6'; // azul
      default:
        return data?.cor || '#6b7280'; // cinza
    }
  };

  // Determina a largura da linha baseada no tipo
  const getLarguraLinha = () => {
    switch (data?.tipo) {
      case 'fibra':
        return 3;
      case 'cobre':
        return 2;
      case 'wireless':
        return 1;
      default:
        return 2;
    }
  };

  // Determina o padrão da linha baseado no tipo
  const getPadraoLinha = () => {
    if (data?.status === 'inativo') return '5,5';
    if (data?.tipo === 'wireless') return '3,3';
    return undefined;
  };

  const cor = getCor();
  const larguraLinha = getLarguraLinha();
  const padraoLinha = getPadraoLinha();

  return (
    <>
      {/* Definições de marcadores e gradientes */}
      <defs>
        {/* Marcador de seta */}
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={cor}
            stroke={cor}
          />
        </marker>

        {/* Marcador bidirecional */}
        {data?.bidirecional && (
          <marker
            id={`arrow-back-${id}`}
            markerWidth="12"
            markerHeight="12"
            refX="3"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
            onClick={()=>console.log('clicou')}
          >
            <path
              d="M9,0 L9,6 L0,3 z"
              fill={cor}
              stroke={cor}
            />
          </marker>
        )}

        {/* Gradiente para animação */}
        {data?.animado && (
          <linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse" >
            <stop offset="0%" stopColor={cor} stopOpacity="0.3">
              <animate
                attributeName="stop-opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={cor} stopOpacity="1" />
            <stop offset="100%" stopColor={cor} stopOpacity="0.3">
              <animate
                attributeName="stop-opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
                begin="1s"
              />
            </stop>
          </linearGradient>
        )}
      </defs>

      {/* Linha de fundo para melhor visibilidade */}
      <path
        d={edgePath}
        strokeWidth={larguraLinha + 2}
        stroke="white"
        fill="none"
        className="react-flow__edge-path-bg"
      />

      {/* Linha principal da conexão */}
      <path
        id={id}
        className={`react-flow__edge-path ${
          selected ? 'react-flow__edge-selected' : ''
        } ${
          data?.animado ? 'animate-pulse' : ''
        }`}
        d={edgePath}
        strokeWidth={larguraLinha}
        stroke={data?.animado ? `url(#gradient-${id})` : cor}
        strokeDasharray={padraoLinha}
        fill="none"
        markerEnd={markerEndId}
        markerStart={data?.bidirecional ? `url(#arrow-back-${id})` : undefined}
        style={{
          transition: 'stroke 0.2s ease-in-out',
        }}
      />

      {/* Label da conexão */}
      {data?.label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="react-flow__edge-text"
          style={{
            fontSize: '12px',
            fill: '#374151',
            fontWeight: '500',
            pointerEvents: 'none',
          }}
        >
          <tspan
            x={labelX}
            dy="-8"
            style={{
              fontSize: '10px',
              fill: '#6b7280',
            }}
          >
            {data.tipo?.toUpperCase()}
          </tspan>
          <tspan x={labelX} dy="16">
            {data.label}
          </tspan>
          {data.larguraBanda && (
            <tspan
              x={labelX}
              dy="14"
              style={{
                fontSize: '10px',
                fill: '#6b7280',
              }}
            >
              {data.larguraBanda}
            </tspan>
          )}
        </text>
      )}

      {/* Indicador de status */}
      {data?.status && data.status !== 'ativo' && (
        <circle
          cx={labelX}
          cy={labelY + 25}
          r="4"
          fill={data.status === 'manutencao' ? '#f59e0b' : '#ef4444'}
          stroke="white"
          strokeWidth="1"
        >
          {data.status === 'manutencao' && (
            <animate
              attributeName="r"
              values="4;6;4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}
    </>
  );
}
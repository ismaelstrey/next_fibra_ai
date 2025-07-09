import React from "react";
import { motion } from "framer-motion";

// Tipos para os dados de cabos e splitters
interface Tubo {
  id: string;
  numero: number;
  capilares: { id: string; numero: number }[];
}

interface Cabo {
  id: string;
  nome: string;
  tipo: string;
  tubos: Tubo[];
}

interface Splitter {
  id: string;
  tipo: string;
  portaEntrada: string;
  portasSaida: string[];
}

interface Fusao {
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: string;
  cor?: string;
}

interface ConexaoGraficaProps {
  cabos: Cabo[];
  splitters: Splitter[];
  fusoes: Fusao[];
}

/**
 * Componente gráfico 2D para visualizar conexões entre cabos e splitters
 * Utiliza SVG para desenhar linhas e círculos representando as conexões
 */
export const ConexaoGrafica: React.FC<ConexaoGraficaProps> = ({ cabos, splitters, fusoes }) => {
  // Layout simples: cabos à esquerda, splitters à direita
  // Cada capilar de cabo é um círculo, cada porta de splitter também
  // Fusões são linhas coloridas conectando os círculos

  // Mapear todos os capilares dos cabos
  const capilares = cabos.flatMap((cabo, ci) =>
    cabo.tubos.flatMap((tubo, ti) =>
      tubo.capilares.map((capilar, fi) => ({
        ...capilar,
        caboId: cabo.id,
        tuboId: tubo.id,
        posY: ci * 120 + ti * 40 + fi * 16 + 40,
        posX: 60,
        label: `${cabo.nome} T${tubo.numero} F${capilar.numero}`
      }))
    )
  );

  // Mapear portas de splitters
  const portasSplitter = splitters.flatMap((splitter, si) => [
    {
      id: splitter.portaEntrada,
      tipo: "entrada",
      splitterId: splitter.id,
      posY: si * 120 + 60,
      posX: 340,
      label: `S${splitter.tipo} IN`
    },
    ...splitter.portasSaida.map((pid, pi) => ({
      id: pid,
      tipo: "saida",
      splitterId: splitter.id,
      posY: si * 120 + 90 + pi * 18,
      posX: 400,
      label: `S${splitter.tipo} OUT${pi + 1}`
    }))
  ]);

  // Função para buscar posição de um capilar ou porta
  const getPos = (id: string) => {
    const cap = capilares.find(c => c.id === id);
    if (cap) return { x: cap.posX, y: cap.posY };
    const porta = portasSplitter.find(p => p.id === id);
    if (porta) return { x: porta.posX, y: porta.posY };
    return { x: 0, y: 0 };
  };

  return (
    <div className="overflow-x-auto w-full">
      <svg width={500} height={Math.max(capilares.length * 18, portasSplitter.length * 18, 300)}>
        {/* Linhas das fusões */}
        {fusoes.map(fusao => {
          const origem = getPos(fusao.capilarOrigemId);
          const destino = getPos(fusao.capilarDestinoId);
          return (
            <motion.line
              key={fusao.id}
              x1={origem.x}
              y1={origem.y}
              x2={destino.x}
              y2={destino.y}
              stroke={fusao.cor || "#888"}
              strokeWidth={3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 }}
            />
          );
        })}
        {/* Capilares */}
        {capilares.map(capilar => (
          <g key={capilar.id}>
            <circle
              cx={capilar.posX}
              cy={capilar.posY}
              r={7}
              fill="#2563eb"
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={capilar.posX - 18}
              y={capilar.posY + 4}
              fontSize={10}
              fill="#222"
            >
              {capilar.label}
            </text>
          </g>
        ))}
        {/* Portas de Splitter */}
        {portasSplitter.map(porta => (
          <g key={porta.id}>
            <circle
              cx={porta.posX}
              cy={porta.posY}
              r={7}
              fill={porta.tipo === "entrada" ? "#059669" : "#f59e42"}
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={porta.posX + 12}
              y={porta.posY + 4}
              fontSize={10}
              fill="#222"
            >
              {porta.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
import React from "react";
import { SplitterFormatado } from "./ParteInternaCTO";

interface Fusao {
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: string;
  status: string;
  caixaId: string;
  bandejaId?: string;
  posicaoFusao?: number;
}

interface Capilar {
  id: string;
  numero?: number;
  nome?: string;
}

interface FusoesVisualProps {
  splitters: SplitterFormatado[];
  fusoes: Fusao[];
  capilares: Capilar[];
}

// Função utilitária para buscar o capilar conectado a uma porta do splitter
function getCapilarConectado(portaId: string, fusoes: Fusao[], capilares: Capilar[]): Capilar | null {
  const fusao = fusoes.find(f => f.capilarDestinoId === portaId);
  if (!fusao) return null;
  return capilares.find(c => c.id === fusao.capilarOrigemId) || null;
}

export const FusoesVisual: React.FC<FusoesVisualProps> = ({ splitters, fusoes, capilares }) => {
  if (!splitters.length) return null;
  return (
    <div className="flex flex-col gap-4 mt-4">
      {splitters.map(splitter => (
        <div key={splitter.id} className="bg-background rounded shadow p-4">
          <div className="font-bold mb-2">Splitter {splitter.tipo} - {splitter.id}</div>
          <div className="flex flex-row gap-2 flex-wrap">
            {splitter.portasSaida.map((portaId, idx) => {
              const capilar = getCapilarConectado(portaId, fusoes, capilares);
              return (
                <div key={portaId} className="flex flex-col items-center mx-2">
                  <svg width="36" height="36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill={capilar ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#22c55e" : "#16a34a") : "var(--tw-bg-neutral-200, #e5e7eb)"}
                      stroke={typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#fff" : "#333"}
                      strokeWidth="2"
                    />
                    {capilar && (
                      <text
                        x="18"
                        y="22"
                        textAnchor="middle"
                        fontSize="12"
                        fill={typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "#fff" : "#333"}
                        fontWeight="bold"
                      >
                        {capilar.numero || capilar.nome || capilar.id.slice(-4)}
                      </text>
                    )}
                  </svg>
                  <span className="text-xs mt-1">Porta {idx + 1}</span>
                  {capilar && (
                    <span className="text-xs text-green-700">{capilar.nome || capilar.id.slice(-4)}</span>
                  )}
                  {!capilar && (
                    <span className="text-xs text-gray-400">Livre</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
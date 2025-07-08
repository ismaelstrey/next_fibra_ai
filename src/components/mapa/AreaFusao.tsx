'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getColor } from '@/functions/color';
import { CapilarAPI } from '@/types/capilar';
import { TuboAPI } from '@/hooks/useTubo';

// Interfaces para os dados formatados vindos da API
interface Cabo {
  id: string;
  nome: string;
  tipo: '6' | '12' | '24' | '48' | '96';
  tubos: TuboAPI[];
}

interface Splitter {
  id: string;
  tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
  balanceado: boolean;
  portaEntrada: string;
  portasSaida: string[];
}

interface Fusao {
  id: string;
  fibraOrigem: string; // ID da fibra de origem
  fibraDestino: string; // ID da fibra de destino ou porta do splitter
  cor: string;
}

interface AreaFusaoProps {
  /**
   * Cabos conectados à CTO
   */
  cabos?: Cabo[];

  /**
   * Splitters instalados na CTO
   */
  splitters?: Splitter[];

  /**
   * Fusões realizadas na CTO
   */
  fusoes?: Fusao[];

  /**
   * Callback chamado quando uma nova fusão é criada
   */
  onCriarFusao?: (fusao: Fusao) => void;
}

/**
 * Componente que representa a área de fusão dentro de uma CTO
 * Mostra os cabos conectados, splitters e fusões
 */
export function AreaFusao({ cabos = [], splitters = [], fusoes = [], onCriarFusao }: AreaFusaoProps) {
  // Estado para controlar quais tubos estão expandidos
  const [expandedTubos, setExpandedTubos] = useState<Record<string, boolean>>({});
  // Estado para controlar a fibra selecionada
  const [fibraSelecionada, setFibraSelecionada] = useState<string | null>(null);
  // Estado para controlar o modo de seleção (se está selecionando para fusão)
  const [modoSelecao, setModoSelecao] = useState<boolean>(false);


  // Função para alternar a expansão de um tubo específico
  const toggleTubo = (caboId: string, tuboId: string) => {
    setExpandedTubos(prev => ({
      ...prev,
      [`${caboId}-${tuboId}`]: !prev[`${caboId}-${tuboId}`]
    }));
  };

  // Função para expandir ou recolher todos os tubos de um cabo
  const toggleAllTubos = (caboId: string, tubos: TuboAPI[]) => {
    // Verifica se todos os tubos do cabo estão expandidos
    const allExpanded = tubos.every(tubo => expandedTubos[`${caboId}-${tubo.id}`]);

    // Cria um novo estado com todos expandidos ou todos recolhidos
    const newState = { ...expandedTubos };
    tubos.forEach(tubo => {
      newState[`${caboId}-${tubo.id}`] = !allExpanded;
    });

    setExpandedTubos(newState);
  };

  // Função para selecionar uma fibra
  const selecionarFibra = (fibraId: string) => {
    // Se já estiver selecionada, desseleciona
    if (fibraSelecionada === fibraId) {
      setFibraSelecionada(null);
      setModoSelecao(false);
    } else {
      setFibraSelecionada(fibraId);
      setModoSelecao(true);
    }
  };

  // Função para associar a fibra selecionada a um splitter
  const associarFibraASplitter = (splitterId: string, portaId: string) => {
    if (!fibraSelecionada || !modoSelecao) return;

    // Verificar se a fibra já está conectada
    const fibraJaConectada = fusoes.some(fusao => fusao.fibraOrigem === fibraSelecionada);
    if (fibraJaConectada) {
      alert('Esta fibra já está conectada a outro dispositivo.');
      return;
    }

    // Verificar se a porta do splitter já está conectada
    const portaJaConectada = fusoes.some(fusao => fusao.fibraDestino === portaId);
    if (portaJaConectada) {
      alert('Esta porta do splitter já está conectada.');
      return;
    }

    // Encontrar a cor da fibra selecionada
    let corFibra = '#FF0000'; // Cor padrão
    for (const cabo of cabos) {
      for (const tubo of cabo.tubos) {
        const fibra = tubo?.capilares?.find(f => f.id === fibraSelecionada);
        if (fibra) {
          corFibra = getColor(fibra.numero);
          break;
        }
      }
    }

    // Criar a nova fusão
    const novaFusao: Fusao = {
      id: `fusao-${Date.now()}`,
      fibraOrigem: fibraSelecionada,
      fibraDestino: portaId,
      cor: corFibra
    };

    // Chamar o callback se existir
    if (onCriarFusao) {
      onCriarFusao(novaFusao);
    }

    // Resetar o estado de seleção
    setFibraSelecionada(null);
    setModoSelecao(false);
  };

  // Função para obter a cor de uma fibra

  // Função para obter a cor de um tubo
  const getTuboCor = (numero: number) => {
    const cores = {
      1: '#008000', // Verde (piloto)
      2: '#FFFF00', // Amarelo (direcional)
      3: '#FFFFFF', // Branco/Natural
    };

    return cores[numero as keyof typeof cores] || '#FFFFFF';
  };

  // Função para verificar se uma fibra está conectada
  const isFibraConectada = (fibraId: string) => {
    return fusoes.some(fusao =>
      fusao.fibraOrigem === fibraId || fusao.fibraDestino === fibraId
    );
  };

  // Função para obter a cor da fusão de uma fibra
  const getFusaoCor = (fibraId: string) => {
    const fusao = fusoes.find(fusao =>
      fusao.fibraOrigem === fibraId || fusao.fibraDestino === fibraId
    );
    return fusao?.cor || '#CCCCCC';
  };

  return (
    <div className="space-y-4">
      {modoSelecao && fibraSelecionada && (
        <div className="bg-blue-50 p-2 rounded-md border border-blue-200 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Modo de seleção ativo: Selecione um splitter para conectar
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setFibraSelecionada(null);
                setModoSelecao(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {cabos.length === 0 && splitters.length === 0 ? (
        <div className="text-center text-muted-foreground italic">
          Nenhum cabo ou splitter conectado a esta CTO
        </div>
      ) : (
        <>
          {/* Seção de Cabos */}
          {cabos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Cabos Conectados</h4>
              <div className="space-y-3">
                {cabos.map(cabo => (
                  <Card key={cabo.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{cabo.nome} ({cabo.tipo} FO)</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleAllTubos(cabo.id, cabo.tubos)}
                        >
                          {cabo.tubos.every(tubo => expandedTubos[`${cabo.id}-${tubo.id}`])
                            ? 'Recolher Todos'
                            : 'Expandir Todos'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {cabo.tubos.map(tubo => (
                          <div key={tubo.id} className="border rounded-sm p-2">
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleTubo(cabo.id, tubo.id)}
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getTuboCor(tubo.numero) }}
                              />
                              <span className="text-xs">Tubo {tubo.numero}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {tubo?.capilares?.length} fibras
                              </Badge>
                              <span className="ml-auto">
                                {expandedTubos[`${cabo.id}-${tubo.id}`] ? '▼' : '▶'}
                              </span>
                            </div>

                            {expandedTubos[`${cabo.id}-${tubo.id}`] && (
                              <div className="grid grid-cols-6 gap-1 mt-2">
                                {tubo?.capilares?.sort((a, b) => a.numero - b.numero).map(fibra => {
                                  const conectada = isFibraConectada(fibra.id);
                                  const fusaoCor = getFusaoCor(fibra.id);
                                  const selecionada = fibraSelecionada === fibra.id;

                                  return (
                                    <Button
                                      key={fibra.id}
                                      variant={selecionada ? "default" : "ghost"}
                                      size="sm"
                                      className={`flex flex-col items-center p-1 rounded h-auto ${conectada ? 'bg-gray-100' : ''} ${selecionada ? 'ring-2 ring-primary' : ''}`}
                                      onClick={() => selecionarFibra(fibra.id)}
                                    >
                                      <div
                                        className="w-4 h-4 rounded-full mb-1"
                                        style={{ backgroundColor: getColor(fibra.numero) }}
                                      />
                                      <span className="text-xs">{fibra.numero}</span>
                                      {conectada && (
                                        <div
                                          className="w-2 h-2 rounded-full mt-1"
                                          style={{ backgroundColor: fusaoCor }}
                                        />
                                      )}
                                    </Button>
                                  );
                                })
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Splitters */}
          {splitters.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Splitters Instalados</h4>
              <div className="space-y-3">
                {splitters.map(splitter => (
                  <Card key={splitter.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Splitter {splitter.tipo}</div>
                        <Badge variant={splitter.balanceado ? "default" : "outline"}>
                          {splitter.balanceado ? 'Balanceado' : 'Desbalanceado'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="border rounded-sm p-2">
                          <div className="text-xs font-medium mb-1">Entrada</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center w-full justify-start p-1 ${modoSelecao ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}`}
                            disabled={!modoSelecao}
                            onClick={() => associarFibraASplitter(splitter.id, splitter.portaEntrada)}
                          >
                            <div className="w-4 h-4 rounded-full bg-blue-500" />
                            <span className="text-xs ml-2">Porta de entrada</span>
                            {modoSelecao && fibraSelecionada && (
                              <span className="ml-auto text-xs text-primary">Clique para conectar</span>
                            )}
                          </Button>
                        </div>

                        <div className="border rounded-sm p-2">
                          <div className="text-xs font-medium mb-1">Saídas ({splitter.portasSaida.length})</div>
                          <div className="grid grid-cols-4 gap-1">
                            {splitter.portasSaida.map((porta, index) => {
                              const conectada = fusoes.some(fusao => fusao.fibraDestino === porta);
                              const fusaoCor = conectada
                                ? fusoes.find(fusao => fusao.fibraDestino === porta)?.cor
                                : '#CCCCCC';

                              return (
                                <Button
                                  key={porta}
                                  variant="ghost"
                                  size="sm"
                                  className={`flex flex-col items-center p-1 h-auto ${modoSelecao ? 'hover:bg-gray-100' : ''}`}
                                  disabled={!modoSelecao || conectada}
                                  onClick={() => associarFibraASplitter(splitter.id, porta)}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full ${conectada ? 'ring-1 ring-offset-1' : ''}`}
                                    style={{ backgroundColor: conectada ? fusaoCor : '#CCCCCC' }}
                                  />
                                  <span className="text-xs mt-1">{index + 1}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Fusões */}
          {fusoes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Fusões Realizadas</h4>
              <div className="space-y-2">
                {fusoes.map(fusao => {
                  // Encontrar os detalhes da fibra de origem
                  let origemInfo = "Desconhecida";
                  let destinoInfo = "Desconhecida";

                  // Busca informações da origem (fibra)
                  for (const cabo of cabos) {
                    for (const tubo of cabo.tubos) {
                      const fibra = tubo?.capilares?.find(f => f.id === fusao.fibraOrigem);
                      if (fibra) {
                        origemInfo = `${cabo.nome} - Tubo ${tubo.numero} - Fibra ${fibra.numero}`;
                        break;
                      }
                    }
                  }

                  // Busca informações do destino (pode ser fibra ou porta de splitter)
                  // Primeiro verifica se é uma fibra
                  let destinoEncontrado = false;
                  for (const cabo of cabos) {
                    for (const tubo of cabo.tubos) {
                      const fibra = tubo?.capilares?.find(f => f.id === fusao.fibraDestino);
                      if (fibra) {
                        destinoInfo = `${cabo.nome} - Tubo ${tubo.numero} - Fibra ${fibra.numero}`;
                        destinoEncontrado = true;
                        break;
                      }
                    }
                    if (destinoEncontrado) break;
                  }

                  // Se não for fibra, verifica se é porta de splitter
                  if (!destinoEncontrado) {
                    for (const splitter of splitters) {
                      if (splitter.portaEntrada === fusao.fibraDestino) {
                        destinoInfo = `Splitter ${splitter.tipo} - Entrada`;
                        break;
                      }

                      const portaIndex = splitter.portasSaida.findIndex(p => p === fusao.fibraDestino);
                      if (portaIndex >= 0) {
                        destinoInfo = `Splitter ${splitter.tipo} - Saída ${portaIndex + 1}`;
                        break;
                      }
                    }
                  }

                  return (
                    <div
                      key={fusao.id}
                      className="flex items-center p-2 border rounded-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: fusao.cor }}
                      />
                      <div className="text-xs">
                        <span className="font-medium">{origemInfo}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{destinoInfo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
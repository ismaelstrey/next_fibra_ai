'use client';

import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TuboLoose, Fibra } from '../types';
import { CORES_FIBRAS, CORES_TUBOS } from '../constants/cores';
import { useFusao } from '@/hooks/useFusao';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  // Estados para o modal de confirmação de remoção de fusão
  const [modalRemoverFusao, setModalRemoverFusao] = useState(false);
  const [fusaoParaRemover, setFusaoParaRemover] = useState<{
    fusaoId: string;
    capilarId: string;
    capilarNumero: number;
  } | null>(null);

  // Hook para gerenciar fusões
  const { excluirFusao, listarFusoes, isLoading } = useFusao();

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

  /**
   * Verifica se um capilar possui fusão ativa
   * @param capilarId - ID do capilar
   * @returns Promise<boolean>
   */
  const verificarCapilarPossuiFusao = useCallback(async (capilarId: string) => {
    try {
      const response = await listarFusoes();
      if (response.data && response.data.fusoes) {
        return response.data.fusoes.find(fusao => 
          fusao.capilarOrigemId === capilarId || fusao.capilarDestinoId === capilarId
        );
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar fusões do capilar:', error);
      return null;
    }
  }, [listarFusoes]);

  /**
   * Manipula o clique no botão do capilar
   * @param fibra - Dados da fibra/capilar clicado
   */
  const handleCapilarClick = useCallback(async (fibra: Fibra) => {
    console.log('Clicou no capilar:', fibra);
    
    // Verifica se o capilar possui fusão
    const fusaoExistente = await verificarCapilarPossuiFusao(fibra.id);
    
    if (fusaoExistente) {
      // Se possui fusão, abre modal para confirmar remoção
      setFusaoParaRemover({
        fusaoId: fusaoExistente.id,
        capilarId: fibra.id,
        capilarNumero: fibra.numero
      });
      setModalRemoverFusao(true);
    } else {
      // Se não possui fusão, comportamento normal (criar conexão)
      toast.info(`Capilar ${fibra.numero} disponível para conexão`);
    }
  }, [verificarCapilarPossuiFusao]);

  /**
   * Confirma e executa a remoção da fusão
   */
  const confirmarRemocaoFusao = useCallback(async () => {
    if (!fusaoParaRemover) return;

    try {
      const response = await excluirFusao(fusaoParaRemover.fusaoId);
      
      if (response.status === 200) {
        toast.success(`Fusão do capilar ${fusaoParaRemover.capilarNumero} removida com sucesso!`);
        setModalRemoverFusao(false);
        setFusaoParaRemover(null);
        
        // Aqui você pode adicionar lógica para atualizar o diagrama
        // Por exemplo, emitir um evento ou chamar uma função de callback
        if (data.onFusaoRemovida) {
          data.onFusaoRemovida(fusaoParaRemover.capilarId);
        }
      } else {
        toast.error('Erro ao remover fusão');
      }
    } catch (error) {
      console.error('Erro ao remover fusão:', error);
      toast.error('Erro ao remover fusão');
    }
  }, [fusaoParaRemover, excluirFusao, data]);

  /**
   * Cancela a remoção da fusão
   */
  const cancelarRemocaoFusao = useCallback(() => {
    setModalRemoverFusao(false);
    setFusaoParaRemover(null);
  }, []);

  console.log(data);

  return (
    <>
      <div className="flex flex-col h-auto border-2 border-gray-300 rounded-md p-2 bg-background tetx-primary shadow-md w-72">
        <div className="border-2 border-gray-300 rounded-md font-bold text-center bg-foreground/10 p-1 mb-2">
          Cabo: {data.nome} ({data.tipo} FO)
        </div>
        <div className=" flex justify-end mb-1">
          <button
            className="border-2 border-gray-300 text-xs hover:bg-foreground/20 px-2 py-1 rounded"
            onClick={toggleAllTubos}
          >
            {data.tubos.every((tubo: TuboLoose) => expandedTubos[tubo.id]) ? 'Recolher Todos' : 'Expandir Todos'}
          </button>
        </div>
        <div className="space-y-2">
          {data.tubos.map((tubo: TuboLoose) => (
            <div key={tubo.id} className="border border-gray-200 rounded p-1">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleTubo(tubo.id)}
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: tubo.numero <= 2 ? CORES_TUBOS[tubo.numero as keyof typeof CORES_TUBOS].hex : CORES_TUBOS[3 as keyof typeof CORES_TUBOS].hex }}
                />
                <span className="text-xs font-medium">Tubo {tubo.numero} ({tubo.fibras.length} FO)</span>
                <span className="ml-auto text-xs">{expandedTubos[tubo.id] ? '▼' : '▶'}</span>
              </div>

              {expandedTubos[tubo.id] && (
                <div className="flex">
                  {tubo.fibras.map((fibra: Fibra, key: number) => (  
                    <Handle
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCapilarClick(fibra);
                      }}
                      key={key}
                      type="source"
                      position={Position.Right}
                      id={fibra.id}
                      className='hover:scale-125 rounded-4xl cursor-pointer transition-transform'
                      style={{
                        backgroundColor: CORES_FIBRAS[fibra.numero as keyof typeof CORES_FIBRAS].hex,
                        border: '2px solid black',
                        width: 20,
                        height: 20,
                        top: 20*(key+10),
                        bottom: 20*(key+10),              
                      }}
                      title={`Capilar ${fibra.numero} - Clique para gerenciar fusões`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmação para remoção de fusão */}
      <Dialog open={modalRemoverFusao} onOpenChange={setModalRemoverFusao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Fusão</DialogTitle>
            <DialogDescription>
              O capilar {fusaoParaRemover?.capilarNumero} possui uma fusão ativa. 
              Deseja remover esta fusão?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelarRemocaoFusao}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmarRemocaoFusao}
              disabled={isLoading}
            >
              {isLoading ? 'Removendo...' : 'Remover Fusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
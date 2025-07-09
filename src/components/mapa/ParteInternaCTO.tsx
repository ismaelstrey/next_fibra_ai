'use client';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaFusao } from './AreaFusao';
import { motion, AnimatePresence } from 'framer-motion';
import { SpliterType } from '@/types/fibra';
import { ConexaoRota } from '@/types/caixa';
import { useCapilar } from '@/hooks/useCapilar';
import { TuboAPI, useTubo } from '@/hooks/useTubo';
import Spliter from './components/Spliter';
import { SpliterAPI } from '@/types/spliter';

interface ParteInternaCTOProps {
    /**
     * Lista de splitters instalados
     */
    splitters?: SpliterType[];
    splitersPorcaixa: SpliterAPI[];

    /**
     * Lista de cabos AS conectados
     */
    cabosAS?: ConexaoRota[];
<<<<<<< HEAD

    /**
     * ID da caixa CTO atual
     */
    caixaId?: string;

    /**
     * ID da bandeja atual
     */
    bandejaId?: string;

    /**
     * ID do usuário atual
     */
    usuarioId?: string;
=======
    removerSplitter: (id: string) => void;
>>>>>>> 45d665e3b29f06cfeb4e02bc33dadbb1ee2045fd
}



// Interface para mapear os dados da API para o formato esperado pelo AreaFusao
interface CaboFormatado {
    id: string;
    nome: string;
    tipo: '6' | '12' | '24' | '48' | '96';
    tubos: TuboAPI[];
}
interface PortasSaida {
    id: string;
    numero: number;
    status: string;
    tipo: string;

}

export interface SplitterFormatado {
    id: string;
    tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64',
    balanceado: boolean;
    portaEntrada: string;
    portasSaida: PortasSaida[];
}



/**
 * Componente que representa a parte interna de uma CTO, incluindo splitters, cabos AS e área de fusões
 */
<<<<<<< HEAD
export default function ParteInternaCTO({ 
    splitters = [], 
    cabosAS = [],
    caixaId = '1',
    bandejaId = '1', 
    usuarioId = '1'
}: ParteInternaCTOProps) {
    const [capilar, setCapilar] = useState<CapilarAPI[]>([]);
    const [tubos, setTubos] = useState<TuboAPI[]>([]);
    const [fusoes, setFusoes] = useState<any[]>([]);
    const [carregandoFusoes, setCarregandoFusoes] = useState(false);
=======
export function ParteInternaCTO({ splitters = [], splitersPorcaixa, cabosAS = [], removerSplitter }: ParteInternaCTOProps) {

>>>>>>> 45d665e3b29f06cfeb4e02bc33dadbb1ee2045fd
    const [cabosFormatados, setCabosFormatados] = useState<CaboFormatado[]>([]);
    const [splittersFormatados, setSplittersFormatados] = useState<SplitterFormatado[]>([]);
    const { buscarCapilarPorTubo } = useCapilar()
    const { buscarPorRotaId } = useTubo()


    async function buscaCapilar() {
        if (cabosAS.length === 0) return;

        try {
            // Buscar dados para cada cabo AS conectado
            const cabosPromises = cabosAS.map(async (caboAS) => {
                // Primeiro buscar os tubos da rota
                const tubosResponse = await buscarPorRotaId(caboAS.rota.id);
                const tubosData = tubosResponse || [];

                // Para cada tubo, buscar seus capilares específicos
                const tubosComCapilares = await Promise.all(
                    tubosData.map(async (tubo) => {
                        const capilaresResponse = await buscarCapilarPorTubo(tubo.id);
                        const capilaresDoTubo = capilaresResponse?.data?.capilares || [];

                        return {
                            ...tubo,
                            capilares: capilaresDoTubo
                        };
                    })
                );

                return {
                    id: caboAS.rota.id,
                    nome: caboAS.rota.nome,
                    tipo: caboAS.rota.tipoCabo as '6' | '12' | '24' | '48' | '96',
                    tubos: tubosComCapilares
                };
            });

            const cabosData = await Promise.all(cabosPromises);
            setCabosFormatados(cabosData);

            // Definir capilares e tubos do primeiro cabo para compatibilidade

        } catch (error) {
            console.error('Erro ao buscar dados dos cabos:', error);
        }
    }

    // Formatar splitters para o formato esperado pelo AreaFusao
    // useEffect(() => {
    //     const formatados = splitters.map((splitter) => {
    //         const numPortas = splitter.tipo === '1/8' ? 8 : splitter.tipo === '1/16' ? 16 : 2;

    //         return {
    //             id: splitter.id,
    //             tipo: splitter.tipo as '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64',
    //             balanceado: true, // Assumindo balanceado por padrão
    //             portaEntrada: `entrada-${splitter.id}`,
    //             portasSaida: Array.from({ length: numPortas }, (_, i) => `saida-${splitter.id}-${i + 1}`)
    //         };
    //     });
    //     setSplittersFormatados(formatados);
    // }, [splitters]);


    useEffect(() => {
        const formatados = splitersPorcaixa.map((splitterCx) => {
            console.log(splitterCx)

            return {
                id: splitterCx.id,
                tipo: splitterCx.tipo as '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64',
                balanceado: true, // Assumindo balanceado por padrão
                portaEntrada: splitterCx.capilarEntrada?.id || '',
                portasSaida: splitterCx.capilarSaida || []
            };
        });
        formatados && setSplittersFormatados(formatados);
        console.log({ formatados })
    }, []);

<<<<<<< HEAD
    // Função para carregar fusões existentes
     async function carregarFusoes() {
         if (!caixaId || !bandejaId) return;
         
         setCarregandoFusoes(true);
         try {
             // TODO: Implementar chamada real para API
             // const response = await fetch(`/api/fusoes?caixaId=${caixaId}&bandejaId=${bandejaId}`);
             // const fusoesData = await response.json();
             // setFusoes(fusoesData);
             
             // Simulação por enquanto
             console.log('Carregando fusões para caixa:', caixaId, 'bandeja:', bandejaId);
             setFusoes([]);
         } catch (error) {
             console.error('Erro ao carregar fusões:', error);
         } finally {
             setCarregandoFusoes(false);
         }
     }

     // Função para buscar informações de um capilar
     function buscarCapilar(capilarId: string) {
         return capilar.find(c => c.id === capilarId);
     }

     // Função para obter descrição amigável do tipo de fusão
     function obterDescricaoTipoFusao(tipo: string): string {
         const tipos: Record<string, string> = {
             'capilar_capilar': 'Capilar para Capilar',
             'capilar_splitter': 'Capilar para Splitter',
             'splitter_cliente': 'Splitter para Cliente'
         };
         return tipos[tipo] || tipo;
     }

=======



    // console.log({ splitters })
    // console.log({ splittersFormatados })
>>>>>>> 45d665e3b29f06cfeb4e02bc33dadbb1ee2045fd
    useEffect(() => {
        buscaCapilar()
    }, [cabosAS]);
    
    useEffect(() => {
        carregarFusoes();
    }, [caixaId, bandejaId]);
    return (
        <>
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Parte Interna</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {/* Seção de Splitters */}
                    <div>
                        <h3 className="font-medium mb-2">Splitters Instalados</h3>
                        {splitters.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {splitters.map((splitter, index) => (
                                    <Spliter {...splitter} removerSplitter={removerSplitter} key={index} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">
                                Nenhum splitter instalado
                            </div>
                        )}
                    </div>

                    {/* Seção de Cabos AS */}
                    <div>
                        <h3 className="font-medium mb-2">Cabos AS</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <AnimatePresence>
                                {cabosAS.map((cabo, key) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-3 rounded-md border transition-colors ${cabo.tipoConexao === 'entrada'
                                            ? 'bg-primary/10 border-primary hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/25'
                                            : 'bg-muted border-muted-foreground/20 hover:bg-muted/80 dark:bg-muted/20 dark:border-muted-foreground/30 dark:hover:bg-muted/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{cabo.rota.nome}</span>
                                            <Badge variant={cabo.rota.tipoCabo === '12' ? 'default' : 'outline'}>
                                                {cabo.rota.tipoCabo === '12' ? 'Conectado' : 'Livre'}

                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Área de Fusões */}
                    <div>
                        <h3 className="font-medium mb-2">Área de Fusões</h3>
                        <AreaFusao
                            cabos={cabosFormatados}
                            splitters={splittersFormatados}
                            fusoes={fusoes}
                            carregandoFusoes={carregandoFusoes}
                            onCriarFusao={async (novaFusao) => {
                                try {
                                    console.log('Criando nova fusão:', novaFusao);
                                    
                                    // Validações antes de criar a fusão
                                    if (!novaFusao.capilarOrigemId || !novaFusao.capilarDestinoId) {
                                        throw new Error('Capilares de origem e destino são obrigatórios');
                                    }
                                    
                                    if (novaFusao.capilarOrigemId === novaFusao.capilarDestinoId) {
                                        throw new Error('Não é possível criar fusão entre o mesmo capilar');
                                    }
                                    
                                    // Verificar se já existe fusão entre estes capilares
                                    const fusaoExistente = fusoes.find(f => 
                                        (f.capilarOrigemId === novaFusao.capilarOrigemId && f.capilarDestinoId === novaFusao.capilarDestinoId) ||
                                        (f.capilarOrigemId === novaFusao.capilarDestinoId && f.capilarDestinoId === novaFusao.capilarOrigemId)
                                    );
                                    
                                    if (fusaoExistente) {
                                        throw new Error('Já existe uma fusão entre estes capilares');
                                    }
                                    
                                    // Preparar dados da fusão para envio à API
                                    const dadosFusao = {
                                        capilarOrigemId: novaFusao.capilarOrigemId,
                                        capilarDestinoId: novaFusao.capilarDestinoId,
                                        tipoFusao: novaFusao.tipoFusao,
                                        status: 'Ativa' as const,
                                        qualidadeSinal: 95.0, // Valor padrão
                                        perdaInsercao: 0.15, // Valor padrão
                                        posicaoFusao: `Pos-${Date.now()}`, // Posição única
                                        caixaId: caixaId,
                                         bandejaId: bandejaId,
                                         criadoPorId: usuarioId,
                                         observacoes: `Fusão ${novaFusao.tipoFusao.replace('_', '-')} criada automaticamente`
                                    };

                                    // TODO: Implementar chamada real para API
                                    // const response = await fetch('/api/fusoes', {
                                    //     method: 'POST',
                                    //     headers: {
                                    //         'Content-Type': 'application/json',
                                    //     },
                                    //     body: JSON.stringify(dadosFusao)
                                    // });
                                    // 
                                    // if (!response.ok) {
                                    //     throw new Error('Erro ao criar fusão');
                                    // }
                                    // 
                                    // const fusaoCriada = await response.json();
                                    
                                    // Simulação de sucesso por enquanto
                                    console.log('Dados da fusão preparados:', dadosFusao);
                                    
                                    // Buscar informações dos capilares para feedback
                                    const capilarOrigem = buscarCapilar(novaFusao.capilarOrigemId);
                                    const capilarDestino = buscarCapilar(novaFusao.capilarDestinoId);
                                    const tipoFusaoDescricao = obterDescricaoTipoFusao(novaFusao.tipoFusao);
                                    
                                    // Feedback visual de sucesso
                                    const detalhesOrigem = capilarOrigem ? `${capilarOrigem.numero} (${getColor(capilarOrigem.numero)})` : novaFusao.capilarOrigemId;
                                    const detalhesDestino = capilarDestino ? `${capilarDestino.numero} (${getColor(capilarDestino.numero)})` : novaFusao.capilarDestinoId;
                                    
                                    alert(`✅ Fusão criada com sucesso!\n\nDetalhes:\n- Origem: Capilar ${detalhesOrigem}\n- Destino: Capilar ${detalhesDestino}\n- Tipo: ${tipoFusaoDescricao}\n- Status: Ativa\n- Qualidade: ${dadosFusao.qualidadeSinal}%\n- Perda: ${dadosFusao.perdaInsercao}dB`);
                                    
                                    // Atualizar estado local das fusões
                                    const fusaoSimulada = {
                                        id: `fusao-${Date.now()}`,
                                        ...dadosFusao,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                        // Adicionar informações dos capilares para exibição
                                        capilarOrigem: capilarOrigem,
                                        capilarDestino: capilarDestino
                                    };
                                    setFusoes(prev => [...prev, fusaoSimulada]);
                                    
                                    console.log('Fusão adicionada ao estado local:', fusaoSimulada);
                                    console.log('Total de fusões:', fusoes.length + 1);
                                    
                                } catch (error) {
                                    console.error('Erro ao criar fusão:', error);
                                    alert(`❌ Erro ao criar fusão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                                }
                            }}
                            onRemoverFusao={async (fusaoId) => {
                                try {
                                    console.log('Removendo fusão:', fusaoId);
                                    
                                    // TODO: Implementar chamada real para API
                                    // const response = await fetch(`/api/fusoes/${fusaoId}`, {
                                    //     method: 'DELETE'
                                    // });
                                    // 
                                    // if (!response.ok) {
                                    //     throw new Error('Erro ao remover fusão');
                                    // }
                                    
                                    // Simulação de sucesso por enquanto
                                    console.log('Fusão removida com sucesso:', fusaoId);
                                    
                                    // Feedback visual de sucesso
                                    alert(`✅ Fusão removida com sucesso!`);
                                    
                                    // Atualizar estado local das fusões
                                    setFusoes(prev => prev.filter(f => f.id !== fusaoId));
                                    
                                } catch (error) {
                                    console.error('Erro ao remover fusão:', error);
                                    alert(`❌ Erro ao remover fusão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                                }
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </>
    );
}
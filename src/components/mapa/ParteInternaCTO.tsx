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
    removerSplitter: (id: string) => void;
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
export function ParteInternaCTO({ splitters = [], splitersPorcaixa, cabosAS = [], removerSplitter }: ParteInternaCTOProps) {

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




    // console.log({ splitters })
    // console.log({ splittersFormatados })
    useEffect(() => {
        buscaCapilar()
    }, [cabosAS]);
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
                            fusoes={[
                                // TODO: Implementar busca de fusões da API
                                // Por enquanto, array vazio até implementar a funcionalidade
                            ]}
                            onCriarFusao={(novaFusao) => {
                                console.log('Nova fusão criada:', novaFusao);
                                // TODO: Implementar chamada para API para salvar a fusão
                                // Exemplo de implementação:
                                // await criarFusao({
                                //     fibraOrigem: novaFusao.fibraOrigem,
                                //     fibraDestino: novaFusao.fibraDestino,
                                //     cor: novaFusao.cor,
                                //     caixaId: caixaId // ID da CTO atual
                                // });
                                alert(`Fusão criada com sucesso entre ${novaFusao.fibraOrigem} e ${novaFusao.fibraDestino}`);
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </>
    );
}
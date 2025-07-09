'use client';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaFusao } from './AreaFusao';
import { motion, AnimatePresence } from 'framer-motion';
import { SpliterType } from '@/types/fibra';
import { ConexaoRota } from '@/types/caixa';
import { useCapilar } from '@/hooks/useCapilar';
import { CapilarAPI } from '@/types/capilar';
import { getColor } from '@/functions/color';
import { TuboAPI, useTubo } from '@/hooks/useTubo';
import { useFusao } from '@/hooks/useFusao';
import { Trash2 } from 'lucide-react';
import { FusoesVisual } from './fusoesVisual';
import { ConexaoGrafica } from "./conexaoGrafica";

interface ParteInternaCTOProps {
    /**
     * Lista de splitters instalados
     */
    splitters?: SpliterType[];

    /**
     * Lista de cabos AS conectados
     */
    cabosAS?: ConexaoRota[];

    /**
     * ID da caixa CTO/CEO atual
     */
    caixaId?: string;

    /**
     * ID da bandeja atual (apenas para CEOs)
     */
    bandejaId?: string;

    /**
     * Função para remover splitter
     */
    removerSplitter: (id: string) => void;

    /**
     * ID do usuário atual
     */
    usuarioId?: string;

    /**
     * Tipo da caixa (CTO ou CEO)
     */
    tipoCaixa?: 'CTO' | 'CEO';
}



// Interface para mapear os dados da API para o formato esperado pelo AreaFusao
interface CaboFormatado {
    id: string;
    nome: string;
    tipo: '6' | '12' | '24' | '48' | '96';
    tubos: TuboAPI[];
}

export interface SplitterFormatado {
    id: string;
    tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
    balanceado: boolean;
    portaEntrada: string;
    portasSaida: string[];
}



/**
 * Componente que representa a parte interna de uma CTO, incluindo splitters, cabos AS e área de fusões
 */
export default function ParteInternaCTO({
    removerSplitter,
    splitters = [],
    cabosAS = [],
    caixaId = '1',
    bandejaId = '',
    usuarioId = '1',
    tipoCaixa = 'CTO'
}: ParteInternaCTOProps) {
    const [capilar, setCapilar] = useState<CapilarAPI[]>([]);
    const [fusoes, setFusoes] = useState<any[]>([]);
    const [carregandoFusoes, setCarregandoFusoes] = useState(false);
    const [cabosFormatados, setCabosFormatados] = useState<CaboFormatado[]>([]);
    const [splittersFormatados, setSplittersFormatados] = useState<SplitterFormatado[]>([]);
    const { buscarCapilarPorTubo } = useCapilar()
    const { buscarPorRotaId } = useTubo()
    const { criarFusao, excluirFusao, listarFusoesPorCaixa, isLoading: loadingFusao } = useFusao()

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
            if (cabosData.length > 0) {
                const primeiroTubo = cabosData[0].tubos;

                const todosCapilares = cabosData.flatMap(cabo =>
                    cabo.tubos.flatMap(tubo => tubo.capilares || [])
                );
                setCapilar(todosCapilares);
            }
        } catch (error) {
            console.error('Erro ao buscar dados dos cabos:', error);
        }
    }

    // Formatar splitters para o formato esperado pelo AreaFusao
    useEffect(() => {
        const formatados = splitters.map((splitter, index) => {
            const numPortas = splitter.tipo === '1/8' ? 8 : splitter.tipo === '1/16' ? 16 : 2;

            return {
                id: splitter.id,
                tipo: splitter.tipo as '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64',
                balanceado: true, // Assumindo balanceado por padrão
                portaEntrada: `entrada-${splitter.id}`,
                portasSaida: Array.from({ length: numPortas }, (_, i) => `saida-${splitter.id}-${i + 1}`)
            };
        });
        setSplittersFormatados(formatados);
    }, [splitters]);

    // Função para carregar fusões existentes
    async function carregarFusoes() {
        if (!caixaId) return;

        setCarregandoFusoes(true);
        try {
            // Só filtra por bandejaId se existir (CTOs não possuem bandejas)
            const filtros = bandejaId ? { bandejaId } : {};
            const response = await listarFusoesPorCaixa(caixaId, filtros);
            if (response.data && response.data.fusoes) {
                setFusoes(response.data.fusoes);
                console.log('Fusões carregadas:', response.data.fusoes.length);
            } else {
                setFusoes([]);
            }
        } catch (error) {
            console.error('Erro ao carregar fusões:', error);
            setFusoes([]);
        } finally {
            setCarregandoFusoes(false);
        }
    }



    useEffect(() => {
        buscaCapilar()
    }, [cabosAS]);

    useEffect(() => {
        carregarFusoes();
    }, [caixaId, bandejaId, fusoes]);
    return (
        <>
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Parte Interna</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {/* Visualização gráfica das conexões */}
                    <ConexaoGrafica cabos={cabosFormatados} splitters={splittersFormatados} fusoes={fusoes} />
                    {/* Seção de Splitters */}
                    <div>
                        <h3 className="font-medium mb-2">Splitters Instalados</h3>
                        {splitters.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {splitters.map((splitter, index) => (
                                    <div key={index} className={`p-3 text-accent rounded-md border border-blue-300 ${splitter.tipo === '1/8' ? 'bg-red-500' : splitter.tipo === '1/16' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                        <div className="flex items-center justify-between">
                                            <span>Splitter {splitter.tipo}</span>
                                            <Badge variant="secondary">Posição {index + 1}</Badge>
                                            {splitter.id && <button className='cursor-pointer hover:scale-110' title='Ecluir spliter' onClick={() => removerSplitter(splitter.id)}><Trash2 size={20} /></button>}

                                        </div>
                                    </div>
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
                        <div>
                            {/* Visualização das Fusões */}
                            {fusoes.length > 0 && splittersFormatados.length > 0 && (
                                <FusoesVisual splitters={splittersFormatados} fusoes={fusoes} capilares={capilar} />
                            )}
                            {/* Área de fusão e outros componentes */}
                            <AreaFusao
                                cabos={cabosFormatados}
                                splitters={splittersFormatados}
                                fusoes={fusoes}
                                carregandoFusoes={carregandoFusoes}
                                onCriarFusao={async (novaFusao) => {
                                    // Garante que caixaId seja atribuído corretamente
                                    const fusaoComCaixa = { ...novaFusao, caixaId };
                                    await criarFusao(fusaoComCaixa);
                                    await carregarFusoes();
                                }}
                                onRemoverFusao={excluirFusao}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </>
    );
}
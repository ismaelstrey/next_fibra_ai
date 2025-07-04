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

interface ParteInternaCTOProps {
    /**
     * Lista de splitters instalados
     */
    splitters?: SpliterType[];

    /**
     * Lista de cabos AS conectados
     */
    cabosAS?: ConexaoRota[];
}

interface PropsCapilar extends CapilarAPI {
    cor: string;
}



/**
 * Componente que representa a parte interna de uma CTO, incluindo splitters, cabos AS e área de fusões
 */
export function ParteInternaCTO({ splitters = [], cabosAS = [] }: ParteInternaCTOProps) {
    const [capilar, setCapilar] = useState<PropsCapilar[]>([]);
    const { buscarCapilarPorRota } = useCapilar()
    async function busacaCapilar() {
        const capilar = await buscarCapilarPorRota(cabosAS[0].rota.id)
        const geraCapilar = capilar.data.capilares.map((c) => ({ ...c, cor: getColor(c.numero) }))
        capilar && setCapilar(geraCapilar)


        console.log(geraCapilar)
    }

    useEffect(() => {
        busacaCapilar()
    }, [])
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
                                    <div key={index} className={`p-3 text-accent rounded-md border border-blue-300 ${splitter.tipo === '1/8' ? 'bg-red-500' : splitter.tipo === '1/16' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                        <div className="flex items-center justify-between">
                                            <span>Splitter {splitter.tipo}</span>
                                            <Badge variant="secondary">Posição {index + 1}</Badge>
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
                        <AreaFusao
                            cabos={[
                                // Exemplo de cabo para demonstração
                                {
                                    id: 'cabo-demo-1',
                                    nome: 'Cabo AS-01',
                                    tipo: '12',
                                    tubos: [
                                        {
                                            id: 'tubo-demo-1',
                                            cor: '#008000',
                                            numero: 1,
                                            fibras: capilar || [],
                                        }
                                    ]
                                }
                            ]}
                            splitters={[
                                // Exemplo de splitter para demonstração
                                {
                                    id: 'splitter-demo-1',
                                    tipo: '1/8',
                                    balanceado: true,
                                    portaEntrada: 'entrada-demo-1',
                                    portasSaida: Array.from({ length: 8 }, (_, i) => `saida-demo-${i + 1}`)
                                }
                            ]}
                            fusoes={[
                                // Exemplo de fusão para demonstração
                                {
                                    id: 'fusao-demo-1',
                                    fibraOrigem: 'fibra-demo-1',
                                    fibraDestino: 'entrada-demo-1',
                                    cor: '#FF0000'
                                }
                            ]}
                            onCriarFusao={(novaFusao) => {
                                console.log('Nova fusão criada:', novaFusao);
                                // Aqui você implementaria a lógica para adicionar a nova fusão ao estado
                                // Por exemplo, usando um estado local ou chamando uma API
                                alert(`Fusão criada com sucesso entre ${novaFusao.fibraOrigem} e ${novaFusao.fibraDestino}`);
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </>
    );
}
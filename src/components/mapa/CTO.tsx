'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface Cliente {
    id: number;
    nome: string;
    endereco: string;
    casa: string;
    apto: string;
    telefone: string;
    plano: string;
    wifi?: string;
    password?: string;

}

interface PortaCliente {
    id: number;
    ativa: boolean;
    cliente?: Cliente;
}

interface SplitterInfo {
    tipo: '1/8' | '1/16' | '1/2';
    posicao: number;
}

interface CaboAS {
    id: number;
    nome: string;
    ativo: boolean;
}

interface CTOProps {
    /**
     * Identificação da CTO
     */
    id: string;

    /**
     * Nome da CTO
     */
    nome: string;

    /**
     * Modelo da CTO
     */
    modelo?: string;

    /**
     * Capacidade total de portas da CTO (8 ou 16)
     */
    capacidade: 8 | 16;

    /**
     * Lista de portas de clientes
     */
    portas?: PortaCliente[];

    /**
     * Lista de splitters instalados
     */
    splitters?: SplitterInfo[];

    /**
     * Lista de cabos AS conectados
     */
    cabosAS?: CaboAS[];

    /**
     * Observações sobre a CTO
     */
    observacoes?: string;
}

/**
 * Componente CTO que representa uma caixa de atendimento de clientes de fibra óptica
 * Possui três abas: visualização externa, conexões de clientes e parte interna com splitters
 */
export function CTO({
    id,
    nome,
    modelo = 'Padrão',
    capacidade = 8,
    portas = [],
    splitters = [],
    cabosAS = [],
    observacoes
}: CTOProps) {
    // Estado para controlar se a CTO está expandida ou não
    const [expandida, setExpandida] = useState(false);

    // Inicializa as portas se não forem fornecidas
    const portasClientes = portas.length > 0 ? portas : Array.from({ length: capacidade }, (_, i) => ({
        id: i + 1,
        ativa: false,
        cliente: {
            id: i + 1,
            nome: `Cliente ${i + 1}`,
            endereco: `Endereço ${i + 1}`,
            casa: `Casa ${i + 1}`,
            apto: `Apto ${i + 1}`,
            telefone: `(11) 91234-5678`,
            plano: `Plano ${i + 1}`,
            wifi: `Wifi ${i + 1}`,
            password: `Password ${i + 1}`,
        }
    }));

    // Inicializa os cabos AS se não forem fornecidos
    const cabosConectados = cabosAS.length > 0 ? cabosAS : Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        nome: `Cabo AS ${i + 1}`,
        ativo: false
    }));

    // Função para alternar entre expandido e contraído
    const toggleExpandir = () => {
        setExpandida(!expandida);
    };

    return (
        <Card className={`border-2 border-primary shadow-lg transition-all duration-300 ${expandida ? 'fixed top-0 left-0 w-full h-full' : 'w-full max-w-md mx-auto'}`}>
            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={toggleExpandir}
                    title={expandida ? "Contrair" : "Expandir"}
                >
                    {expandida ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                <Tabs defaultValue="fechada" className="w-full">
                    {/* Abas de navegação */}
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="fechada">CTO Fechada</TabsTrigger>
                        <TabsTrigger value="conexoes">Conexões</TabsTrigger>
                        <TabsTrigger value="interna">Parte Interna</TabsTrigger>
                    </TabsList>

                    {/* Conteúdo da aba "CTO Fechada" */}
                    <TabsContent value="fechada">
                        <CardHeader className="text-center border-b pb-4">
                            <CardTitle className="text-xl font-bold">{nome}</CardTitle>
                            <div className="flex justify-center gap-2 mt-2">
                                <Badge variant="outline">{modelo}</Badge>
                                <Badge>{capacidade} portas</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{id}</div>
                                    <div className="text-sm text-muted-foreground mt-2">CTO - {capacidade} portas</div>
                                </div>
                            </div>
                            {observacoes && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    <strong>Observações:</strong> {observacoes}
                                </div>
                            )}
                        </CardContent>
                    </TabsContent>

                    {/* Conteúdo da aba "Conexões" */}
                    <TabsContent value="conexoes">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-lg">Conexões de Clientes</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3">

                                {portasClientes.map((porta) => (
                                    <div
                                        key={porta.id}
                                        className={`p-3 rounded-md border ${porta.ativa ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Porta {porta.id}</span>
                                            <Badge variant={porta.ativa ? 'default' : 'outline'}>
                                                {porta.ativa ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </div>
                                        {porta.ativa && porta.cliente && (
                                            <div className="text-sm mt-1 text-muted-foreground">
                                                Cliente: {porta?.cliente?.nome || 'Sem cliente'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </TabsContent>

                    {/* Conteúdo da aba "Parte Interna" */}
                    <TabsContent value="interna">
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
                                                <div key={index} className="p-3 rounded-md border border-blue-300 bg-blue-50">
                                                    <div className="flex items-center justify-between">
                                                        <span>Splitter {splitter.tipo}</span>
                                                        <Badge variant="secondary">Posição {splitter.posicao}</Badge>
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
                                        {cabosConectados.map((cabo) => (
                                            <div
                                                key={cabo.id}
                                                className={`p-3 rounded-md border ${cabo.ativo ? 'bg-amber-100 border-amber-500' : 'bg-gray-100 border-gray-300'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{cabo.nome}</span>
                                                    <Badge variant={cabo.ativo ? 'secondary' : 'outline'}>
                                                        {cabo.ativo ? 'Conectado' : 'Livre'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Área de Fusões */}
                                <div>
                                    <h3 className="font-medium mb-2">Área de Fusões</h3>
                                    <div className="p-4 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground">
                                            Área para acomodação de fusões de fibra óptica
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </div>
        </Card>
    );
}
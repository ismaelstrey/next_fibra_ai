'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import ParteInternaCTO from './ParteInternaCTO';
import { SpliterType } from '@/types/fibra';
import { ClienteAPI } from '@/types/cliente';
import { ConexaoRota } from '@/types/caixa';
import { useSpliter } from '@/hooks/useSpliter';
import { SpliterAPI } from '@/types/spliter';

interface BandejaProps {
  id: string;
  numero: number;
  capacidade: number;
  status?: string;
  caixaId: string;
}

interface CEOProps {
  /**
   * Identificação do CEO
   */
  id: string;

  /**
   * Nome do CEO
   */
  nome: string;

  /**
   * Modelo do CEO
   */
  modelo?: string;

  /**
   * Capacidade total de bandejas do CEO
   */
  capacidade: number;

  /**
   * Lista de clientes conectados
   */
  clientes?: ClienteAPI[];

  /**
   * Lista de splitters instalados
   */
  splitters?: SpliterType[];

  /**
   * Função para remover splitter
   */
  removerSplitter: (id: string) => void;

  /**
   * Lista de cabos AS conectados
   */
  cabosAS?: ConexaoRota[];

  /**
   * Lista de bandejas
   */
  bandejas?: BandejaProps[];

  /**
   * Observações sobre o CEO
   */
  observacoes?: string;
}

/**
 * Componente CEO que representa uma Caixa de Emenda Óptica
 * Possui três abas: visualização externa, bandejas e parte interna com splitters
 */
export function CEO({
  id,
  nome,
  modelo = 'Padrão',
  capacidade = 12,
  clientes = [],
  splitters = [],
  cabosAS = [],
  removerSplitter,
  bandejas = [],
  observacoes
}: CEOProps) {
  // Estado para controlar se o CEO está expandido ou não
  const [expandida, setExpandida] = useState(false);
  const toggleExpandir = () => {
    setExpandida(!expandida);
  };
  
  const { buscarSpliterPorCaixa } = useSpliter();
  const [splitersPorcaixa, setSplitersPorcaixa] = useState<SpliterAPI[]>([]);
  
  const loadSpliter = async () => {
    const spliters = await buscarSpliterPorCaixa(id);
    setSplitersPorcaixa(spliters.data.spliters);
  };

  useEffect(() => {
    loadSpliter();
  }, [id]);

  return (
    <Card className={`border-2 border-orange-500 shadow-lg transition-all duration-300 ${expandida ? 'fixed top-0 left-0 w-full h-full' : 'w-full max-w-full mx-auto'}`}>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-8 right-0 z-10"
          onClick={toggleExpandir}
          title={expandida ? "Contrair" : "Expandir"}
        >
          {expandida ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Tabs defaultValue="fechada" className="w-full">
          {/* Abas de navegação */}
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="fechada">CEO Fechado</TabsTrigger>
            <TabsTrigger value="bandejas">Bandejas</TabsTrigger>
            <TabsTrigger value="interna">Parte Interna</TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba "CEO Fechado" */}
          <TabsContent value="fechada">
            <CardHeader className="text-center border-b pb-4">
              <CardTitle className="text-xl font-bold">{nome}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {modelo}
              </CardDescription>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-800">{modelo}</Badge>
                <Badge className="bg-orange-500">{capacidade} bandejas</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{id}</div>
                  <div className="text-sm text-muted-foreground mt-2">CEO - {capacidade} bandejas</div>
                </div>
              </div>
              {observacoes && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <strong>Observações:</strong> {observacoes}
                </div>
              )}
            </CardContent>
          </TabsContent>

          {/* Conteúdo da aba "Bandejas" */}
          <TabsContent value="bandejas">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Bandejas de Fusão</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {bandejas.map((bandeja, key) => (
                  <div
                    key={key}
                    className="p-3 border rounded-md bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Bandeja {bandeja.numero}</span>
                      <Badge variant="outline" className="text-orange-700">
                        {bandeja.capacidade} fusões
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Status: {bandeja.status || 'Disponível'}
                    </div>
                  </div>
                ))}
                {bandejas.length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    Nenhuma bandeja configurada
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>

          {/* Conteúdo da aba "Parte Interna" */}
          <TabsContent value="interna">
            <ParteInternaCTO
              removerSplitter={removerSplitter}
              splitters={splitters}
              cabosAS={cabosAS}
              caixaId={id}
              bandejaId={bandejas.length > 0 ? bandejas[0].id : undefined}
              tipoCaixa="CEO"
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
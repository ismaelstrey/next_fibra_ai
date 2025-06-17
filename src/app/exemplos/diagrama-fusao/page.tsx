'use client';

import React, { useState } from 'react';
import { DiagramaFusao } from '@/components/diagrama/DiagramaFusao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function DiagramaFusaoExemplo() {
  const [conexoes, setConexoes] = useState<{origem: string, destino: string}[]>([]);

  // Função para registrar conexões realizadas
  const handleConexaoRealizada = (sourceId: string, targetId: string) => {
    setConexoes(prev => [...prev, {origem: sourceId, destino: targetId}]);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diagrama de Fusão de Cabos</h1>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Este é um exemplo de diagrama para fusão de cabos de fibra óptica. Você pode adicionar cabos e splitters, 
          e conectar as fibras entre si arrastando das saídas (direita) para as entradas (esquerda).
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="diagrama" className="w-full">
        <TabsList>
          <TabsTrigger value="diagrama">Diagrama</TabsTrigger>
          <TabsTrigger value="conexoes">Conexões Realizadas</TabsTrigger>
        </TabsList>
        <TabsContent value="diagrama" className="mt-4">
          <DiagramaFusao onConexaoRealizada={handleConexaoRealizada} />
        </TabsContent>
        <TabsContent value="conexoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexões Realizadas</CardTitle>
            </CardHeader>
            <CardContent>
              {conexoes.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma conexão realizada ainda.</p>
              ) : (
                <div className="space-y-2">
                  {conexoes.map((conexao, index) => (
                    <div key={index} className="p-2 border rounded-md">
                      <p><strong>Origem:</strong> {conexao.origem}</p>
                      <p><strong>Destino:</strong> {conexao.destino}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
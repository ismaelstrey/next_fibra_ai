'use client';

import React, { useState } from 'react';
import { DiagramaFusao } from '@/components/diagrama/DiagramaFusao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DiagramaFusaoExemplo() {
  const [conexoes, setConexoes] = useState<{ origem: string, destino: string }[]>([]);

  // Função para registrar conexões realizadas
  const handleConexaoRealizada = (sourceId: string, targetId: string) => {
    setConexoes(prev => [...prev, { origem: sourceId, destino: targetId }]);
  };

  return (
    <div className=" h-screen mt-0 bg-red-600">

      <Tabs defaultValue="diagrama" className="w-full">
        <TabsList className='fixed right-4 top-8'>
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
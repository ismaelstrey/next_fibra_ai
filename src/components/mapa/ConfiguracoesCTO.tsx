'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfiguracoesCTOProps {
  /**
   * Capacidade atual da CTO (8 ou 16 portas)
   */
  capacidade: 8 | 16;
  
  /**
   * Função para alterar a capacidade da CTO
   */
  setCapacidade: (capacidade: 8 | 16) => void;
  
  /**
   * Array com os IDs das portas ativas
   */
  portasAtivas: number[];
  
  /**
   * Função para alternar o estado de uma porta (ativa/inativa)
   */
  alternarPorta: (portaId: number) => void;
  
  /**
   * Array com os splitters instalados na CTO
   */
  splitters: Array<{ tipo: '1/8' | '1/16' | '1/2'; posicao: number }>;
  
  /**
   * Função para adicionar um splitter à CTO
   */
  adicionarSplitter: (tipo: '1/8' | '1/16' | '1/2') => void;
  
  /**
   * Função para remover o último splitter adicionado
   */
  removerSplitter: () => void;
  
  /**
   * Array com os IDs dos cabos AS ativos
   */
  cabosAtivos: number[];
  
  /**
   * Função para alternar o estado de um cabo AS (ativo/inativo)
   */
  alternarCabo: (caboId: number) => void;
}

/**
 * Componente para configuração dos parâmetros de uma CTO
 * Permite configurar capacidade, splitters, portas ativas e cabos AS
 */
export function ConfiguracoesCTO({
  capacidade,
  setCapacidade,
  portasAtivas,
  alternarPorta,
  splitters,
  adicionarSplitter,
  removerSplitter,
  cabosAtivos,
  alternarCabo
}: ConfiguracoesCTOProps) {

  console.log(portasAtivas)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da CTO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Capacidade</label>
          <Select 
            value={capacidade.toString()} 
            onValueChange={(value) => setCapacidade(parseInt(value) as 8 | 16)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a capacidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 portas</SelectItem>
              <SelectItem value="16">16 portas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Splitters</label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => adicionarSplitter('1/8')}
              disabled={splitters.length >= 2}
            >
              + Splitter 1/8
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => adicionarSplitter('1/16')}
              disabled={splitters.length >= 2}
            >
              + Splitter 1/16
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={removerSplitter}
              disabled={splitters.length === 0}
            >
              - Remover
            </Button>
          </div>
          <div className="mt-2 text-sm">
            {splitters.length === 0 ? (
              <span className="text-muted-foreground">Nenhum splitter adicionado</span>
            ) : (
              <span>
                Splitters: {splitters.map(s => s.tipo).join(', ')}
              </span>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Portas Ativas</label>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: capacidade }, (_, i) => i + 1).map(portaId => (
              <Button 
                key={portaId}
                size="sm"
                variant={portasAtivas.includes(portaId) ? "default" : "outline"}
                onClick={() => alternarPorta(portaId)}
              >
                {portaId}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Cabos AS Ativos</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(caboId => (
              <Button 
                key={caboId}
                size="sm"
                variant={cabosAtivos.includes(caboId) ? "secondary" : "outline"}
                onClick={() => alternarCabo(caboId)}
              >
                Cabo {caboId}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
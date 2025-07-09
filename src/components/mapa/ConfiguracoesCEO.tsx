'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { SpliterType } from '@/types/fibra';
import { useSpliter } from '@/hooks/useSpliter';
import { SpliterAPI } from '@/types/spliter';

interface BandejaProps {
  id: string;
  numero: number;
  capacidade: number;
  status?: string;
  caixaId: string;
}

interface ConfiguracoesCEOProps {
  /**
   * Lista de bandejas do CEO
   */
  bandejas?: BandejaProps[];

  /**
   * ID do CEO
   */
  ceoId: string;

  /**
   * Capacidade total de bandejas
   */
  capacidade: number;

  /**
   * Lista de bandejas selecionadas
   */
  bandejasSelecionadas: number[];

  /**
   * Função para alternar seleção de bandeja
   */
  alternarBandeja: (bandejaId: number) => void;

  /**
   * Lista de splitters instalados
   */
  splitters: SpliterType[];

  /**
   * Função para adicionar splitter
   */
  adicionarSplitter: (tipo: '1/8' | '1/16' | '1/2') => void;

  /**
   * Função para remover splitter
   */
  removerSplitter: (id: string) => void;
}

/**
 * Componente de configurações para CEO (Caixa de Emenda Óptica)
 * Permite gerenciar bandejas e splitters
 */
export function ConfiguracoesCEO({
  bandejas = [],
  ceoId,
  capacidade,
  bandejasSelecionadas,
  alternarBandeja,
  splitters,
  adicionarSplitter,
  removerSplitter
}: ConfiguracoesCEOProps) {
  const [tipoSplitterSelecionado, setTipoSplitterSelecionado] = useState<'1/8' | '1/16' | '1/2'>('1/8');
  const { buscarSpliterPorCaixa } = useSpliter();
  const [splitersCarregados, setSplittersCarregados] = useState<SpliterAPI[]>([]);

  const loadSplitters = async () => {
    try {
      const response = await buscarSpliterPorCaixa(ceoId);
      if (response?.data?.spliters) {
        setSplittersCarregados(response.data.spliters);
      }
    } catch (error) {
      console.error('Erro ao carregar splitters:', error);
    }
  };

  useEffect(() => {
    if (ceoId) {
      loadSplitters();
    }
  }, [ceoId]);

  const handleAdicionarSplitter = () => {
    adicionarSplitter(tipoSplitterSelecionado);
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Bandejas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            Bandejas de Fusão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Capacidade: {capacidade} bandejas
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {bandejas.map((bandeja) => (
                <Button
                  key={bandeja.id}
                  variant={bandejasSelecionadas.includes(bandeja.numero) ? "default" : "outline"}
                  size="sm"
                  onClick={() => alternarBandeja(bandeja.numero)}
                  className={`h-12 flex flex-col items-center justify-center ${
                    bandejasSelecionadas.includes(bandeja.numero)
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'hover:bg-orange-50'
                  }`}
                >
                  <span className="text-xs font-medium">{bandeja.numero}</span>
                  <span className="text-xs opacity-75">{bandeja.capacidade}f</span>
                </Button>
              ))}
              
              {/* Bandejas vazias */}
              {Array.from({ length: Math.max(0, capacidade - bandejas.length) }, (_, i) => (
                <Button
                  key={`empty-${i}`}
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-12 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30"
                >
                  <span className="text-xs text-muted-foreground">{bandejas.length + i + 1}</span>
                  <span className="text-xs text-muted-foreground opacity-50">-</span>
                </Button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              Bandejas selecionadas: {bandejasSelecionadas.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Splitters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            Splitters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controles para adicionar splitter */}
            <div className="flex gap-2">
              <Select
                value={tipoSplitterSelecionado}
                onValueChange={(value: '1/8' | '1/16' | '1/2') => setTipoSplitterSelecionado(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tipo de splitter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1/2">1:2 (2 saídas)</SelectItem>
                  <SelectItem value="1/8">1:8 (8 saídas)</SelectItem>
                  <SelectItem value="1/16">1:16 (16 saídas)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAdicionarSplitter}
                disabled={splitters.length >= 4} // CEOs podem ter mais splitters
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            {/* Lista de splitters instalados */}
            <div className="space-y-2">
              {splitters.length > 0 ? (
                splitters.map((splitter, index) => (
                  <div
                    key={splitter.id || index}
                    className="flex items-center justify-between p-3 border rounded-md bg-blue-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Splitter {splitter.tipo}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Posição {index + 1}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => splitter.id && removerSplitter(splitter.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4 border-2 border-dashed border-muted-foreground/30 rounded-md">
                  Nenhum splitter instalado
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Splitters instalados: {splitters.length}/4
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do CEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono">{ceoId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">CEO</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bandejas Ativas:</span>
              <span>{bandejasSelecionadas.length}/{capacidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Splitters:</span>
              <span>{splitters.length}/4</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
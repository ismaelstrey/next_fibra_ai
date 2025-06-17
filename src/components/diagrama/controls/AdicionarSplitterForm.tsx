'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdicionarSplitterFormProps {
  tipoSplitterSelecionado: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
  setTipoSplitterSelecionado: (tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64') => void;
  splitterBalanceado: boolean;
  setSplitterBalanceado: (balanceado: boolean) => void;
  adicionarSplitter: () => void;
}

/**
 * Componente de formulário para adicionar splitters
 */
export function AdicionarSplitterForm({
  tipoSplitterSelecionado,
  setTipoSplitterSelecionado,
  splitterBalanceado,
  setSplitterBalanceado,
  adicionarSplitter,
}: AdicionarSplitterFormProps) {
  return (
    <div className="space-y-2">
      <Label>Adicionar Splitter</Label>
      <div className="flex space-x-2">
        <Select value={tipoSplitterSelecionado} onValueChange={(value) => setTipoSplitterSelecionado(value as any)}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1/2">1:2</SelectItem>
            <SelectItem value="1/4">1:4</SelectItem>
            <SelectItem value="1/8">1:8</SelectItem>
            <SelectItem value="1/16">1:16</SelectItem>
            <SelectItem value="1/32">1:32</SelectItem>
            <SelectItem value="1/64">1:64</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={splitterBalanceado ? 'balanceado' : 'desbalanceado'}
          onValueChange={(value) => setSplitterBalanceado(value === 'balanceado')}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Balanceamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="balanceado">Balanceado</SelectItem>
            <SelectItem value="desbalanceado">Desbalanceado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={adicionarSplitter}>Adicionar Splitter</Button>
      </div>
    </div>
  );
}
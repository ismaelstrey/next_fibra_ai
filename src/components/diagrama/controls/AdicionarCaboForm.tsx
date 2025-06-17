'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdicionarCaboFormProps {
  nomeCabo: string;
  setNomeCabo: (nome: string) => void;
  tipoCaboSelecionado: '6' | '12' | '24' | '48' | '96';
  setTipoCaboSelecionado: (tipo: '6' | '12' | '24' | '48' | '96') => void;
  adicionarCabo: () => void;
}

/**
 * Componente de formulário para adicionar cabos
 */
export function AdicionarCaboForm({
  nomeCabo,
  setNomeCabo,
  tipoCaboSelecionado,
  setTipoCaboSelecionado,
  adicionarCabo,
}: AdicionarCaboFormProps) {
  return (
    <div className="space-y-2">
      <Label>Adicionar Cabo</Label>
      <div className="flex space-x-2">
        <Input
          placeholder="Nome do cabo"
          value={nomeCabo}
          onChange={(e) => setNomeCabo(e.target.value)}
          className="w-40"
        />
        <Select value={tipoCaboSelecionado} onValueChange={(value) => setTipoCaboSelecionado(value as any)}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 FO</SelectItem>
            <SelectItem value="12">12 FO</SelectItem>
            <SelectItem value="24">24 FO</SelectItem>
            <SelectItem value="48">48 FO</SelectItem>
            <SelectItem value="96">96 FO</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={adicionarCabo}>Adicionar Cabo</Button>
      </div>
    </div>
  );
}
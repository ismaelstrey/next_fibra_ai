'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { AdicionarCaboForm } from './AdicionarCaboForm';
import { AdicionarSplitterForm } from './AdicionarSplitterForm';

interface DiagramaControlesProps {
  // Props para o formulário de cabos
  nomeCabo: string;
  setNomeCabo: (nome: string) => void;
  tipoCaboSelecionado: '6' | '12' | '24' | '48' | '96';
  setTipoCaboSelecionado: (tipo: '6' | '12' | '24' | '48' | '96') => void;
  adicionarCabo: () => void;
  
  // Props para o formulário de splitters
  tipoSplitterSelecionado: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
  setTipoSplitterSelecionado: (tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64') => void;
  splitterBalanceado: boolean;
  setSplitterBalanceado: (balanceado: boolean) => void;
  adicionarSplitter: () => void;
}

/**
 * Componente para os controles do diagrama
 */
export function DiagramaControles({
  nomeCabo,
  setNomeCabo,
  tipoCaboSelecionado,
  setTipoCaboSelecionado,
  adicionarCabo,
  tipoSplitterSelecionado,
  setTipoSplitterSelecionado,
  splitterBalanceado,
  setSplitterBalanceado,
  adicionarSplitter,
}: DiagramaControlesProps) {
  return (
    <div className="p-4 border-b flex space-x-4">
      <AdicionarCaboForm
        nomeCabo={nomeCabo}
        setNomeCabo={setNomeCabo}
        tipoCaboSelecionado={tipoCaboSelecionado}
        setTipoCaboSelecionado={setTipoCaboSelecionado}
        adicionarCabo={adicionarCabo}
      />

      <Separator orientation="vertical" className="h-auto" />

      <AdicionarSplitterForm
        tipoSplitterSelecionado={tipoSplitterSelecionado}
        setTipoSplitterSelecionado={setTipoSplitterSelecionado}
        splitterBalanceado={splitterBalanceado}
        setSplitterBalanceado={setSplitterBalanceado}
        adicionarSplitter={adicionarSplitter}
      />
    </div>
  );
}
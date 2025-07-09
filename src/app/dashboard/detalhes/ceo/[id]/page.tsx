'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import useCaixa from '@/hooks/useCaixa';
import { CaixaAPI } from '@/types/caixa';
import { CEO } from '@/components/mapa/CEO';
import { ConfiguracoesCEO } from '@/components/mapa/ConfiguracoesCEO';
import { useSpliter } from '@/hooks/useSpliter';
import { SpliterType } from '@/types/fibra';
import { useClient } from '@/hooks/useClient';
import { ClienteAPI } from '@/types/cliente';

/**
 * Página de detalhes para CEO (Caixa de Emenda Óptica)
 */
export default function DetalheCEOPage() {
  const [ceo, setCeo] = useState<CaixaAPI>();
  const [splitters, setSplitters] = useState<SpliterType[]>([]);
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [bandejasSelecionadas, setBandejasSelecionadas] = useState<number[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);

  const { criarSpliter, excluirSpliter } = useSpliter();
  const { buscarClientesPorCto } = useClient();
  const { obterCaixaPorId } = useCaixa();

  const path = usePathname();
  const id = path.split('/')[4];

  const loadCaixa = async () => {
    try {
      const ceoBusca = await obterCaixaPorId(id);
      if (ceoBusca?.data) {
        setCeo(ceoBusca.data);
        
        // Gerar bandejas baseado na capacidade (1 bandeja para cada 12 fibras)
        const numBandejas = Math.ceil(ceoBusca.data.capacidade / 12);
        const bandejasList = Array.from({ length: numBandejas }, (_, i) => ({
          id: `bandeja-${i + 1}`,
          numero: i + 1,
          capacidade: 12,
          status: 'ativa',
          caixaId: id
        }));
        setBandejas(bandejasList);
      }
      
      const cliente = await buscarClientesPorCto(id);
      if (cliente?.data) {
        setClientes(cliente.data.clientes);
      }
    } catch (error) {
      console.error('Erro ao carregar CEO:', error);
    }
  };

  useEffect(() => {
    loadCaixa();
  }, [id]);

  // Atualiza os splitters quando o CEO é carregado
  useEffect(() => {
    if (ceo?.spliters) {
      setSplitters(ceo.spliters);
    }
  }, [ceo]);

  // Adiciona um splitter
  const adicionarSplitter = async (tipo: '1/8' | '1/16' | '1/2') => {
    if (splitters.length < 4) { // CEOs podem ter mais splitters
      try {
        await criarSpliter({
          atendimento: true,
          tipo,
          caixaId: ceo?.id || '',
          nome: "Spliter" + ceo?.nome,
        });
        await loadCaixa();
      } catch (error) {
        console.error('Erro ao criar splitter:', error);
      }
    }
  };

  // Remove um splitter
  const removerSplitter = async (id: string) => {
    try {
      await excluirSpliter(id);
      await loadCaixa();
    } catch (error) {
      console.error('Erro ao remover splitter:', error);
    }
  };

  // Alterna seleção de bandeja
  const alternarBandeja = (bandejaId: number) => {
    setBandejasSelecionadas(prev => {
      if (prev.includes(bandejaId)) {
        return prev.filter(id => id !== bandejaId);
      } else {
        return [...prev, bandejaId];
      }
    });
  };

  if (!ceo) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">{ceo.nome || 'CEO'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ConfiguracoesCEO
            bandejas={bandejas}
            ceoId={ceo.id || ''}
            capacidade={Math.ceil((ceo.capacidade || 12) / 12)}
            bandejasSelecionadas={bandejasSelecionadas}
            alternarBandeja={alternarBandeja}
            splitters={splitters}
            adicionarSplitter={adicionarSplitter}
            removerSplitter={removerSplitter}
          />
        </div>

        <div>
          <CEO
            id={ceo.id || "CEO-EXEMPLO-01"}
            nome={ceo.nome || "CEO Exemplo"}
            modelo={ceo.modelo || "Modelo Demonstração"}
            capacidade={ceo.capacidade || 12}
            clientes={clientes}
            splitters={splitters}
            cabosAS={ceo.rotaCaixas}
            observacoes={ceo.observacoes || "Sem observações"}
            removerSplitter={removerSplitter}
            bandejas={bandejas}
          />
        </div>
      </div>
    </div>
  );
}
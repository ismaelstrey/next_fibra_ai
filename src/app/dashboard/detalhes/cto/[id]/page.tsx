'use client';

import React, { useEffect, useState } from 'react';
import { ConfiguracoesCTO } from '@/components/mapa/ConfiguracoesCTO';
import { usePathname } from 'next/navigation';
import { useSpliter } from '@/hooks/useSpliter';
import useCaixa from '@/hooks/useCaixa';
import { CTO } from '@/components/mapa/CTO';
import { useCapilar } from '@/hooks/useCapilar';
import { usePorta } from '@/hooks/usePorta';
import { SpliterType } from '@/types/fibra';
import { CaixaAPI } from '@/types/caixa';
import { ModalStatusPorta } from '@/components/mapa/ModalStatusPorta';

/**
 * Página de exemplo para demonstrar o componente CTO
 */
export default function ExemploCTOPage() {
  const [capacidade, setCapacidade] = useState<8 | 16>(8);
  const [portasAtivas, setPortasAtivas] = useState<number[]>([]);
  const [splitters, setSplitters] = useState<SpliterType[]>([]);
  const [cabosAtivos, setCabosAtivos] = useState<number[]>([1]);
  const [cto, setCto] = useState<CaixaAPI>()
  const [portaSelecionada, setPortaSelecionada] = useState<number | null>(null)
  const [mostrarModalStatus, setMostrarModalStatus] = useState(false)


  const { criarSpliter } = useSpliter()
  const { obterCapilarPorCaixa } = useCapilar()

  const path = usePathname();
  const id = path.split('/')[4];

  const { obterCaixaPorId } = useCaixa()
  const { atualizar, isLoading: loadingPortas } = usePorta()



  const loadCaixa = async () => {
    try {
      const ctoBusca = await obterCaixaPorId(id)
      if (ctoBusca?.data) {
        setCto(ctoBusca.data)
        console.log('CTO carregado:', ctoBusca.data)
      }
    } catch (error) {
      console.error('Erro ao carregar CTO:', error)
    }
  }


  useEffect(() => {
    loadCaixa()
    const capilares = obterCapilarPorCaixa(id)
    console.log(capilares)
  }, [])

  // Atualiza as portas ativas quando o CTO é carregado
  useEffect(() => {
    if (cto?.portas) {
      const ctFilter = cto.portas.filter((item) => item.status === 'Em uso').map((item) => item.numero) || []
      setPortasAtivas(ctFilter)

      // Atualiza a capacidade baseada no CTO carregado
      if (cto.capacidade) {
        setCapacidade(cto.capacidade as 8 | 16)
      }

      if (cto.spliters) {
        setSplitters(cto?.spliters)

      }
      console.log(splitters)
    }
  }, [cto])
  console.log(portasAtivas)





  if (loadingPortas) {
    return <div>Carregando...</div>
  }

  // Gera as portas com base na capacidade e portas ativas
  const gerarPortas = () => {
    return Array.from({ length: capacidade }, (_, i) => ({
      id: i + 1,
      ativa: portasAtivas.includes(i + 1),
      cliente: portasAtivas.includes(i + 1) ? {
        id: i + 1,
        nome: `Cliente ${i + 1}`,
        endereco: `Rua Exemplo, ${i + 100}`,
        casa: `${i + 1}`,
        apto: '',
        telefone: `(11) 9${i + 1000}-${i + 2000}`,
        plano: `Fibra ${50 * (i + 1)}MB`
      } : undefined
    }));
  };

  // Gera os cabos AS com base nos cabos ativos
  const gerarCabosAS = () => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      nome: `Cabo AS ${i + 1}`,
      ativo: cabosAtivos.includes(i + 1)
    }));
  };

  // Adiciona um splitter
  const adicionarSplitter = (tipo: '1/8' | '1/16' | '1/2') => {
    if (splitters.length < 2) {
      criarSpliter({
        atendimento: true,
        tipo,
        caixaId: cto?.id || '',
        nome: "Spliter" + cto?.nome,
      })

    }
  };

  // Remove um splitter
  const removerSplitter = () => {
    if (splitters.length > 0) {
      setSplitters(splitters.slice(0, -1));
    }
  };

  // Abre modal para selecionar status da porta
  const alternarPorta = (portaId: number) => {
    setPortaSelecionada(portaId)
    setMostrarModalStatus(true)
  };

  // Atualiza o status da porta selecionada
  const atualizarStatusPorta = async (novoStatus: string, clienteId?: string) => {
    if (!portaSelecionada) return

    const portaCto = cto?.portas?.find(({ numero }) => numero === portaSelecionada)
    if (portaCto?.id) {
      try {
        const updateData: any = {
          status: novoStatus
        }

        // Se um cliente foi selecionado, associa à porta
        if (clienteId) {
          updateData.clienteId = clienteId
        }

        await atualizar(portaCto.id, updateData)

        // Atualiza o estado local imediatamente
        if (novoStatus === 'Em uso') {
          setPortasAtivas(prev => {
            if (!prev.includes(portaSelecionada)) {
              return [...prev, portaSelecionada]
            }
            return prev
          })
        } else {
          setPortasAtivas(prev => prev.filter(id => id !== portaSelecionada))
        }

        // Recarrega os dados do CTO para sincronizar
        await loadCaixa()

        // Fecha o modal
        setMostrarModalStatus(false)
        setPortaSelecionada(null)
      } catch (error) {
        console.error('Erro ao atualizar porta:', error)
      }
    }
  };

  // Fecha o modal sem alterar
  const fecharModal = () => {
    setMostrarModalStatus(false)
    setPortaSelecionada(null)
  };

  // Alterna o estado de um cabo
  const alternarCabo = (caboId: number) => {
    if (cabosAtivos.includes(caboId)) {
      setCabosAtivos(cabosAtivos.filter(id => id !== caboId));
    } else {
      setCabosAtivos([...cabosAtivos, caboId]);
    }
  };
  // const portasLivres = cto?.portas?.filter((item) => item.status === 'Disponivel').map((item) => item.numero) || []

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">{cto?.nome || 'Exemplo de CTO'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ConfiguracoesCTO
            portas={cto?.portas}
            capacidade={cto?.capacidade as 8 | 16 || capacidade}
            setCapacidade={setCapacidade}
            portasAtivas={portasAtivas}
            alternarPorta={alternarPorta}
            splitters={splitters}
            adicionarSplitter={adicionarSplitter}
            removerSplitter={removerSplitter}
            cabosAtivos={cabosAtivos}
            alternarCabo={alternarCabo}
          />
        </div>

        <div>
          <CTO
            id={cto?.id || "CTO-EXEMPLO-01"}
            nome={cto?.nome || "CTO Exemplo"}
            modelo={cto?.modelo || "Modelo Demonstração"}
            capacidade={cto?.capacidade as 8 | 16 || capacidade}
            portas={gerarPortas()}
            splitters={splitters}
            cabosAS={gerarCabosAS()}
            observacoes={cto?.observacoes || "Sem observações"}
          />
        </div>
      </div>

      {/* Modal para selecionar status da porta */}
      <ModalStatusPorta
        mostrarModal={mostrarModalStatus}
        portaSelecionada={portaSelecionada}
        cto={cto}
        onAtualizarStatus={atualizarStatusPorta}
        onFecharModal={fecharModal}
      />
    </div>
  );
}
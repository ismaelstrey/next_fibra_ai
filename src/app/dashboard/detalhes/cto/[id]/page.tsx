'use client';

import React, { useEffect, useState } from 'react';
import { ConfiguracoesCTO } from '@/components/mapa/ConfiguracoesCTO';
import { usePathname } from 'next/navigation';
import { useSpliter } from '@/hooks/useSpliter';
import useCaixa from '@/hooks/useCaixa';
import { CaixaAPI } from '@/hooks/useCaixa';
import { CTO } from '@/components/mapa/CTO';
import { useCapilar } from '@/hooks/useCapilar';
import { usePorta } from '@/hooks/usePorta';

/**
 * Página de exemplo para demonstrar o componente CTO
 */
export default function ExemploCTOPage() {
  const [capacidade, setCapacidade] = useState<8 | 16>(8);
  const [portasAtivas, setPortasAtivas] = useState<number[]>([1, 3, 5]);
  const [splitters, setSplitters] = useState<Array<{ tipo: '1/8' | '1/16' | '1/2'; posicao: number }>>([]);
  const [cabosAtivos, setCabosAtivos] = useState<number[]>([1]);
  const [cto, setCto] = useState<CaixaAPI>()


  const { criarSpliter } = useSpliter()

  const { buscarCapilarPorRota } = useCapilar()

  const path = usePathname();
  const id = path.split('/')[4];
  console.log(path, id)

  const { obterCaixaPorId } = useCaixa()
  const { atualizar } = usePorta()

  useEffect(() => {
    obterCaixaPorId(id).then((ctoBusca) => {
      ctoBusca && setCto(ctoBusca.data)
      buscarCapilarPorRota(ctoBusca?.data?.id || '').then((capilar) => {
        console.log(capilar)
      })

    })
  }, [id])

  console.log(cto?.portas)





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
        capilarEntradaId: "",
        capilarSaidaId: ""
      })
      setSplitters([...splitters, { tipo, posicao: splitters.length + 1 }]);
    }
  };

  // Remove um splitter
  const removerSplitter = () => {
    if (splitters.length > 0) {
      setSplitters(splitters.slice(0, -1));
    }
  };

  // Alterna o estado de uma porta
  const alternarPorta = (portaId: number) => {
    console.log(portaId)
    const portaCto = cto?.portas?.filter(({ numero }) => (numero === portaId))[0]

    console.log(portaCto)


    if (portasAtivas.includes(portaId)) {
      setPortasAtivas(portasAtivas.filter(id => id !== portaId));
    } else {
      setPortasAtivas([...portasAtivas, portaId]);
    }
  };

  // Alterna o estado de um cabo
  const alternarCabo = (caboId: number) => {
    if (cabosAtivos.includes(caboId)) {
      setCabosAtivos(cabosAtivos.filter(id => id !== caboId));
    } else {
      setCabosAtivos([...cabosAtivos, caboId]);
    }
  };
  const portasLivres = cto?.portas?.filter((item) => item.status === 'Livre').map((item) => item.numero) || []
  const portasOcupadas = cto?.portas?.filter((item) => item.status === 'Ocupado').map((item) => item.numero) || []

  console.log(portasLivres, portasOcupadas)


  console.log(cto?.portas?.filter((item) => item.status === 'Livre'))
  console.log(portasAtivas)
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">{cto?.nome || 'Exemplo de CTO'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ConfiguracoesCTO
            capacidade={cto?.capacidade as 8 | 16 || capacidade}
            setCapacidade={setCapacidade}
            portasAtivas={portasOcupadas}
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
            capacidade={capacidade}
            portas={gerarPortas()}
            splitters={splitters}
            cabosAS={gerarCabosAS()}
            observacoes={cto?.observacoes || "Sem observações"}
          />
        </div>
      </div>
    </div>
  );
}
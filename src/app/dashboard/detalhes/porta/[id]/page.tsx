'use client'
import { ModalStatusPorta } from "@/components/mapa/ModalStatusPorta";
import { usePorta } from "@/hooks/usePorta";
import { CaixaAPI } from "@/types/caixa";
import { PortaAPI } from "@/types/porta";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Porta() {
  const [cto, setCto] = useState<CaixaAPI>()
  const [porta, setPorta] = useState<PortaAPI>()
  const [portaSelecionada, setPortaSelecionada] = useState<number | null>(null)
  const [mostrarModalStatus, setMostrarModalStatus] = useState(true)
  const { atualizar, buscarPorId, isLoading: loadingPortas } = usePorta()
  const path = usePathname();
  const id = path.split('/')[4];

  useEffect(() => {
    buscarPorId(id).then((data) => {
      data && setPorta(data)
    })
  }, [id])

  porta && console.log(porta)

  // Fecha o modal sem alterar
  const fecharModal = () => {
    setMostrarModalStatus(false)
    setPortaSelecionada(null)
  };

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


        // Fecha o modal
        setMostrarModalStatus(false)
        setPortaSelecionada(null)
      } catch (error) {
        console.error('Erro ao atualizar porta:', error)
      }
    }
  };

  return (
    <div>
      ola
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
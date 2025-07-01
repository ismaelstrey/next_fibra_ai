'use client'
import { PortaCto } from "@/components/portas/Porta";
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



  const atualizarStatusPorta = async (novoStatus: string, clienteId?: string) => {

    console.log(portaSelecionada)
    if (!portaSelecionada) return


    if (porta?.id) {
      try {
        const updateData: any = {
          status: novoStatus
        }

        // Se um cliente foi selecionado, associa à porta
        if (clienteId) {
          updateData.clienteId = clienteId
        }
        console.log({ novoStatus, clienteId, updateData })

        // await atualizar(porta.id, updateData)


        // Fecha o modal

        setPortaSelecionada(null)
      } catch (error) {
        console.error('Erro ao atualizar porta:', error)
      }
    }
  };

  return (
    <div>
      ola
      <PortaCto
        mostrarModal={mostrarModalStatus}
        portaSelecionada={portaSelecionada}
        porta={porta}
        onAtualizarStatus={atualizarStatusPorta}
      />
    </div>
  );
}
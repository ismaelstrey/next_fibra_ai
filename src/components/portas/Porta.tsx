import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClienteAPI } from '@/types/cliente';
import { useClient } from '@/hooks/useClient';
import { PortaAPI } from '@/types/porta';

interface ModalStatusPortaProps {
  mostrarModal: boolean;
  portaSelecionada: number | null;
  porta?: PortaAPI
  onAtualizarStatus: (status: string, clienteId?: string) => void;

}

export const PortaCto: React.FC<ModalStatusPortaProps> = ({

  portaSelecionada,
  onAtualizarStatus,
  porta
}) => {
  const router = useRouter();

  const [etapa, setEtapa] = useState<'status' | 'cliente'>('status');
  const [statusSelecionado, setStatusSelecionado] = useState<string>('');
  const [clientesDisponiveis, setClientesDisponiveis] = useState<ClienteAPI[]>([]);
  const [carregandoClientes, setCarregandoClientes] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const { listarClientes } = useClient();


  const statusOptions = ['Disponível', 'Em uso', 'Reservada', 'Defeito'];


  const getStatusDescription = (status: string) => {
    const descriptions = {
      'Disponível': 'Porta livre para uso',
      'Em uso': 'Porta ocupada por cliente',
      'Reservada': 'Porta reservada para cliente',
      'Defeito': 'Porta com problema técnico'
    };
    return descriptions[status as keyof typeof descriptions] || '';
  };

  const carregarClientesDisponiveis = async () => {
    setCarregandoClientes(true);
    try {
      // Busca clientes que não têm portaId associado
      const response = await listarClientes({ limite: 100 });
      const clientesSemPorta = response.data.clientes.filter(cliente => !cliente.portaId);
      setClientesDisponiveis(clientesSemPorta);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setCarregandoClientes(false);
    }
  };

  const handleStatusClick = async (status: string) => {
    if (status === 'Em uso' || status === 'Reservada') {
      setStatusSelecionado(status);
      setEtapa('cliente');
      await carregarClientesDisponiveis();
    } else {
      onAtualizarStatus(status);
    }
  };

  const handleClienteSelect = (clienteId: string) => {
    setClienteSelecionado(clienteId);
  };

  const handleConfirmarAssociacao = async () => {
    const atualizarStatus = await onAtualizarStatus(statusSelecionado, clienteSelecionado);

    console.log(atualizarStatus)

  };

  const handleNovoCliente = () => {
    router.push(`/dashboard/clientes/novo?portaId=${porta?.id}/status=${statusSelecionado}`);

  };




  const handleVoltarParaStatus = () => {
    setEtapa('status');
    setStatusSelecionado('');
    setClienteSelecionado('');
  };

  console.log(porta)

  return (
    <div className="fixed inset-0 bg-background text-foreground bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background dark:bg-foreground rounded-lg p-6 w-96 max-w-md mx-4">
        {etapa === 'status' ? (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Alterar Status da Porta {portaSelecionada}
            </h3>
            <span>{porta?.id}</span>
            <div className="space-y-2">
              {statusOptions.map((status) => {
                const isAtual = porta?.status === status;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusClick(status)}
                    className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${isAtual
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{status}</span>
                      {isAtual && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          (Atual)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getStatusDescription(status)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={router.back}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <button
                onClick={handleVoltarParaStatus}
                className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold">
                Associar Cliente à Porta {portaSelecionada}
              </h3>
              <span>{porta?.id}</span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className="font-medium">{statusSelecionado}</span>
              </p>
            </div>

            {carregandoClientes ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Carregando clientes...</div>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                  {clientesDisponiveis.length > 0 ? (
                    clientesDisponiveis.map((cliente) => (
                      <button
                        key={cliente.id}
                        onClick={() => handleClienteSelect(cliente.id)}
                        className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${clienteSelecionado === cliente.id
                          ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                          }`}
                      >
                        <div className="font-medium">{cliente.nome}</div>
                        {cliente.email && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {cliente.email}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum cliente disponível
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={handleNovoCliente}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mb-3"
                  >
                    + Cadastrar Novo Cliente
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleVoltarParaStatus}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmarAssociacao}
                    disabled={!clienteSelecionado}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
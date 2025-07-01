'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClient } from '@/hooks/useClient';
import { useApiService } from '@/hooks/useApiService';
import { AtualizarClienteData, ClienteAPI, CriarClienteData } from '@/types/cliente';

interface ClienteFormPageProps {
  params: Promise<{
    action: 'novo' | 'edit';
  }>;
}

export default function ClienteFormPage({ params }: ClienteFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { criarCliente, atualizarCliente } = useClient();
  const { clientes } = useApiService();
  
  const resolvedParams = use(params);
  const clienteId = searchParams.get('id');
  const portaId = searchParams.get('portaId')?.split('/')[0];
  const status = searchParams.get('status');
  const isEdit = resolvedParams.action === 'edit';
  
  
  const [cliente, setCliente] = useState<ClienteAPI | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CriarClienteData>>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    apartamento: '',
    casa: '',
    numero: 0,
    potencia: 0,
    wifi: '',
    senhaWifi: '',
    neutraId: '',
    status: status || '',
    portaId: portaId || ''
  });

  // Carrega dados do cliente se estiver editando
  useEffect(() => {
    const carregarCliente = async () => {
      if (isEdit && clienteId) {
        setCarregando(true);
        try {
          const response = await clientes.obterPorId(clienteId);
          const clienteData = response.data as Partial<CriarClienteData>;
          console.log(response.data)
          console.log('Cliente carregado:', clienteData);
         clienteData && setCliente(clienteData as ClienteAPI);
          setFormData({
            nome: clienteData?.nome || '',
            email: clienteData?.email || '',
            telefone: clienteData?.telefone || '',
            endereco: clienteData?.endereco || '',
            apartamento: clienteData?.apartamento || '',
            casa: clienteData?.casa || '',
            numero: clienteData?.numero || 0,
            potencia: clienteData?.potencia || 0,
            wifi: clienteData?.wifi || '',
            senhaWifi: clienteData?.senhaWifi || '',
            neutraId: clienteData?.neutraId || '',
            portaId: clienteData?.portaId || ''
            
          });
        } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          router.push('/dashboard/clientes');
        }
        setCarregando(false);
      }
    };

    carregarCliente();
  }, [isEdit, clienteId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    try {
      if (isEdit && clienteId) {
        await atualizarCliente(clienteId, formData as AtualizarClienteData);
      } else {
       const criar = await criarCliente(formData as CriarClienteData);
       if(criar.status === 201) {
        router.push('/dashboard/clientes');
       }else{
        setSalvando(false);
       }

      }
      router.push('/dashboard/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
    
    setSalvando(false);
  };



  const handleCancel = () => {
    router.push('/dashboard/clientes');
  };

  if (carregando) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
 <div className='fixed top-0 left-0 w-full h-full bg-black/50'>
       <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? `Editar Cliente: ${cliente?.nome || 'Carregando...'}` : 'Novo Cliente'}
            </h1>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartamento
                </label>
                <input
                  type="text"
                  name="apartamento"
                  value={formData.apartamento}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casa
                </label>
                <input
                  type="text"
                  name="casa"
                  value={formData.casa}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número *
                </label>
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potência
                </label>
                <input
                  type="number"
                  name="potencia"
                  value={formData.potencia}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wi-Fi
                </label>
                <input
                  type="text"
                  name="wifi"
                  value={formData.wifi}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Wi-Fi
                </label>
                <input
                  type="text"
                  name="senhaWifi"
                  value={formData.senhaWifi}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Neutra
                </label>
                <input
                  type="text"
                  name="neutraId"
                  value={formData.neutraId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Porta
                </label>
                <input
                  type="text"
                  name="portaId"
                  value={formData.portaId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {salvando ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Cliente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
 </div>
  );
}
'use client'
import React, { useEffect, useState } from "react";
import { useApiService } from "@/hooks/useApiService";
import { useClient, ClienteAPI, CriarClienteData, AtualizarClienteData } from "@/hooks/useClient";

const ClientesPage = () => {
  const { clientes } = useApiService();
  const { criarCliente, atualizarCliente, excluirCliente } = useClient();
  const [dados, setDados] = useState<ClienteAPI[]>([]);
  const [paginacao, setPaginacao] = useState<any>({ pagina: 1, limite: 10, total: 0, totalPaginas: 1 });
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  
  // Estados para modais
  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteAPI | null>(null);
  
  // Estados para formulário
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
    portaId: ''
  });

  const carregarClientes = async (pagina = 1, buscaTexto = "") => {
    setCarregando(true);
    try {
      const resp = await clientes.listar({ pagina, limite: paginacao.limite, busca: buscaTexto });
      setDados(resp.data.clientes);
      setPaginacao(resp.data.paginacao);
    } catch (e) {
      console.error('Erro ao carregar clientes:', e);
    }
    setCarregando(false);
  };

  const resetForm = () => {
    setFormData({
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
      portaId: ''
    });
  };

  const abrirModalCriar = () => {
    resetForm();
    setMostrarModalCriar(true);
  };

  const abrirModalEditar = (cliente: ClienteAPI) => {
    setClienteSelecionado(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || '',
      endereco: cliente.endereco || '',
      apartamento: cliente.apartamento || '',
      casa: cliente.casa || '',
      numero: cliente.numero,
      potencia: cliente.potencia,
      wifi: cliente.wifi,
      senhaWifi: cliente.senhaWifi,
      neutraId: cliente.neutraId,
      portaId: cliente.portaId
    });
    setMostrarModalEditar(true);
  };

  const fecharModais = () => {
    setMostrarModalCriar(false);
    setMostrarModalEditar(false);
    setClienteSelecionado(null);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmitCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criarCliente(formData as CriarClienteData);
      fecharModais();
      carregarClientes(paginacao.pagina, busca);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado) return;
    
    try {
      await atualizarCliente(clienteSelecionado.id, formData as AtualizarClienteData);
      fecharModais();
      carregarClientes(paginacao.pagina, busca);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  };

  const handleExcluir = async (cliente: ClienteAPI) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      try {
        await excluirCliente(cliente.id);
        carregarClientes(paginacao.pagina, busca);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line
  }, []);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    carregarClientes(1, busca);
  };

  const handlePagina = (novaPagina: number) => {
    carregarClientes(novaPagina, busca);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={abrirModalCriar}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Novo Cliente
        </button>
      </div>
      
      <form onSubmit={handleBusca} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition-colors">Buscar</button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Nome</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Telefone</th>
              <th className="border px-2 py-1">Endereço</th>
              <th className="border px-2 py-1">Apartamento</th>
              <th className="border px-2 py-1">Casa</th>
              <th className="border px-2 py-1">Número</th>
              <th className="border px-2 py-1">Potência</th>
              <th className="border px-2 py-1">Wi-Fi</th>
              <th className="border px-2 py-1">Neutra</th>
              <th className="border px-2 py-1">Porta</th>
              <th className="border px-2 py-1">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={12} className="text-center py-4">Carregando...</td></tr>
            ) : dados.length === 0 ? (
              <tr><td colSpan={12} className="text-center py-4">Nenhum cliente encontrado.</td></tr>
            ) : (
              dados.map(cliente => (
                <tr key={cliente.id}>
                  <td className="border px-2 py-1">{cliente.nome}</td>
                  <td className="border px-2 py-1">{cliente.email}</td>
                  <td className="border px-2 py-1">{cliente.telefone}</td>
                  <td className="border px-2 py-1">{cliente.endereco}</td>
                  <td className="border px-2 py-1">{cliente.apartamento}</td>
                  <td className="border px-2 py-1">{cliente.casa}</td>
                  <td className="border px-2 py-1">{cliente.numero}</td>
                  <td className="border px-2 py-1">{cliente.potencia}</td>
                  <td className="border px-2 py-1">{cliente.wifi ? "Sim" : "Não"}</td>
                  <td className="border px-2 py-1">{cliente.neutra?.nome || "-"}</td>
                  <td className="border px-2 py-1">{cliente.porta?.numero || "-"}</td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(cliente)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>Página {paginacao.pagina} de {paginacao.totalPaginas}</span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePagina(paginacao.pagina - 1)}
            disabled={paginacao.pagina === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Anterior</button>
          <button
            onClick={() => handlePagina(paginacao.pagina + 1)}
            disabled={paginacao.pagina === paginacao.totalPaginas}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >Próxima</button>
        </div>
      </div>

      {/* Modal para Criar Cliente */}
      {mostrarModalCriar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Novo Cliente</h2>
              <button
                onClick={fecharModais}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCriar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Apartamento</label>
                  <input
                    type="text"
                    name="apartamento"
                    value={formData.apartamento}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Casa</label>
                  <input
                    type="text"
                    name="casa"
                    value={formData.casa}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Número *</label>
                  <input
                    type="number"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Potência *</label>
                  <input
                    type="number"
                    name="potencia"
                    value={formData.potencia}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Wi-Fi </label>
                  <input
                    type="text"
                    name="wifi"
                    value={formData.wifi}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Senha Wi-Fi </label>
                  <input
                    type="text"
                    name="senhaWifi"
                    value={formData.senhaWifi}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ID Neutra </label>
                  <input
                    type="text"
                    name="neutraId"
                    value={formData?.neutraId || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ID Porta </label>
                  <input
                    type="text"
                    name="portaId"
                    value={formData.portaId}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Cliente */}
      {mostrarModalEditar && clienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Cliente: {clienteSelecionado.nome}</h2>
              <button
                onClick={fecharModais}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Apartamento</label>
                  <input
                    type="text"
                    name="apartamento"
                    value={formData.apartamento}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Casa</label>
                  <input
                    type="text"
                    name="casa"
                    value={formData.casa}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Número *</label>
                  <input
                    type="number"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Potência </label>
                  <input
                    type="number"
                    name="potencia"
                    value={formData.potencia}
                    onChange={handleInputChange}                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Wi-Fi </label>
                  <input
                    type="text"
                    name="wifi"
                    value={formData.wifi}
                    onChange={handleInputChange}
                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Senha Wi-Fi *</label>
                  <input
                    type="text"
                    name="senhaWifi"
                    value={formData.senhaWifi}
                    onChange={handleInputChange}
                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ID Neutra </label>
                  <input
                    type="text"
                    name="neutraId"
                    value={formData.neutraId}
                    onChange={handleInputChange}
                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ID Porta </label>
                  <input
                    type="text"
                    name="portaId"
                    value={formData.portaId}
                    onChange={handleInputChange}
                    
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={fecharModais}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesPage;
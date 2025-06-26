import React, { useEffect, useState } from "react";
import { useApiService } from "@/hooks/useApiService";

const ClientesPage = () => {
  const { clientes } = useApiService();
  const [dados, setDados] = useState<any[]>([]);
  const [paginacao, setPaginacao] = useState<any>({ pagina: 1, limite: 10, total: 0, totalPaginas: 1 });
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarClientes = async (pagina = 1, buscaTexto = "") => {
    setCarregando(true);
    try {
      const resp = await clientes.listar({ pagina, limite: paginacao.limite, busca: buscaTexto });
      setDados(resp.data.clientes);
      setPaginacao(resp.data.paginacao);
    } catch (e) {
      // Tratar erro
    }
    setCarregando(false);
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
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <form onSubmit={handleBusca} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Buscar</button>
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
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={11} className="text-center py-4">Carregando...</td></tr>
            ) : dados.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-4">Nenhum cliente encontrado.</td></tr>
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
    </div>
  );
};

export default ClientesPage;
import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { RotaAPI, ListarRotasResponse, CriarRotaData, AtualizarRotaData } from "@/types/rota";

export function useRota() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista rotas com filtros e paginação
  const listar = useCallback(async (params: {
    pagina?: number;
    limite?: number;
    busca?: string;
    cidadeId?: string;
    tipoCabo?: string;
    tipoPassagem?: string;
  }): Promise<ListarRotasResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.pagina) searchParams.append("pagina", params.pagina.toString());
      if (params.limite) searchParams.append("limite", params.limite.toString());
      if (params.busca) searchParams.append("busca", params.busca);
      if (params.cidadeId) searchParams.append("cidadeId", params.cidadeId);
      if (params.tipoCabo) searchParams.append("tipoCabo", params.tipoCabo);
      if (params.tipoPassagem) searchParams.append("tipoPassagem", params.tipoPassagem);
      const url = `/api/rotas?${searchParams.toString()}`;
      const resp = await axios.get(url);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || "Erro ao listar rotas");
      toast.error(err.response?.data?.erro || "Erro ao listar rotas");
      return null;
    }
  }, []);

  // Cria nova rota
  const criar = useCallback(async (data: CriarRotaData): Promise<RotaAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.post("/api/rotas", data);
      setIsLoading(false);
      toast.success("Rota criada com sucesso!");
      return resp.data.rota;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || "Erro ao criar rota");
      toast.error(err.response?.data?.erro || "Erro ao criar rota");
      return null;
    }
  }, []);

  // Atualiza rota existente
  const atualizar = useCallback(async (id: string, data: AtualizarRotaData): Promise<RotaAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.patch(`/api/rotas/${id}`, data);
      setIsLoading(false);
      toast.success("Rota atualizada com sucesso!");
      return resp.data.rota;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || "Erro ao atualizar rota");
      toast.error(err.response?.data?.erro || "Erro ao atualizar rota");
      return null;
    }
  }, []);

  // Exclui rota existente
  const excluir = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/rotas/${id}`);
      setIsLoading(false);
      toast.success("Rota excluída com sucesso!");
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || "Erro ao excluir rota");
      toast.error(err.response?.data?.erro || "Erro ao excluir rota");
      return false;
    }
  }, []);

  return {
    listar,
    criar,
    atualizar,
    excluir,
    isLoading,
    error,
  };
}
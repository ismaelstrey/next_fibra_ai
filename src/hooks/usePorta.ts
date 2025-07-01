import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { PortaAPI, Paginacao, ListarPortasResponse, CriarPortaData, AtualizarPortaData } from '@/types/porta';

export function usePorta() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar portas com filtros e paginação
  const listar = useCallback(async (params: {
    pagina?: number;
    limite?: number;
    numero?: number;
    status?: string;
    caixaId?: string;
    splitterId?: string;
  }): Promise<ListarPortasResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.pagina) searchParams.append('pagina', params.pagina.toString());
      if (params.limite) searchParams.append('limite', params.limite.toString());
      if (params.numero) searchParams.append('numero', params.numero.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.caixaId) searchParams.append('caixaId', params.caixaId);
      if (params.splitterId) searchParams.append('splitterId', params.splitterId);
      const url = `/api/portas?${searchParams.toString()}`;
      const resp = await axios.get(url);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao listar portas');
      toast.error(err.response?.data?.erro || 'Erro ao listar portas');
      return null;
    }
  }, []);

  // Criar nova porta
  const criar = useCallback(async (data: CriarPortaData): Promise<PortaAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.post('/api/portas', data);
      setIsLoading(false);
      toast.success('Porta criada com sucesso!');
      return resp.data.porta;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao criar porta');
      toast.error(err.response?.data?.erro || 'Erro ao criar porta');
      return null;
    }
  }, []);

  // Atualizar porta existente
  const atualizar = useCallback(async (id: string, data: AtualizarPortaData): Promise<PortaAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.patch(`/api/portas/${id}`, data);
      setIsLoading(false);
      toast.success('Porta atualizada com sucesso!');
      return resp.data.porta;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao atualizar porta');
      toast.error(err.response?.data?.erro || 'Erro ao atualizar porta');
      return null;
    }
  }, []);

  // Excluir porta existente
  const excluir = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/portas/${id}`);
      setIsLoading(false);
      toast.success('Porta excluída com sucesso!');
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao excluir porta');
      toast.error(err.response?.data?.erro || 'Erro ao excluir porta');
      return false;
    }
  }, []);

  // Buscar porta por ID
  const buscarPorId = useCallback(async (id: string): Promise<PortaAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/portas/${id}`);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao buscar porta');
      toast.error(err.response?.data?.erro || 'Erro ao buscar porta');
      return null;
    }
  }, []);

  return {
    listar,
    criar,
    atualizar,
    excluir,
    buscarPorId,
    isLoading,
    error,
  };
}
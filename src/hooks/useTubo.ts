import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

// Tipos para Tubo
export interface TuboAPI {
  id: string;
  numero: number;
  quantidadeCapilares: number;
  tipo: string;
  rotaId?: string;
  capilares?: any[];
  rota?: any;
}

export interface ListarTuboParams {
  rotaId?: string;
  tipo?: string;
  numero?: number;
}

export function useTubo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar tubos com filtros
  const listar = useCallback(async (params?: ListarTuboParams): Promise<TuboAPI[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params?.rotaId) searchParams.append('rotaId', params.rotaId);
      if (params?.tipo) searchParams.append('tipo', params.tipo);
      if (params?.numero) searchParams.append('numero', params.numero.toString());
      const url = `/api/tubos${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const resp = await axios.get(url);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao listar tubos');
      toast.error(err.response?.data?.erro || 'Erro ao listar tubos');
      return null;
    }
  }, []);

  // Criar novo tubo
  const criar = useCallback(async (data: Omit<TuboAPI, 'id' | 'capilares' | 'rota'>): Promise<TuboAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.post('/api/tubos', data);
      setIsLoading(false);
      toast.success('Tubo criado com sucesso!');
      return resp.data.tubo;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao criar tubo');
      toast.error(err.response?.data?.erro || 'Erro ao criar tubo');
      return null;
    }
  }, []);

  // Atualizar tubo existente
  const atualizar = useCallback(async (id: string, data: Partial<Omit<TuboAPI, 'id' | 'capilares' | 'rota'>>): Promise<TuboAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.patch(`/api/tubos/${id}`, data);
      setIsLoading(false);
      toast.success('Tubo atualizado com sucesso!');
      return resp.data.tubo;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao atualizar tubo');
      toast.error(err.response?.data?.erro || 'Erro ao atualizar tubo');
      return null;
    }
  }, []);

  // Excluir tubo existente
  const excluir = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/tubos/${id}`);
      setIsLoading(false);
      toast.success('Tubo excluído com sucesso!');
      return true;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao excluir tubo');
      toast.error(err.response?.data?.erro || 'Erro ao excluir tubo');
      return false;
    }
  }, []);

  // Buscar tubo por ID
  const buscarPorId = useCallback(async (id: string): Promise<TuboAPI | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/tubos/${id}`);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao buscar tubo');
      toast.error(err.response?.data?.erro || 'Erro ao buscar tubo');
      return null;
    }
  }, []);

  // Buscar tubos por rotaId
  const buscarPorRotaId = useCallback(async (rotaId: string): Promise<TuboAPI[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/tubos?rotaId=${rotaId}`);
      setIsLoading(false);
      return resp.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.erro || 'Erro ao buscar tubos por rotaId');
      toast.error(err.response?.data?.erro || 'Erro ao buscar tubos por rotaId');
      return null;
    }
  }, []);

  return {
    listar,
    criar,
    atualizar,
    excluir,
    buscarPorId,
    buscarPorRotaId,
    isLoading,
    error,
  };
}
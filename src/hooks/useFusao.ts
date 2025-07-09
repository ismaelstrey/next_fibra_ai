'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Tipos para as operações de fusão
export interface FusaoAPI {
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente';
  status: 'Ativa' | 'Inativa' | 'Manutencao';
  qualidadeSinal?: number | null;
  perdaInsercao?: number | null;
  cor?: string | null;
  observacoes?: string | null;
  posicaoFusao?: number | null;
  caixaId: string;
  bandejaId?: string | null;
  criadoPorId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  // Relacionamentos
  capilarOrigem?: {
    id: string;
    numero: number;
    tipo: string;
    status: string;
    tubo?: {
      numero: number;
      tipo: string;
    };
  };
  capilarDestino?: {
    id: string;
    numero: number;
    tipo: string;
    status: string;
    tubo?: {
      numero: number;
      tipo: string;
    };
  };
  caixa?: {
    nome: string;
    tipo: string;
    cidade?: {
      nome: string;
      estado: string;
    };
  };
  bandeja?: {
    numero: number;
    capacidade: number;
  };
  criadoPor?: {
    id: string;
    nome: string;
    cargo: string;
  };
}

export interface CriarFusaoData {
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente';
  status: 'Ativa' | 'Inativa' | 'Manutencao';
  qualidadeSinal?: number | null;
  perdaInsercao?: number | null;
  cor?: string | null;
  observacoes?: string | null;
  caixaId: string;
  bandejaId?: string | null;
  posicaoFusao?: number | null;
}

export interface AtualizarFusaoData {
  capilarOrigemId?: string;
  capilarDestinoId?: string;
  tipoFusao?: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente';
  status?: 'Ativa' | 'Inativa' | 'Manutencao';
  qualidadeSinal?: number | null;
  perdaInsercao?: number | null;
  cor?: string | null;
  observacoes?: string | null;
  caixaId?: string;
  bandejaId?: string | null;
  posicaoFusao?: number | null;
}

export interface CriarFusoesEmLoteData {
  fusoes: CriarFusaoData[];
}

export interface ListarFusoesParams {
  pagina?: number;
  limite?: number;
  busca?: string;
  cidadeId?: string;
  caixaId?: string;
  bandejaId?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  isLoading: boolean;
  error: string | null;
}

export interface PaginacaoMetadata {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export const useFusao = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Criação da instância do Axios
  const api: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para tratamento de erros
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const message = 'Erro ao comunicar com o servidor';
      toast.error(message);
      return Promise.reject(error);
    }
  );

  // Função genérica para fazer requisições
  const request = useCallback(async <T>(method: string, url: string, data?: any, params?: any): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.request<T>({
        method,
        url,
        data,
        params,
      });

      return {
        data: response.data,
        status: response.status,
        isLoading: false,
        error: null,
      };
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = 'Erro ao comunicar com o servidor';
      setError(errorMessage);

      return {
        data: {} as T,
        status: axiosError.response?.status || 500,
        isLoading: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lista todas as fusões com paginação e filtros
   * @param params - Parâmetros de filtro e paginação
   * @returns Promise com lista de fusões e metadados de paginação
   */
  const listarFusoes = useCallback(async (params?: ListarFusoesParams) => {
    return request<{ fusoes: FusaoAPI[], paginacao: PaginacaoMetadata }>('GET', '/fusoes', undefined, params);
  }, [request]);

  /**
   * Obtém uma fusão específica por ID
   * @param id - ID da fusão
   * @returns Promise com dados da fusão
   */
  const obterFusaoPorId = useCallback(async (id: string) => {
    return request<FusaoAPI>('GET', `/fusoes/${id}`);
  }, [request]);

  /**
   * Cria uma nova fusão
   * @param fusao - Dados da fusão a ser criada
   * @returns Promise com dados da fusão criada
   */
  const criarFusao = useCallback(async (fusao: CriarFusaoData) => {
    return request<{ mensagem: string, fusao: FusaoAPI }>('POST', '/fusoes', fusao);
  }, [request]);

  /**
   * Cria múltiplas fusões em lote
   * @param dados - Dados das fusões a serem criadas em lote
   * @returns Promise com mensagem de confirmação
   */
  const criarFusoesEmLote = useCallback(async (dados: CriarFusoesEmLoteData) => {
    return request<{ mensagem: string }>('POST', '/fusoes', dados);
  }, [request]);

  /**
   * Atualiza uma fusão existente
   * @param id - ID da fusão a ser atualizada
   * @param fusao - Dados parciais da fusão para atualização
   * @returns Promise com dados da fusão atualizada
   */
  const atualizarFusao = useCallback(async (id: string, fusao: AtualizarFusaoData) => {
    return request<{ mensagem: string, fusao: FusaoAPI }>('PATCH', `/fusoes/${id}`, fusao);
  }, [request]);

  /**
   * Exclui uma fusão
   * @param id - ID da fusão a ser excluída
   * @returns Promise com mensagem de confirmação
   */
  const excluirFusao = useCallback(async (id: string) => {
    return request<{ mensagem: string }>('DELETE', `/fusoes/${id}`);
  }, [request]);

  /**
   * Lista fusões por caixa específica
   * @param caixaId - ID da caixa
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões da caixa
   */
  const listarFusoesPorCaixa = useCallback(async (caixaId: string, params?: Omit<ListarFusoesParams, 'caixaId'>) => {
    return listarFusoes({ ...params, caixaId });
  }, [listarFusoes]);

  /**
   * Lista fusões por bandeja específica
   * @param bandejaId - ID da bandeja
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões da bandeja
   */
  const listarFusoesPorBandeja = useCallback(async (bandejaId: string, params?: Omit<ListarFusoesParams, 'bandejaId'>) => {
    return listarFusoes({ ...params, bandejaId });
  }, [listarFusoes]);

  /**
   * Lista fusões por cidade específica
   * @param cidadeId - ID da cidade
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões da cidade
   */
  const listarFusoesPorCidade = useCallback(async (cidadeId: string, params?: Omit<ListarFusoesParams, 'cidadeId'>) => {
    return listarFusoes({ ...params, cidadeId });
  }, [listarFusoes]);

  /**
   * Busca fusões por tipo específico
   * @param tipoFusao - Tipo da fusão
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões do tipo especificado
   */
  const buscarFusoesPorTipo = useCallback(async (tipoFusao: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente', params?: ListarFusoesParams) => {
    const busca = tipoFusao.replace('_', ' ');
    return listarFusoes({ ...params, busca });
  }, [listarFusoes]);

  /**
   * Busca fusões por status específico
   * @param status - Status da fusão
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões com o status especificado
   */
  const buscarFusoesPorStatus = useCallback(async (status: 'Ativa' | 'Inativa' | 'Manutencao', params?: ListarFusoesParams) => {
    return listarFusoes({ ...params, busca: status });
  }, [listarFusoes]);

  /**
   * Busca fusões ativas
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões ativas
   */
  const buscarFusoesAtivas = useCallback(async (params?: ListarFusoesParams) => {
    return buscarFusoesPorStatus('Ativa', params);
  }, [buscarFusoesPorStatus]);

  /**
   * Busca fusões inativas
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões inativas
   */
  const buscarFusoesInativas = useCallback(async (params?: ListarFusoesParams) => {
    return buscarFusoesPorStatus('Inativa', params);
  }, [buscarFusoesPorStatus]);

  /**
   * Busca fusões em manutenção
   * @param params - Parâmetros adicionais de filtro
   * @returns Promise com lista de fusões em manutenção
   */
  const buscarFusoesEmManutencao = useCallback(async (params?: ListarFusoesParams) => {
    return buscarFusoesPorStatus('Manutencao', params);
  }, [buscarFusoesPorStatus]);

  /**
   * Verifica se uma fusão pode ser excluída
   * @param id - ID da fusão
   * @returns Promise com boolean indicando se pode ser excluída
   */
  const podeExcluirFusao = useCallback(async (id: string): Promise<boolean> => {
    const response = await obterFusaoPorId(id);
    if (response.data && response.data.status) {
      // Fusões ativas ou em manutenção podem precisar de verificações adicionais
      return response.data.status === 'Inativa';
    }
    return false;
  }, [obterFusaoPorId]);

  /**
   * Ativa uma fusão (altera status para Ativa)
   * @param id - ID da fusão
   * @returns Promise com dados da fusão atualizada
   */
  const ativarFusao = useCallback(async (id: string) => {
    return atualizarFusao(id, { status: 'Ativa' });
  }, [atualizarFusao]);

  /**
   * Desativa uma fusão (altera status para Inativa)
   * @param id - ID da fusão
   * @returns Promise com dados da fusão atualizada
   */
  const desativarFusao = useCallback(async (id: string) => {
    return atualizarFusao(id, { status: 'Inativa' });
  }, [atualizarFusao]);

  /**
   * Coloca uma fusão em manutenção
   * @param id - ID da fusão
   * @returns Promise com dados da fusão atualizada
   */
  const colocarFusaoEmManutencao = useCallback(async (id: string) => {
    return atualizarFusao(id, { status: 'Manutencao' });
  }, [atualizarFusao]);

  return {
    // Estados
    isLoading,
    error,

    // Operações básicas de CRUD
    listarFusoes,
    obterFusaoPorId,
    criarFusao,
    criarFusoesEmLote,
    atualizarFusao,
    excluirFusao,

    // Buscas específicas por contexto
    listarFusoesPorCaixa,
    listarFusoesPorBandeja,
    listarFusoesPorCidade,

    // Buscas por tipo e status
    buscarFusoesPorTipo,
    buscarFusoesPorStatus,
    buscarFusoesAtivas,
    buscarFusoesInativas,
    buscarFusoesEmManutencao,

    // Operações de status
    ativarFusao,
    desativarFusao,
    colocarFusaoEmManutencao,

    // Utilitários
    podeExcluirFusao,
  };
};

/**
 * Função utilitária para verificar se uma fusão pode ser excluída
 * @param fusao - Dados da fusão
 * @returns boolean indicando se pode ser excluída
 */
export const podeExcluirFusao = (fusao: FusaoAPI): boolean => {
  return fusao.status === 'Inativa';
};

/**
 * Função utilitária para obter a descrição do tipo de fusão
 * @param tipoFusao - Tipo da fusão
 * @returns string com descrição amigável
 */
export const obterDescricaoTipoFusao = (tipoFusao: string): string => {
  const tipos: Record<string, string> = {
    'capilar_capilar': 'Capilar para Capilar',
    'capilar_splitter': 'Capilar para Splitter',
    'splitter_cliente': 'Splitter para Cliente'
  };
  return tipos[tipoFusao] || tipoFusao;
};

/**
 * Função utilitária para obter a cor do status da fusão
 * @param status - Status da fusão
 * @returns string com classe CSS ou cor
 */
export const obterCorStatus = (status: string): string => {
  const cores: Record<string, string> = {
    'Ativa': 'text-green-600 bg-green-100',
    'Inativa': 'text-red-600 bg-red-100',
    'Manutencao': 'text-yellow-600 bg-yellow-100'
  };
  return cores[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Função utilitária para validar dados de fusão
 * @param fusao - Dados da fusão
 * @returns objeto com validação
 */
export const validarDadosFusao = (fusao: Partial<CriarFusaoData>) => {
  const erros: string[] = [];

  if (!fusao.capilarOrigemId) {
    erros.push('Capilar de origem é obrigatório');
  }

  if (!fusao.capilarDestinoId) {
    erros.push('Capilar de destino é obrigatório');
  }

  if (fusao.capilarOrigemId === fusao.capilarDestinoId) {
    erros.push('Capilar de origem e destino não podem ser iguais');
  }

  if (!fusao.tipoFusao) {
    erros.push('Tipo de fusão é obrigatório');
  }

  if (!fusao.status) {
    erros.push('Status é obrigatório');
  }

  if (!fusao.caixaId) {
    erros.push('Caixa é obrigatória');
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

export default useFusao;
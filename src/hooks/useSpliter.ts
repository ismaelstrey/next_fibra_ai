'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// Tipos para as respostas da API
export interface ApiResponse<T> {
    data: T;
    status: number;
    isLoading: boolean;
    error: string | null;
}

export interface PaginatedResponse<T> {
    items: T[];
    paginacao: {
        total: number;
        pagina: number;
        limite: number;
        totalPaginas: number;
    };
}

// Interface para os dados do Spliter
export interface SpliterAPI {
    id: string;
    nome: string;
    atendimento: boolean;
    tipo: string;
    caixaId: string;
    capilarSaidaId?: string | null;
    capilarEntradaId?: string | null;
    caixa?: {
        id: string;
        nome: string;
        tipo: 'CTO' | 'CEO';
        coordenadas?: {
            lat: number;
            lng: number;
        };
        cidade?: {
            id: string;
            nome: string;
            estado: string;
        };
        rota?: {
            id: string;
            nome: string;
            tipoCabo: string;
        };
    };
    capilarSaida?: {
        id: string;
        numero: number;
        tipo: string;
        comprimento?: number;
        status: string;
        potencia?: number;
        rota?: {
            id: string;
            nome: string;
            tipoCabo: string;
        };
    };
    capilarEntrada?: {
        id: string;
        numero: number;
        tipo: string;
        comprimento?: number;
        status: string;
        potencia?: number;
        rota?: {
            id: string;
            nome: string;
            tipoCabo: string;
        };
    };
}

// Interface para criação de spliter
export interface CriarSpliterData {
    nome: string;
    atendimento: boolean;
    tipo: string;
    caixaId: string;
    capilarSaidaId?: string | null;
    capilarEntradaId?: string | null;
}

// Interface para atualização de spliter
export interface AtualizarSpliterData {
    nome?: string;
    atendimento?: boolean;
    tipo?: string;
    caixaId?: string;
    capilarSaidaId?: string | null;
    capilarEntradaId?: string | null;
}

// Interface para parâmetros de listagem
export interface ListarSpliterParams {
    pagina?: number;
    limite?: number;
    busca?: string;
    tipo?: string;
    caixaId?: string;
    capilarSaidaId?: string;
    capilarEntradaId?: string;
    atendimento?: boolean;
}

/**
 * Hook personalizado para gerenciar operações de Spliters
 * Fornece funções para CRUD completo de spliters
 */
export const useSpliter = () => {
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
     * Lista todos os spliters com paginação e filtros
     * @param params - Parâmetros de filtro e paginação
     * @returns Promise com lista de spliters e metadados de paginação
     */
    const listarSpliter = useCallback(async (params?: ListarSpliterParams) => {
        return request<{ spliters: SpliterAPI[], paginacao: any }>('GET', '/spliters', undefined, params);
    }, [request]);

    /**
     * Obtém um spliter específico por ID
     * @param id - ID do spliter
     * @returns Promise com dados do spliter
     */
    const obterSpliterPorId = useCallback(async (id: string) => {
        return request<SpliterAPI>('GET', `/spliters/${id}`);
    }, [request]);

    /**
     * Cria um novo spliter
     * @param spliter - Dados do spliter a ser criado
     * @returns Promise com dados do spliter criado
     */
    const criarSpliter = useCallback(async (spliter: CriarSpliterData) => {
        return request<{ mensagem: string, spliter: SpliterAPI }>('POST', '/spliters', spliter);
    }, [request]);

    /**
     * Atualiza um spliter existente
     * @param id - ID do spliter a ser atualizado
     * @param spliter - Dados parciais do spliter para atualização
     * @returns Promise com dados do spliter atualizado
     */
    const atualizarSpliter = useCallback(async (id: string, spliter: AtualizarSpliterData) => {
        return request<{ mensagem: string, spliter: SpliterAPI }>('PATCH', `/spliters/${id}`, spliter);
    }, [request]);

    /**
     * Exclui um spliter
     * @param id - ID do spliter a ser excluído
     * @returns Promise com mensagem de confirmação
     */
    const excluirSpliter = useCallback(async (id: string) => {
        return request<{ mensagem: string }>('DELETE', `/spliters/${id}`);
    }, [request]);

    /**
     * Busca spliters por caixa específica
     * @param caixaId - ID da caixa
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de spliters da caixa
     */
    const buscarSpliterPorCaixa = useCallback(async (caixaId: string, params?: Omit<ListarSpliterParams, 'caixaId'>) => {
        return listarSpliter({ ...params, caixaId });
    }, [listarSpliter]);

    /**
     * Busca spliters por tipo
     * @param tipo - Tipo do spliter
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de spliters do tipo especificado
     */
    const buscarSpliterPorTipo = useCallback(async (tipo: string, params?: Omit<ListarSpliterParams, 'tipo'>) => {
        return listarSpliter({ ...params, tipo });
    }, [listarSpliter]);

    /**
     * Busca spliters por status de atendimento
     * @param atendimento - Status de atendimento (true/false)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de spliters filtrados por atendimento
     */
    const buscarSpliterPorAtendimento = useCallback(async (atendimento: boolean, params?: Omit<ListarSpliterParams, 'atendimento'>) => {
        return listarSpliter({ ...params, atendimento });
    }, [listarSpliter]);

    /**
     * Busca spliters por capilar de saída
     * @param capilarSaidaId - ID do capilar de saída
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de spliters do capilar de saída
     */
    const buscarSpliterPorCapilarSaida = useCallback(async (capilarSaidaId: string, params?: Omit<ListarSpliterParams, 'capilarSaidaId'>) => {
        return listarSpliter({ ...params, capilarSaidaId });
    }, [listarSpliter]);

    /**
     * Busca spliters por capilar de entrada
     * @param capilarEntradaId - ID do capilar de entrada
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de spliters do capilar de entrada
     */
    const buscarSpliterPorCapilarEntrada = useCallback(async (capilarEntradaId: string, params?: Omit<ListarSpliterParams, 'capilarEntradaId'>) => {
        return listarSpliter({ ...params, capilarEntradaId });
    }, [listarSpliter]);

    return {
        // Estados
        isLoading,
        error,
        
        // Operações CRUD básicas
        listarSpliter,
        obterSpliterPorId,
        criarSpliter,
        atualizarSpliter,
        excluirSpliter,
        
        // Operações de busca específicas
        buscarSpliterPorCaixa,
        buscarSpliterPorTipo,
        buscarSpliterPorAtendimento,
        buscarSpliterPorCapilarSaida,
        buscarSpliterPorCapilarEntrada,
    };
};
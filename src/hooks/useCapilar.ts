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

// Interface para os dados do Capilar
export interface CapilarAPI {
    id: string;
    numero: number;
    tipo: string;
    comprimento: number;
    status: string;
    potencia: number;
    rota?: {
        id: string;
        nome: string;
        tipoCabo: string;
        fabricante?: string;
    };
    saidas?: {
        id: string;
        capilarEntrada?: {
            id: string;
            numero: number;
            tipo: string;
        };
    }[];
    entradas?: {
        id: string;
        capilarSaida?: {
            id: string;
            numero: number;
            tipo: string;
        };
    }[];
    spliter_saida?: {
        id: string;
        nome: string;
        caixa?: {
            id: string;
            nome: string;
            tipo: 'CTO' | 'CEO';
        };
        capilarEntrada?: {
            id: string;
            numero: number;
        };
    }[];
    spliter_entrada?: {
        id: string;
        nome: string;
        caixa?: {
            id: string;
            nome: string;
            tipo: 'CTO' | 'CEO';
        };
        capilarSaida?: {
            id: string;
            numero: number;
        };
    }[];
    _count?: {
        saidas: number;
        entradas: number;
        spliter_saida: number;
        spliter_entrada: number;
    };
}

// Interface para criação de capilar
export interface CriarCapilarData {
    numero: number;
    tipo: string;
    comprimento: number;
    status: string;
    potencia: number;
    rotaId?: string;
}

// Interface para atualização de capilar
export interface AtualizarCapilarData {
    numero?: number;
    tipo?: string;
    comprimento?: number;
    status?: string;
    potencia?: number;
    rotaId?: string;
}

// Interface para parâmetros de listagem
export interface ListarCapilarParams {
    pagina?: number;
    limite?: number;
    busca?: string;
    tipo?: string;
    status?: string;
    rotaId?: string;
}

/**
 * Hook personalizado para gerenciar operações de Capilares
 * Fornece funções para CRUD completo de capilares
 */
export const useCapilar = () => {
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
     * Lista todos os capilares com paginação e filtros
     * @param params - Parâmetros de filtro e paginação
     * @returns Promise com lista de capilares e metadados de paginação
     */
    const listarCapilar = useCallback(async (params?: ListarCapilarParams) => {
        return request<{ capilares: CapilarAPI[], paginacao: any }>('GET', '/capilares', undefined, params);
    }, [request]);

    /**
     * Obtém um capilar específico por ID
     * @param id - ID do capilar
     * @returns Promise com dados do capilar
     */
    const obterCapilarPorId = useCallback(async (id: string) => {
        return request<CapilarAPI>('GET', `/capilares/${id}`);
    }, [request]);

    /**
     * Cria um novo capilar
     * @param capilar - Dados do capilar a ser criado
     * @returns Promise com dados do capilar criado
     */
    const criarCapilar = useCallback(async (capilar: CriarCapilarData) => {
        return request<{ mensagem: string, capilar: CapilarAPI }>('POST', '/capilares', capilar);
    }, [request]);

    /**
     * Atualiza um capilar existente
     * @param id - ID do capilar a ser atualizado
     * @param capilar - Dados parciais do capilar para atualização
     * @returns Promise com dados do capilar atualizado
     */
    const atualizarCapilar = useCallback(async (id: string, capilar: AtualizarCapilarData) => {
        return request<{ mensagem: string, capilar: CapilarAPI }>('PATCH', `/capilares/${id}`, capilar);
    }, [request]);

    /**
     * Exclui um capilar
     * @param id - ID do capilar a ser excluído
     * @returns Promise com mensagem de confirmação
     */
    const excluirCapilar = useCallback(async (id: string) => {
        return request<{ mensagem: string }>('DELETE', `/capilares/${id}`);
    }, [request]);

    /**
     * Busca capilares por rota específica
     * @param rotaId - ID da rota
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares da rota
     */
    const buscarCapilarPorRota = useCallback(async (rotaId: string, params?: Omit<ListarCapilarParams, 'rotaId'>) => {
        return listarCapilar({ ...params, rotaId });
    }, [listarCapilar]);

    /**
     * Busca capilares por tipo
     * @param tipo - Tipo do capilar
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares do tipo especificado
     */
    const buscarCapilarPorTipo = useCallback(async (tipo: string, params?: Omit<ListarCapilarParams, 'tipo'>) => {
        return listarCapilar({ ...params, tipo });
    }, [listarCapilar]);

    /**
     * Busca capilares por status
     * @param status - Status do capilar
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares filtrados por status
     */
    const buscarCapilarPorStatus = useCallback(async (status: string, params?: Omit<ListarCapilarParams, 'status'>) => {
        return listarCapilar({ ...params, status });
    }, [listarCapilar]);

    /**
     * Busca capilares por número específico
     * @param numero - Número do capilar
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares com o número especificado
     */
    const buscarCapilarPorNumero = useCallback(async (numero: number, params?: Omit<ListarCapilarParams, 'busca'>) => {
        return listarCapilar({ ...params, busca: numero.toString() });
    }, [listarCapilar]);

    /**
     * Busca capilares associados a uma caixa específica
     * @param caixaId - ID da caixa
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares da caixa
     */
    const obterCapilarPorCaixa = useCallback(async (caixaId: string, params?: ListarCapilarParams) => {
        return request<{ capilares: CapilarAPI[], paginacao: any }>('GET', '/capilares', undefined, { ...params, caixaId });
    }, [request]);

    /**
     * Busca capilares disponíveis (sem conexões)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares disponíveis
     */
    const buscarCapilaresDisponiveis = useCallback(async (params?: ListarCapilarParams) => {
        return listarCapilar({ ...params, status: 'Ativo' });
    }, [listarCapilar]);

    /**
     * Busca capilares com conexões (emendas ou spliters)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de capilares conectados
     */
    const buscarCapilaresConectados = useCallback(async (params?: ListarCapilarParams) => {
        const response = await listarCapilar(params);
        if (response.data && response.data.capilares) {
            const capilaresConectados = response.data.capilares.filter(capilar => 
                capilar._count && (
                    capilar._count.saidas > 0 || 
                    capilar._count.entradas > 0 || 
                    capilar._count.spliter_saida > 0 || 
                    capilar._count.spliter_entrada > 0
                )
            );
            return {
                ...response,
                data: {
                    ...response.data,
                    capilares: capilaresConectados
                }
            };
        }
        return response;
    }, [listarCapilar]);

    /**
     * Verifica se um capilar pode ser excluído (sem conexões)
     * @param id - ID do capilar
     * @returns Promise com boolean indicando se pode ser excluído
     */
    const podeExcluirCapilar = useCallback(async (id: string): Promise<boolean> => {
        const response = await obterCapilarPorId(id);
        if (response.data && response.data._count) {
            const count = response.data._count;
            return count.saidas === 0 && count.entradas === 0 && 
                   count.spliter_saida === 0 && count.spliter_entrada === 0;
        }
        return false;
    }, [obterCapilarPorId]);

    return {
        // Estados
        isLoading,
        error,
        
        // Operações CRUD básicas
        listarCapilar,
        obterCapilarPorId,
        criarCapilar,
        atualizarCapilar,
        excluirCapilar,
        
        // Operações de busca específicas
        buscarCapilarPorRota,
        buscarCapilarPorTipo,
        buscarCapilarPorStatus,
        buscarCapilarPorNumero,
        obterCapilarPorCaixa,
        buscarCapilaresDisponiveis,
        buscarCapilaresConectados,
        
        // Operações utilitárias
        podeExcluirCapilar,
    };
};
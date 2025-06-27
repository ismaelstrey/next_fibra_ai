'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ApiResponse, PaginatedResponse, ClienteAPI, CriarClienteData, AtualizarClienteData } from '@/types/cliente';

// Interface para parâmetros de listagem
export interface ListarClienteParams {
    pagina?: number;
    limite?: number;
    busca?: string;
    neutraId?: string;
    portaId?: string;
}

export const useClient = () => {
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
     * Lista todos os clientes com paginação e filtros
     * @param params - Parâmetros de filtro e paginação
     * @returns Promise com lista de clientes e metadados de paginação
     */
    const listarClientes = useCallback(async (params?: ListarClienteParams) => {
        return request<{ clientes: ClienteAPI[], paginacao: any }>('GET', '/clientes', undefined, params);
    }, [request]);

    /**
     * Obtém um cliente específico por ID
     * @param id - ID do cliente
     * @returns Promise com dados do cliente
     */
    const obterClientePorId = useCallback(async (id: string) => {
        return request<ClienteAPI>('GET', `/clientes/${id}`);
    }, [request]);

    /**
     * Cria um novo cliente
     * @param cliente - Dados do cliente a ser criado
     * @returns Promise com dados do cliente criado
     */
    const criarCliente = useCallback(async (cliente: CriarClienteData) => {
        return request<{ mensagem: string, cliente: ClienteAPI }>('POST', '/clientes', cliente);
    }, [request]);

    /**
     * Atualiza um cliente existente
     * @param id - ID do cliente a ser atualizado
     * @param cliente - Dados parciais do cliente para atualização
     * @returns Promise com dados do cliente atualizado
     */
    const atualizarCliente = useCallback(async (id: string, cliente: AtualizarClienteData) => {
        return request<{ mensagem: string, cliente: ClienteAPI }>('PATCH', `/clientes/${id}`, cliente);
    }, [request]);

    /**
     * Exclui um cliente
     * @param id - ID do cliente a ser excluído
     * @returns Promise com mensagem de confirmação
     */
    const excluirCliente = useCallback(async (id: string) => {
        return request<{ mensagem: string }>('DELETE', `/clientes/${id}`);
    }, [request]);

    /**
     * Busca clientes por nome ou email
     * @param termo - Termo de busca
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de clientes encontrados
     */
    const buscarClientes = useCallback(async (termo: string, params?: Omit<ListarClienteParams, 'busca'>) => {
        return listarClientes({ ...params, busca: termo });
    }, [listarClientes]);

    /**
     * Busca clientes por neutra
     * @param neutraId - ID da neutra
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de clientes da neutra
     */
    const buscarClientesPorNeutra = useCallback(async (neutraId: string, params?: Omit<ListarClienteParams, 'neutraId'>) => {
        return listarClientes({ ...params, neutraId });
    }, [listarClientes]);

    /**
     * Busca clientes por porta
     * @param portaId - ID da porta
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de clientes da porta
     */
    const buscarClientesPorPorta = useCallback(async (portaId: string, params?: Omit<ListarClienteParams, 'portaId'>) => {
        return listarClientes({ ...params, portaId });
    }, [listarClientes]);

    /**
     * Verifica se um email já está em uso
     * @param email - Email a ser verificado
     * @param clienteId - ID do cliente atual (para edição)
     * @returns Promise com boolean indicando se o email está disponível
     */
    const verificarEmailDisponivel = useCallback(async (email: string, clienteId?: string) => {
        try {
            const response = await listarClientes({ busca: email, limite: 1 });
            if (response.data.clientes.length === 0) {
                return true; // Email disponível
            }
            
            // Se estiver editando, verifica se o email pertence ao próprio cliente
            if (clienteId && response.data.clientes[0].id === clienteId) {
                return true;
            }
            
            return false; // Email já em uso
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            return false;
        }
    }, [listarClientes]);

    /**
     * Obtém estatísticas dos clientes
     * @returns Promise com estatísticas dos clientes
     */
    const obterEstatisticasClientes = useCallback(async () => {
        try {
            const response = await listarClientes({ limite: 1 });
            const total = response.data.paginacao?.total || 0;
            
            return {
                total,
                // Aqui você pode adicionar mais estatísticas conforme necessário
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { total: 0 };
        }
    }, [listarClientes]);

    return {
        // Estados
        isLoading,
        error,
        
        // Métodos CRUD
        listarClientes,
        obterClientePorId,
        criarCliente,
        atualizarCliente,
        excluirCliente,
        
        // Métodos de busca
        buscarClientes,
        buscarClientesPorNeutra,
        buscarClientesPorPorta,
        
        // Métodos utilitários
        verificarEmailDisponivel,
        obterEstatisticasClientes,
    };
};
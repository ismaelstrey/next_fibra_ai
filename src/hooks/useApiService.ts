'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ApiResponse, CaixaAPI } from '@/types/caixa';
import { RotaAPI } from '@/types/rota';
import { FusaoAPI } from '@/types/caixa';
import { CidadeAPI } from '@/types/cidade';

// Tipos para as respostas da API









// Hook para acessar a API
export const useApiService = () => {
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

    // Funções específicas para cada endpoint
    const rotas = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
            tipoCabo?: string;
            tipoPassagem?: string;
        }) => {
            return request<{ rotas: RotaAPI[], paginacao: any }>('GET', '/rotas', undefined, params);
        }, [request]),

        obterPorId: useCallback(async (id: string) => {
            return request<{ rota: RotaAPI }>('GET', `/rotas/${id}`);
        }, [request]),

        criar: useCallback(async (rota: {
            nome: string;
            tipoCabo: string;
            fabricante?: string;
            distancia?: number;
            profundidade?: number;
            tipoPassagem: string;
            coordenadas: { lat: number; lng: number }[];
            cor?: string;
            observacoes?: string;
            cidadeId: string;
        }) => {
            return request<{ mensagem: string, rota: RotaAPI }>('POST', '/rotas', rota);
        }, [request]),

        atualizar: useCallback(async (id: string, rota: Partial<{
            nome: string;
            tipoCabo: string;
            fabricante: string;
            distancia: number;
            profundidade: number;
            tipoPassagem: string;
            coordenadas: { lat: number; lng: number }[];
            cor: string;
            observacoes: string;
        }>) => {
            return request<{ mensagem: string, rota: RotaAPI }>('PATCH', `/rotas/${id}`, rota);
        }, [request]),

        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/rotas/${id}`);
        }, [request])
    };

    const caixas = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
            rotaId?: string;
            tipo?: string;
        }) => {
            return request<{ caixas: CaixaAPI[], paginacao: any }>('GET', '/caixas', undefined, params);
        }, [request]),

        obterPorId: useCallback(async (id: string) => {
            return request<{ caixa: CaixaAPI }>('GET', `/caixas/${id}`);
        }, [request]),

        criar: useCallback(async (caixa: {
            nome: string;
            tipo: 'CTO' | 'CEO';
            modelo: string;
            capacidade: number;
            coordenadas: {
                lat: number;
                lng: number;
            };
            observacoes?: string;
            cidadeId: string;
            rotaIds: string[];
        }) => {
            return request<{ mensagem: string, caixa: CaixaAPI }>('POST', '/caixas', caixa);
        }, [request]),

        atualizar: useCallback(async (id: string, caixa: Partial<{
            nome: string;
            modelo: string;
            coordenadas: {
                latitude: number;
                longitude: number;
            };
            observacoes: string;
            rotaIds: string[];
        }>) => {
            return request<{ mensagem: string, caixa: CaixaAPI }>('PATCH', `/caixas/${id}`, caixa);
        }, [request]),

        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/caixas/${id}`);
        }, [request])
    };

    const fusoes = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
            caixaId?: string;
            bandejaId?: string;
        }) => {
            return request<{ fusoes: FusaoAPI[], paginacao: any }>('GET', '/fusoes', undefined, params);
        }, [request]),

        criar: useCallback(async (fusao: {
            posicao: number;
            cor?: string;
            origem: string;
            destino: string;
            observacoes?: string;
            caixaId: string;
            bandejaId?: string;
        }) => {
            return request<{ mensagem: string, fusao: FusaoAPI }>('POST', '/fusoes', fusao);
        }, [request]),

        criarEmLote: useCallback(async (fusoes: {
            posicao: number;
            cor?: string;
            origem: string;
            destino: string;
            observacoes?: string;
            caixaId: string;
            bandejaId?: string;
        }[]) => {
            return request<{ mensagem: string, fusoes: FusaoAPI[] }>('POST', '/fusoes/lote', { fusoes });
        }, [request])
    };

    const cidades = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            estado?: string;
            apenasMinhas?: boolean;
        }) => {
            return request<{ cidades: CidadeAPI[], paginacao: any }>('GET', '/cidades', undefined, params);
        }, [request]),

        obterPorId: useCallback(async (id: string) => {
            return request<{ cidade: CidadeAPI }>('GET', `/cidades/${id}`);
        }, [request])
    };

    const spliters = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
            caixaId?: string;
        }) => {
            return request<{ spliters: any[], paginacao: any }>('GET', '/spliters', undefined, params);
        }, [request]),
        obterPorId: useCallback(async (id: string) => {
            return request<{ spliter: any }>('GET', `/spliters/${id}`);
        }, [request]),
        criar: useCallback(async (spliter: any) => {
            return request<{ mensagem: string, spliter: any }>('POST', '/spliters', spliter);
        }, [request]),
        atualizar: useCallback(async (id: string, spliter: Partial<any>) => {
            return request<{ mensagem: string, spliter: any }>('PATCH', `/spliters/${id}`, spliter);
        }, [request]),
        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/spliters/${id}`);
        }, [request])
    };

    const clientes = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
        }) => {
            return request<{ clientes: any[], paginacao: any }>('GET', '/clientes', undefined, params);
        }, [request]),
        obterPorId: useCallback(async (id: string) => {
            return request<{ cliente: any }>('GET', `/clientes/${id}`);
        }, [request]),
        criar: useCallback(async (cliente: any) => {
            return request<{ mensagem: string, cliente: any }>('POST', '/clientes', cliente);
        }, [request]),
        atualizar: useCallback(async (id: string, cliente: Partial<any>) => {
            return request<{ mensagem: string, cliente: any }>('PATCH', `/clientes/${id}`, cliente);
        }, [request]),
        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/clientes/${id}`);
        }, [request])
    };

    const incidentes = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
        }) => {
            return request<{ incidentes: any[], paginacao: any }>('GET', '/incidentes', undefined, params);
        }, [request]),
        obterPorId: useCallback(async (id: string) => {
            return request<{ incidente: any }>('GET', `/incidentes/${id}`);
        }, [request]),
        criar: useCallback(async (incidente: any) => {
            return request<{ mensagem: string, incidente: any }>('POST', '/incidentes', incidente);
        }, [request]),
        atualizar: useCallback(async (id: string, incidente: Partial<any>) => {
            return request<{ mensagem: string, incidente: any }>('PATCH', `/incidentes/${id}`, incidente);
        }, [request]),
        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/incidentes/${id}`);
        }, [request])
    };

    const relatorios = {
        listar: useCallback(async (params?: {
            pagina?: number;
            limite?: number;
            busca?: string;
            cidadeId?: string;
        }) => {
            return request<{ relatorios: any[], paginacao: any }>('GET', '/relatorios', undefined, params);
        }, [request]),
        obterPorId: useCallback(async (id: string) => {
            return request<{ relatorio: any }>('GET', `/relatorios/${id}`);
        }, [request]),
        criar: useCallback(async (relatorio: any) => {
            return request<{ mensagem: string, relatorio: any }>('POST', '/relatorios', relatorio);
        }, [request]),
        atualizar: useCallback(async (id: string, relatorio: Partial<any>) => {
            return request<{ mensagem: string, relatorio: any }>('PATCH', `/relatorios/${id}`, relatorio);
        }, [request]),
        excluir: useCallback(async (id: string) => {
            return request<{ mensagem: string }>('DELETE', `/relatorios/${id}`);
        }, [request])
    };

    return {
        isLoading,
        error,
        rotas,
        caixas,
        fusoes,
        cidades,
        spliters,
        clientes,
        incidentes,
        relatorios
    };
};
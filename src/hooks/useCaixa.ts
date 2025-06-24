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

// Interface para os dados da Caixa
export interface CaixaAPI {
    id: string;
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
    rotaId: string;
    criadoEm: string;
    atualizadoEm: string;
    cidade?: {
        id: string;
        nome: string;
        estado: string;
    };
    rota?: {
        id: string;
        nome: string;
        tipoCabo: string;
        fabricante?: string;
    };
    portas?: PortaAPI[];
    bandejas?: BandejaAPI[];
    fusoes?: FusaoAPI[];
    comentarios?: ComentarioAPI[];
    arquivos?: ArquivoAPI[];
    manutencoes?: ManutencaoAPI[];
    spliters?: SpliterAPI[];
    _count?: {
        fusoes: number;
        portas: number;
        bandejas: number;
        comentarios: number;
        arquivos: number;
        manutencoes: number;
    };
}

// Interface para Porta
export interface PortaAPI {
    id: string;
    numero: number;
    status: string;
    observacoes?: string;
    caixaId: string;
    criadoEm: string;
    atualizadoEm: string;
}

// Interface para Bandeja
export interface BandejaAPI {
    id: string;
    numero: number;
    capacidade: number;
    caixaId: string;
    criadoEm: string;
    atualizadoEm: string;
    _count?: {
        fusoes: number;
    };
}

// Interface para Fusão
export interface FusaoAPI {
    id: string;
    fibraOrigem: number;
    fibraDestino: number;
    tuboOrigem?: string;
    tuboDestino?: string;
    status: string;
    cor?: string;
    observacoes?: string;
    caixaId: string;
    bandejaId?: string;
    rotaOrigemId: string;
    criadoEm: string;
    atualizadoEm: string;
    bandeja?: {
        numero: number;
    };
}

// Interface para Comentário
export interface ComentarioAPI {
    id: string;
    conteudo: string;
    caixaId: string;
    usuarioId: string;
    criadoEm: string;
    atualizadoEm: string;
    usuario?: {
        id: string;
        nome: string;
        email: string;
        imagem?: string;
    };
}

// Interface para Arquivo
export interface ArquivoAPI {
    id: string;
    nome: string;
    tipo: string;
    tamanho: number;
    url: string;
    caixaId: string;
    usuarioId: string;
    criadoEm: string;
    atualizadoEm: string;
}

// Interface para Manutenção
export interface ManutencaoAPI {
    id: string;
    tipo: string;
    descricao: string;
    status: string;
    dataInicio: string;
    dataFim?: string;
    caixaId: string;
    usuarioId: string;
    criadoEm: string;
    atualizadoEm: string;
    usuario?: {
        id: string;
        nome: string;
        email: string;
        imagem?: string;
    };
}

// Interface para Spliter
export interface SpliterAPI {
    id: string;
    nome: string;
    atendimento: boolean;
    tipo: string;
    caixaId: string;
    capilarSaidaId?: string;
    capilarEntradaId?: string;
}

// Interface para criação de caixa
export interface CriarCaixaData {
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
    rotaId: string;
}

// Interface para atualização de caixa
export interface AtualizarCaixaData {
    nome?: string;
    tipo?: 'CTO' | 'CEO';
    modelo?: string;
    capacidade?: number;
    coordenadas?: {
        lat: number;
        lng: number;
    };
    observacoes?: string;
    cidadeId?: string;
    rotaId?: string;
}

// Interface para parâmetros de listagem
export interface ListarCaixaParams {
    pagina?: number;
    limite?: number;
    busca?: string;
    cidadeId?: string;
    rotaId?: string;
    tipo?: 'CTO' | 'CEO';
}

// Interface para atualização de portas em lote
export interface AtualizarPortaData {
    id: string;
    status?: string;
    observacoes?: string;
}

// Interface para atualização de bandejas em lote
export interface AtualizarBandejaData {
    id: string;
    capacidade?: number;
}

// Interface para estatísticas de portas
export interface EstatisticasPortas {
    total: number;
    livres: number;
    ocupadas: number;
    reservadas: number;
    defeito: number;
}

// Interface para estatísticas de bandejas
export interface EstatisticasBandejas {
    totalBandejas: number;
    totalCapacidade: number;
    totalFusoes: number;
    disponivel: number;
}

/**
 * Hook personalizado para gerenciar operações de Caixas
 * Fornece funções para CRUD completo de caixas e operações relacionadas
 */
export const useCaixa = () => {
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
     * Lista todas as caixas com paginação e filtros
     * @param params - Parâmetros de filtro e paginação
     * @returns Promise com lista de caixas e metadados de paginação
     */
    const listarCaixa = useCallback(async (params?: ListarCaixaParams) => {
        return request<{ caixas: CaixaAPI[], paginacao: any }>('GET', '/caixas', undefined, params);
    }, [request]);

    /**
     * Obtém uma caixa específica por ID
     * @param id - ID da caixa
     * @returns Promise com dados da caixa
     */
    const obterCaixaPorId = useCallback(async (id: string) => {
        return request<CaixaAPI>('GET', `/caixas/${id}`);
    }, [request]);

    /**
     * Cria uma nova caixa
     * @param caixa - Dados da caixa a ser criada
     * @returns Promise com dados da caixa criada
     */
    const criarCaixa = useCallback(async (caixa: CriarCaixaData) => {
        return request<{ mensagem: string, caixa: CaixaAPI }>('POST', '/caixas', caixa);
    }, [request]);

    /**
     * Atualiza uma caixa existente
     * @param id - ID da caixa a ser atualizada
     * @param caixa - Dados parciais da caixa para atualização
     * @returns Promise com dados da caixa atualizada
     */
    const atualizarCaixa = useCallback(async (id: string, caixa: AtualizarCaixaData) => {
        return request<{ mensagem: string, caixa: CaixaAPI }>('PATCH', `/caixas/${id}`, caixa);
    }, [request]);

    /**
     * Exclui uma caixa
     * @param id - ID da caixa a ser excluída
     * @returns Promise com mensagem de confirmação
     */
    const excluirCaixa = useCallback(async (id: string) => {
        return request<{ mensagem: string }>('DELETE', `/caixas/${id}`);
    }, [request]);

    /**
     * Lista todas as portas de uma caixa específica
     * @param caixaId - ID da caixa
     * @param status - Filtro por status das portas (opcional)
     * @returns Promise com lista de portas e estatísticas
     */
    const listarPortasDaCaixa = useCallback(async (caixaId: string, status?: string) => {
        const params = status ? { status } : undefined;
        return request<{
            caixa: { id: string, nome: string, capacidade: number },
            portas: PortaAPI[],
            estatisticas: EstatisticasPortas
        }>('GET', `/caixas/${caixaId}/portas`, undefined, params);
    }, [request]);

    /**
     * Obtém uma porta específica de uma caixa
     * @param caixaId - ID da caixa
     * @param portaId - ID da porta
     * @returns Promise com dados da porta
     */
    const obterPortaDaCaixa = useCallback(async (caixaId: string, portaId: string) => {
        return request<PortaAPI>('GET', `/caixas/${caixaId}/portas/${portaId}`);
    }, [request]);

    /**
     * Atualiza uma porta específica de uma caixa
     * @param caixaId - ID da caixa
     * @param portaId - ID da porta
     * @param porta - Dados da porta para atualização
     * @returns Promise com dados da porta atualizada
     */
    const atualizarPortaDaCaixa = useCallback(async (caixaId: string, portaId: string, porta: Omit<AtualizarPortaData, 'id'>) => {
        return request<{ mensagem: string, porta: PortaAPI }>('PATCH', `/caixas/${caixaId}/portas/${portaId}`, porta);
    }, [request]);

    /**
     * Atualiza múltiplas portas de uma caixa em lote
     * @param caixaId - ID da caixa
     * @param portas - Array com dados das portas para atualização
     * @returns Promise com dados das portas atualizadas
     */
    const atualizarPortasEmLote = useCallback(async (caixaId: string, portas: AtualizarPortaData[]) => {
        return request<{ mensagem: string, portas: PortaAPI[] }>('PUT', `/caixas/${caixaId}/portas`, { portas });
    }, [request]);

    /**
     * Lista todas as bandejas de uma caixa específica
     * @param caixaId - ID da caixa
     * @returns Promise com lista de bandejas e estatísticas
     */
    const listarBandejasDaCaixa = useCallback(async (caixaId: string) => {
        return request<{
            caixa: { id: string, nome: string, capacidade: number },
            bandejas: BandejaAPI[],
            estatisticas: EstatisticasBandejas
        }>('GET', `/caixas/${caixaId}/bandejas`);
    }, [request]);

    /**
     * Obtém uma bandeja específica de uma caixa
     * @param caixaId - ID da caixa
     * @param bandejaId - ID da bandeja
     * @returns Promise com dados da bandeja e suas fusões
     */
    const obterBandejaDaCaixa = useCallback(async (caixaId: string, bandejaId: string) => {
        return request<BandejaAPI & { fusoes: FusaoAPI[] }>('GET', `/caixas/${caixaId}/bandejas/${bandejaId}`);
    }, [request]);

    /**
     * Atualiza uma bandeja específica de uma caixa
     * @param caixaId - ID da caixa
     * @param bandejaId - ID da bandeja
     * @param bandeja - Dados da bandeja para atualização
     * @returns Promise com dados da bandeja atualizada
     */
    const atualizarBandejaDaCaixa = useCallback(async (caixaId: string, bandejaId: string, bandeja: Omit<AtualizarBandejaData, 'id'>) => {
        return request<{ mensagem: string, bandeja: BandejaAPI }>('PATCH', `/caixas/${caixaId}/bandejas/${bandejaId}`, bandeja);
    }, [request]);

    /**
     * Atualiza múltiplas bandejas de uma caixa em lote
     * @param caixaId - ID da caixa
     * @param bandejas - Array com dados das bandejas para atualização
     * @returns Promise com dados das bandejas atualizadas
     */
    const atualizarBandejasEmLote = useCallback(async (caixaId: string, bandejas: AtualizarBandejaData[]) => {
        return request<{ mensagem: string, bandejas: BandejaAPI[] }>('PUT', `/caixas/${caixaId}/bandejas`, { bandejas });
    }, [request]);

    /**
     * Busca uma caixa específica por ID com informações detalhadas
     * @param id - ID da caixa
     * @param incluirRelacionamentos - Se deve incluir relacionamentos (portas, bandejas, etc.)
     * @returns Promise com dados detalhados da caixa
     */
    const buscarCaixaPorId = useCallback(async (id: string, incluirRelacionamentos: boolean = true) => {
        const params = incluirRelacionamentos ? { incluir: 'portas,bandejas,fusoes,comentarios,arquivos,manutencoes,spliters,cidade,rota' } : undefined;
        return request<CaixaAPI>('GET', `/caixas/${id}`, undefined, params);
    }, [request]);

    /**
     * Busca caixas por cidade específica
     * @param cidadeId - ID da cidade
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de caixas da cidade
     */
    const buscarCaixasPorCidade = useCallback(async (cidadeId: string, params?: Omit<ListarCaixaParams, 'cidadeId'>) => {
        return listarCaixa({ ...params, cidadeId });
    }, [listarCaixa]);

    /**
     * Busca caixas por rota específica
     * @param rotaId - ID da rota
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de caixas da rota
     */
    const buscarCaixasPorRota = useCallback(async (rotaId: string, params?: Omit<ListarCaixaParams, 'rotaId'>) => {
        return listarCaixa({ ...params, rotaId });
    }, [listarCaixa]);

    /**
     * Busca caixas por tipo
     * @param tipo - Tipo da caixa (CTO ou CEO)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de caixas do tipo especificado
     */
    const buscarCaixasPorTipo = useCallback(async (tipo: 'CTO' | 'CEO', params?: Omit<ListarCaixaParams, 'tipo'>) => {
        return listarCaixa({ ...params, tipo });
    }, [listarCaixa]);

    /**
     * Busca caixas CTO (com portas)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de caixas CTO
     */
    const buscarCaixasCTO = useCallback(async (params?: Omit<ListarCaixaParams, 'tipo'>) => {
        return buscarCaixasPorTipo('CTO', params);
    }, [buscarCaixasPorTipo]);

    /**
     * Busca caixas CEO (com bandejas)
     * @param params - Parâmetros adicionais de filtro
     * @returns Promise com lista de caixas CEO
     */
    const buscarCaixasCEO = useCallback(async (params?: Omit<ListarCaixaParams, 'tipo'>) => {
        return buscarCaixasPorTipo('CEO', params);
    }, [buscarCaixasPorTipo]);

    /**
     * Verifica se uma caixa pode ser excluída (sem portas em uso ou fusões)
     * @param id - ID da caixa
     * @returns Promise com boolean indicando se pode ser excluída
     */
    const podeExcluirCaixa = useCallback(async (id: string): Promise<boolean> => {
        const response = await obterCaixaPorId(id);
        if (response.data && response.data._count) {
            const count = response.data._count;
            return count.fusoes === 0;
        }
        return false;
    }, [obterCaixaPorId]);

    return {
        // Estados
        isLoading,
        error,

        // Operações básicas de CRUD
        listarCaixa,
        obterCaixaPorId,
        criarCaixa,
        atualizarCaixa,
        excluirCaixa,

        // Operações de portas
        listarPortasDaCaixa,
        obterPortaDaCaixa,
        atualizarPortaDaCaixa,
        atualizarPortasEmLote,

        // Operações de bandejas
        listarBandejasDaCaixa,
        obterBandejaDaCaixa,
        atualizarBandejaDaCaixa,
        atualizarBandejasEmLote,

        // Buscas específicas
        buscarCaixaPorId,
        buscarCaixasPorCidade,
        buscarCaixasPorRota,
        buscarCaixasPorTipo,
        buscarCaixasCTO,
        buscarCaixasCEO,

        // Utilitários
        podeExcluirCaixa,
    };
};

/**
 * Função utilitária para verificar se uma caixa pode ser excluída
 * @param caixa - Dados da caixa
 * @returns boolean indicando se pode ser excluída
 */
export const podeExcluirCaixa = (caixa: CaixaAPI): boolean => {
    if (caixa._count) {
        return caixa._count.fusoes === 0;
    }
    return false;
};

/**
 * Função utilitária para obter o status de ocupação de uma caixa
 * @param caixa - Dados da caixa
 * @returns objeto com informações de ocupação
 */
export const getStatusOcupacaoCaixa = (caixa: CaixaAPI) => {
    if (!caixa._count) {
        return {
            total: caixa.capacidade,
            ocupado: 0,
            disponivel: caixa.capacidade,
            percentualOcupacao: 0
        };
    }

    const ocupado = caixa.tipo === 'CTO' ? 
        (caixa._count.portas - (caixa.portas?.filter(p => p.status === 'Livre').length || 0)) :
        caixa._count.fusoes;
    
    const disponivel = caixa.capacidade - ocupado;
    const percentualOcupacao = (ocupado / caixa.capacidade) * 100;

    return {
        total: caixa.capacidade,
        ocupado,
        disponivel,
        percentualOcupacao: Math.round(percentualOcupacao * 100) / 100
    };
};

export default useCaixa;
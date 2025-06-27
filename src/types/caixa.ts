// Tipos relacionados a Caixa

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
    spliters?: any[];
    _count?: {
        fusoes: number;
        portas: number;
        bandejas: number;
        comentarios: number;
        arquivos: number;
        manutencoes: number;
    };
}

export interface PortaAPI {
    atualizadoEm: string;
    caixaId: string;
    clienteId?: string;
    clienteNome?: string;
    criadoEm: string;
    id: string;
    numero: number;
    observacoes?: string;
    status: "Disponível" | "Em uso" | "Reservada" | "Defeito";
    spliterId?: string;
}

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
}

export interface ComentarioAPI {
    id: string;
    conteudo: string;
    criadoEm: string;
    usuarioId: string;
    caixaId: string;
}

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

export interface ManutencaoAPI {
    id: string;
    descricao: string;
    data: string;
    caixaId: string;
    criadoEm: string;
    atualizadoEm: string;
}
// Tipos relacionados a Capilar

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

export interface CriarCapilarData {
    numero: number;
    tipo: string;
    comprimento: number;
    status: string;
    potencia: number;
    rotaId?: string;
}

export interface AtualizarCapilarData {
    numero?: number;
    tipo?: string;
    comprimento?: number;
    status?: string;
    potencia?: number;
    rotaId?: string;
}
// Tipos relacionados a Spliter

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
interface PortasSaida {
    id: string;
    numero: number;
    status: string;
    tipo: string;

}

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
    capilarSaida?: PortasSaida[];
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

export interface CriarSpliterData {
    nome: string;
    atendimento: boolean;
    tipo: string;
    caixaId: string;
    capilarSaidaId?: string | null;
    capilarEntradaId?: string | null;
}

export interface AtualizarSpliterData {
    nome?: string;
    atendimento?: boolean;
    tipo?: string;
    caixaId?: string;
    capilarSaidaId?: string | null;
    capilarEntradaId?: string | null;
}
// Tipos relacionados a Cliente

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

export interface ClienteAPI {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    apartamento?: string;
    endereco?: string;
    casa?: string;
    numero: number;
    potencia: number;
    wifi: string;
    senhaWifi: string;
    neutraId: string;
    portaId: string;
    neutra?: {
        id: string;
        nome: string;
        vlan: number;
    };
    porta?: {
        id: string;
        numero: number;
        status: string;
        caixa?: {
            id: string;
            nome: string;
            tipo: string;
            coordenadas?: {
                lat: number;
                lng: number;
            };
            cidade?: {
                id: string;
                nome: string;
                estado: string;
            };
            rotaCaixas?: Array<{
                tipoConexao: string;
                ordem: number;
                rota: {
                    id: string;
                    nome: string;
                    tipoCabo: string;
                };
            }>;
        };
    };
}

export interface CriarClienteData {
    nome: string;
    email: string;
    senha?: string;
    telefone?: string;
    apartamento?: string;
    endereco?: string;
    casa?: string;
    numero: number;
    potencia: number;
    wifi: string;
    senhaWifi: string;
    neutraId: string;
    portaId: string;
}

export interface AtualizarClienteData {
    nome?: string;
    email?: string;
    senha?: string;
    telefone?: string;
    apartamento?: string;
    endereco?: string;
    casa?: string;
    numero?: number;
    potencia?: number;
    wifi?: string;
    senhaWifi?: string;
    neutraId?: string;
    portaId?: string;
}
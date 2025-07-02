// Tipos relacionados a Cliente

import { PortaAPI } from "./porta";

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
    porta?:PortaAPI
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
    status?: string;
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
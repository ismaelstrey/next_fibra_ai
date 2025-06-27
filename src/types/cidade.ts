export interface CidadeAPI {
    id: string;
    nome: string;
    estado: string;
    coordenadas: {
        lat: number;
        lng: number;
    };
    criadoEm: string;
    atualizadoEm: string;
    _count?: {
        usuarios: number;
        rotas: number;
        caixas: number;
    };
}
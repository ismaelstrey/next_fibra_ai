// Tipos relacionados a Rotas

export interface RotaAPI {
  id: string;
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
  criadoEm: string;
  atualizadoEm: string;
  cidade?: {
    nome: string;
    estado: string;
  };
  _count?: {
    rotaCaixas: number;
    fusoes: number;
    comentarios: number;
    arquivos: number;
  };
}

export interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ListarRotasResponse {
  rotas: RotaAPI[];
  paginacao: Paginacao;
}

export interface CriarRotaData {
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
}

export interface AtualizarRotaData {
  nome?: string;
  tipoCabo?: string;
  fabricante?: string;
  distancia?: number;
  profundidade?: number;
  tipoPassagem?: string;
  coordenadas?: { lat: number; lng: number }[];
  cor?: string;
  observacoes?: string;
  cidadeId?: string;
}
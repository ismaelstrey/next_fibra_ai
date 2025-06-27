// Tipos relacionados a Portas

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

export interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ListarPortasResponse {
  portas: PortaAPI[];
  paginacao: Paginacao;
}

export interface CriarPortaData {
  numero: number;
  status: string;
  caixaId: string;
  splitterId?: string;
}

export interface AtualizarPortaData {
  numero?: number;
  status?: string;
  caixaId?: string;
  splitterId?: string | null;
}
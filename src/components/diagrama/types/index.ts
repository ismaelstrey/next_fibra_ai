// Tipos para os elementos do diagrama
export interface TuboLoose {
  id: string;
  cor: string;
  numero: number;
  fibras: Fibra[];
}

export interface Fibra {
  id: string;
  cor: string;
  numero: number;
  conectadaA?: string; // ID da fibra ou porta de splitter conectada
}

export interface Cabo {
  id: string;
  nome: string;
  tipo: '6' | '12' | '24' | '48' | '96';
  tubos: TuboLoose[];
}

export interface Splitter {
  id: string;
  tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
  balanceado: boolean;
  portaEntrada: string;
  portasSaida: string[];
}

// Tipos para as props dos componentes
export interface DiagramaFusaoProps {
  /**
   * Cabos disponíveis para o diagrama
   */
  cabos?: Cabo[];

  /**
   * Splitters disponíveis para o diagrama
   */
  splitters?: Splitter[];

  /**
   * Função chamada quando uma conexão é criada
   */
  onConexaoRealizada?: (sourceId: string, targetId: string) => void;
}
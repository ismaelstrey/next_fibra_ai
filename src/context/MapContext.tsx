'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Interface para uma rota de cabo de fibra óptica
 */
export interface Rota {
  id: string;
  nome: string;
  tipoCabo: '6' | '12' | '24' | '48' | '96';
  path: { lat: number; lng: number }[];
  profundidade?: string;
  tipoPassagem?: 'posteado' | 'subterraneo' | 'aereo';
  observacoes?: string;
  fabricante?: string;
  distancia?: number; // em metros
}

/**
 * Interface para uma caixa (CTO ou CEO)
 */
export interface Caixa {
  id: string;
  tipo: 'CTO' | 'CEO';
  nome: string;
  modelo?: string;
  capacidade?: number; // número de portas para CTO ou bandejas para CEO
  posicao: { lat: number; lng: number };
  rotaAssociada?: string; // ID da rota associada
}

/**
 * Interface para um ponto de fusão
 */
export interface PontoFusao {
  id: string;
  caixaId: string; // ID da caixa (CEO) onde está localizado
  bandeja: number;
  tubo: number;
  fibras: { origem: number; destino: number; status: 'ativo' | 'reserva' | 'programado' }[];
}

/**
 * Interface para os filtros do mapa
 */
export interface FiltrosMapa {
  tipoCaixa?: 'CTO' | 'CEO' | '';
  tipoCabo?: '6' | '12' | '24' | '48' | '96' | '';
  cidade?: string;
}

/**
 * Interface para as camadas visíveis no mapa
 */
export interface CamadasVisiveis {
  caixas: boolean;
  rotas: boolean;
  fusoes: boolean;
}

/**
 * Interface para o contexto do mapa
 */
interface MapContextType {
  rotas: Rota[];
  caixas: Caixa[];
  pontosFusao: PontoFusao[];
  filtros: FiltrosMapa;
  camadasVisiveis: CamadasVisiveis;
  modoEdicao: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null;
  tipoCaboSelecionado: '6' | '12' | '24' | '48' | '96';
  adicionarRota: (rota: Omit<Rota, 'id'>) => Rota;
  adicionarCaixa: (caixa: Omit<Caixa, 'id'>) => Caixa;
  adicionarPontoFusao: (pontoFusao: Omit<PontoFusao, 'id'>) => PontoFusao;
  atualizarFiltros: (novosFiltros: FiltrosMapa) => void;
  atualizarCamadasVisiveis: (novasCamadas: Partial<CamadasVisiveis>) => void;
  setModoEdicao: (modo: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null) => void;
  setTipoCaboSelecionado: (tipo: '6' | '12' | '24' | '48' | '96') => void;
  calcularDistanciaRota: (path: { lat: number; lng: number }[]) => number;
  buscarNoMapa: (texto: string) => { rotas: Rota[]; caixas: Caixa[] };
}

// Criação do contexto com valor inicial undefined
const MapContext = createContext<MapContextType | undefined>(undefined);

/**
 * Hook para utilizar o contexto do mapa
 * @returns {MapContextType} Objeto com o estado e funções do mapa
 */
export const useMapContext = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext deve ser usado dentro de um MapProvider');
  }
  return context;
};

/**
 * Provedor de contexto do mapa para a aplicação
 * Gerencia o estado global do mapa e suas funcionalidades
 */
export function MapProvider({ children }: { children: ReactNode }) {
  // Estado para as rotas de cabos
  const [rotas, setRotas] = useState<Rota[]>([]);

  // Estado para as caixas (CTOs e CEOs)
  const [caixas, setCaixas] = useState<Caixa[]>([]);

  // Estado para os pontos de fusão
  const [pontosFusao, setPontosFusao] = useState<PontoFusao[]>([]);

  // Estado para os filtros aplicados ao mapa
  const [filtros, setFiltros] = useState<FiltrosMapa>({});

  // Estado para as camadas visíveis no mapa
  const [camadasVisiveis, setCamadasVisiveis] = useState<CamadasVisiveis>({
    caixas: true,
    rotas: true,
    fusoes: true
  });

  // Estado para o modo de edição atual
  const [modoEdicao, setModoEdicao] = useState<'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null>(null);

  // Estado para o tipo de cabo selecionado para desenho
  const [tipoCaboSelecionado, setTipoCaboSelecionado] = useState<'6' | '12' | '24' | '48' | '96'>('12');

  /**
   * Adiciona uma nova rota ao estado
   */
  const adicionarRota = (rota: Omit<Rota, 'id'>) => {
    const novaRota: Rota = {
      ...rota,
      id: `rota-${Date.now()}`
    };

    setRotas(prev => [...prev, novaRota]);
    toast.success('Rota adicionada com sucesso!');
    return novaRota;
  };

  /**
   * Adiciona uma nova caixa ao estado
   */
  const adicionarCaixa = (caixa: Omit<Caixa, 'id'>) => {
    const novaCaixa: Caixa = {
      ...caixa,
      id: `caixa-${Date.now()}`
    };

    setCaixas(prev => [...prev, novaCaixa]);
    toast.success(`${caixa.tipo} adicionada com sucesso!`);
    return novaCaixa;
  };

  /**
   * Adiciona um novo ponto de fusão ao estado
   */
  const adicionarPontoFusao = (pontoFusao: Omit<PontoFusao, 'id'>) => {
    const novoPontoFusao: PontoFusao = {
      ...pontoFusao,
      id: `fusao-${Date.now()}`
    };

    setPontosFusao(prev => [...prev, novoPontoFusao]);
    toast.success('Ponto de fusão adicionado com sucesso!');
    return novoPontoFusao;
  };

  /**
   * Atualiza os filtros do mapa
   */
  const atualizarFiltros = (novosFiltros: FiltrosMapa) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  /**
   * Atualiza as camadas visíveis no mapa
   */
  const atualizarCamadasVisiveis = (novasCamadas: Partial<CamadasVisiveis>) => {
    setCamadasVisiveis(prev => ({ ...prev, ...novasCamadas }));
  };

  /**
   * Calcula a distância total de uma rota em metros
   */
  const calcularDistanciaRota = (path: { lat: number; lng: number }[]): number => {
    if (path.length < 2) return 0;

    let distanciaTotal = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];

      // Fórmula de Haversine para calcular distância entre dois pontos geográficos
      const R = 6371e3; // raio da Terra em metros
      const φ1 = p1.lat * Math.PI / 180;
      const φ2 = p2.lat * Math.PI / 180;
      const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
      const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c;

      distanciaTotal += distancia;
    }

    return Math.round(distanciaTotal);
  };

  /**
   * Busca elementos no mapa por texto
   */
  const buscarNoMapa = (texto: string) => {
    const textoBusca = texto.toLowerCase();

    const rotasEncontradas = rotas.filter(rota =>
      rota.nome.toLowerCase().includes(textoBusca) ||
      rota.observacoes?.toLowerCase().includes(textoBusca)
    );

    const caixasEncontradas = caixas.filter(caixa =>
      caixa.nome.toLowerCase().includes(textoBusca) ||
      caixa.modelo?.toLowerCase().includes(textoBusca)
    );

    return { rotas: rotasEncontradas, caixas: caixasEncontradas };
  };

  // Valor do contexto que será fornecido aos componentes filhos
  const contextValue: MapContextType = {
    rotas,
    caixas,
    pontosFusao,
    filtros,
    camadasVisiveis,
    modoEdicao,
    tipoCaboSelecionado,
    adicionarRota,
    adicionarCaixa,
    adicionarPontoFusao,
    atualizarFiltros,
    atualizarCamadasVisiveis,
    setModoEdicao,
    setTipoCaboSelecionado,
    calcularDistanciaRota,
    buscarNoMapa
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}
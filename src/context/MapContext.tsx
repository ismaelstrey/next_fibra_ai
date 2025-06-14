'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useApiService, RotaAPI, CaixaAPI, FusaoAPI, CidadeAPI } from '../hooks/useApiService';

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
  cidadeId: string;
  cor?: string;
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
  cidadeId: string;
  observacoes?: string;
}

/**
 * Interface para um ponto de fusão
 */
export interface PontoFusao {
  id: string;
  caixaId: string; // ID da caixa (CEO) onde está localizado
  bandeja?: number;
  fibraOrigem: number;
  fibraDestino: number;
  tuboOrigem?: string;
  tuboDestino?: string;
  status: string;
  cor?: string;
  observacoes?: string;
  rotaOrigemId: string;
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
  cidades: CidadeAPI[];
  filtros: FiltrosMapa;
  camadasVisiveis: CamadasVisiveis;
  modoEdicao: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null;
  tipoCaboSelecionado: '6' | '12' | '24' | '48' | '96';
  isLoading: boolean;
  adicionarRota: (rota: Omit<Rota, 'id'>) => Promise<Rota | null>;
  adicionarCaixa: (caixa: Omit<Caixa, 'id'>) => Promise<Caixa | null>;
  adicionarPontoFusao: (pontoFusao: Omit<PontoFusao, 'id'>) => Promise<PontoFusao | null>;
  atualizarFiltros: (novosFiltros: FiltrosMapa) => void;
  atualizarCamadasVisiveis: (novasCamadas: Partial<CamadasVisiveis>) => void;
  setModoEdicao: (modo: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null) => void;
  setTipoCaboSelecionado: (tipo: '6' | '12' | '24' | '48' | '96') => void;
  calcularDistanciaRota: (path: { lat: number; lng: number }[]) => number;
  buscarNoMapa: (texto: string) => { rotas: Rota[]; caixas: Caixa[] };
  carregarDados: (cidadeId?: string) => Promise<void>;
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
 * Função para converter uma rota da API para o formato do contexto
 */
const converterRotaApiParaContexto = (rotaApi: RotaAPI): Rota => {
  return {
    id: rotaApi.id,
    nome: rotaApi.nome,
    tipoCabo: rotaApi.tipoCabo as '6' | '12' | '24' | '48' | '96',
    path: rotaApi.coordenadas,
    profundidade: rotaApi.profundidade?.toString(),
    tipoPassagem: rotaApi.tipoPassagem.toLowerCase() as 'posteado' | 'subterraneo' | 'aereo',
    observacoes: rotaApi.observacoes,
    fabricante: rotaApi.fabricante,
    distancia: rotaApi.distancia,
    cidadeId: rotaApi.cidadeId,
    cor: rotaApi.cor
  };
};

/**
 * Função para converter uma caixa da API para o formato do contexto
 */
const converterCaixaApiParaContexto = (caixaApi: CaixaAPI): Caixa => {
  return {
    id: caixaApi.id,
    tipo: caixaApi.tipo,
    nome: caixaApi.nome,
    modelo: caixaApi.modelo,
    capacidade: caixaApi.capacidade,
    posicao: {
      lat: caixaApi.coordenadas.lat,
      lng: caixaApi.coordenadas.lng
    },
    rotaAssociada: caixaApi.rotaId,
    cidadeId: caixaApi.cidadeId,
    observacoes: caixaApi.observacoes
  };
};

/**
 * Função para converter uma fusão da API para o formato do contexto
 */
const converterFusaoApiParaContexto = (fusaoApi: FusaoAPI): PontoFusao => {
  return {
    id: fusaoApi.id,
    caixaId: fusaoApi.caixaId,
    bandeja: fusaoApi.bandejaId ? parseInt(fusaoApi.bandejaId) : undefined,
    fibraOrigem: fusaoApi.fibraOrigem,
    fibraDestino: fusaoApi.fibraDestino,
    tuboOrigem: fusaoApi.tuboOrigem,
    tuboDestino: fusaoApi.tuboDestino,
    status: fusaoApi.status,
    cor: fusaoApi.cor,
    observacoes: fusaoApi.observacoes,
    rotaOrigemId: fusaoApi.rotaOrigemId
  };
};

/**
 * Provedor de contexto do mapa para a aplicação
 * Gerencia o estado global do mapa e suas funcionalidades
 */
export function MapProvider({ children }: { children: ReactNode }) {
  // Acesso à API
  const api = useApiService();

  // Estado para as rotas de cabos
  const [rotas, setRotas] = useState<Rota[]>([]);

  // Estado para as caixas (CTOs e CEOs)
  const [caixas, setCaixas] = useState<Caixa[]>([]);

  // Estado para os pontos de fusão
  const [pontosFusao, setPontosFusao] = useState<PontoFusao[]>([]);

  // Estado para as cidades
  const [cidades, setCidades] = useState<CidadeAPI[]>([]);

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

  // Estado para indicar carregamento
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Carrega os dados da API
   */
  const carregarDados = useCallback(async (cidadeId?: string) => {
    setIsLoading(true);
    try {
      // Carrega as cidades
      const cidadesResponse = await api.cidades.listar({ limite: 100 });
      if (cidadesResponse.data.cidades) {
        setCidades(cidadesResponse.data.cidades);
      }

      // Carrega as rotas
      const rotasResponse = await api.rotas.listar({
        limite: 100,
        cidadeId: cidadeId || filtros.cidade
      });
      if (rotasResponse.data.rotas) {
        const rotasConvertidas = rotasResponse.data.rotas.map(converterRotaApiParaContexto);
        setRotas(rotasConvertidas);
      }

      // Carrega as caixas
      const caixasResponse = await api.caixas.listar({
        limite: 100,
        cidadeId: cidadeId || filtros.cidade,
        tipo: filtros.tipoCaixa
      });
      if (caixasResponse.data.caixas) {
        const caixasConvertidas = caixasResponse.data.caixas.map(converterCaixaApiParaContexto);
        setCaixas(caixasConvertidas);
      }

      // Carrega as fusões
      const fusoesResponse = await api.fusoes.listar({
        limite: 500,
        cidadeId: cidadeId || filtros.cidade
      });
      if (fusoesResponse.data.fusoes) {
        const fusoesConvertidas = fusoesResponse.data.fusoes.map(converterFusaoApiParaContexto);
        setPontosFusao(fusoesConvertidas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do mapa');
    } finally {
      setIsLoading(false);
    }
  }, [api, filtros.cidade, filtros.tipoCaixa]);

  // Carrega os dados iniciais
  useEffect(() => {
    carregarDados();

    console.log('carregarDados');
  }, []); // Adiciona array de dependências vazio para executar apenas na montagem

  /**
   * Adiciona uma nova rota ao estado e na API
   */
  const adicionarRota = async (rota: Omit<Rota, 'id'>): Promise<Rota | null> => {
    try {
      // Prepara os dados para a API
      const rotaParaApi = {
        nome: rota.nome,
        tipoCabo: rota.tipoCabo,
        fabricante: rota.fabricante,
        distancia: rota.distancia || calcularDistanciaRota(rota.path),
        profundidade: rota.profundidade ? parseFloat(rota.profundidade) : undefined,
        tipoPassagem: rota.tipoPassagem ? rota.tipoPassagem.charAt(0).toUpperCase() + rota.tipoPassagem.slice(1) : 'Posteado',
        coordenadas: rota.path,
        cor: rota.cor,
        observacoes: rota.observacoes,
        cidadeId: rota.cidadeId
      };

      // Envia para a API
      const response = await api.rotas.criar(rotaParaApi);

      if (response.data.rota) {
        const novaRota = converterRotaApiParaContexto(response.data.rota);
        setRotas(prev => [...prev, novaRota]);
        toast.success('Rota adicionada com sucesso!');
        return novaRota;
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar rota:', error);
      toast.error('Erro ao adicionar rota');
      return null;
    }
  };

  /**
   * Adiciona uma nova caixa ao estado e na API
   */
  const adicionarCaixa = async (caixa: Omit<Caixa, 'id'>): Promise<Caixa | null> => {
    try {
      // Prepara os dados para a API
      const caixaParaApi = {
        nome: caixa.nome,
        tipo: caixa.tipo,
        modelo: caixa.modelo || '',
        capacidade: caixa.capacidade || 0,
        coordenadas: {
          lat: caixa.posicao.lat,
          lng: caixa.posicao.lng
        },
        observacoes: caixa.observacoes,
        cidadeId: caixa.cidadeId,
        rotaId: caixa.rotaAssociada || ''
      };

      // Envia para a API
      const response = await api.caixas.criar(caixaParaApi);

      if (response.data.caixa) {
        const novaCaixa = converterCaixaApiParaContexto(response.data.caixa);
        setCaixas(prev => [...prev, novaCaixa]);
        toast.success(`${caixa.tipo} adicionada com sucesso!`);
        return novaCaixa;
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar caixa:', error);
      toast.error('Erro ao adicionar caixa');
      return null;
    }
  };

  /**
   * Adiciona um novo ponto de fusão ao estado e na API
   */
  const adicionarPontoFusao = async (pontoFusao: Omit<PontoFusao, 'id'>): Promise<PontoFusao | null> => {
    try {
      // Prepara os dados para a API
      const fusaoParaApi = {
        posicao: pontoFusao.fibraOrigem,
        origem: pontoFusao.tuboOrigem || `Fibra ${pontoFusao.fibraOrigem}`,
        destino: pontoFusao.tuboDestino || `Fibra ${pontoFusao.fibraDestino}`,
        cor: pontoFusao.cor,
        observacoes: pontoFusao.observacoes,
        caixaId: pontoFusao.caixaId,
        bandejaId: pontoFusao.bandeja?.toString()
      };

      // Envia para a API
      const response = await api.fusoes.criar(fusaoParaApi);

      if (response.data.fusao) {
        const novaFusao = converterFusaoApiParaContexto(response.data.fusao);
        setPontosFusao(prev => [...prev, novaFusao]);
        toast.success('Ponto de fusão adicionado com sucesso!');
        return novaFusao;
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar ponto de fusão:', error);
      toast.error('Erro ao adicionar ponto de fusão');
      return null;
    }
  };

  /**
   * Atualiza os filtros do mapa e recarrega os dados
   */
  const atualizarFiltros = (novosFiltros: FiltrosMapa) => {
    setFiltros(prev => {
      const filtrosAtualizados = { ...prev, ...novosFiltros };
      // Recarrega os dados com os novos filtros
      carregarDados(filtrosAtualizados.cidade);
      return filtrosAtualizados;
    });
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
    cidades,
    filtros,
    camadasVisiveis,
    modoEdicao,
    tipoCaboSelecionado,
    isLoading,
    adicionarRota,
    adicionarCaixa,
    adicionarPontoFusao,
    atualizarFiltros,
    atualizarCamadasVisiveis,
    setModoEdicao,
    setTipoCaboSelecionado,
    calcularDistanciaRota,
    buscarNoMapa,
    carregarDados
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}
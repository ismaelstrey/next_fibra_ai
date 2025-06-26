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
 * Agora inclui filtros avançados: status, cliente, incidente, manutenção, busca global
 */
export interface FiltrosMapa {
  tipoCaixa?: 'CTO' | 'CEO' | '';
  tipoCabo?: '6' | '12' | '24' | '48' | '96' | '';
  cidade?: string;
  status?: string;
  cliente?: string;
  incidente?: string;
  manutencao?: string;
  busca?: string;
}

/**
 * Interface para as camadas visíveis no mapa
 * Agora inclui clientes, incidentes, manutenção, spliters
 */
export interface CamadasVisiveis {
  caixas: boolean;
  rotas: boolean;
  fusoes: boolean;
  spliters?: boolean;
  clientes?: boolean;
  incidentes?: boolean;
  manutencoes?: boolean;
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
  spliters: Spliter[];
  clientes: Cliente[];
  incidentes: Incidente[];
  relatorios: Relatorio[];
  adicionarRota: (rota: Omit<Rota, 'id'>) => Promise<Rota | null>;
  removerRota: (rotaId: string) => Promise<boolean>;
  adicionarCaixa: (caixa: Omit<Caixa, 'id'>) => Promise<Caixa | null>;
  dividirRota: (rotaOriginal: Rota, pontoDiv: { lat: number; lng: number }, novaCaixa: Caixa) => Promise<{ rota1: Rota | null; rota2: Rota | null }>;
  adicionarPontoFusao: (pontoFusao: Omit<PontoFusao, 'id'>) => Promise<PontoFusao | null>;
  atualizarFiltros: (novosFiltros: FiltrosMapa) => void;
  atualizarCamadasVisiveis: (novasCamadas: Partial<CamadasVisiveis>) => void;
  setModoEdicao: (modo: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null) => void;
  setTipoCaboSelecionado: (tipo: '6' | '12' | '24' | '48' | '96') => void;
  calcularDistanciaRota: (path: { lat: number; lng: number }[]) => number;
  buscarNoMapa: (texto: string) => { rotas: Rota[]; caixas: Caixa[] };
  carregarDados: (cidadeId?: string) => Promise<void>;
  carregarSpliters: () => Promise<void>;
  carregarClientes: () => Promise<void>;
  carregarIncidentes: () => Promise<void>;
  carregarRelatorios: () => Promise<void>;

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
    fusoes: true,
    spliters: true,
    clientes: false,
    incidentes: false,
    manutencoes: false
  });

  // Estado para o modo de edição atual
  const [modoEdicao, setModoEdicao] = useState<'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null>(null);

  // Estado para o tipo de cabo selecionado para desenho
  const [tipoCaboSelecionado, setTipoCaboSelecionado] = useState<'6' | '12' | '24' | '48' | '96'>('12');

  // Estado para indicar carregamento
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estado para spliters
  const [spliters, setSpliters] = useState<Spliter[]>([]);
  // Estado para clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // Estado para incidentes
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  // Estado para relatórios
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

  // Funções para carregar dados dessas entidades
  const carregarSpliters = useCallback(async () => {
    try {
      const response = await api.spliters.listar({ limite: 100 });
      if (response.data.spliters) {
        setSpliters(response.data.spliters);
      }
    } catch (error) {
      toast.error('Erro ao carregar splitters');
    }
  }, [api]);

  const carregarClientes = useCallback(async () => {
    try {
      const response = await api.clientes.listar({ limite: 100 });
      if (response.data.clientes) {
        setClientes(response.data.clientes);
      }
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    }
  }, [api]);

  const carregarIncidentes = useCallback(async () => {
    try {
      const response = await api.incidentes.listar({ limite: 100 });
      if (response.data.incidentes) {
        setIncidentes(response.data.incidentes);
      }
    } catch (error) {
      toast.error('Erro ao carregar incidentes');
    }
  }, [api]);

  const carregarRelatorios = useCallback(async () => {
    try {
      const response = await api.relatorios.listar({ limite: 100 });
      if (response.data.relatorios) {
        setRelatorios(response.data.relatorios);
      }
    } catch (error) {
      toast.error('Erro ao carregar relatórios');
    }
  }, [api]);

  /**
   * Carrega os dados da API
   */
  const carregarDados = useCallback(async (cidadeId?: string) => {
    setIsLoading(true);
    setModoEdicao(null)
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
  }, []); // Adiciona array de dependências vazio para executar apenas na montagem


  /**
   * Calcula a distância total de uma rota

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
   * Divide uma rota em duas partes no ponto especificado
   */
  const dividirRota = async (rotaOriginal: Rota, pontoDiv: { lat: number; lng: number }, novaCaixa: Caixa): Promise<{ rota1: Rota | null; rota2: Rota | null }> => {
    try {
      // Encontra o ponto mais próximo na rota para fazer a divisão
      const path = rotaOriginal.path;
      let menorDistancia = Infinity;
      let indiceDivisao = 0;

      for (let i = 0; i < path.length - 1; i++) {
        const distancia = calcularDistanciaEntrePontos(pontoDiv, path[i]);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          indiceDivisao = i;
        }
      }

      // Divide o caminho em duas partes
      const path1 = [...path.slice(0, indiceDivisao + 1), pontoDiv];
      const path2 = [pontoDiv, ...path.slice(indiceDivisao + 1)];

      // Calcula a proporção de capilares para cada rota baseado no comprimento
      const comprimentoTotal = calcularDistanciaRota(path);
      const comprimento1 = calcularDistanciaRota(path1);
      const comprimento2 = calcularDistanciaRota(path2);

      const proporcao1 = comprimento1 / comprimentoTotal;
      const proporcao2 = comprimento2 / comprimentoTotal;

      // Obtém a quantidade original de capilares
      const quantidadeOriginal = parseInt(rotaOriginal.tipoCabo) || 0;
      const capilares1 = Math.ceil(quantidadeOriginal * proporcao1);
      const capilares2 = Math.floor(quantidadeOriginal * proporcao2);

      // Mapeia a quantidade de capilares para os tipos válidos
      const mapearTipoCabo = (quantidade: number): '6' | '12' | '24' | '48' | '96' => {
        if (quantidade <= 6) return '6';
        if (quantidade <= 12) return '12';
        if (quantidade <= 24) return '24';
        if (quantidade <= 48) return '48';
        return '96';
      };

      // Cria a primeira rota (do início até a nova caixa)
      const dadosRota1 = {
        nome: `${rotaOriginal.nome} - Parte 1`,
        tipoCabo: mapearTipoCabo(capilares1),
        fabricante: rotaOriginal.fabricante,
        observacoes: `Rota dividida - Primeira parte (${capilares1} capilares)`,
        cidadeId: rotaOriginal.cidadeId,
        path: path1
      };

      // Cria a segunda rota (da nova caixa até o fim)
      const dadosRota2 = {
        nome: `${rotaOriginal.nome} - Parte 2`,
        tipoCabo: mapearTipoCabo(capilares2),
        fabricante: rotaOriginal.fabricante,
        observacoes: `Rota dividida - Segunda parte (${capilares2} capilares)`,
        cidadeId: rotaOriginal.cidadeId,
        path: path2
      };

      // Adiciona as novas rotas
      const [novaRota1, novaRota2] = await Promise.all([
        adicionarRota(dadosRota1),
        adicionarRota(dadosRota2)
      ]);

      // Remove a rota original
      if (novaRota1 && novaRota2) {
        await removerRota(rotaOriginal.id);

        // Dispara evento para abrir o gerenciador de fusões
        const evento = new CustomEvent('rota-dividida', {
          detail: {
            rota1: novaRota1,
            rota2: novaRota2,
            caixaConexao: novaCaixa
          }
        });
        window.dispatchEvent(evento);

        toast.success('Rota dividida com sucesso! Capilares redistribuídos proporcionalmente.');
      }

      return { rota1: novaRota1, rota2: novaRota2 };
    } catch (error) {
      console.error('Erro ao dividir rota:', error);
      toast.error('Erro ao dividir rota');
      return { rota1: null, rota2: null };
    }
  };

  /**
   * Calcula a distância entre dois pontos geográficos
   */
  const calcularDistanciaEntrePontos = (ponto1: { lat: number; lng: number }, ponto2: { lat: number; lng: number }): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = ponto1.lat * Math.PI / 180;
    const φ2 = ponto2.lat * Math.PI / 180;
    const Δφ = (ponto2.lat - ponto1.lat) * Math.PI / 180;
    const Δλ = (ponto2.lng - ponto1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /**
   * Adiciona uma nova caixa ao estado e na API
   * Se a caixa estiver associada a uma rota, divide a rota automaticamente
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

        // Se a caixa está associada a uma rota, divide a rota
        if (caixa.rotaAssociada) {
          const rotaOriginal = rotas.find(r => r.id === caixa.rotaAssociada);
          if (rotaOriginal) {
            await dividirRota(rotaOriginal, caixa.posicao, novaCaixa);
          }
        }

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
   * Agora suporta busca global e filtros avançados
   */
  const atualizarFiltros = (novosFiltros: FiltrosMapa) => {
    setFiltros(prev => {
      const filtrosAtualizados = { ...prev, ...novosFiltros };
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
   * Busca global no mapa por texto, cliente, incidente, status, etc.
   * Agora inclui spliters, clientes e incidentes
   */
  const buscarNoMapa = (texto: string) => {
    const textoBusca = texto.toLowerCase();
    return {
      rotas: rotas.filter(rota => rota.nome.toLowerCase().includes(textoBusca) || rota.observacoes?.toLowerCase().includes(textoBusca)),
      caixas: caixas.filter(caixa => caixa.nome.toLowerCase().includes(textoBusca) || caixa.modelo?.toLowerCase().includes(textoBusca)),
      spliters: spliters.filter(spliter => spliter.nome?.toLowerCase().includes(textoBusca) || spliter.tipo?.toLowerCase().includes(textoBusca)),
      clientes: clientes.filter(cliente => cliente.nome?.toLowerCase().includes(textoBusca) || cliente.email?.toLowerCase().includes(textoBusca)),
      incidentes: incidentes.filter(incidente => incidente.titulo?.toLowerCase().includes(textoBusca) || incidente.status?.toLowerCase().includes(textoBusca)),
    };
  };

  /**
   * Remove uma rota do estado e da API
   */
  const removerRota = async (rotaId: string): Promise<boolean> => {
    try {
      // Envia para a API
      const response = await api.rotas.excluir(rotaId);

      if (response.status === 200) {
        // Atualiza o estado local removendo a rota
        setRotas(prev => prev.filter(rota => rota.id !== rotaId));
        toast.success('Rota removida com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao remover rota:', error);
      toast.error('Erro ao remover rota');
      return false;
    }
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
    clientes,
    incidentes,
    relatorios,
    spliters,
    adicionarRota,
    removerRota,
    adicionarCaixa,
    dividirRota,
    adicionarPontoFusao,
    atualizarFiltros,
    atualizarCamadasVisiveis,
    setModoEdicao,
    setTipoCaboSelecionado,
    calcularDistanciaRota,
    buscarNoMapa,
    carregarDados,
    carregarSpliters,
    carregarClientes,
    carregarIncidentes,
    carregarRelatorios
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

/**
 * Interface para um splitter (spliter)
 */
export interface Spliter {
  id: string;
  nome: string;
  atendimento: boolean;
  tipo: string;
  caixaId: string;
  capilarSaidaId?: string | null;
  capilarEntradaId?: string | null;
}

/**
 * Interface para um cliente
 */
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  apartamento?: string;
  endereco?: string;
  casa?: string;
  numero?: string;
  potencia?: number;
  wifi?: string;
  senhaWifi?: string;
  neutraId?: string;
  portaId?: string;
}

/**
 * Interface para incidente
 */
export interface Incidente {
  id: string;
  titulo: string;
  descricao: string;
  dataOcorrencia: string;
  dataResolucao?: string | null;
  status: 'Aberto' | 'Em análise' | 'Em resolução' | 'Resolvido' | 'Fechado';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  impacto: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  solucao?: string | null;
  caixaId?: string;
  capilarId?: string;
  emendaId?: string;
  clienteId?: string;
  equipamentoId?: string;
}

/**
 * Interface para relatório
 */
export interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'manutencao' | 'instalacao' | 'desempenho' | 'incidente' | 'outro';
  dataInicio: string;
  dataFim: string;
  dados?: Record<string, any>;
  cidadeId?: string;
  caixaId?: string;
  rotaId?: string;
  manutencaoId?: string;
  observacoes?: string;
}

/**
 * Calcula a distância total de uma rota baseada em um array de objetos {lat, lng}.
 * @param path Array de coordenadas representando a rota
 * @returns Distância total em metros
 */
function calcularDistanciaRota(path: { lat: number; lng: number }[]): number {
  if (!Array.isArray(path) || path.length < 2) return 0;
  let distancia = 0;
  for (let i = 1; i < path.length; i++) {
    const { lat: lat1, lng: lng1 } = path[i - 1];
    const { lat: lat2, lng: lng2 } = path[i];
    // Fórmula de Haversine para calcular distância entre dois pontos geográficos
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distancia += R * c;
  }
  return Math.round(distancia);
}
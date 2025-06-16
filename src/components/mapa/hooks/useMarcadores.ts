import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import useMapa from '@/hooks/useMapa';
import { MarcadorInfo } from '../types/mapTypes';

/**
 * Hook para gerenciar os marcadores (CTOs e CEOs) no mapa
 */
export const useMarcadores = (mapRef: React.RefObject<google.maps.Map | null>) => {
  // Estado para armazenar os marcadores (CTOs e CEOs)
  const [marcadores, setMarcadores] = useState<MarcadorInfo[]>([]);
  
  // Estado para controlar o modal de adicionar CTO/CEO
  const [modalAberto, setModalAberto] = useState(false);
  const [posicaoClicada, setPosicaoClicada] = useState<google.maps.LatLngLiteral | null>(null);
  const [rotaAssociada, setRotaAssociada] = useState<string | undefined>(undefined);

  // Referência para armazenar os marcadores avançados criados
  const advancedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Obtém o estado do mapa do hook useMapa
  const {
    modoEdicao,
    camadasVisiveis,
    filtros,
    adicionarCaixa,
    caixas, // Adicionado para acessar as caixas da API
  } = useMapa();
  
  /**
   * Efeito para carregar os marcadores existentes da API
   */
  useEffect(() => {
    if (!mapRef.current || !caixas || caixas.length === 0) return;
    
    // Importa a biblioteca de marcadores
    const carregarMarcadores = async () => {
      try {
        // Converte as caixas da API em marcadores
        const marcadoresDaAPI = caixas.map(caixa => {
          const iconUrl = caixa.tipo === 'CTO' ? '/icons/cto-icon.svg' : '/icons/ceo-icon.svg';
          const title = caixa.rotaAssociada 
            ? `${caixa.tipo} ${caixa.nome} - Vinculada à rota ${caixa.rotaAssociada}` 
            : `${caixa.tipo} ${caixa.nome}`;
          
          // Cria um objeto LatLng do Google Maps
          const position = new google.maps.LatLng(
            caixa.posicao.lat,
            caixa.posicao.lng
          );
          
          return {
            position,
            icon: iconUrl,
            title: title,
            tipo: caixa.tipo,
            draggable: modoEdicao === 'editar',
            visible: camadasVisiveis.caixas
          } as MarcadorInfo;
        });
        
        // Atualiza o estado dos marcadores
        setMarcadores(marcadoresDaAPI);
        
        // Recria os marcadores avançados no mapa
        criarMarcadoresAvancados(true);
      } catch (error) {
        console.error('Erro ao carregar marcadores da API:', error);
      }
    };
    
    carregarMarcadores();
  }, [caixas, modoEdicao, camadasVisiveis.caixas]);

  /**
   * Adiciona um marcador (CTO ou CEO) no mapa
   */
  const adicionarMarcador = useCallback((posicao: google.maps.LatLng, tipo: 'CTO' | 'CEO') => {
    if (!mapRef.current) return;

    const iconUrl = tipo === 'CTO' ? '/icons/cto-icon.svg' : '/icons/ceo-icon.svg';

    const novoMarcador: MarcadorInfo = {
      position: posicao,
      icon: iconUrl,
      title: `${tipo} - Clique para editar`,
      tipo: tipo,
      draggable: true
    };
   
    setMarcadores(prev => [...prev, novoMarcador]);

    // Verifica se há uma cidade selecionada nos filtros
    if (!filtros.cidade) {
      toast.error('Selecione uma cidade antes de adicionar uma ' + tipo);
      return;
    }

    // Adiciona a caixa ao estado global do mapa
    adicionarCaixa({
      tipo,
      nome: `${tipo} ${new Date().toLocaleTimeString()}`,
      posicao: {
        lat: posicao.lat(),
        lng: posicao.lng()
      },
      cidadeId: filtros.cidade, // Adiciona o cidadeId da cidade selecionada
      modelo: tipo === 'CTO' ? 'Padrão' : 'CEO Padrão', // Modelo padrão necessário conforme API
      capacidade: tipo === 'CTO' ? 8 : 12 // Capacidade padrão necessária conforme API
    });
  }, [adicionarCaixa, filtros.cidade, mapRef]);

  /**
   * Adiciona um marcador (CTO ou CEO) vinculado a uma rota
   */
  const adicionarMarcadorNaRota = useCallback((event: google.maps.PolyMouseEvent, rota: any) => {
    if (!event.latLng || !mapRef.current) return;
    
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    const latLng = {lat, lng};

    if (latLng?.lat === undefined || latLng.lng === undefined) return;

    // Verifica se está no modo de adicionar CTO ou CEO
    if (modoEdicao === 'cto' || modoEdicao === 'ceo') {
      // Cria um novo marcador na posição do clique
      const tipo = modoEdicao === 'cto' ? 'CTO' : 'CEO';
      
      if (!mapRef.current) return;

      const iconUrl = tipo === 'CTO' ? '/icons/cto-icon.svg' : '/icons/ceo-icon.svg';
      
      const novoMarcador: MarcadorInfo = {
        position: event.latLng,
        icon: iconUrl,
        title: `${tipo} - Vinculada à rota ${rota.nome}`,
        tipo: tipo,
        draggable: true
      };

      setMarcadores(prev => [...prev, novoMarcador]);

      // Verifica se há uma cidade selecionada nos filtros
      if (!rota.cidadeId || !filtros.cidade) {
        toast.error('Selecione uma cidade antes de adicionar uma ' + tipo);
        return;
      }

      // Adiciona a caixa ao estado global do mapa, vinculada à rota
      adicionarCaixa({
        tipo,
        nome: `${tipo} ${new Date().toLocaleTimeString()} - ${rota.nome}`,
        posicao: {
          lat,
          lng
        },
        cidadeId: rota.cidadeId || filtros.cidade,
        rotaAssociada: rota.id, // Vincula a caixa à rota clicada
        modelo: tipo === 'CTO' ? 'Padrão' : 'CEO Padrão',
        capacidade: tipo === 'CTO' ? 8 : 12
      });
      
      toast.success(`${tipo} adicionada e vinculada à rota ${rota.nome}`);
    }
  }, [modoEdicao, adicionarCaixa, filtros.cidade, mapRef]);

  /**
   * Efeito para atualizar a visibilidade dos marcadores
   */
  useEffect(() => {
    setMarcadores(prev => prev.map(marcador => ({
      ...marcador,
      visible: camadasVisiveis.caixas
    })));
  }, [camadasVisiveis.caixas]);

  /**
   * Filtra os marcadores visíveis
   */
  const marcadoresFiltrados = useCallback(() => {
    return marcadores;
  }, [marcadores]);

  /**
   * Cria os marcadores avançados no mapa
   */
  const criarMarcadoresAvancados = useCallback(async (isLoaded: boolean) => {
    if (!isLoaded || !mapRef.current) return;
    
    // Remove todos os marcadores avançados existentes
    advancedMarkersRef.current.forEach(marker => {
      marker.map = null;
    });
    advancedMarkersRef.current = [];
    
    // Obtém os marcadores visíveis
    const marcadoresVisiveis = marcadoresFiltrados();
    
    // Importa a biblioteca de marcadores
    try {
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      
      // Cria cada marcador
      marcadoresVisiveis.forEach(marcador => {
        // Cria o elemento para o ícone
        const iconElement = document.createElement('img');
        iconElement.src = marcador.icon;
        iconElement.style.width = '32px';
        iconElement.style.height = '32px';
        
        // Cria o marcador avançado diretamente no mapa
        const advancedMarker = new AdvancedMarkerElement({
          position: marcador.position,
          map: mapRef.current,
          title: marcador.title,
          content: iconElement,
          gmpDraggable: modoEdicao === 'editar'
        });
        
        // Adiciona evento de clique ao marcador
        advancedMarker.addListener('click', () => {
          // Se estiver no modo de edição, abre o modal
          if (modoEdicao === 'editar') {
            setPosicaoClicada({
              lat: marcador.position.lat(),
              lng: marcador.position.lng()
            });
            // Extrai o ID da rota associada do título do marcador, se existir
            const rotaMatch = marcador.title.match(/Vinculada à rota (.+)$/);
            setRotaAssociada(rotaMatch ? rotaMatch[1] : undefined);
            setModalAberto(true);
          }
        });
        
        // Armazena o marcador na referência
        advancedMarkersRef.current.push(advancedMarker);
      });
    } catch (error) {
      console.error('Erro ao carregar a biblioteca de marcadores:', error);
    }
  }, [marcadoresFiltrados, modoEdicao, mapRef]);

  /**
   * Limpa os marcadores avançados
   */
  const limparMarcadoresAvancados = useCallback(() => {
    advancedMarkersRef.current.forEach(marker => {
      marker.map = null;
    });
    advancedMarkersRef.current = [];
  }, []);

  return {
    marcadores,
    setMarcadores,
    modalAberto,
    setModalAberto,
    posicaoClicada,
    setPosicaoClicada,
    rotaAssociada,
    setRotaAssociada,
    adicionarMarcador,
    adicionarMarcadorNaRota,
    marcadoresFiltrados,
    criarMarcadoresAvancados,
    limparMarcadoresAvancados
  };
};
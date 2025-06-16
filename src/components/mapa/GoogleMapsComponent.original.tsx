'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polyline } from '@react-google-maps/api';
import { toast } from 'sonner';


import useMapa, { Rota } from '@/hooks/useMapa';
import { getFiberColor } from '@/functions/color';
import AddCaixaModal from './AddCaixaModal';
import { center, mapContainerStyle, mapOptions, tiposCabos } from '@/contants';

/**
 * Interface para a biblioteca de marcadores do Google Maps
 */
declare global {
  namespace google.maps {
    interface MarkerLibrary {
      AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
    }
  }
}

/**
 * Tipos de bibliotecas do Google Maps necessárias para o componente
 */
type Libraries = ("drawing" | "geometry" | "places" | "visualization" | "marker")[];



/**
 * Interface para as propriedades do componente
 */
interface GoogleMapsComponentProps {
  /**
   * Chave da API do Google Maps
   */
  apiKey: string;

  /**
   * Callback para quando o mapa é carregado
   */
  onMapLoad?: (map: google.maps.Map) => void;

  /**
   * Callback para quando uma rota é desenhada
   */
  onRotaDesenhada?: (path: google.maps.LatLng[]) => void;
}

/**
 * Componente do Google Maps para visualização e gerenciamento da infraestrutura de fibra óptica
 */
// Componente do Google Maps para visualização e gerenciamento da infraestrutura de fibra óptica
const GoogleMapsComponent = ({
  apiKey,
  onMapLoad,
  onRotaDesenhada
}: GoogleMapsComponentProps) => {
  // Referência para o mapa
  const mapRef = useRef<google.maps.Map | null>(null);

  // Estado para armazenar as rotas desenhadas
  const [rotas, setRotas] = useState<google.maps.Polyline[]>([]);

  // Interface para armazenar informações dos marcadores
  interface MarcadorInfo {
    position: google.maps.LatLng;
    icon: string;
    title: string;
    tipo: 'CTO' | 'CEO';
    draggable: boolean;
  }

  // Estado para armazenar os marcadores (CTOs e CEOs)
  const [marcadores, setMarcadores] = useState<MarcadorInfo[]>([]);

  // Estado para controlar o modo de desenho
  const [drawingMode, setDrawingMode] = useState<google.maps.drawing.OverlayType | null>(null);

  // Estado para controlar o modal de adicionar CTO/CEO
  const [modalAberto, setModalAberto] = useState(false);
  const [posicaoClicada, setPosicaoClicada] = useState<google.maps.LatLngLiteral | null>(null);
  const [rotaAssociada, setRotaAssociada] = useState<string | undefined>(undefined);

  // Obtém o estado do mapa do hook useMapa
  const {
    modoEdicao,
    tipoCaboSelecionado,
    camadasVisiveis,
    filtros,
    adicionarRota,
    adicionarCaixa,
    setModoEdicao,
   caixas,
    rotas: rotasGlobais,
  } = useMapa();

  // Bibliotecas necessárias
  const libraries = useState<Libraries>(['drawing', 'geometry', 'marker']);

  // Efeito para inicializar o mapa

  // Carrega a API do Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries[0]
  });

  /**
   * Callback para quando o mapa é carregado
   */
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (onMapLoad) onMapLoad(map);
  }, [onMapLoad]);

  /**
   * Callback para quando o desenho de uma rota é completada
   */
  const handlePolylineComplete = useCallback((polyline: google.maps.Polyline) => {
    // Aplica a cor baseada no tipo de cabo selecionado
    polyline.setOptions({
      strokeColor: tiposCabos[tipoCaboSelecionado as keyof typeof tiposCabos] || '#FF0000',
      editable: true,
      draggable: true
    });

    // Adiciona a nova rota ao estado
    setRotas(prev => [...prev, polyline]);

    // Adiciona a rota ao estado global do mapa
    const path = polyline.getPath().getArray();
    const pathArray = path.map(point => ({
      lat: point.lat(),
      lng: point.lng()
    }));
console.log(filtros)
    // Verifica se há uma cidade selecionada nos filtros
    if (!filtros.cidade) {
      toast.error('Selecione uma cidade antes de adicionar uma rota');
      return;
    }
    
    adicionarRota({
      nome: `Rota ${new Date().toLocaleTimeString()}`,
      tipoCabo: tipoCaboSelecionado,
      path: pathArray,
      cidadeId: filtros.cidade, // Adiciona o cidadeId da cidade selecionada
      tipoPassagem: 'posteado' // Valor padrão necessário conforme API
    });

    // Chama o callback se existir
    if (onRotaDesenhada) {
      onRotaDesenhada(path);
    }
  }, [tipoCaboSelecionado, onRotaDesenhada, adicionarRota]);

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

    console.log(filtros)
    if (!filtros.cidade) {
      toast.error('Selecione uma cidade antes de adicionar uma ' + tipo);
      return;
    }
console.log("Adicionando caixa...")
    // Adiciona a caixa ao estado global do mapa
    console.log("Adicionando marcador...")
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
  }, [adicionarCaixa]);

  /**
   * Efeito para atualizar a visibilidade das rotas
  const */


  useEffect(() => {
    // Atualiza a visibilidade das rotas
    rotas.forEach(rota => {
      rota.setVisible(camadasVisiveis.rotas);
    });

    setMarcadores(prev => prev.map(marcador => ({
      ...marcador,
      visible: camadasVisiveis.caixas
    })))


  }, [camadasVisiveis.rotas, rotas]);
console.log(marcadores)
  /**
   * Efeito para filtrar os marcadores visíveis
   */
  const marcadoresFiltrados = useCallback(() => {
   
    return marcadores.filter(marcador => 
      camadasVisiveis.caixas &&
      (!filtros.tipoCaixa || marcador.title.includes(filtros.tipoCaixa || ''))
    );
  
  }, [camadasVisiveis.caixas, filtros.tipoCaixa, marcadores]);


  // Função para lidar com cliques no mapa para adicionar CTO ou CEO
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    console.log(event, modoEdicao)
    if (!event.latLng || !mapRef.current) return;
    if (modoEdicao === 'cto') {
      adicionarMarcador(event.latLng, 'CTO');
    } else if (modoEdicao === 'ceo') {
      adicionarMarcador(event.latLng, 'CEO');
    }
  }, [modoEdicao, adicionarMarcador]);
  
  // Função para lidar com cliques em uma rota (Polyline) para adicionar CTO ou CEO vinculada à rota
  const handlePolylineClick = useCallback((event: google.maps.PolyMouseEvent, rota: Rota) => {
    if (!event.latLng || !mapRef.current) return;
    const lat = event.latLng?.lat()
    const lng = event.latLng?.lng()
    const latLng = {lat, lng}


    if (latLng?.lat === undefined || latLng.lng === undefined) return;
   

    // Verifica se está no modo de adicionar CTO ou CEO
    if (modoEdicao === 'cto' || modoEdicao === 'ceo') {
      // Cria um novo marcador na posição do clique
      const tipo = modoEdicao === 'cto' ? 'CTO' : 'CEO';
      
      if (!mapRef.current) return;

      const iconUrl = tipo === 'CTO' ? '/icons/cto-icon.svg' : '/icons/ceo-icon.svg';
      console.log(latLng)
      const novoMarcador: MarcadorInfo = {
        position:event.latLng,
        icon: iconUrl,
        title: `${tipo} - Vinculada à rota ${rota.nome}`,
        tipo: tipo,
        draggable: true
      };

      console.log(novoMarcador)

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
    } else {
      // Se não estiver no modo de adicionar CTO ou CEO, apenas exibe informações da rota
      console.log('Rota clicada:', rota);
    }
  }, [modoEdicao, adicionarCaixa, filtros.cidade, mapRef]);
  
  // Função para lidar com duplo clique em uma rota para ativar o modo de edição
  const handlePolylineDblClick = useCallback((event: google.maps.PolyMouseEvent, rota: Rota) => {
    // Previne a propagação do evento para evitar que o mapa também receba o evento
    console.log('Evento Polyline dbClick:', event, modoEdicao)
    if (event.domEvent) {
      event.domEvent.stopPropagation();
    }
    
    // Ativa o modo de edição
    setModoEdicao('editar');
    
    // Exibe uma mensagem informando que o modo de edição foi ativado
    toast.success(`Modo de edição ativado para a rota ${rota.nome}`);
    
    console.log('Modo de edição ativado para a rota:', rota);
  }, [setModoEdicao]);


  //   const handlePolylineRightClick = useCallback((event: google.maps.PolyMouseEvent, rota: Rota) => {
  
    
  //   if (event.domEvent) {
  //     event.domEvent.preventDefault();
  //     event.domEvent.stopPropagation();
  //   }
    
  //   // Ativa o modo de edição
  // setModalAberto(true);
    
  //   // Exibe uma mensagem informando que o modo de edição foi ativado
  //   toast.success(`Modo de edição ativado para a rota ${rota.nome}`);
    
  //   console.log('Modo de edição ativado para a rota:', rota);
  // }, [setModoEdicao]);
  // // Efeito para controlar a visibilidade do DrawingManager baseado no modo de edição
  // useEffect(() => {
  //   if (modoEdicao === 'rota') {
  //     setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
  //   } else {
  //     setDrawingMode(null);
  //   }
  // }, [modoEdicao]);

  const handlePolylineRightClick = useCallback((event: google.maps.PolyMouseEvent, rota: any) => {
  if (!event.latLng || !mapRef.current) return;
  
  // Previne o menu de contexto do navegador
  if (event.domEvent) {
    event.domEvent.preventDefault();
    event.domEvent.stopPropagation();
  }
  
  // Abre o modal para edição da rota
  setPosicaoClicada({
    lat: event.latLng.lat(),
    lng: event.latLng.lng()
  });
  setRotaAssociada(rota.id);
  setModalAberto(true);
  
  toast.info(`Clique com botão direito na rota ${rota.nome}`);
}, [mapRef, setPosicaoClicada, setRotaAssociada, setModalAberto]);
  
  // Referência para armazenar os marcadores avançados criados
  const advancedMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Efeito para criar os AdvancedMarkerElement quando o mapa estiver carregado
  useEffect(() => {
   
    if (!isLoaded || !mapRef.current) return;
    
    // Função para limpar marcadores existentes
    const limparMarcadores = async () => {
      // Remove todos os marcadores avançados existentes
      advancedMarkersRef.current.forEach(marker => {
        marker.map = null;
      });
      advancedMarkersRef.current = [];
       console.log('oi')
      // Obtém os marcadores visíveis
      const marcadoresVisiveis = marcadoresFiltrados();
      console.log(marcadoresVisiveis)
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
    };
    
    limparMarcadores();
    
    // Limpa os marcadores quando o componente for desmontado
    return () => {
      advancedMarkersRef.current.forEach(marker => {
        marker.map = null;
      });
      advancedMarkersRef.current = [];
    };
  }, [isLoaded, marcadoresFiltrados, modoEdicao]);

  // Renderiza mensagem de erro se houver problema ao carregar a API
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>Erro ao carregar o mapa</p>
          <p className="text-xs">{loadError.message}</p>
        </div>
      </div>
    );
  }

  // Renderiza mensagem de carregamento enquanto a API está sendo carregada
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      options={mapOptions}
      onLoad={handleMapLoad}
      onClick={handleMapClick}
    >
      {/* Gerenciador de desenho para rotas */}
      {isLoaded && (
        <DrawingManager
          options={{
            drawingMode: drawingMode,
            drawingControl: false, // Desabilita os controles nativos, usaremos nosso próprio painel
            polylineOptions: {
              strokeColor: tiposCabos[tipoCaboSelecionado as keyof typeof tiposCabos] || '#FF0000',
              strokeWeight: 3,
              editable: true,
              draggable: true
            }
          }}
          onPolylineComplete={handlePolylineComplete}
        />
      )}

      {/* Renderiza as rotas existentes */}

      

            {camadasVisiveis.rotas && rotasGlobais.map((rota, index) => {     
        const path = rota.path
        return (
          <Polyline
            onClick={(e) => handlePolylineClick(e, rota)}
            onDblClick={(e) => handlePolylineDblClick(e, rota)}
            onRightClick={(e) => handlePolylineRightClick(e, rota)}
            key={`rota-${index}`}
            path={path}            
            options={{
              strokeColor:rota.cor ||getFiberColor(rota.tipoCabo),
              strokeWeight:  5,
              editable: modoEdicao === 'editar',
              draggable: modoEdicao === 'editar'
            }}
          />
        );
      })}

      {/* Os marcadores avançados são criados e gerenciados diretamente no useEffect */}

      {/* Modal para adicionar CTO ou CEO */}
      {posicaoClicada && (
        <AddCaixaModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          position={posicaoClicada}
          rotaAssociada={rotaAssociada}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMapsComponent;
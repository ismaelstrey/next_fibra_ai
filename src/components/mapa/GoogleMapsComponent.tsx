'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polyline } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';

import useMapa from '@/hooks/useMapa';
import { getFiberColor } from '@/functions/color';

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
 * Configurações do mapa
 */
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

/**
 * Centro inicial do mapa (pode ser ajustado para a localização padrão desejada)
 */
const center = {
  lat: -23.550520, // São Paulo como exemplo
  lng: -46.633308
};

/**
 * Opções do mapa
 */
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  center: {lat: -29.572421, lng: -50.798587},
  zoom: 15,
  clickableIcons: false, // Desabilita os ícones clicáveis
  mapTypeId: 'roadmap', // Tipo de mapa
  gestureHandling: 'greedy', // Permite gestos de zoom e rotação
  mapId: '973baf8ee9c2faa5fb1f9d99', // ID necessário para AdvancedMarkerElement
};

/**
 * Opções para o gerenciador de desenho
 */
const drawingManagerOptions = {
  drawingControl: true,
  drawingControlOptions: {
    position: 2, // google.maps.ControlPosition.TOP_CENTER
    drawingModes: ['polyline'] // Apenas desenho de linhas para rotas de cabos
  },
  polylineOptions: {
    strokeColor: '#FF0000',
    strokeWeight: 3,
    editable: true,
    draggable: true,
  }
};

/**
 * Tipos de cabos disponíveis com suas cores correspondentes
 */
const tiposCabos = {
  '6': '#3498db',   // Azul
  '12': '#2ecc71',  // Verde
  '24': '#f1c40f',  // Amarelo
  '48': '#e67e22',  // Laranja
  '96': '#e74c3c'   // Vermelho
};

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

  // Obtém o estado do mapa do hook useMapa
  const {
    modoEdicao,
    tipoCaboSelecionado,
    camadasVisiveis,
    filtros,
    adicionarRota,
    adicionarCaixa,
    rotas: rotasGlobais,
  } = useMapa();

  // Bibliotecas necessárias
  const libraries = useState<Libraries>(['drawing', 'geometry', 'marker']);

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
   */
  useEffect(() => {
    // Atualiza a visibilidade das rotas
    rotas.forEach(rota => {
      rota.setVisible(camadasVisiveis.rotas);
    });
  }, [camadasVisiveis.rotas, rotas]);

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
  
  // Efeito para controlar a visibilidade do DrawingManager baseado no modo de edição
  useEffect(() => {
    if (modoEdicao === 'rota') {
      setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
    } else {
      setDrawingMode(null);
    }
  }, [modoEdicao]);
  
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

  console.log("Renderizando mapa...")
  console.log(mapRef.current)
  console.log(mapOptions)
  rotas && console.log(rotasGlobais)

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
   
      {camadasVisiveis.rotas && rotas.map((rota, index) => {     
        const path = rota.getPath().getArray();
        return (
          <Polyline
            key={`rota-${index}`}
            path={path}
            options={{
              strokeColor: rota.get('strokeColor'),
              strokeWeight: rota.get('strokeWeight'),
              editable: modoEdicao === 'editar',
              draggable: modoEdicao === 'editar'
            }}
          />
        );
      })}
            {camadasVisiveis.rotas && rotasGlobais.map((rota, index) => {     
        const path = rota.path
        return (
          <Polyline
            key={`rota-${index}`}
            path={path}
            options={{
              strokeColor:rota.cor ||getFiberColor(rota.tipoCabo),
              strokeWeight:  3,
              editable: modoEdicao === 'editar',
              draggable: modoEdicao === 'editar'
            }}
          />
        );
      })}

      {/* Os marcadores avançados são criados e gerenciados diretamente no useEffect */}
    </GoogleMap>
  );
};

export default GoogleMapsComponent;
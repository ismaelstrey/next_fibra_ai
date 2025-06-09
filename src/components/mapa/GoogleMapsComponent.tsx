'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polyline, Marker } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';

/**
 * Tipos de bibliotecas do Google Maps necessárias para o componente
 */
type Libraries = ("drawing" | "geometry" | "places" | "visualization")[];

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
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
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
  
  /**
   * Camadas visíveis no mapa
   */
  camadasVisiveis?: {
    caixas: boolean;
    rotas: boolean;
    fusoes: boolean;
  };
  
  /**
   * Filtros aplicados ao mapa
   */
  filtros?: {
    tipoCaixa?: string;
    tipoCabo?: string;
    cidade?: string;
  };
}

/**
 * Componente do Google Maps para visualização e gerenciamento da infraestrutura de fibra óptica
 */
// Dentro do componente, após o carregamento da API
const GoogleMapsComponent = ({
  apiKey,
  onMapLoad,
  onRotaDesenhada,
  camadasVisiveis = { caixas: true, rotas: true, fusoes: true },
  filtros = {}
}: GoogleMapsComponentProps) => {
  // Referência para o mapa
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Estado para armazenar as rotas desenhadas
  const [rotas, setRotas] = useState<google.maps.Polyline[]>([]);
  
  // Estado para armazenar os marcadores (CTOs e CEOs)
  const [marcadores, setMarcadores] = useState<google.maps.Marker[]>([]);
  
  // Estado para o tipo de cabo selecionado
  const [tipoCaboSelecionado, setTipoCaboSelecionado] = useState<string>('12');
  
  // Bibliotecas necessárias
  const libraries = useState<Libraries>(['drawing', 'geometry']);

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
   * Callback para quando o desenho de uma rota é completado
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
    
    // Notifica sobre a nova rota
    toast.success('Rota desenhada com sucesso!');
    
    // Chama o callback se existir
    if (onRotaDesenhada) {
      const path = polyline.getPath().getArray();
      onRotaDesenhada(path);
    }
  }, [tipoCaboSelecionado, onRotaDesenhada]);

  /**
   * Adiciona um marcador (CTO ou CEO) no mapa
   */
  const adicionarMarcador = useCallback((posicao: google.maps.LatLng, tipo: 'CTO' | 'CEO') => {
    if (!mapRef.current) return;
    
    const icone = {
      url: tipo === 'CTO' ? '/icons/cto-icon.svg' : '/icons/ceo-icon.svg',
      scaledSize: new google.maps.Size(32, 32)
    };
    
    const novoMarcador = new google.maps.Marker({
      position: posicao,
      map: mapRef.current,
      icon: icone,
      draggable: true,
      title: `${tipo} - Clique para editar`
    });
    
    setMarcadores(prev => [...prev, novoMarcador]);
    toast.success(`${tipo} adicionado com sucesso!`);
  }, []);

  /**
   * Efeito para atualizar a visibilidade das camadas
   */
  useEffect(() => {
    // Atualiza a visibilidade das rotas
    rotas.forEach(rota => {
      rota.setVisible(camadasVisiveis.rotas);
    });
    
    // Atualiza a visibilidade dos marcadores
    marcadores.forEach(marcador => {
      marcador.setVisible(
        camadasVisiveis.caixas && 
        (!filtros.tipoCaixa || (marcador.getTitle()?.includes(filtros.tipoCaixa || '') ?? false))
      );
    });
  }, [camadasVisiveis, filtros, rotas, marcadores]);

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
    >
      {/* Gerenciador de desenho para rotas */}
      {isLoaded && (
        <DrawingManager
          options={{
            ...drawingManagerOptions,
            drawingControlOptions: {
              ...drawingManagerOptions.drawingControlOptions,
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYLINE]
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
              editable: true,
              draggable: true
            }}
          />
        );
      })}
    </GoogleMap>
  );
};

export default GoogleMapsComponent;
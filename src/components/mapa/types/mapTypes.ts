/**
 * Tipos e interfaces para o componente do mapa
 */

/**
 * Interface para as propriedades do componente GoogleMapsComponent
 */
export interface GoogleMapsComponentProps {
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
 * Interface para armazenar informações dos marcadores
 */
export interface MarcadorInfo {
  position: google.maps.LatLng;
  icon: string;
  title: string;
  tipo: 'CTO' | 'CEO';
  draggable: boolean;
  visible?: boolean;
}

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
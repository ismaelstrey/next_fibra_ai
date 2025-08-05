/**
 * Configurações e constantes para o componente do mapa
 */

/**
 * Tipos de bibliotecas do Google Maps necessárias para o componente
 */
export type Libraries = ("drawing" | "geometry" | "places" | "visualization" | "marker")[];

/**
 * Configurações do mapa
 */
export const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

/**
 * Centro inicial do mapa (pode ser ajustado para a localização padrão desejada)
 */
export const center = {
  lat: -23.550520, // São Paulo como exemplo
  lng: -46.633308
};

/**
 * Estilos personalizados para ocultar pontos de interesse
 */
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.sports_complex",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.government",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit.station",
    stylers: [{ visibility: "off" }]
  }
];

/**
 * Opções do mapa
 */
export const mapOptions: google.maps.MapOptions = {
  center: { lat: -23.5505, lng: -46.6333 }, // São Paulo como centro padrão
  zoom: 10,
  mapId: '973baf8ee9c2faa5fb1f9d99', // ID necessário para AdvancedMarkerElement
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  clickableIcons: false,
  // Removido styles para evitar conflito com mapId
  // styles: mapStyles,
};

/**
 * Opções para o gerenciador de desenho
 */
export const drawingManagerOptions = {
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
export const tiposCabos = {
  '6': '#3498db',   // Azul
  '12': '#2ecc71',  // Verde
  '24': '#f1c40f',  // Amarelo
  '48': '#e67e22',  // Laranja
  '96': '#e74c3c'   // Vermelho
};
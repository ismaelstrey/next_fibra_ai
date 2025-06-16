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
 * Opções do mapa
 */
export const mapOptions = {
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
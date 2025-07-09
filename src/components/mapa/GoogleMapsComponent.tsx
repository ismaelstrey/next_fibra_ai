'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polyline } from '@react-google-maps/api';
import useMapa from '@/hooks/useMapa';
import { getFiberColor } from '@/functions/color';
import AddCaixaModal from './AddCaixaModal';
import { DetalhesMarcadorModal } from './DetalhesMarcadorModal';
import GerenciadorFusoes from './GerenciadorFusoes';
import { RotaTooltip } from './RotaTooltip';
import { DetalhesRotaModal } from './DetalhesRotaModal';
import { Caixa, Rota } from '@/context/MapContext';
import { mapContainerStyle, center as defaultCenter, mapOptions, tiposCabos } from './config/mapConfig';
import { GoogleMapsComponentProps } from './types/mapTypes';
import { useMarcadores } from './hooks/useMarcadores';
import { useRotas } from './hooks/useRotas';
import { useMapHandlers } from './hooks/useMapHandlers';

// Bibliotecas necessárias - definidas fora do componente para evitar recriação a cada render
const libraries = ['drawing', 'geometry', 'marker'] as ("drawing" | "geometry" | "places" | "visualization" | "marker")[];

/**
 * Componente do Google Maps para visualização e gerenciamento da infraestrutura de fibra óptica
 */
const GoogleMapsComponent = ({
  apiKey,
  onMapLoad,
  onRotaDesenhada
}: GoogleMapsComponentProps) => {
  // Referência para o mapa
  const mapRef = useRef<google.maps.Map | null>(null);

  // Estado para o centro do mapa
  const [mapCenter, setMapCenter] = useState(defaultCenter);


  // Estado para controlar o modal de detalhes do marcador
  const [detalhesModalAberto, setDetalhesModalAberto] = useState(false);
  const [marcadorSelecionado, setMarcadorSelecionado] = useState<Caixa | null>(null);

  // Estado para controlar o modal de fusões
  const [fusoesModalAberto, setFusoesModalAberto] = useState(false);
  const [rotasDivididas, setRotasDivididas] = useState<{ rota1: Rota; rota2: Rota; caixaConexao: Caixa } | null>(null);

  // Estados para controlar tooltip e modal da rota
  const [hoveredRota, setHoveredRota] = useState<Rota | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedRota, setSelectedRota] = useState<Rota | null>(null);
  const [isRotaModalOpen, setIsRotaModalOpen] = useState(false);
  // console.log(rotasDivididas)
  // Função para lidar com o carregamento do mapa
  const handleMapLoaded = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  // Handlers para eventos da rota
  const handleRotaMouseOver = useCallback((rota: Rota, event: google.maps.MapMouseEvent) => {
    if (event.domEvent && event.domEvent instanceof MouseEvent) {
      setHoveredRota(rota);
      setTooltipPosition({
        x: event.domEvent.clientX,
        y: event.domEvent.clientY
      });
    }
  }, []);

  const handleRotaMouseOut = useCallback(() => {
    setHoveredRota(null);
    setTooltipPosition(null);
  }, []);

  const handleRotaClick = useCallback((rota: Rota) => {

    setSelectedRota(rota);
    setIsRotaModalOpen(true);
    // Esconder tooltip ao abrir modal
    setHoveredRota(null);
    setTooltipPosition(null);

  }, []);

  // Adiciona um listener para o evento personalizado 'marcador-clicado'
  useEffect(() => {
    const handleMarcadorClicado = (event: Event) => {
      const customEvent = event as CustomEvent<Caixa>;
      setMarcadorSelecionado(customEvent.detail);
      setDetalhesModalAberto(true);
    };

    const handleRotaDividida = (event: Event) => {
      const customEvent = event as CustomEvent<{ rota1: Rota; rota2: Rota; caixaConexao: Caixa }>;
      setRotasDivididas(customEvent.detail);
      setFusoesModalAberto(true);
    };

    window.addEventListener('marcador-clicado', handleMarcadorClicado);
    window.addEventListener('rota-dividida', handleRotaDividida);

    return () => {
      window.removeEventListener('marcador-clicado', handleMarcadorClicado);
      window.removeEventListener('rota-dividida', handleRotaDividida);
    };
  }, []);

  // Obtém o estado do mapa do hook useMapa
  const {
    modoEdicao,
    tipoCaboSelecionado,
    camadasVisiveis,
    rotas: rotasGlobais,
    filtros,
    obterCoordenadasCidade,
  } = useMapa();

  // Carrega a API do Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries
  });

  // Utiliza os hooks refatorados
  const {
    modalAberto,
    setModalAberto,
    posicaoClicada,
    setPosicaoClicada,
    rotaAssociada,
    setRotaAssociada,
    adicionarMarcador,
    adicionarMarcadorNaRota,
    criarMarcadoresAvancados
  } = useMarcadores(mapRef);

  const {
    drawingMode,
    handlePolylineComplete
  } = useRotas(mapRef);

  const {
    handleMapClick,
    handlePolylineClick,
    handlePolylineDblClick,
    handlePolylineRightClick,
    handleMapLoad
  } = useMapHandlers(
    mapRef,
    adicionarMarcador,
    adicionarMarcadorNaRota,
    setModalAberto,
    setPosicaoClicada,
    setRotaAssociada
  );

  // Efeito para centralizar o mapa quando a cidade for selecionada
  useEffect(() => {
    const centralizarMapa = async () => {
      if (filtros.cidade && obterCoordenadasCidade) {
        const coordenadas = await obterCoordenadasCidade(filtros.cidade);
        if (coordenadas) {
          setMapCenter(coordenadas);
          // Se o mapa já estiver carregado, centraliza imediatamente
          if (mapRef.current) {
            mapRef.current.setCenter(coordenadas);
            mapRef.current.setZoom(15);
          }
        }
      }
    };

    centralizarMapa();
  }, [filtros.cidade, obterCoordenadasCidade]);

  // Cria os marcadores avançados quando o mapa estiver carregado
  if (isLoaded && mapRef.current) {
    criarMarcadoresAvancados(isLoaded);
  }


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
      center={mapCenter}
      zoom={filtros.cidade ? 15 : 13}
      options={mapOptions}
      onLoad={map => {
        handleMapLoaded(map);
        handleMapLoad(map);
        // Se há uma cidade selecionada, centraliza o mapa
        if (filtros.cidade) {
          map.setCenter(mapCenter);
          map.setZoom(15);
        }
      }}
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
        const path = rota.path;
        // Calcula o ponto médio da rota para posicionar o label
        const midIndex = Math.floor(path.length / 2);
        const midPoint = path[midIndex];
        return (
        <div key={index}>
             <Polyline
              onClick={(e) => {
                handlePolylineClick(e, rota);
                handleRotaClick(rota);
              }}
              onDblClick={(e) => handlePolylineDblClick(e, rota)}
              onRightClick={(e) => handlePolylineRightClick(e, rota)}
              onMouseOver={(e) => handleRotaMouseOver(rota, e)}
              onMouseOut={handleRotaMouseOut}
              key={`rota-${index}`}
              path={path}
              options={{
                strokeColor: rota.cor || getFiberColor(rota.tipoCabo),
                strokeWeight: 5,
                editable: modoEdicao === 'editar',
                draggable: modoEdicao === 'editar',
              }}
            />
            {/* Label acima da linha da rota */}
            {midPoint && (
              <div
                style={{
                  position: 'absolute',
                  left: `${midPoint.lng}px`,
                  top: `${midPoint.lat}px`,
                  background: 'rgba(255,255,255,0.8)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -100%)',
                  zIndex: 10
                }}
              >
                {rota.nome}
              </div>
            )}
        </div>
        );
      })}

      {/* Os marcadores avançados são criados e gerenciados diretamente nos hooks */}

      {/* Tooltip da rota */}
      {hoveredRota && tooltipPosition && (
        <RotaTooltip
          rota={hoveredRota}
          position={tooltipPosition}
          visible={true}
        />
      )}

      {/* Modal de detalhes da rota */}
      <DetalhesRotaModal
        aberto={isRotaModalOpen}
        aoFechar={() => setIsRotaModalOpen(false)}
        rota={selectedRota}
      />

      {/* Modal para adicionar CTO ou CEO */}
      {/* -      {posicaoClicada && (
-        <AddCaixaModal
-          isOpen={modalAberto}
-          onClose={() => setModalAberto(false)}
-          position={posicaoClicada}
-          rotaAssociada={rotaAssociada}
-        />
-      )} */}
      {posicaoClicada && (
        <AddCaixaModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          position={posicaoClicada}
          rotasAssociadas={Array.isArray(rotaAssociada) ? rotaAssociada : rotaAssociada ? [rotaAssociada] : []}
        />
      )}

      {/* Modal para exibir detalhes do marcador */}
      <DetalhesMarcadorModal
        aberto={detalhesModalAberto}
        aoFechar={() => setDetalhesModalAberto(false)}
        marcador={marcadorSelecionado}
      />

      {/* Modal para gerenciar fusões após divisão de rota */}
      {fusoesModalAberto && rotasDivididas && (
        <GerenciadorFusoes
          rota1={rotasDivididas.rota1}
          rota2={rotasDivididas.rota2}
          caixaConexao={rotasDivididas.caixaConexao}
          onClose={() => {
            setFusoesModalAberto(false);
            setRotasDivididas(null);
          }}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMapsComponent;

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";

import { TuboAPI } from '@/hooks/useTubo';

// Tipos para os dados de cabos e splitters
interface Tubo {
  id: string;
  numero: number;
  capilares: { id: string; numero: number }[];
}

interface CaboFormatado {
  id: string;
  nome: string;
  tipo: '6' | '12' | '24' | '48' | '96';
  tubos: TuboAPI[];
}

interface Splitter {
  id: string;
  tipo: string;
  portaEntrada: string;
  portasSaida: string[];
}

interface Fusao {
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: string;
  cor?: string;
}

interface ConexaoTemporaria {
  origem: {
    id: string;
    x: number;
    y: number;
    tipo: string;
  } | null;
  destino: {
    id: string;
    x: number;
    y: number;
    tipo: string;
  } | null;
}

interface ElementPosition {
  x: number;
  y: number;
}

interface CustomPositions {
  cabos: Record<string, ElementPosition>;
  splitters: Record<string, ElementPosition>;
  tubos: Record<string, ElementPosition>;
  capilares: Record<string, ElementPosition>;
  portas: Record<string, ElementPosition>;
  gruposCabos: Record<string, ElementPosition>;
  gruposSplitters: Record<string, ElementPosition>;
  [key: string]: Record<string, ElementPosition>;
}

interface ProtoboardFibraProps {
  cabos: CaboFormatado[];
  splitters: Splitter[];
  fusoes: Fusao[];
  onCriarFusao?: (fusao: Omit<Fusao, 'id'>) => void;
  onRemoverFusao?: (fusaoId: string) => void;
  readonly?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
  allowDrag?: boolean;
  onPositionChange?: (positions: CustomPositions) => void;
}

/**
 * Componente interativo de protoboard para visualizar e criar conexões entre fibras ópticas
 * Permite drag-and-drop para criar conexões visuais entre capilares e splitters
 */
export const ProtoboardFibra: React.FC<ProtoboardFibraProps> = ({ 
  cabos, 
  splitters, 
  fusoes, 
  onCriarFusao,
  onRemoverFusao,
  readonly = false,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
  allowDrag = true,
  onPositionChange
}) => {
  const [conexaoTemporaria, setConexaoTemporaria] = useState<ConexaoTemporaria>({
    origem: null,
    destino: null
  });
  const [elementoSelecionado, setElementoSelecionado] = useState<string | null>(null);
  const [modoConexao, setModoConexao] = useState<boolean>(false);
  const [posicaoMouse, setPosicaoMouse] = useState({ x: 0, y: 0 });
  const [dimensoes, setDimensoes] = useState({ width: 0, height: 0 });
  const [customPositions, setCustomPositions] = useState<CustomPositions>({
    cabos: {},
    splitters: {},
    tubos: {},
    capilares: {},
    portas: {},
    gruposCabos: {},
    gruposSplitters: {}
  });
  const [isDragging, setIsDragging] = useState<{
    type: 'cabo' | 'splitter' | 'tubo' | 'capilar' | 'porta' | 'grupo-cabo' | 'grupo-splitter' | null;
    id: string | null;
    offset: { x: number; y: number };
  }>({ type: null, id: null, offset: { x: 0, y: 0 } });
  const [dragMode, setDragMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Atualizar dimensões quando em fullscreen
  useEffect(() => {
    const updateDimensions = () => {
      if (isFullscreen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensoes({ width: rect.width, height: rect.height - 80 }); // Subtraindo altura dos controles
      }
    };

    if (isFullscreen) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [isFullscreen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && onClose) {
        onClose();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isFullscreen, onClose]);

  // Função para obter coordenadas do mouse relativas ao SVG
  const obterCoordenadasMouse = useCallback((event: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  // Funções de drag-and-drop
  const iniciarDrag = useCallback((event: React.MouseEvent, type: 'cabo' | 'splitter' | 'tubo' | 'capilar' | 'porta' | 'grupo-cabo' | 'grupo-splitter', id: string, currentX: number, currentY: number) => {
    if (!allowDrag || readonly || modoConexao) return;
    
    event.stopPropagation();
    const coords = obterCoordenadasMouse(event);
    
    setIsDragging({
      type,
      id,
      offset: {
        x: coords.x - currentX,
        y: coords.y - currentY
      }
    });
  }, [allowDrag, readonly, modoConexao, obterCoordenadasMouse]);

  const atualizarDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging.type || !isDragging.id) return;
    
    const coords = obterCoordenadasMouse(event);
    const newX = coords.x - isDragging.offset.x;
    const newY = coords.y - isDragging.offset.y;
    
    if (isDragging.type === 'grupo-cabo') {
      // Arrastar todo o grupo de cabo (tubo + capilares)
      const cabo = cabos.find(c => c.id === isDragging.id);
      if (cabo) {
        const customPos = customPositions.cabos[cabo.id];
        const currentX = customPos ? customPos.x : 0;
        const currentY = customPos ? customPos.y : 0;
        const deltaX = newX - (customPositions.gruposCabos[isDragging.id]?.x ?? currentX);
        const deltaY = newY - (customPositions.gruposCabos[isDragging.id]?.y ?? currentY);
        
        setCustomPositions(prev => {
          const newPositions = { ...prev };
          
          // Atualizar posição do grupo
          newPositions.gruposCabos = {
            ...prev.gruposCabos,
            [isDragging.id!]: { x: newX, y: newY }
          };
          
          // Atualizar posições dos tubos
          cabo.tubos.forEach(tubo => {
            const currentTuboPos = prev.tubos[tubo.id] || { x: 0, y: 0 };
            newPositions.tubos = {
              ...newPositions.tubos,
              [tubo.id]: {
                x: currentTuboPos.x + deltaX,
                y: currentTuboPos.y + deltaY
              }
            };
            
            // Atualizar posições dos capilares
            (tubo.capilares || []).forEach(capilar => {
              const currentCapilarPos = prev.capilares[capilar.id] || { x: 0, y: 0 };
              newPositions.capilares = {
                ...newPositions.capilares,
                [capilar.id]: {
                  x: currentCapilarPos.x + deltaX,
                  y: currentCapilarPos.y + deltaY
                }
              };
            });
          });
          
          return newPositions;
        });
      }
    } else if (isDragging.type === 'grupo-splitter') {
      // Arrastar todo o grupo de splitter (splitter + portas)
      const splitter = splitters.find(s => s.id === isDragging.id);
      if (splitter) {
        const customPos = customPositions.splitters[splitter.id];
        const currentX = customPos ? customPos.x : 0;
        const currentY = customPos ? customPos.y : 0;
        const deltaX = newX - (customPositions.gruposSplitters[isDragging.id]?.x ?? currentX);
        const deltaY = newY - (customPositions.gruposSplitters[isDragging.id]?.y ?? currentY);
        
        setCustomPositions(prev => {
          const newPositions = { ...prev };
          
          // Atualizar posição do grupo
          newPositions.gruposSplitters = {
            ...prev.gruposSplitters,
            [isDragging.id!]: { x: newX, y: newY }
          };
          
          // Atualizar posições das portas
          [splitter.portaEntrada, ...splitter.portasSaida].forEach(portaId => {
            const currentPortaPos = prev.portas[portaId] || { x: 0, y: 0 };
            newPositions.portas = {
              ...newPositions.portas,
              [portaId]: {
                x: currentPortaPos.x + deltaX,
                y: currentPortaPos.y + deltaY
              }
            };
          });
          
          return newPositions;
        });
      }
    } else {
      // Arrastar elemento individual
      const typeMap = {
        'cabo': 'cabos',
        'splitter': 'splitters',
        'tubo': 'tubos',
        'capilar': 'capilares',
        'porta': 'portas'
      };
      
      const key = typeMap[isDragging.type];
      
      setCustomPositions(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [isDragging.id!]: { x: newX, y: newY }
        }
      }));
    }
  }, [isDragging, obterCoordenadasMouse, cabos, splitters, customPositions]);

  const finalizarDrag = useCallback(() => {
    if (isDragging.type && onPositionChange) {
      onPositionChange(customPositions);
    }
    setIsDragging({ type: null, id: null, offset: { x: 0, y: 0 } });
  }, [isDragging.type, customPositions, onPositionChange]);

  // Cores para diferentes tubos
  const coresTubos = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  // Calcular layout responsivo baseado no modo fullscreen
  const layoutConfig = isFullscreen && dimensoes.width > 0 ? {
    caboWidth: Math.max(300, (dimensoes.width - 400) / Math.max(cabos.length, 1)),
    spacing: 30,
    startX: 20,
    startY: 20
  } : {
    caboWidth: 320,
    spacing: 20,
    startX: 20,
    startY: 20
  };

  // Organizar dados por seções com layout responsivo e posições customizadas
  const secoesCabos = cabos.map((cabo, caboIndex) => {
    // Usar posição customizada se disponível
    const customPos = customPositions.cabos[cabo.id];
    const baseX = customPos ? customPos.x : layoutConfig.startX + caboIndex * (layoutConfig.caboWidth + layoutConfig.spacing);
    const baseY = customPos ? customPos.y : layoutConfig.startY;
    
    const tubosOrganizados = cabo.tubos.map((tubo, tuboIndex) => {
      const cor = coresTubos[tuboIndex % coresTubos.length];
      const capilares = (tubo.capilares || []).map((capilar, capilarIndex) => ({
        id: capilar.id,
        numero: capilar.numero,
        caboId: cabo.id,
        tuboId: tubo.id,
        cor,
        posX: baseX + 60,
        posY: baseY + 70 + tuboIndex * 60 + capilarIndex * 12,
        label: `C${caboIndex + 1}-T${tubo.numero}-F${capilar.numero}`
      }));
      
      return {
        ...tubo,
        cor,
        capilares,
        posX: baseX + 30,
        posY: baseY + 40 + tuboIndex * 60,
        headerY: baseY + 20 + tuboIndex * 60
      };
    });
    
    return {
      ...cabo,
      tubos: tubosOrganizados,
      posX: baseX,
      posY: baseY,
      isDragging: isDragging.type === 'cabo' && isDragging.id === cabo.id
    };
  });

  // Mapear todos os capilares para busca
  const todosCapilares = secoesCabos.flatMap(cabo => 
    cabo.tubos.flatMap(tubo => tubo.capilares)
  );

  // Organizar splitters com layout responsivo e posições customizadas
  const splittersOrganizados = splitters.map((splitter, splitterIndex) => {
    // Usar posição customizada se disponível
    const customPos = customPositions.splitters[splitter.id];
    const defaultX = isFullscreen && dimensoes.width > 0 
      ? Math.max(dimensoes.width - 400, secoesCabos.length * layoutConfig.caboWidth + 50)
      : Math.max(400, secoesCabos.length * layoutConfig.caboWidth + 50);
    const baseX = customPos ? customPos.x : defaultX;
    const baseY = customPos ? customPos.y : layoutConfig.startY + 50 + splitterIndex * 150;
    const numPortasSaida = splitter.portasSaida.length;
    
    const portaEntrada = {
      id: splitter.portaEntrada,
      tipo: "entrada" as const,
      splitterId: splitter.id,
      posX: baseX - 30,
      posY: baseY + 40,
      label: `Split ${splitter.tipo} IN`
    };
    
    const portasSaida = splitter.portasSaida.map((pid, portaIndex) => {
      const espacamento = Math.min(15, 60 / Math.max(numPortasSaida - 1, 1));
      const offsetY = numPortasSaida === 1 ? 0 : 
        (portaIndex - (numPortasSaida - 1) / 2) * espacamento;
      
      return {
        id: pid,
        tipo: "saida" as const,
        splitterId: splitter.id,
        posX: baseX + 40,
        posY: baseY + 40 + offsetY,
        label: `OUT${portaIndex + 1}`
      };
    });
    
    return {
      ...splitter,
      portaEntrada,
      portasSaida,
      posX: baseX - 50,
      posY: baseY - 10,
      headerY: baseY - 20,
      isDragging: isDragging.type === 'splitter' && isDragging.id === splitter.id
    };
  });

  // Função para iniciar conexão
  const iniciarConexao = useCallback((elemento: any, tipo: string) => {
    if (readonly) return;
    
    const posicao = tipo === 'capilar' 
      ? { x: elemento.posX, y: elemento.posY + 32 }
      : tipo === 'entrada_splitter'
      ? { x: elemento.posX - 25, y: elemento.posY + 10 }
      : { x: elemento.posX - 35, y: elemento.posY + 10 };
    
    setConexaoTemporaria({
      origem: {
        id: elemento.id,
        x: posicao.x,
        y: posicao.y,
        tipo
      },
      destino: null
    });
    setModoConexao(true);
    setElementoSelecionado(elemento.id);
  }, [readonly]);

  // Função para finalizar conexão
  const finalizarConexao = useCallback((elemento: any, tipo: string) => {
    if (!conexaoTemporaria.origem || readonly) return;
    
    const posicao = tipo === 'capilar' 
      ? { x: elemento.posX, y: elemento.posY + 32 }
      : tipo === 'entrada_splitter'
      ? { x: elemento.posX - 25, y: elemento.posY + 10 }
      : { x: elemento.posX - 35, y: elemento.posY + 10 };
    
    // Verificar se não é o mesmo elemento
    if (conexaoTemporaria.origem.id === elemento.id) {
      cancelarConexao();
      return;
    }
    
    // Verificar se já existe uma fusão entre esses elementos
    const fusaoExistente = fusoes.find(f => 
      (f.capilarOrigemId === conexaoTemporaria.origem!.id && f.capilarDestinoId === elemento.id) ||
      (f.capilarOrigemId === elemento.id && f.capilarDestinoId === conexaoTemporaria.origem!.id)
    );
    
    if (fusaoExistente) {
      alert('Já existe uma fusão entre esses elementos!');
      cancelarConexao();
      return;
    }
    
    // Determinar tipo de fusão
    const tipoFusao = (conexaoTemporaria.origem.tipo === 'capilar' && tipo === 'capilar') 
      ? 'capilar_capilar'
      : 'capilar_splitter';
    
    // Criar nova fusão
    const novaFusao: Omit<Fusao, 'id'> = {
      capilarOrigemId: conexaoTemporaria.origem.id,
      capilarDestinoId: elemento.id,
      tipoFusao,
      cor: tipoFusao === 'capilar_capilar' ? '#DC2626' : '#7C3AED'
    };
    
    onCriarFusao?.(novaFusao);
    cancelarConexao();
  }, [conexaoTemporaria.origem, fusoes, onCriarFusao, readonly]);

  // Função para cancelar conexão
  const cancelarConexao = useCallback(() => {
    setConexaoTemporaria({ origem: null, destino: null });
    setModoConexao(false);
    setElementoSelecionado(null);
  }, []);

  // Função para atualizar posição do mouse
  const atualizarPosicaoMouse = useCallback((event: React.MouseEvent) => {
    if (modoConexao) {
      const coords = obterCoordenadasMouse(event);
      setPosicaoMouse(coords);
    }
    
    // Atualizar drag se estiver arrastando
    if (isDragging.type) {
      atualizarDrag(event);
    }
  }, [modoConexao, obterCoordenadasMouse, isDragging.type, atualizarDrag]);

  // Função para buscar posição de um elemento
  const getPos = (id: string) => {
    // Buscar em capilares
    const cap = todosCapilares.find(c => c.id === id);
    if (cap) {
      return { 
        x: cap.posX, 
        y: cap.posY + 32, 
        tipo: 'capilar',
        cor: cap.cor,
        elemento: cap
      };
    }
    
    // Buscar em splitters
    for (const splitter of splittersOrganizados) {
      if (splitter.portaEntrada.id === id) {
        return { 
          x: splitter.portaEntrada.posX - 25, 
          y: splitter.portaEntrada.posY + 10,
          tipo: 'entrada_splitter',
          cor: '#059669',
          elemento: splitter.portaEntrada
        };
      }
      const portaSaida = splitter.portasSaida.find(p => p.id === id);
      if (portaSaida) {
        return { 
          x: portaSaida.posX - 35, 
          y: portaSaida.posY + 10,
          tipo: 'saida_splitter',
          cor: '#F59E0B',
          elemento: portaSaida
        };
      }
    }
    
    // Buscar pelos IDs sintéticos dos splitters
    const splitterMatch = id.match(/^(entrada|saida)-(\w+)(?:-(\d+))?$/);
    if (splitterMatch) {
      const [, tipo, splitterId, portaIndex] = splitterMatch;
      const splitter = splittersOrganizados.find(s => s.id === splitterId);
      if (splitter) {
        if (tipo === 'entrada') {
          return { 
            x: splitter.portaEntrada.posX - 25, 
            y: splitter.portaEntrada.posY + 10,
            tipo: 'entrada_splitter',
            cor: '#059669',
            elemento: splitter.portaEntrada
          };
        } else if (tipo === 'saida' && portaIndex) {
          const portaSaida = splitter.portasSaida[parseInt(portaIndex) - 1];
          if (portaSaida) {
            return { 
              x: portaSaida.posX - 35, 
              y: portaSaida.posY + 10,
              tipo: 'saida_splitter',
              cor: '#F59E0B',
              elemento: portaSaida
            };
          }
        }
      }
    }
    
    return { x: 0, y: 0, tipo: 'desconhecido', cor: '#888', elemento: null };
  };

  // Calcular dimensões do SVG
  const largura = isFullscreen && dimensoes.width > 0 
    ? dimensoes.width 
    : Math.max(800, secoesCabos.length * (layoutConfig.caboWidth + layoutConfig.spacing) + splittersOrganizados.length * 200 + 100);
  const altura = isFullscreen && dimensoes.height > 0 
    ? dimensoes.height
    : Math.max(400, 
        Math.max(
          secoesCabos.reduce((max, cabo) => Math.max(max, cabo.tubos.length * 80 + 100), 0),
          splittersOrganizados.length * 200 + 100
        )
      );

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : "flex flex-col gap-4";

  const svgContainerClasses = isFullscreen
    ? "flex-1 overflow-hidden bg-background"
    : "flex overflow-x-auto w-full bg-background rounded-lg";

  return (
    <AnimatePresence>
      <motion.div 
        ref={containerRef}
        className={containerClasses}
        {...(isFullscreen && {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.2 }
        })}
      >
        {/* Controles */}
        <div className={`flex justify-between items-center gap-2 p-4 ${
          isFullscreen ? 'bg-gray-900 text-white border-b border-gray-700' : 'bg-gray-50 rounded-lg'
        }`}>
          <div className="flex gap-2 items-center">
            {!readonly && (
              <>
                <button
                   onClick={() => setModoConexao(!modoConexao)}
                   className={`px-4 py-2 rounded transition-colors ${
                     modoConexao 
                       ? 'bg-blue-500 text-white hover:bg-blue-600' 
                       : isFullscreen 
                         ? 'bg-gray-700 text-white hover:bg-gray-600'
                         : 'bg-gray-200 hover:bg-gray-300'
                   }`}
                 >
                   {modoConexao ? 'Cancelar Conexão' : 'Modo Conexão'}
                 </button>
                 
                 {allowDrag && (
                   <button
                     onClick={() => setDragMode(!dragMode)}
                     className={`px-4 py-2 rounded transition-colors ${
                       dragMode 
                         ? 'bg-green-500 text-white hover:bg-green-600' 
                         : isFullscreen 
                           ? 'bg-gray-700 text-white hover:bg-gray-600'
                           : 'bg-gray-200 hover:bg-gray-300'
                     }`}
                   >
                     {dragMode ? 'Sair do Modo Arrastar' : 'Modo Arrastar'}
                   </button>
                 )}
                {modoConexao && (
                   <div className={`text-sm flex items-center ${
                     isFullscreen ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     Clique em um elemento para iniciar a conexão, depois clique no destino
                   </div>
                 )}
                 
                 {dragMode && (
                   <div className={`text-sm flex items-center ${
                     isFullscreen ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     Arraste os cabeçalhos dos cabos e splitters para reposicioná-los
                   </div>
                 )}
              </>
            )}
            
            {/* Estatísticas */}
            <div className={`text-sm flex gap-4 ml-4 ${
              isFullscreen ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span>Cabos: {cabos.length}</span>
              <span>Splitters: {splitters.length}</span>
              <span>Fusões: {fusoes.length}</span>
            </div>
          </div>
          
          {/* Controles de Fullscreen */}
          <div className="flex gap-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`p-2 rounded transition-colors ${
                  isFullscreen 
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isFullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            
            {isFullscreen && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Fechar (ESC)"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Protoboard */}
        <div className={svgContainerClasses}>
          <svg 
            ref={svgRef}
            width={largura} 
            height={altura} 
            className={`bg-background text-foreground ${
               isDragging.type ? 'cursor-grabbing' : dragMode ? 'cursor-grab' : modoConexao ? 'cursor-crosshair' : 'cursor-default'
             } ${
               isFullscreen ? 'w-full h-full' : 'border border-gray-200 rounded'
             }`}
             onMouseMove={atualizarPosicaoMouse}
             onMouseUp={finalizarDrag}
             onClick={cancelarConexao}
            viewBox={isFullscreen ? `0 0 ${largura} ${altura}` : undefined}
            preserveAspectRatio={isFullscreen ? "xMidYMid meet" : undefined}
          >
          {/* Seções de Cabos */}
          {secoesCabos.map((cabo) => {
            const customCaboPos = customPositions.gruposCabos[cabo.id];
            const caboX = customCaboPos ? customCaboPos.x : cabo.posX;
            const caboY = customCaboPos ? customCaboPos.y : cabo.posY;
            
            return (
            <g key={cabo.id}>
              {/* Header do Cabo */}
              <rect
                x={caboX}
                y={caboY}
                width={300}
                height={30}
                fill="#1F2937"
                rx={10}
                className={`${dragMode ? 'cursor-grab' : ''} ${
                  isDragging.type === 'grupo-cabo' && isDragging.id === cabo.id ? 'cursor-grabbing' : ''
                }`}
                onMouseDown={(e) => dragMode && iniciarDrag(e, 'grupo-cabo', cabo.id, caboX, caboY)}
              />
              <text
                x={caboX + 150}
                y={caboY + 20}
                fontSize={12}
                fill="white"
                textAnchor="middle"
                fontWeight="bold"
                className={`${dragMode ? 'cursor-grab' : ''} ${
                  isDragging.type === 'grupo-cabo' && isDragging.id === cabo.id ? 'cursor-grabbing' : ''
                }`}
                onMouseDown={(e) => dragMode && iniciarDrag(e, 'grupo-cabo', cabo.id, caboX, caboY)}
              >
                {cabo.nome}
              </text>
              
              {/* Tubos do Cabo */}
              {cabo.tubos.map((tubo) => {
                const customTuboPos = customPositions.tubos[tubo.id];
                const tuboX = customTuboPos ? customTuboPos.x : tubo.posX;
                const tuboY = customTuboPos ? customTuboPos.y : tubo.posY;
                const headerY = customTuboPos ? customTuboPos.y - 20 : tubo.headerY;
                
                return (
                <g key={tubo.id}>
                  {/* Header do Tubo */}
                  <rect
                    x={tuboX}
                    y={headerY}
                    width={140}
                    height={20}
                    fill={tubo.cor}
                    rx={3}
                  />
                  <text
                    x={tuboX + 70}
                    y={headerY + 14}
                    fontSize={10}
                    fill="white"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Tubo {tubo.numero}
                  </text>
                  
                  {/* Capilares do Tubo */}
                  {tubo.capilares.map((capilar, capilarIndex) => {
                    const customCapilarPos = customPositions.capilares[capilar.id];
                    const capilarX = customCapilarPos ? customCapilarPos.x : capilar.posX;
                    const capilarY = customCapilarPos ? customCapilarPos.y : capilar.posY;
                    
                    const isSelected = elementoSelecionado === capilar.id;
                    const isConnected = fusoes.some(f => 
                      f.capilarOrigemId === capilar.id || f.capilarDestinoId === capilar.id
                    );
                    
                    return (
                      <g key={capilar.id}>
                        <motion.circle
                          cx={capilarX}
                          cy={capilarY + 30}
                          r={isSelected ? 8 : 5}
                          fill={isSelected ? '#FFD700' : tubo.cor}
                          stroke={isConnected ? '#059669' : 'white'}
                          strokeWidth={isConnected ? 3 : 2}
                          className={readonly ? '' : 'cursor-pointer hover:stroke-blue-400'}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!readonly) {
                              if (modoConexao && !conexaoTemporaria.origem) {
                                iniciarConexao({...capilar, posX: capilarX, posY: capilarY}, 'capilar');
                              } else if (modoConexao && conexaoTemporaria.origem) {
                                finalizarConexao({...capilar, posX: capilarX, posY: capilarY}, 'capilar');
                              }
                            }
                          }}
                          whileHover={readonly ? {} : { scale: 1.2 }}
                          whileTap={readonly ? {} : { scale: 0.9 }}
                        />
                        <text
                          x={capilarX + 10}
                          y={capilarY + 33}
                          fontSize={8}
                          fill="#374151"
                          className="pointer-events-none"
                        >
                          F{capilar.numero}
                        </text>
                      </g>
                    );
                  })}
                </g>
                );
              })}
            </g>
            );
          })}
          
          {/* Seção de Splitters */}
          {splittersOrganizados.map((splitter) => {
            const customSplitterPos = customPositions.gruposSplitters[splitter.id];
            const splitterX = customSplitterPos ? customSplitterPos.x : splitter.posX;
            const splitterY = customSplitterPos ? customSplitterPos.y : splitter.posY;
            const headerY = customSplitterPos ? customSplitterPos.y - 20 : splitter.headerY;
            
            return (
            <g key={splitter.id}>
              {/* Header do Splitter */}
              <rect
                x={splitterX - 50}
                y={headerY}
                width={150}
                height={25}
                fill="#7C3AED"
                rx={4}
                className={`${dragMode ? 'cursor-grab' : ''} ${
                  isDragging.type === 'grupo-splitter' && isDragging.id === splitter.id ? 'cursor-grabbing' : ''
                }`}
                onMouseDown={(e) => dragMode && iniciarDrag(e, 'grupo-splitter', splitter.id, splitterX, splitterY)}
              />
              <text
                x={splitterX + 25}
                y={headerY + 17}
                fontSize={11}
                fill="white"
                textAnchor="middle"
                fontWeight="bold"
                className={`${dragMode ? 'cursor-grab' : ''} ${
                  isDragging.type === 'grupo-splitter' && isDragging.id === splitter.id ? 'cursor-grabbing' : ''
                }`}
                onMouseDown={(e) => dragMode && iniciarDrag(e, 'grupo-splitter', splitter.id, splitterX, splitterY)}
              >
                Splitter {splitter.tipo}
              </text>
              
              {/* Linhas internas do splitter */}
              {splitter.portasSaida.map((porta) => {
                const customEntradaPos = customPositions.portas[splitter.portaEntrada.id];
                const customSaidaPos = customPositions.portas[porta.id];
                const entradaX = customEntradaPos ? customEntradaPos.x : splitter.portaEntrada.posX;
                const entradaY = customEntradaPos ? customEntradaPos.y : splitter.portaEntrada.posY;
                const saidaX = customSaidaPos ? customSaidaPos.x : porta.posX;
                const saidaY = customSaidaPos ? customSaidaPos.y : porta.posY;
                
                return (
                <line
                  key={`internal-${porta.id}`}
                  x1={entradaX - 20}
                  y1={entradaY + 10}
                  x2={saidaX - 40}
                  y2={saidaY + 10}
                  stroke="#6366F1"
                  strokeWidth={3}
                  opacity={0.8}
                />
                );
              })}
              
              {/* Porta de Entrada */}
              {(() => {
                const customEntradaPos = customPositions.portas[splitter.portaEntrada.id];
                const entradaX = customEntradaPos ? customEntradaPos.x : splitter.portaEntrada.posX;
                const entradaY = customEntradaPos ? customEntradaPos.y : splitter.portaEntrada.posY;
                
                const isSelected = elementoSelecionado === splitter.portaEntrada.id;
                const isConnected = fusoes.some(f => 
                  f.capilarOrigemId === splitter.portaEntrada.id || 
                  f.capilarDestinoId === splitter.portaEntrada.id ||
                  f.capilarDestinoId === `entrada-${splitter.id}`
                );
                
                return (
                  <motion.circle
                    cx={entradaX - 25}
                    cy={entradaY + 10}
                    r={isSelected ? 12 : 8}
                    fill={isSelected ? '#FFD700' : '#059669'}
                    stroke={isConnected ? '#DC2626' : 'white'}
                    strokeWidth={isConnected ? 3 : 2}
                    className={readonly ? '' : 'cursor-pointer hover:stroke-blue-400'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!readonly) {
                        if (modoConexao && !conexaoTemporaria.origem) {
                          iniciarConexao({...splitter.portaEntrada, posX: entradaX, posY: entradaY}, 'entrada_splitter');
                        } else if (modoConexao && conexaoTemporaria.origem) {
                          finalizarConexao({...splitter.portaEntrada, posX: entradaX, posY: entradaY}, 'entrada_splitter');
                        }
                      }
                    }}
                    whileHover={readonly ? {} : { scale: 1.2 }}
                    whileTap={readonly ? {} : { scale: 0.9 }}
                  />
                );
              })()}
              <text
                x={splitterX - 75}
                y={splitterY + 50}
                fontSize={9}
                fill="#374151"
                textAnchor="end"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {splitter.portaEntrada.label}
              </text>
              
              {/* Portas de Saída */}
              {splitter.portasSaida.map((porta, index) => {
                const customPortaPos = customPositions.portas[porta.id];
                const portaX = customPortaPos ? customPortaPos.x : porta.posX;
                const portaY = customPortaPos ? customPortaPos.y : porta.posY;
                
                const isSelected = elementoSelecionado === porta.id;
                const isConnected = fusoes.some(f => 
                  f.capilarOrigemId === porta.id || 
                  f.capilarDestinoId === porta.id ||
                  f.capilarDestinoId === `saida-${splitter.id}-${index + 1}`
                );
                
                return (
                  <g key={porta.id}>
                    <motion.circle
                      cx={portaX - 35}
                      cy={portaY + 10}
                      r={isSelected ? 8 : 5}
                      fill={isSelected ? '#FFD700' : '#F59E0B'}
                      stroke={isConnected ? '#DC2626' : 'white'}
                      strokeWidth={isConnected ? 3 : 0}
                      className={readonly ? '' : 'cursor-pointer hover:stroke-blue-400'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!readonly) {
                          if (modoConexao && !conexaoTemporaria.origem) {
                            iniciarConexao({...porta, posX: portaX, posY: portaY}, 'saida_splitter');
                          } else if (modoConexao && conexaoTemporaria.origem) {
                            finalizarConexao({...porta, posX: portaX, posY: portaY}, 'saida_splitter');
                          }
                        }
                      }}
                      whileHover={readonly ? {} : { scale: 1.2 }}
                      whileTap={readonly ? {} : { scale: 0.9 }}
                    />
                    <text
                      x={portaX + 8}
                      y={portaY + 3}
                      fontSize={8}
                      fill="#374151"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {porta.label}
                    </text>
                  </g>
                );
              })}
            </g>
            );
          })}
          
          {/* Linha temporária durante conexão */}
          {modoConexao && conexaoTemporaria.origem && (
            <motion.line
              x1={conexaoTemporaria.origem.x}
              y1={conexaoTemporaria.origem.y}
              x2={posicaoMouse.x}
              y2={posicaoMouse.y}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Linhas das Fusões Existentes */}
          {fusoes.map(fusao => {
            const origem = getPos(fusao.capilarOrigemId);
            const destino = getPos(fusao.capilarDestinoId);
            
            if (origem.tipo === 'desconhecido' || destino.tipo === 'desconhecido') {
              return null;
            }
            
            const corFusao = fusao.cor || 
              (origem.tipo === 'capilar' && destino.tipo === 'capilar' ? '#DC2626' :
               origem.tipo.includes('splitter') || destino.tipo.includes('splitter') ? '#7C3AED' : '#DC2626');
            
            const midX = (origem.x + destino.x) / 2;
            const midY = (origem.y + destino.y) / 2;
            const controlOffset = Math.abs(origem.x - destino.x) * 0.2;
            
            const pathData = `M ${origem.x} ${origem.y} Q ${midX} ${midY - controlOffset} ${destino.x} ${destino.y}`;
            
            return (
              <g key={fusao.id}>
                <motion.path
                  d={pathData}
                  stroke={corFusao}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray="8,4"
                  className={readonly ? '' : 'cursor-pointer hover:stroke-red-500'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!readonly && onRemoverFusao) {
                      if (confirm('Deseja remover esta fusão?')) {
                        onRemoverFusao(fusao.id);
                      }
                    }
                  }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  whileHover={readonly ? {} : { strokeWidth: 4 }}
                />
                
                {/* Indicadores nas extremidades */}
                <circle
                  cx={origem.x}
                  cy={origem.y}
                  r={3}
                  fill={corFusao}
                  opacity={0.8}
                  className="pointer-events-none"
                />
                <circle
                  cx={destino.x}
                  cy={destino.y}
                  r={3}
                  fill={corFusao}
                  opacity={0.8}
                  className="pointer-events-none"
                />
                
                {/* Label da fusão */}
                <text
                  x={midX}
                  y={midY - controlOffset - 8}
                  fontSize={8}
                  fill={corFusao}
                  textAnchor="middle"
                  fontWeight="bold"
                  opacity={0.9}
                  className="pointer-events-none"
                >
                  {fusao.tipoFusao || 'Fusão'}
                </text>
              </g>
            );
          })}
          
          {/* Legenda */}
          <g>
            <rect x={20} y={altura - 140} width={300} height={120} fill="white" stroke="#D1D5DB" rx={4} />
            <text x={30} y={altura - 125} fontSize={10} fontWeight="bold" fill="#374151">Legenda:</text>
            
            {/* Elementos de Fibra */}
            <circle cx={35} cy={altura - 110} r={4} fill="#3B82F6" />
            <text x={45} y={altura - 107} fontSize={8} fill="#374151">Capilar</text>
            
            {/* Elementos de Splitter */}
            <circle cx={35} cy={altura - 95} r={4} fill="#059669" />
            <text x={45} y={altura - 92} fontSize={8} fill="#374151">Entrada Splitter</text>
            
            <circle cx={35} cy={altura - 80} r={4} fill="#F59E0B" />
            <text x={45} y={altura - 77} fontSize={8} fill="#374151">Saída Splitter</text>
            
            {/* Estados */}
            <circle cx={35} cy={altura - 65} r={4} fill="#FFD700" />
            <text x={45} y={altura - 62} fontSize={8} fill="#374151">Selecionado</text>
            
            <circle cx={35} cy={altura - 50} r={4} fill="#3B82F6" stroke="#059669" strokeWidth={2} />
            <text x={45} y={altura - 47} fontSize={8} fill="#374151">Conectado</text>
            
            {/* Tipos de Fusão */}
            <path d={`M 150 ${altura - 110} Q 165 ${altura - 115} 180 ${altura - 110}`} stroke="#DC2626" strokeWidth={2} strokeDasharray="4,2" fill="none" />
            <text x={185} y={altura - 107} fontSize={8} fill="#374151">Fusão Capilar-Capilar</text>
            
            <path d={`M 150 ${altura - 95} Q 165 ${altura - 100} 180 ${altura - 95}`} stroke="#7C3AED" strokeWidth={2} strokeDasharray="4,2" fill="none" />
            <text x={185} y={altura - 92} fontSize={8} fill="#374151">Fusão com Splitter</text>
            
            {/* Instruções */}
            {!readonly && (
              <text x={30} y={altura - 30} fontSize={8} fill="#6B7280">Clique nos elementos para conectar • Clique nas fusões para remover</text>
            )}
          </g>
        </svg>
      </div>
    </motion.div>
  </AnimatePresence>
  );
};
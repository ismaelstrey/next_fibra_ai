import React from "react";
import { motion } from "framer-motion";

import { TuboAPI } from '@/hooks/useTubo';

// Tipos para os dados de cabos e splitters
interface Tubo {
  id: string;
  numero: number;
  capilares: { id: string; numero: number }[];
}



// Tipo compatível com CaboFormatado
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

interface ConexaoGraficaProps {
  cabos: CaboFormatado[];
  splitters: Splitter[];
  fusoes: Fusao[];
}

/**
 * Componente gráfico 2D para visualizar conexões entre cabos e splitters
 * Layout organizado: cabos agrupados por seções, tubos com cores distintas, splitters separados
 */
export const ConexaoGrafica: React.FC<ConexaoGraficaProps> = ({ cabos, splitters, fusoes }) => {
  // Cores para diferentes tubos

  console.log(fusoes)
  const coresTubos = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  // Organizar dados por seções
  const secoesCabos = cabos.map((cabo, caboIndex) => {
    const tubosOrganizados = cabo.tubos.map((tubo, tuboIndex) => {
      const cor = coresTubos[tuboIndex % coresTubos.length];
      const capilares = (tubo.capilares || []).map((capilar, capilarIndex) => ({
        id: capilar.id,
        numero: capilar.numero,
        caboId: cabo.id,
        tuboId: tubo.id,
        cor,
        posX: 80 + caboIndex * 200,
        posY: 90 + tuboIndex * 60 + capilarIndex * 12,
        label: `C${caboIndex + 1}-T${tubo.numero}-F${capilar.numero}`
      }));
      
      return {
        ...tubo,
        cor,
        capilares,
        posX: 50 + caboIndex * 200,
        posY: 60 + tuboIndex * 60,
        headerY: 40 + tuboIndex * 60
      };
    });
    
    return {
      ...cabo,
      tubos: tubosOrganizados,
      posX: 20 + caboIndex * 200,
      posY: 20
    };
  });

  // Mapear todos os capilares para busca
  const todosCapilares = secoesCabos.flatMap(cabo => 
    cabo.tubos.flatMap(tubo => tubo.capilares)
  );

  // Organizar splitters em seção separada
  const splittersOrganizados = splitters.map((splitter, splitterIndex) => {
    const baseX = Math.max(600, secoesCabos.length * 200 + 100);
    const baseY = 80 + splitterIndex * 180;
    const numPortasSaida = splitter.portasSaida.length;
    
    // Posição da porta de entrada (lado esquerdo do triângulo)
    const portaEntrada = {
      id: splitter.portaEntrada,
      tipo: "entrada" as const,
      splitterId: splitter.id,
      posX: baseX - 30,
      posY: baseY + 40,
      label: `Split ${splitter.tipo} IN`
    };
    
    // Posições das portas de saída (lado direito do triângulo)
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
    
    // Pontos do triângulo
    const trianglePoints = [
      { x: baseX - 30, y: baseY + 40 }, // Ponto esquerdo (entrada)
      { x: baseX + 20, y: baseY + 10 }, // Ponto superior direito
      { x: baseX + 20, y: baseY + 70 }  // Ponto inferior direito
    ];
    
    return {
      ...splitter,
      portaEntrada,
      portasSaida,
      trianglePoints,
      posX: baseX - 50,
      posY: baseY - 10,
      headerY: baseY - 20
    };
  });

  // Função para buscar posição de um capilar ou porta com informações adicionais
  const getPos = (id: string) => {
    // Debug: Log do ID sendo procurado
    // console.log(`Procurando posição para ID: ${id}`);
    
    // Buscar em capilares
    const cap = todosCapilares.find(c => c.id === id);
    if (cap) {
      // console.log(`Capilar encontrado:`, cap);
      return { 
        x: cap.posX, 
        y: cap.posY+32, 
        tipo: 'capilar',
        cor: cap.cor,
        elemento: cap
      };
    }
    
    // Buscar em splitters pelos IDs reais das portas
    for (const splitter of splittersOrganizados) {
      if (splitter.portaEntrada.id === id) {
        console.log(`Porta de entrada do splitter encontrada:`, splitter.portaEntrada);
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
        console.log(`Porta de saída do splitter encontrada:`, portaSaida);
        return { 
          x: portaSaida.posX - 35, 
          y: portaSaida.posY + 10,
          tipo: 'saida_splitter',
          cor: '#F59E0B',
          elemento: portaSaida
        };
      }
    }
    
    // Buscar pelos IDs sintéticos dos splitters (formato: entrada-splitterId ou saida-splitterId-portaIndex)
    const splitterMatch = id.match(/^(entrada|saida)-(\w+)(?:-(\d+))?$/);
    if (splitterMatch) {
      const [, tipo, splitterId, portaIndex] = splitterMatch;
      console.log(`ID sintético detectado: tipo=${tipo}, splitterId=${splitterId}, portaIndex=${portaIndex}`);
      
      const splitter = splittersOrganizados.find(s => s.id === splitterId);
      if (splitter) {
        if (tipo === 'entrada') {
          console.log(`Porta de entrada do splitter encontrada via ID sintético:`, splitter.portaEntrada);
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
            console.log(`Porta de saída do splitter encontrada via ID sintético:`, portaSaida);
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
    
    // Debug: Log quando não encontrado
    console.log(`ID não encontrado: ${id}`);
    console.log(`Capilares disponíveis:`, todosCapilares.map(c => ({ id: c.id, numero: c.numero })));
    console.log(`Splitters disponíveis:`, splittersOrganizados.map(s => ({
      id: s.id,
      entrada: s.portaEntrada.id,
      saidas: s.portasSaida.map(p => p.id)
    })));
    
    return { x: 0, y: 0, tipo: 'desconhecido', cor: '#888', elemento: null };
  };

  // Calcular dimensões do SVG
  const largura = Math.max(800, secoesCabos.length * 200 + splittersOrganizados.length * 150 + 100);
  const altura = Math.max(400, 
    Math.max(
      secoesCabos.reduce((max, cabo) => Math.max(max, cabo.tubos.length * 60 + 100), 0),
      splittersOrganizados.length * 150 + 50
    )
  );

  return (
    <div className="flex overflow-x-auto w-full bg-background rounded-lg">
      <svg width={largura} height={altura} className="border flex gap-2 border-gray-200 bg-background text-foreground rounded">
        {/* Seções de Cabos */}
        {secoesCabos.map((cabo) => (
          <g key={cabo.id}>
            {/* Header do Cabo */}
            <rect
              x={cabo.posX}
              y={cabo.posY}
              width={300}
              height={30}
              fill="#1F2937"
              rx={10}
            />
            <text
              x={cabo.posX + 90}
              y={cabo.posY + 20}
              fontSize={12}
              fill="white"
              textAnchor="middle"
              fontWeight="bold"
            >
              {cabo.nome} 
            </text>
            
            {/* Tubos do Cabo */}
            {cabo.tubos.map((tubo, tuboIndex) => (
              <g key={tubo.id}>
                {/* Header do Tubo */}
                <rect
                  x={tubo.posX}
                  y={tubo.headerY}
                  width={140}
                  height={20}
                  fill={tubo.cor}
                  rx={3}
                />
                <text
                  x={tubo.posX + 70}
                  y={tubo.headerY + 14}
                  fontSize={10}
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  Tubo {tubo.numero}
                </text>
                
                {/* Capilares do Tubo */}
                {tubo.capilares.map((capilar) => (
                  <g key={capilar.id}>
                    <circle
                      cx={capilar.posX}
                      cy={capilar.posY+30}
                      r={5}
                      fill={tubo.cor}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <text
                      x={capilar.posX + 10}
                      y={capilar.posY + 33}
                      fontSize={8}
                      fill="#374151"
                    >
                      F{capilar.numero}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </g>
        ))}
        
        {/* Seção de Splitters */}
        {splittersOrganizados.map((splitter) => (
          <g key={splitter.id}>
            {/* Header do Splitter */}
            <rect
              x={splitter.posX-50}
              y={splitter.headerY}
              width={150}
              height={25}
              fill="#7C3AED"
              rx={4}
            />
            <text
              x={splitter.posX + 40}
              y={splitter.headerY + 17}
              fontSize={11}
              fill="white"
              textAnchor="middle"
              fontWeight="bold"
            >
              Splitter {splitter.tipo}
            </text>
            
            {/* Corpo do Splitter - Triângulo */}
            {/* <polygon
              points={splitter.trianglePoints.map(p => `${p.x+5},${p.y+10}`).join(' ')}              
              fill="#A855F7"
              stroke="#7C3AED"
              strokeWidth={2}
              opacity={0.8}

            /> */}
            
            {/* Linhas internas do splitter para mostrar divisão */}
            {splitter.portasSaida.map((porta) => (
              <line
                key={`internal-${porta.id}`}
                x1={splitter.portaEntrada.posX-20}
                y1={splitter.portaEntrada.posY+10}
                x2={porta.posX-40}
                y2={porta.posY+10}
                stroke="#6366F1"
                strokeWidth={3}
                opacity={0.8}
              />
            ))}
            
            {/* Porta de Entrada */}
            <circle
              cx={splitter.portaEntrada.posX -25}
              cy={splitter.portaEntrada.posY + 10}
              r={8}
              fill="#059669"
              stroke="white"
              strokeWidth={2}
              onClick={(e)=>console.log(e)}
            />
            <text
              x={splitter.portaEntrada.posX - 50}
              y={splitter.portaEntrada.posY + 10}
              fontSize={9}
              fill="#374151"
              textAnchor="end"
              fontWeight="bold"
            >
              {splitter.portaEntrada.label}
            </text>
            
            {/* Portas de Saída */}
            {splitter.portasSaida.map((porta) => (
              <g key={porta.id}>
                <circle
                  cx={porta.posX - 35}
                  cy={porta.posY + 10}
                  r={5}
                  fill="#F59E0B"
                  stroke="white"
                  strokeWidth={0}
                />
                <text
                  x={porta.posX + 8}
                  y={porta.posY + 3}
                  fontSize={8}
                  fill="#374151"
                  fontWeight="bold"
                >
                  {porta.label}
                </text>
              </g>
            ))}
          </g>
        ))}
        
        {/* Linhas das Fusões */}
        {fusoes.map(fusao => {
          const origem = getPos(fusao.capilarOrigemId);
          const destino = getPos(fusao.capilarDestinoId);
          console.log(origem,destino)
          
          // Verificar se ambas as posições foram encontradas
          if (origem.tipo === 'desconhecido' || destino.tipo === 'desconhecido') {
            console.warn(`Fusão ${fusao.id}: Posição não encontrada para origem (${fusao.capilarOrigemId}) ou destino (${fusao.capilarDestinoId})`);
            return null;
          }
          
          // Determinar cor da fusão baseada nos elementos conectados
          const corFusao = fusao.cor || 
            (origem.tipo === 'capilar' && destino.tipo === 'capilar' ? '#DC2626' :
             origem.tipo.includes('splitter') || destino.tipo.includes('splitter') ? '#7C3AED' : '#DC2626');
          
          // Criar path curvo para melhor visualização
          const midX = (origem.x + destino.x) / 2;
          const midY = (origem.y + destino.y) / 2;
          const controlOffset = Math.abs(origem.x - destino.x) * 0.2;
          
          const pathData = `M ${origem.x} ${origem.y} Q ${midX} ${midY - controlOffset} ${destino.x} ${destino.y}`;
          
          return (
            <g key={fusao.id}>
              {/* Linha principal da fusão */}
              <motion.path
                d={pathData}
                stroke={corFusao}
                strokeWidth={3}
                fill="none"
                strokeDasharray="8,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              
              {/* Indicadores nas extremidades */}
              <circle
                cx={origem.x}
                cy={origem.y}
                r={3}
                fill={corFusao}
                opacity={0.8}
              />
              <circle
                cx={destino.x}
                cy={destino.y}
                r={3}
                fill={corFusao}
                opacity={0.8}
              />
              
              {/* Label da fusão no meio */}
              <text
                x={midX}
                y={midY - controlOffset - 8}
                fontSize={8}
                fill={corFusao}
                textAnchor="middle"
                fontWeight="bold"
                opacity={0.9}
              >
                {fusao.tipoFusao || 'Fusão'}
              </text>
            </g>
          );
        })}
        
        {/* Legenda */}
        <g>
          <rect x={20} y={altura - 120} width={280} height={100} fill="white" stroke="#D1D5DB" rx={4} />
          <text x={30} y={altura - 105} fontSize={10} fontWeight="bold" fill="#374151">Legenda:</text>
          
          {/* Elementos de Fibra */}
          <circle cx={35} cy={altura - 90} r={4} fill="#3B82F6" />
          <text x={45} y={altura - 87} fontSize={8} fill="#374151">Capilar</text>
          
          {/* Elementos de Splitter */}
           <polygon points={`30,${altura - 75} 40,${altura - 80} 40,${altura - 70}`} fill="#A855F7" />
           <text x={45} y={altura - 72} fontSize={8} fill="#374151">Splitter</text>
           
           <circle cx={35} cy={altura - 60} r={4} fill="#059669" />
           <text x={45} y={altura - 57} fontSize={8} fill="#374151">Entrada Splitter</text>
           
           <circle cx={35} cy={altura - 45} r={4} fill="#F59E0B" />
           <text x={45} y={altura - 42} fontSize={8} fill="#374151">Saída Splitter</text>
           
           {/* Tipos de Fusão */}
           <path d={`M 150 ${altura - 90} Q 165 ${altura - 95} 180 ${altura - 90}`} stroke="#DC2626" strokeWidth={2} strokeDasharray="4,2" fill="none" />
           <text x={185} y={altura - 87} fontSize={8} fill="#374151">Fusão Capilar-Capilar</text>
           
           <path d={`M 150 ${altura - 75} Q 165 ${altura - 80} 180 ${altura - 75}`} stroke="#7C3AED" strokeWidth={2} strokeDasharray="4,2" fill="none" />
           <text x={185} y={altura - 72} fontSize={8} fill="#374151">Fusão com Splitter</text>
          
          {/* Cores dos Tubos */}
          <text x={30} y={altura - 30} fontSize={8} fontWeight="bold" fill="#374151">Cores dos Tubos:</text>
          {coresTubos.slice(0, 5).map((cor, index) => (
            <g key={index}>
              <circle cx={30 + index * 25} cy={altura - 15} r={3} fill={cor} />
              <text x={30 + index * 25} y={altura - 5} fontSize={6} fill="#374151" textAnchor="middle">{index + 1}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
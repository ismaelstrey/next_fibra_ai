
import React, { useState } from 'react';
import { ProtoboardFibra } from './protoboardFibra';
import { Maximize2 } from 'lucide-react';

// Exemplo de dados para demonstração
const dadosExemplo = {
  cabos: [
    {
      id: 'cabo1',
      nome: 'Cabo Principal',
      tipo: '12' as const,
      tubos: [
        {
          id: 'tubo1',
          numero: 1,
          quantidadeCapilares: 4,
          tipo: 'loose',
          capilares: [
            { id: 'cap1', numero: 1, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap2', numero: 2, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap3', numero: 3, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap4', numero: 4, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 }
          ]
        },
        {
          id: 'tubo2',
          numero: 2,
          quantidadeCapilares: 4,
          tipo: 'loose',
          capilares: [
            { id: 'cap5', numero: 1, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap6', numero: 2, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap7', numero: 3, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap8', numero: 4, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 }
          ]
        }
      ]
    },
    {
      id: 'cabo2',
      nome: 'Cabo Secundário',
      tipo: '6' as const,
      tubos: [
        {
          id: 'tubo3',
          numero: 1,
          quantidadeCapilares: 3,
          tipo: 'loose',
          capilares: [
            { id: 'cap9', numero: 1, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap10', numero: 2, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 },
            { id: 'cap11', numero: 3, tipo: 'SM', comprimento: 100, status: 'ativo', potencia: -20 }
          ]
        }
      ]
    }
  ],
  splitters: [
    {
      id: 'split1',
      tipo: '1x8',
      portaEntrada: 'entrada-split1',
      portasSaida: [
        'saida-split1-1',
        'saida-split1-2',
        'saida-split1-3',
        'saida-split1-4',
        'saida-split1-5',
        'saida-split1-6',
        'saida-split1-7',
        'saida-split1-8'
      ]
    },
    {
      id: 'split2',
      tipo: '1x4',
      portaEntrada: 'entrada-split2',
      portasSaida: [
        'saida-split2-1',
        'saida-split2-2',
        'saida-split2-3',
        'saida-split2-4'
      ]
    }
  ]
};

interface Fusao {
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: string;
  cor?: string;
}

/**
 * Componente de exemplo para demonstrar o uso do ProtoboardFibra
 * Mostra como integrar com dados reais e gerenciar fusões
 */
export const ExemploProtoboard: React.FC = () => {
  const [fusoes, setFusoes] = useState<Fusao[]>([
    {
      id: 'fusao1',
      capilarOrigemId: 'cap1',
      capilarDestinoId: 'cap5',
      tipoFusao: 'capilar_capilar',
      cor: '#DC2626'
    },
    {
      id: 'fusao2',
      capilarOrigemId: 'cap2',
      capilarDestinoId: 'entrada-split1',
      tipoFusao: 'capilar_splitter',
      cor: '#7C3AED'
    }
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customPositions, setCustomPositions] = useState({
    cabos: {},
    splitters: {},
    tubos: {},
    capilares: {},
    portas: {},
    gruposCabos: {},
    gruposSplitters: {}
  });

  const [modoVisualizacao, setModoVisualizacao] = useState<'interativo' | 'readonly'>('interativo');

  // Função para criar nova fusão
  const criarFusao = (novaFusao: Omit<Fusao, 'id'>) => {
    const fusaoComId: Fusao = {
      ...novaFusao,
      id: `fusao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setFusoes(prev => [...prev, fusaoComId]);
    
    // Aqui você pode adicionar lógica para salvar no backend
    console.log('Nova fusão criada:', fusaoComId);
  };

  // Função para remover fusão
  const removerFusao = (fusaoId: string) => {
    setFusoes(prev => prev.filter(f => f.id !== fusaoId));
    
    // Aqui você pode adicionar lógica para remover do backend
    console.log('Fusão removida:', fusaoId);
  };

  // Função para obter estatísticas das conexões
  const obterEstatisticas = () => {
    const totalCapilares = dadosExemplo.cabos.reduce((total, cabo) => 
      total + cabo.tubos.reduce((tubosTotal, tubo) => 
        tubosTotal + tubo.capilares.length, 0), 0);
    
    const totalPortasSplitter = dadosExemplo.splitters.reduce((total, splitter) => 
      total + splitter.portasSaida.length + 1, 0); // +1 para porta de entrada
    
    const capilaresConectados = new Set();
    const portasSplitterConectadas = new Set();
    
    fusoes.forEach(fusao => {
      // Verificar se é capilar
      const isOrigemCapilar = dadosExemplo.cabos.some(cabo => 
        cabo.tubos.some(tubo => 
          tubo.capilares.some(cap => cap.id === fusao.capilarOrigemId)));
      
      const isDestinoCapilar = dadosExemplo.cabos.some(cabo => 
        cabo.tubos.some(tubo => 
          tubo.capilares.some(cap => cap.id === fusao.capilarDestinoId)));
      
      if (isOrigemCapilar) capilaresConectados.add(fusao.capilarOrigemId);
      if (isDestinoCapilar) capilaresConectados.add(fusao.capilarDestinoId);
      
      // Verificar se é porta de splitter
      if (!isOrigemCapilar) portasSplitterConectadas.add(fusao.capilarOrigemId);
      if (!isDestinoCapilar) portasSplitterConectadas.add(fusao.capilarDestinoId);
    });
    
    return {
      totalCapilares,
      totalPortasSplitter,
      capilaresConectados: capilaresConectados.size,
      portasSplitterConectadas: portasSplitterConectadas.size,
      totalFusoes: fusoes.length,
      fusoesCapilarCapilar: fusoes.filter(f => f.tipoFusao === 'capilar_capilar').length,
      fusoesCapilarSplitter: fusoes.filter(f => f.tipoFusao === 'capilar_splitter').length
    };
  };

  const stats = obterEstatisticas();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protoboard de Fibra Óptica</h1>
          <p className="text-gray-600">Visualização interativa de conexões de fibra óptica</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setModoVisualizacao(modoVisualizacao === 'interativo' ? 'readonly' : 'interativo')}
            className={`px-4 py-2 rounded-lg font-medium ${
              modoVisualizacao === 'interativo' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {modoVisualizacao === 'interativo' ? 'Modo Interativo' : 'Modo Visualização'}
          </button>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Maximize2 size={16} />
            Tela Cheia
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalCapilares}</div>
          <div className="text-sm text-blue-800">Total Capilares</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalPortasSplitter}</div>
          <div className="text-sm text-purple-800">Portas Splitter</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.capilaresConectados}</div>
          <div className="text-sm text-green-800">Capilares Conectados</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.portasSplitterConectadas}</div>
          <div className="text-sm text-orange-800">Portas Conectadas</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.totalFusoes}</div>
          <div className="text-sm text-red-800">Total Fusões</div>
        </div>
        
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{stats.fusoesCapilarCapilar}</div>
          <div className="text-sm text-pink-800">Capilar-Capilar</div>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{stats.fusoesCapilarSplitter}</div>
          <div className="text-sm text-indigo-800">Capilar-Splitter</div>
        </div>
      </div>

      {/* Lista de Fusões */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Fusões Ativas ({fusoes.length})</h3>
        
        {fusoes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma fusão criada ainda</p>
        ) : (
          <div className="space-y-2">
            {fusoes.map((fusao) => (
              <div key={fusao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: fusao.cor || '#666' }}
                  />
                  <div>
                    <div className="font-medium">
                      {fusao.capilarOrigemId} → {fusao.capilarDestinoId}
                    </div>
                    <div className="text-sm text-gray-600">
                      Tipo: {fusao.tipoFusao}
                    </div>
                  </div>
                </div>
                
                {modoVisualizacao === 'interativo' && (
                  <button
                    onClick={() => removerFusao(fusao.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protoboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Protoboard Interativo</h3>
        
        <ProtoboardFibra
          cabos={dadosExemplo.cabos}
          splitters={dadosExemplo.splitters}
          fusoes={fusoes}
          onCriarFusao={criarFusao}
          onRemoverFusao={removerFusao}
          readonly={modoVisualizacao === 'readonly'}
        />
      </div>
      
      {/* Protoboard Fullscreen */}
      {isFullscreen && (
        <ProtoboardFibra
          cabos={dadosExemplo.cabos}
            splitters={dadosExemplo.splitters}
            fusoes={fusoes}
            onCriarFusao={criarFusao}
            onRemoverFusao={removerFusao}
            readonly={modoVisualizacao === 'readonly'}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            onClose={() => setIsFullscreen(false)}
            allowDrag={true}
            onPositionChange={setCustomPositions}
        />
      )}

      {/* Instruções */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Como Usar</h3>
        <ul className="space-y-1 text-blue-800">
          <li>• <strong>Modo Interativo:</strong> Clique em "Modo Conexão" e depois clique em dois elementos para conectá-los</li>
          <li>• <strong>Criar Fusão:</strong> Primeiro clique define a origem, segundo clique define o destino</li>
          <li>• <strong>Remover Fusão:</strong> Clique diretamente na linha da fusão ou use o botão "Remover" na lista</li>
          <li>• <strong>Elementos Conectados:</strong> Aparecem com borda verde e são destacados visualmente</li>
          <li>• <strong>Modo Visualização:</strong> Apenas visualiza as conexões sem permitir edição</li>
        </ul>
      </div>
    </div>
  );
};

// Hook personalizado para integração com dados reais
export const useProtoboardData = () => {
  // Aqui você pode integrar com seus hooks existentes
  // const { cabos } = useCabo();
  // const { splitters } = useSplitter();
  // const { fusoes, criarFusao, removerFusao } = useFusao();
  
  return {
    // cabos,
    // splitters, 
    // fusoes,
    // criarFusao,
    // removerFusao
  };
};
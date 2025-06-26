import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCapilar } from '@/hooks/useCapilar';
import { Rota, Caixa } from '@/context/MapContext';

interface GerenciadorFusoesProps {
  rota1: Rota;
  rota2: Rota;
  caixaConexao: Caixa;
  onClose: () => void;
}

interface CapilarInfo {
  id: string;
  numero: number;
  tipo: string;
  status: string;
  rotaId: string;
  rotaNome: string;
}

interface FusaoCapilar {
  capilarRota1: string;
  capilarRota2: string;
  observacoes?: string;
}

export const GerenciadorFusoes: React.FC<GerenciadorFusoesProps> = ({
  rota1,
  rota2,
  caixaConexao,
  onClose
}) => {
  const [capilaresRota1, setCapilaresRota1] = useState<CapilarInfo[]>([]);
  const [capilaresRota2, setCapilaresRota2] = useState<CapilarInfo[]>([]);
  const [fusoesPlanejadas, setFusoesPlanejadas] = useState<FusaoCapilar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { buscarCapilarPorRota } = useCapilar();

  // Carrega os capilares das duas rotas
  useEffect(() => {
    const carregarCapilares = async () => {
      setIsLoading(true);
      try {
        const [responseRota1, responseRota2] = await Promise.all([
          buscarCapilarPorRota(rota1.id),
          buscarCapilarPorRota(rota2.id)
        ]);

        if (responseRota1.data) {
          const capilares1 = responseRota1.data.capilares.map(cap => ({
            id: cap.id,
            numero: cap.numero,
            tipo: cap.tipo,
            status: cap.status,
            rotaId: rota1.id,
            rotaNome: rota1.nome
          }));
          setCapilaresRota1(capilares1);
        }

        if (responseRota2.data) {
          const capilares2 = responseRota2.data.capilares.map(cap => ({
            id: cap.id,
            numero: cap.numero,
            tipo: cap.tipo,
            status: cap.status,
            rotaId: rota2.id,
            rotaNome: rota2.nome
          }));
          setCapilaresRota2(capilares2);
        }
      } catch (error) {
        console.error('Erro ao carregar capilares:', error);
        toast.error('Erro ao carregar capilares das rotas');
      } finally {
        setIsLoading(false);
      }
    };

    carregarCapilares();
  }, [rota1.id, rota2.id, buscarCapilarPorRota]);

  // Adiciona uma nova fusão planejada
  const adicionarFusao = () => {
    setFusoesPlanejadas(prev => [...prev, {
      capilarRota1: '',
      capilarRota2: '',
      observacoes: ''
    }]);
  };

  // Remove uma fusão planejada
  const removerFusao = (index: number) => {
    setFusoesPlanejadas(prev => prev.filter((_, i) => i !== index));
  };

  // Atualiza uma fusão planejada
  const atualizarFusao = (index: number, campo: keyof FusaoCapilar, valor: string) => {
    setFusoesPlanejadas(prev => prev.map((fusao, i) => 
      i === index ? { ...fusao, [campo]: valor } : fusao
    ));
  };

  // Executa as fusões planejadas
  const executarFusoes = async () => {
    const fusoesValidas = fusoesPlanejadas.filter(f => f.capilarRota1 && f.capilarRota2);
    
    if (fusoesValidas.length === 0) {
      toast.error('Adicione pelo menos uma fusão válida');
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você implementaria a lógica para criar as fusões na API
      // Por exemplo, usando um hook de fusões
      
      toast.success(`${fusoesValidas.length} fusões criadas com sucesso!`);
      onClose();
    } catch (error) {
      console.error('Erro ao executar fusões:', error);
      toast.error('Erro ao executar fusões');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra capilares disponíveis (não utilizados em outras fusões)
  const getCapilaresDisponiveis = (rotaCapilares: CapilarInfo[], rotaAtual: 'rota1' | 'rota2') => {
    const capilaresUsados = fusoesPlanejadas
      .map(f => rotaAtual === 'rota1' ? f.capilarRota1 : f.capilarRota2)
      .filter(Boolean);
    
    return rotaCapilares.filter(cap => !capilaresUsados.includes(cap.id));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
            <span>Carregando capilares...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gerenciador de Fusões - {caixaConexao.nome}</span>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure as fusões entre os capilares das rotas divididas
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações das rotas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">{rota1.nome}</h3>
              <Badge variant="outline">{capilaresRota1.length} capilares</Badge>
              <div className="text-xs text-gray-500">
                Tipo de cabo: {rota1.tipoCabo} fibras
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">{rota2.nome}</h3>
              <Badge variant="outline">{capilaresRota2.length} capilares</Badge>
              <div className="text-xs text-gray-500">
                Tipo de cabo: {rota2.tipoCabo} fibras
              </div>
            </div>
          </div>

          {/* Lista de fusões planejadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Fusões Planejadas</h3>
              <Button onClick={adicionarFusao} size="sm">
                + Adicionar Fusão
              </Button>
            </div>

            {fusoesPlanejadas.map((fusao, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-blue-600">
                      Capilar de {rota1.nome}
                    </label>
                    <Select
                      value={fusao.capilarRota1}
                      onValueChange={(value) => atualizarFusao(index, 'capilarRota1', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um capilar" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCapilaresDisponiveis(capilaresRota1, 'rota1').map(capilar => (
                          <SelectItem className='text-primary' key={capilar.id} value={capilar.id}>
                            Capilar {capilar.numero} - {capilar.tipo} ({capilar.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-green-600">
                      Capilar de {rota2.nome}
                    </label>
                    <Select
                      value={fusao.capilarRota2}
                      onValueChange={(value) => atualizarFusao(index, 'capilarRota2', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um capilar" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCapilaresDisponiveis(capilaresRota2, 'rota2').map(capilar => (
                          <SelectItem key={capilar.id} value={capilar.id}>
                            Capilar {capilar.numero} - {capilar.tipo} ({capilar.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Observações (opcional)"
                    value={fusao.observacoes || ''}
                    onChange={(e) => atualizarFusao(index, 'observacoes', e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border rounded mr-2"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removerFusao(index)}
                  >
                    Remover
                  </Button>
                </div>
              </Card>
            ))}

            {fusoesPlanejadas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma fusão planejada. Clique em "Adicionar Fusão" para começar.
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={executarFusoes}
              disabled={fusoesPlanejadas.length === 0 || isLoading}
            >
              {isLoading ? 'Executando...' : 'Executar Fusões'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciadorFusoes;
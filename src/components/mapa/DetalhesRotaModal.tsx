import React from 'react';
import { Rota } from '@/context/MapContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CableIcon, 
  RulerIcon, 
  MapPinIcon, 
  InfoIcon, 
  CalendarIcon,
  FactoryIcon,
  LayersIcon,
  RouteIcon
} from 'lucide-react';

interface DetalhesRotaModalProps {
  rota: Rota | null;
  aberto: boolean;
  aoFechar: () => void;
}

/**
 * Modal para exibir detalhes completos da rota
 */
export const DetalhesRotaModal: React.FC<DetalhesRotaModalProps> = ({ 
  rota, 
  aberto, 
  aoFechar 
}) => {
  if (!rota) return null;

  // Calcula a distância total da rota
  const calcularDistancia = (path: { lat: number; lng: number }[]) => {
    if (path.length < 2) return 0;
    
    let distanciaTotal = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      
      // Fórmula de Haversine para calcular distância entre dois pontos
      const R = 6371000; // Raio da Terra em metros
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLng = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanciaTotal += R * c;
    }
    
    return Math.round(distanciaTotal);
  };

  const distancia = rota.distancia || calcularDistancia(rota.path);
  const distanciaFormatada = distancia > 1000 
    ? `${(distancia / 1000).toFixed(2)} km`
    : `${distancia} m`;

  // Função para obter a cor do tipo de cabo
  const getCorTipoCabo = (tipo: string) => {
    const cores = {
      '6': 'bg-blue-500',
      '12': 'bg-green-500',
      '24': 'bg-yellow-500',
      '48': 'bg-orange-500',
      '96': 'bg-red-500'
    };
    return cores[tipo as keyof typeof cores] || 'bg-gray-500';
  };

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CableIcon className="h-5 w-5" />
            Detalhes da Rota: {rota.nome}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nome da Rota</label>
                    <p className="text-sm font-semibold">{rota.nome}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-xs font-mono bg-muted p-1 rounded">{rota.id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CableIcon className="h-3 w-3" />
                      Tipo de Cabo
                    </label>
                    <Badge className={`${getCorTipoCabo(rota.tipoCabo)} text-white`}>
                      {rota.tipoCabo} vias
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <RulerIcon className="h-3 w-3" />
                      Distância
                    </label>
                    <p className="text-sm font-semibold">{distanciaFormatada}</p>
                  </div>
                </div>

                {rota.fabricante && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FactoryIcon className="h-3 w-3" />
                      Fabricante
                    </label>
                    <p className="text-sm">{rota.fabricante}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Características Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayersIcon className="h-4 w-4" />
                  Características Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      Tipo de Passagem
                    </label>
                    <Badge variant="outline" className="capitalize">
                      {rota.tipoPassagem || 'Não especificado'}
                    </Badge>
                  </div>
                  {rota.profundidade && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Profundidade</label>
                      <p className="text-sm">{rota.profundidade}</p>
                    </div>
                  )}
                </div>

                {rota.cor && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Cor da Rota</label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: rota.cor }}
                      />
                      <span className="text-sm font-mono">{rota.cor}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coordenadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RouteIcon className="h-4 w-4" />
                  Coordenadas da Rota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total de pontos: <span className="font-semibold">{rota.path.length}</span>
                  </p>
                  <ScrollArea className="h-32 w-full border rounded p-2">
                    <div className="space-y-1">
                      {rota.path.map((ponto, index) => (
                        <div key={index} className="text-xs font-mono flex justify-between">
                          <span>Ponto {index + 1}:</span>
                          <span>{ponto.lat.toFixed(6)}, {ponto.lng.toFixed(6)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            {rota.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <InfoIcon className="h-4 w-4" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-muted/50 p-3 rounded whitespace-pre-wrap">
                    {rota.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesRotaModal;
import React from 'react';
import { Rota } from '@/context/MapContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CableIcon, RulerIcon, MapPinIcon, InfoIcon } from 'lucide-react';

interface RotaTooltipProps {
  rota: Rota;
  position: { x: number; y: number };
  visible: boolean;
}

/**
 * Componente de tooltip para exibir informações detalhadas da rota
 */
export const RotaTooltip: React.FC<RotaTooltipProps> = ({ rota, position, visible }) => {
  if (!visible) return null;

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
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanciaTotal += R * c;
    }

    return Math.round(distanciaTotal);
  };

  const distancia = rota.distancia || calcularDistancia(rota.path);
  const distanciaFormatada = distancia > 1000
    ? `${(distancia / 1000).toFixed(2)} km`
    : `${distancia} m`;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <Card className="w-80 shadow-lg border-2 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white font-semibold flex items-center gap-2">
            <CableIcon className="h-4 w-4" />
            {rota.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Tipo de Cabo */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tipo de Cabo:</span>
            <Badge variant="secondary" className="text-xs">
              {rota.tipoCabo} vias
            </Badge>
          </div>

          {/* Distância */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RulerIcon className="h-3 w-3" />
              Distância:
            </span>
            <span className="text-xs font-medium">{distanciaFormatada}</span>
          </div>

          {/* Tipo de Passagem */}
          {rota.tipoPassagem && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                Passagem:
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {rota.tipoPassagem}
              </Badge>
            </div>
          )}

          {/* Fabricante */}
          {rota.fabricante && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Fabricante:</span>
              <span className="text-xs font-medium">{rota.fabricante}</span>
            </div>
          )}

          {/* Profundidade */}
          {rota.profundidade && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Profundidade:</span>
              <span className="text-xs font-medium">{rota.profundidade}</span>
            </div>
          )}

          <Separator />

          {/* Observações */}
          {rota.observacoes && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <InfoIcon className="h-3 w-3" />
                Observações:
              </span>
              <p className="text-xs text-foreground bg-muted/50 p-2 rounded text-wrap break-words">
                {rota.observacoes}
              </p>
            </div>
          )}

          {/* Pontos da Rota */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Pontos da Rota:</span>
            <span className="text-xs font-medium">{rota.path.length} coordenadas</span>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-1 border-t">
            Clique para mais detalhes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RotaTooltip;
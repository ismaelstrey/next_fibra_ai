'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Caixa, useMapContext } from '@/context/MapContext';
import { Badge } from '@/components/ui/badge';
import { MapPinIcon, BoxIcon, CableIcon, InfoIcon } from 'lucide-react';
import Link from 'next/link';

interface DetalhesMarcadorModalProps {
  /**
   * Estado que controla se o modal está aberto ou fechado
   */
  aberto: boolean;

  /**
   * Função chamada quando o estado do modal muda
   */
  aoFechar: () => void;

  /**
   * Dados do marcador a ser exibido
   */
  marcador: Caixa | null;
}

/**
 * Componente de modal para exibir detalhes de um marcador (CTO ou CEO)
 */
export function DetalhesMarcadorModal({ aberto, aoFechar, marcador }: DetalhesMarcadorModalProps) {
  const { modoEdicao } = useMapContext()
  if (!marcador || modoEdicao === 'editar') return null;
  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="sm:max-w-md text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {marcador.tipo === 'CTO' ? (
              <BoxIcon className="h-5 w-5 text-primary" />
            ) : (
              <BoxIcon className="h-5 w-5 text-orange-500" />
            )}
            {marcador.tipo} {marcador.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Badge variant="outline" className="col-span-1 justify-center">
              {marcador.tipo}
            </Badge>
            <span className="col-span-3 font-medium">{marcador.nome}</span>
          </div>

          {marcador.modelo && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-1 text-muted-foreground text-sm">Modelo:</span>
              <span className="col-span-3">{marcador.modelo}</span>
            </div>
          )}

          {marcador.capacidade && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-1 text-muted-foreground text-sm">
                {marcador.tipo === 'CTO' ? 'Portas:' : 'Bandejas:'}
              </span>
              <span className="col-span-3">{marcador.capacidade}</span>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 text-muted-foreground text-sm flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" /> Posição:
            </span>
            <span className="col-span-3 text-sm">
              Lat: {marcador.posicao.lat.toFixed(6)}, Lng: {marcador.posicao.lng.toFixed(6)}
            </span>
          </div>

          {marcador.rotaAssociada && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-1 text-muted-foreground text-sm flex items-center gap-1">
                <CableIcon className="h-3 w-3" /> Rota:
              </span>
              <span className="col-span-3">{marcador.rotaAssociada}</span>
            </div>
          )}

          {marcador.observacoes && (
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="col-span-1 text-muted-foreground text-sm flex items-center gap-1">
                <InfoIcon className="h-3 w-3" /> Obs:
              </span>
              <span className="col-span-3 text-sm whitespace-pre-wrap">{marcador.observacoes}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Fechar
          </Button>
          <Link href={`/dashboard/detalhes/${marcador.tipo.toLowerCase()}/${marcador.id}`}>
            <Button variant="default" onClick={() => {
              // Aqui poderia ser implementada a funcionalidade de edição
              aoFechar();
            }}>Editar</Button></Link>


        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { useMapa } from '@/hooks/useMapa';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogDescription } from '@radix-ui/react-dialog';

interface AddCaixaModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: google.maps.LatLngLiteral;
  rotaAssociada?: string;

}

/**
 * Modal para adicionar CTO ou CEO no mapa
 */
const AddCaixaModal: React.FC<AddCaixaModalProps> = ({ isOpen, onClose, position, rotaAssociada }) => {
  const { adicionarCaixa, filtros } = useMapa();
  const [tipoCaixa, setTipoCaixa] = React.useState<'CTO' | 'CEO'>('CTO');
  const [nome, setNome] = React.useState('');
  const [modelo, setModelo] = React.useState(tipoCaixa === 'CTO' ? 'Padrão' : 'CEO Padrão');
  const [capacidade, setCapacidade] = React.useState(tipoCaixa === 'CTO' ? 8 : 12);

  // Atualiza os valores padrão quando o tipo de caixa muda
  React.useEffect(() => {
    setModelo(tipoCaixa === 'CTO' ? 'Padrão' : 'CEO Padrão');
    setCapacidade(tipoCaixa === 'CTO' ? 8 : 12);
  }, [tipoCaixa]);

  // Gera um nome padrão quando o modal é aberto
  React.useEffect(() => {
    if (isOpen) {
      const timestamp = new Date().toLocaleTimeString();
      const rotaInfo = rotaAssociada ? ` - ${rotaAssociada}` : '';
      setNome(`${tipoCaixa} ${timestamp}${rotaInfo}`);
    }
  }, [isOpen, tipoCaixa, rotaAssociada]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se há uma cidade selecionada nos filtros
    if (!filtros.cidade) {
      toast.error(`Selecione uma cidade antes de adicionar uma ${tipoCaixa}`);
      return;
    }

    // Adiciona a caixa ao estado global do mapa
    adicionarCaixa({
      tipo: tipoCaixa,
      nome,
      posicao: position,
      cidadeId: filtros.cidade,
      rotaAssociada,
      modelo,
      capacidade
    });
    
    toast.success(`${tipoCaixa} adicionada com sucesso`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar {tipoCaixa}</DialogTitle>
          <DialogDescription>Adicionar {tipoCaixa}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipoCaixa">Tipo</Label>
            <Select
              value={tipoCaixa}
              onValueChange={(value) => setTipoCaixa(value as 'CTO' | 'CEO')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CTO">CTO</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade</Label>
            <Input
              id="capacidade"
              type="number"
              value={capacidade}
              onChange={(e) => setCapacidade(parseInt(e.target.value))}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCaixaModal;
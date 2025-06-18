'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiService } from '@/hooks/useApiService';

// Schema de validação para o formulário
const cidadeSchema = z.object({
  nome: z.string().min(3, { message: 'O nome da cidade deve ter pelo menos 3 caracteres' }),
  estado: z.string().length(2, { message: 'O estado deve ter exatamente 2 caracteres' }),
  coordenadas: z.object({
    lat: z.number({ required_error: 'A latitude é obrigatória' }),
    lng: z.number({ required_error: 'A longitude é obrigatória' })
  })
});

type CidadeFormData = z.infer<typeof cidadeSchema>;

interface AdicionarCidadeModalProps {
  /**
   * Estado que controla se o modal está aberto ou fechado
   */
  aberto: boolean;
  
  /**
   * Função chamada quando o estado do modal muda
   */
  aoMudarEstado: (aberto: boolean) => void;
  
  /**
   * Função chamada após adicionar uma cidade com sucesso
   */
  aoAdicionar?: () => void;
}

/**
 * Componente de modal para adicionar uma nova cidade
 */
export function AdicionarCidadeModal({ aberto, aoMudarEstado, aoAdicionar }: AdicionarCidadeModalProps) {
  const [carregando, setCarregando] = useState(false);
  const api = useApiService();
  
  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  // Configuração do formulário com react-hook-form e zod
  const form = useForm<CidadeFormData>({
    resolver: zodResolver(cidadeSchema),
    defaultValues: {
      nome: '',
      estado: '',
      coordenadas: {
        lat: 0,
        lng: 0
      }
    }
  });
  
  /**
   * Função para lidar com o envio do formulário
   */
  const onSubmit = async (data: CidadeFormData) => {
    setCarregando(true);
    
    try {
      // Chamada à API para criar a cidade
      const response = await fetch('/api/cidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao adicionar cidade');
      }
      
      toast.success('Cidade adicionada com sucesso!');
      form.reset();
      aoMudarEstado(false);
      
      // Chama a função de callback se fornecida
      if (aoAdicionar) {
        aoAdicionar();
      }
    } catch (error) {
      console.error('Erro ao adicionar cidade:', error);
      toast.error('Ocorreu um erro ao adicionar a cidade');
    } finally {
      setCarregando(false);
    }
  };
  
  return (
    <Dialog open={aberto} onOpenChange={aoMudarEstado}>
      <DialogContent className="sm:max-w-md text-primary">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Cidade</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar uma nova cidade ao sistema.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coordenadas.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="Ex: -23.5505" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coordenadas.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="Ex: -46.6333" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => aoMudarEstado(false)}>Cancelar</Button>
              <Button type="submit" disabled={carregando}>
                {carregando ? 'Adicionando...' : 'Adicionar Cidade'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
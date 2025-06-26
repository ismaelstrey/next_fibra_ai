'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, Plus, Filter, ArrowUpDown, Eye, Edit, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

/**
 * Página de gerenciamento de fusões de fibra óptica
 * Permite visualizar, adicionar, editar e excluir fusões
 */

// Definindo a interface para o tipo Fusao
interface Fusao {
  id: number;
  caixa: string;
  tipoCaixa: string;
  bandeja: number;
  porta: number;
  fibra: string;
  destino: string;
  destinoPorta: number;
  destinoFibra: string;
  status: string;
  dataCriacao: string;
  criadoPor: string;
  ultimaAtualizacao: string;
  observacoes: string;
}

export default function FusoesPage() {
  // Estado para controle de pesquisa e filtros
  const [pesquisa, setPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCaixa, setFiltroCaixa] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('recentes');
  
  // Estado para controle do modal de detalhes
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [fusaoSelecionada, setFusaoSelecionada] = useState<Fusao | null>(null);

  // Estado para controle do modal de formulário
  const [modalFormularioAberto, setModalFormularioAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // Dados simulados de fusões
  const [fusoes, setFusoes] = useState([
    { 
      id: 1, 
      caixa: 'CTO-001', 
      tipoCaixa: 'CTO',
      bandeja: 1, 
      porta: 1, 
      fibra: 'Azul', 
      destino: 'CEO-002', 
      destinoPorta: 3,
      destinoFibra: 'Verde',
      status: 'Ativo',
      dataCriacao: '2023-10-15',
      criadoPor: 'João Silva',
      ultimaAtualizacao: '2023-10-15',
      observacoes: 'Fusão realizada com sucesso'
    },
    { 
      id: 2, 
      caixa: 'CTO-001', 
      tipoCaixa: 'CTO',
      bandeja: 1, 
      porta: 2, 
      fibra: 'Verde', 
      destino: 'CEO-002', 
      destinoPorta: 4,
      destinoFibra: 'Azul',
      status: 'Ativo',
      dataCriacao: '2023-10-15',
      criadoPor: 'João Silva',
      ultimaAtualizacao: '2023-10-15',
      observacoes: 'Fusão realizada com sucesso'
    },
    { 
      id: 3, 
      caixa: 'CEO-002', 
      tipoCaixa: 'CEO',
      bandeja: 2, 
      porta: 1, 
      fibra: 'Azul', 
      destino: 'CTO-003', 
      destinoPorta: 1,
      destinoFibra: 'Azul',
      status: 'Ativo',
      dataCriacao: '2023-10-16',
      criadoPor: 'Maria Santos',
      ultimaAtualizacao: '2023-10-16',
      observacoes: 'Fusão realizada com atenuação de 0.1dB'
    },
    { 
      id: 4, 
      caixa: 'CTO-003', 
      tipoCaixa: 'CTO',
      bandeja: 1, 
      porta: 3, 
      fibra: 'Laranja', 
      destino: 'CEO-004', 
      destinoPorta: 2,
      destinoFibra: 'Marrom',
      status: 'Inativo',
      dataCriacao: '2023-10-17',
      criadoPor: 'Carlos Oliveira',
      ultimaAtualizacao: '2023-10-20',
      observacoes: 'Fusão com problema, necessita revisão'
    },
  ]);

  // Formulário para nova fusão ou edição
  const [formulario, setFormulario] = useState({
    caixa: '',
    bandeja: '',
    porta: '',
    fibra: '',
    destino: '',
    destinoPorta: '',
    destinoFibra: '',
    observacoes: ''
  });

  // Função para filtrar fusões
  const fusoesFiltradas = () => {
    return fusoes
      .filter(fusao => {
        // Filtro por pesquisa
        const termoPesquisa = pesquisa.toLowerCase();
        if (termoPesquisa && !(
          fusao.caixa.toLowerCase().includes(termoPesquisa) ||
          fusao.destino.toLowerCase().includes(termoPesquisa) ||
          fusao.fibra.toLowerCase().includes(termoPesquisa) ||
          fusao.destinoFibra.toLowerCase().includes(termoPesquisa)
        )) {
          return false;
        }
        
        // Filtro por tipo de caixa
        if (filtroTipo !== 'todos' && fusao.tipoCaixa !== filtroTipo) {
          return false;
        }
        
        // Filtro por caixa específica
        if (filtroCaixa !== 'todas' && fusao.caixa !== filtroCaixa) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Ordenação
        switch (ordenacao) {
          case 'recentes':
            return new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
          case 'antigos':
            return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
          case 'caixa-asc':
            return a.caixa.localeCompare(b.caixa);
          case 'caixa-desc':
            return b.caixa.localeCompare(a.caixa);
          default:
            return 0;
        }
      });
  };

  // Função para abrir modal de detalhes
  const abrirDetalhes = (fusao: Fusao) => {
    setFusaoSelecionada(fusao);
    setModalDetalhesAberto(true);
  };

  // Função para abrir formulário de nova fusão
  const abrirNovaFusao = () => {
    setModoEdicao(false);
    setFormulario({
      caixa: '',
      bandeja: '',
      porta: '',
      fibra: '',
      destino: '',
      destinoPorta: '',
      destinoFibra: '',
      observacoes: ''
    });
    setModalFormularioAberto(true);
  };

  // Função para abrir formulário de edição
  const abrirEdicao = (fusao: Fusao) => {
    setModoEdicao(true);
    setFormulario({
      caixa: fusao.caixa,
      bandeja: fusao.bandeja.toString(),
      porta: fusao.porta.toString(),
      fibra: fusao.fibra,
      destino: fusao.destino,
      destinoPorta: fusao.destinoPorta.toString(),
      destinoFibra: fusao.destinoFibra,
      observacoes: fusao.observacoes
    });
    setFusaoSelecionada(fusao);
    setModalFormularioAberto(true);
  };

  // Função para salvar fusão (nova ou editada)
  const salvarFusao = () => {
    // Validação básica
    if (!formulario.caixa || !formulario.bandeja || !formulario.porta || !formulario.fibra ||
        !formulario.destino || !formulario.destinoPorta || !formulario.destinoFibra) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (modoEdicao && fusaoSelecionada) {
      // Atualizar fusão existente
      const fusaoAtualizada = {
        ...fusaoSelecionada,
        caixa: formulario.caixa,
        bandeja: parseInt(formulario.bandeja),
        porta: parseInt(formulario.porta),
        fibra: formulario.fibra,
        destino: formulario.destino,
        destinoPorta: parseInt(formulario.destinoPorta),
        destinoFibra: formulario.destinoFibra,
        observacoes: formulario.observacoes,
        ultimaAtualizacao: new Date().toISOString().split('T')[0]
      };

      setFusoes(fusoes.map(f => f.id === fusaoSelecionada.id ? fusaoAtualizada : f));
      toast.success('Fusão atualizada com sucesso!');
    } else {
      // Criar nova fusão
      const novaFusao = {
        id: Math.max(...fusoes.map(f => f.id)) + 1,
        caixa: formulario.caixa,
        tipoCaixa: formulario.caixa.startsWith('CTO') ? 'CTO' : 'CEO',
        bandeja: parseInt(formulario.bandeja),
        porta: parseInt(formulario.porta),
        fibra: formulario.fibra,
        destino: formulario.destino,
        destinoPorta: parseInt(formulario.destinoPorta),
        destinoFibra: formulario.destinoFibra,
        status: 'Ativo',
        dataCriacao: new Date().toISOString().split('T')[0],
        criadoPor: 'Usuário Atual', // Em um sistema real, seria o usuário logado
        ultimaAtualizacao: new Date().toISOString().split('T')[0],
        observacoes: formulario.observacoes
      };

      setFusoes([...fusoes, novaFusao]);
      toast.success('Fusão adicionada com sucesso!');
    }

    setModalFormularioAberto(false);
  };

  // Função para excluir fusão
  const excluirFusao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta fusão?')) {
      setFusoes(fusoes.filter(f => f.id !== id));
      toast.success('Fusão excluída com sucesso!');
    }
  };

  // Função para exportar dados
  const exportarDados = (formato: 'csv' | 'pdf' = 'csv') => {
    // Simulação de exportação de dados
    if (formato === 'csv') {
      // Gera CSV simples
      const header = 'Caixa,Bandeja,Porta,Fibra,Destino,Destino Porta,Destino Fibra,Status,Data de Criação,Observações';
      const rows = fusoes.map(f => `${f.caixa},${f.bandeja},${f.porta},${f.fibra},${f.destino},${f.destinoPorta},${f.destinoFibra},${f.status},${f.dataCriacao},${f.observacoes}`);
      const csvContent = [header, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fusoes.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exportação CSV concluída!');
    } else {
      toast('Exportação PDF não implementada nesta demo.');
    }
  };

  // Função para importar dados
  const importarDados = (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Simples parse de CSV (apenas para demo)
        const lines = text.split('\n').slice(1); // ignora header
        const novasFusoes = lines.filter(Boolean).map((line, idx) => {
          const [caixa, bandeja, porta, fibra, destino, destinoPorta, destinoFibra, status, dataCriacao, observacoes] = line.split(',');
          return {
            id: Math.max(...fusoes.map(f => f.id)) + idx + 1,
            caixa,
            tipoCaixa: caixa.startsWith('CTO') ? 'CTO' : 'CEO',
            bandeja: Number(bandeja),
            porta: Number(porta),
            fibra,
            destino,
            destinoPorta: Number(destinoPorta),
            destinoFibra,
            status,
            dataCriacao,
            criadoPor: 'Importado',
            ultimaAtualizacao: dataCriacao,
            observacoes
          };
        });
        setFusoes([...fusoes, ...novasFusoes]);
        toast.success('Importação concluída!');
      };
      reader.readAsText(file);
    }
  };

  // Função para acionar input de importação
  const abrirInputImportacao = () => {
    document.getElementById('input-importar-fusoes')?.click();
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="container mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Zap className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Gerenciamento de Fusões</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => exportarDados('csv')} variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => exportarDados('pdf')} variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <input id="input-importar-fusoes" type="file" accept=".csv" style={{ display: 'none' }} onChange={importarDados} />
          <Button onClick={abrirInputImportacao} variant="outline" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={abrirNovaFusao} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Nova Fusão
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar fusões..."
                className="pl-8"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de Caixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="CTO">CTO</SelectItem>
                  <SelectItem value="CEO">CEO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filtroCaixa} onValueChange={setFiltroCaixa}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Caixa Específica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Caixas</SelectItem>
                  <SelectItem value="CTO-001">CTO-001</SelectItem>
                  <SelectItem value="CTO-003">CTO-003</SelectItem>
                  <SelectItem value="CEO-002">CEO-002</SelectItem>
                  <SelectItem value="CEO-004">CEO-004</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={ordenacao} onValueChange={setOrdenacao}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recentes">Mais Recentes</SelectItem>
                  <SelectItem value="antigos">Mais Antigos</SelectItem>
                  <SelectItem value="caixa-asc">Caixa (A-Z)</SelectItem>
                  <SelectItem value="caixa-desc">Caixa (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fusões Cadastradas</CardTitle>
          <CardDescription>
            {fusoesFiltradas().length} {fusoesFiltradas().length === 1 ? 'fusão encontrada' : 'fusões encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Caixa</th>
                  <th className="p-2 text-left">Bandeja/Porta</th>
                  <th className="p-2 text-left">Fibra</th>
                  <th className="p-2 text-left">Destino</th>
                  <th className="p-2 text-left">Destino Porta/Fibra</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fusoesFiltradas().map((fusao) => (
                  <tr key={fusao.id} className="border-b last:border-b-0">
                    <td className="p-2">{fusao.caixa}</td>
                    <td className="p-2">B{fusao.bandeja}/P{fusao.porta}</td>
                    <td className="p-2">{fusao.fibra}</td>
                    <td className="p-2">{fusao.destino}</td>
                    <td className="p-2">P{fusao.destinoPorta}/{fusao.destinoFibra}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${fusao.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {fusao.status}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => abrirDetalhes(fusao)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => abrirEdicao(fusao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => excluirFusao(fusao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {fusoesFiltradas().length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Nenhuma fusão encontrada com os filtros selecionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Fusão */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Fusão</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a fusão selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {fusaoSelecionada && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Caixa de Origem</Label>
                  <p className="font-medium">{fusaoSelecionada.caixa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{fusaoSelecionada.tipoCaixa}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Bandeja</Label>
                  <p className="font-medium">{fusaoSelecionada.bandeja}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Porta</Label>
                  <p className="font-medium">{fusaoSelecionada.porta}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fibra</Label>
                  <p className="font-medium">{fusaoSelecionada.fibra}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Caixa de Destino</Label>
                  <p className="font-medium">{fusaoSelecionada.destino}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Porta</Label>
                  <p className="font-medium">{fusaoSelecionada.destinoPorta}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fibra</Label>
                  <p className="font-medium">{fusaoSelecionada.destinoFibra}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="flex items-center mt-1">
                  <div className={`h-2 w-2 rounded-full mr-2 ${fusaoSelecionada.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="font-medium">{fusaoSelecionada.status}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-medium">{fusaoSelecionada.observacoes || 'Nenhuma observação'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Criação</Label>
                  <p className="font-medium">{fusaoSelecionada.dataCriacao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criado Por</Label>
                  <p className="font-medium">{fusaoSelecionada.criadoPor}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Última Atualização</Label>
                <p className="font-medium">{fusaoSelecionada.ultimaAtualizacao}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalhesAberto(false)}>Fechar</Button>
            <Button onClick={() => {
              setModalDetalhesAberto(false);
              fusaoSelecionada && abrirEdicao(fusaoSelecionada);
            }}>Editar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário (Nova Fusão ou Edição) */}
      <Dialog open={modalFormularioAberto} onOpenChange={setModalFormularioAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modoEdicao ? 'Editar Fusão' : 'Nova Fusão'}</DialogTitle>
            <DialogDescription>
              {modoEdicao 
                ? 'Atualize as informações da fusão selecionada.' 
                : 'Preencha os dados para adicionar uma nova fusão.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caixa">Caixa de Origem</Label>
                <Input 
                  id="caixa" 
                  placeholder="Ex: CTO-001"
                  value={formulario.caixa}
                  onChange={(e) => setFormulario({...formulario, caixa: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bandeja">Bandeja</Label>
                <Input 
                  id="bandeja" 
                  type="number"
                  placeholder="Ex: 1"
                  value={formulario.bandeja}
                  onChange={(e) => setFormulario({...formulario, bandeja: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="porta">Porta</Label>
                <Input 
                  id="porta" 
                  type="number"
                  placeholder="Ex: 1"
                  value={formulario.porta}
                  onChange={(e) => setFormulario({...formulario, porta: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fibra">Fibra</Label>
                <Select 
                  value={formulario.fibra} 
                  onValueChange={(value) => setFormulario({...formulario, fibra: value})}
                >
                  <SelectTrigger id="fibra">
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Azul">Azul</SelectItem>
                    <SelectItem value="Verde">Verde</SelectItem>
                    <SelectItem value="Laranja">Laranja</SelectItem>
                    <SelectItem value="Marrom">Marrom</SelectItem>
                    <SelectItem value="Cinza">Cinza</SelectItem>
                    <SelectItem value="Branco">Branco</SelectItem>
                    <SelectItem value="Vermelho">Vermelho</SelectItem>
                    <SelectItem value="Preto">Preto</SelectItem>
                    <SelectItem value="Amarelo">Amarelo</SelectItem>
                    <SelectItem value="Violeta">Violeta</SelectItem>
                    <SelectItem value="Rosa">Rosa</SelectItem>
                    <SelectItem value="Aqua">Aqua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destino">Caixa de Destino</Label>
                <Input 
                  id="destino" 
                  placeholder="Ex: CEO-002"
                  value={formulario.destino}
                  onChange={(e) => setFormulario({...formulario, destino: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destinoPorta">Porta de Destino</Label>
                <Input 
                  id="destinoPorta" 
                  type="number"
                  placeholder="Ex: 3"
                  value={formulario.destinoPorta}
                  onChange={(e) => setFormulario({...formulario, destinoPorta: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destinoFibra">Fibra de Destino</Label>
              <Select 
                value={formulario.destinoFibra} 
                onValueChange={(value) => setFormulario({...formulario, destinoFibra: value})}
              >
                <SelectTrigger id="destinoFibra">
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Laranja">Laranja</SelectItem>
                  <SelectItem value="Marrom">Marrom</SelectItem>
                  <SelectItem value="Cinza">Cinza</SelectItem>
                  <SelectItem value="Branco">Branco</SelectItem>
                  <SelectItem value="Vermelho">Vermelho</SelectItem>
                  <SelectItem value="Preto">Preto</SelectItem>
                  <SelectItem value="Amarelo">Amarelo</SelectItem>
                  <SelectItem value="Violeta">Violeta</SelectItem>
                  <SelectItem value="Rosa">Rosa</SelectItem>
                  <SelectItem value="Aqua">Aqua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input 
                id="observacoes" 
                placeholder="Observações sobre a fusão"
                value={formulario.observacoes}
                onChange={(e) => setFormulario({...formulario, observacoes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalFormularioAberto(false)}>Cancelar</Button>
            <Button onClick={salvarFusao}>{modoEdicao ? 'Atualizar' : 'Adicionar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
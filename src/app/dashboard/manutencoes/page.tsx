'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Search, Plus, Filter, ArrowUpDown, Eye, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Manutencao {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
  local: string;
  dataAgendada: string;
  dataRealizada: string | null;
  status: string;
  tecnico: string;
  observacoes: string;
  prioridade: string;
}

/**
 * Página de gerenciamento de manutenções
 * Permite visualizar, adicionar, editar e excluir registros de manutenções preventivas e corretivas
 */
export default function ManutencoesPage() {
  // Estado para controle de pesquisa e filtros
  const [pesquisa, setPesquisa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [abaSelecionada, setAbaSelecionada] = useState('todas');
  
  // Estado para controle do modal de detalhes
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState<Manutencao | null>(null);

  // Estado para controle do modal de formulário
  const [modalFormularioAberto, setModalFormularioAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // Dados simulados de manutenções
  const [manutencoes, setManutencoes] = useState([
    { 
      id: 1, 
      tipo: 'Preventiva', 
      titulo: 'Inspeção de rotina CTO-001',
      descricao: 'Verificação de integridade física e limpeza da caixa CTO-001',
      local: 'CTO-001',
      dataAgendada: '2023-11-10',
      dataRealizada: '2023-11-10',
      status: 'Concluída',
      tecnico: 'João Silva',
      observacoes: 'Caixa em bom estado, sem sinais de umidade ou danos',
      prioridade: 'Normal'
    },
    { 
      id: 2, 
      tipo: 'Corretiva', 
      titulo: 'Reparo de fusão CTO-003',
      descricao: 'Reparo de fusão com alta atenuação na porta 3 da CTO-003',
      local: 'CTO-003',
      dataAgendada: '2023-11-12',
      dataRealizada: '2023-11-12',
      status: 'Concluída',
      tecnico: 'Maria Santos',
      observacoes: 'Fusão refeita com sucesso, atenuação normalizada',
      prioridade: 'Alta'
    },
    { 
      id: 3, 
      tipo: 'Preventiva', 
      titulo: 'Verificação de cabos aéreos',
      descricao: 'Inspeção visual dos cabos aéreos no trecho entre CEO-002 e CTO-005',
      local: 'Rota CEO-002 a CTO-005',
      dataAgendada: '2023-11-15',
      dataRealizada: null,
      status: 'Agendada',
      tecnico: 'Carlos Oliveira',
      observacoes: '',
      prioridade: 'Normal'
    },
    { 
      id: 4, 
      tipo: 'Corretiva', 
      titulo: 'Reparo emergencial - cabo rompido',
      descricao: 'Reparo de cabo rompido por acidente de trânsito na Av. Principal',
      local: 'Av. Principal, próximo ao nº 1500',
      dataAgendada: '2023-11-08',
      dataRealizada: '2023-11-08',
      status: 'Concluída',
      tecnico: 'Pedro Souza',
      observacoes: 'Cabo substituído em um trecho de 50 metros, todas as fusões refeitas',
      prioridade: 'Urgente'
    },
    { 
      id: 5, 
      tipo: 'Corretiva', 
      titulo: 'Verificação de sinal baixo',
      descricao: 'Cliente relatou sinal fraco, verificar toda a rota até a CTO-008',
      local: 'CTO-008',
      dataAgendada: '2023-11-14',
      dataRealizada: null,
      status: 'Em andamento',
      tecnico: 'Ana Costa',
      observacoes: 'Identificado problema na fusão da caixa de entrada do cliente',
      prioridade: 'Alta'
    },
  ]);

  // Formulário para nova manutenção ou edição
  const [formulario, setFormulario] = useState({
    tipo: '',
    titulo: '',
    descricao: '',
    local: '',
    dataAgendada: '',
    status: '',
    tecnico: '',
    observacoes: '',
    prioridade: ''
  });

  // Função para filtrar manutenções
  const manutencoesFiltradas = () => {
    return manutencoes
      .filter(manutencao => {
        // Filtro por aba
        if (abaSelecionada === 'preventivas' && manutencao.tipo !== 'Preventiva') return false;
        if (abaSelecionada === 'corretivas' && manutencao.tipo !== 'Corretiva') return false;
        
        // Filtro por pesquisa
        const termoPesquisa = pesquisa.toLowerCase();
        if (termoPesquisa && !(
          manutencao.titulo.toLowerCase().includes(termoPesquisa) ||
          manutencao.local.toLowerCase().includes(termoPesquisa) ||
          manutencao.tecnico.toLowerCase().includes(termoPesquisa)
        )) {
          return false;
        }
        
        // Filtro por tipo
        if (filtroTipo !== 'todos' && manutencao.tipo !== filtroTipo) {
          return false;
        }
        
        // Filtro por status
        if (filtroStatus !== 'todos' && manutencao.status !== filtroStatus) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Ordenação
        switch (ordenacao) {
          case 'recentes':
            return new Date(b.dataAgendada).getTime() - new Date(a.dataAgendada).getTime();
          case 'antigos':
            return new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime();
          case 'prioridade':
            const prioridadeOrdem = { 'Urgente': 0, 'Alta': 1, 'Normal': 2, 'Baixa': 3 };
            return prioridadeOrdem[a.prioridade as keyof typeof prioridadeOrdem] - prioridadeOrdem[b.prioridade as keyof typeof prioridadeOrdem];
          default:
            return 0;
        }
      });
  };

  // Função para abrir modal de detalhes
  const abrirDetalhes = (manutencao: Manutencao) => {
    setManutencaoSelecionada(manutencao);
    setModalDetalhesAberto(true);
  };

  // Função para abrir formulário de nova manutenção
  const abrirNovaManutencao = () => {
    setModoEdicao(false);
    setFormulario({
      tipo: 'Preventiva',
      titulo: '',
      descricao: '',
      local: '',
      dataAgendada: new Date().toISOString().split('T')[0],
      status: 'Agendada',
      tecnico: '',
      observacoes: '',
      prioridade: 'Normal'
    });
    setModalFormularioAberto(true);
  };

  // Função para abrir formulário de edição
  const abrirEdicao = (manutencao: Manutencao) => {
    setModoEdicao(true);
    setFormulario({
      tipo: manutencao.tipo,
      titulo: manutencao.titulo,
      descricao: manutencao.descricao,
      local: manutencao.local,
      dataAgendada: manutencao.dataAgendada,
      status: manutencao.status,
      tecnico: manutencao.tecnico,
      observacoes: manutencao.observacoes || '',
      prioridade: manutencao.prioridade
    });
    setManutencaoSelecionada(manutencao);
    setModalFormularioAberto(true);
  };

  // Função para salvar manutenção (nova ou editada)
  const salvarManutencao = () => {
    // Validação básica
    if (!formulario.titulo || !formulario.descricao || !formulario.local || 
        !formulario.dataAgendada || !formulario.status || !formulario.tecnico) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (modoEdicao && manutencaoSelecionada) {
      // Atualizar manutenção existente
      const manutencaoAtualizada = {
        ...manutencaoSelecionada,
        tipo: formulario.tipo,
        titulo: formulario.titulo,
        descricao: formulario.descricao,
        local: formulario.local,
        dataAgendada: formulario.dataAgendada,
        status: formulario.status,
        tecnico: formulario.tecnico,
        observacoes: formulario.observacoes,
        prioridade: formulario.prioridade,
        dataRealizada: formulario.status === 'Concluída' 
          ? (manutencaoSelecionada.dataRealizada || new Date().toISOString().split('T')[0])
          : manutencaoSelecionada.dataRealizada
      };

      setManutencoes(manutencoes.map(m => m.id === manutencaoSelecionada.id ? manutencaoAtualizada : m));
      toast.success('Manutenção atualizada com sucesso!');
    } else {
      // Criar nova manutenção
      const novaManutencao = {
        id: Math.max(...manutencoes.map(m => m.id)) + 1,
        tipo: formulario.tipo,
        titulo: formulario.titulo,
        descricao: formulario.descricao,
        local: formulario.local,
        dataAgendada: formulario.dataAgendada,
        dataRealizada: formulario.status === 'Concluída' ? new Date().toISOString().split('T')[0] : null,
        status: formulario.status,
        tecnico: formulario.tecnico,
        observacoes: formulario.observacoes,
        prioridade: formulario.prioridade
      };

      setManutencoes([...manutencoes, novaManutencao]);
      toast.success('Manutenção adicionada com sucesso!');
    }

    setModalFormularioAberto(false);
  };

  // Função para excluir manutenção
  const excluirManutencao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta manutenção?')) {
      setManutencoes(manutencoes.filter(m => m.id !== id));
      toast.success('Manutenção excluída com sucesso!');
    }
  };

  // Função para obter a cor do badge de status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Em andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Agendada': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Função para obter a cor do badge de prioridade
  const getPrioridadeBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Urgente': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
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
          <Wrench className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl text-foreground font-bold">Gerenciamento de Manutenções</h1>
        </div>
        
        <Button onClick={abrirNovaManutencao} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Nova Manutenção
        </Button>
      </header>

      <Tabs defaultValue="todas" value={abaSelecionada} onValueChange={setAbaSelecionada} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="preventivas">Preventivas</TabsTrigger>
          <TabsTrigger value="corretivas">Corretivas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar manutenções..."
                className="pl-8"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Agendada">Agendada</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
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
                  <SelectItem value="prioridade">Por Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manutenções</CardTitle>
          <CardDescription>
            {manutencoesFiltradas().length} {manutencoesFiltradas().length === 1 ? 'manutenção encontrada' : 'manutenções encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Título</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Local</th>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Prioridade</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {manutencoesFiltradas().map((manutencao) => (
                  <tr key={manutencao.id} className="border-b last:border-b-0">
                    <td className="p-2">{manutencao.titulo}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={manutencao.tipo === 'Preventiva' ? 'border-blue-500' : 'border-orange-500'}>
                        {manutencao.tipo}
                      </Badge>
                    </td>
                    <td className="p-2">{manutencao.local}</td>
                    <td className="p-2">{manutencao.dataAgendada}</td>
                    <td className="p-2">
                      <Badge className={getStatusBadgeColor(manutencao.status)}>
                        {manutencao.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getPrioridadeBadgeColor(manutencao.prioridade)}>
                        {manutencao.prioridade}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => abrirDetalhes(manutencao)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => abrirEdicao(manutencao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => excluirManutencao(manutencao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {manutencoesFiltradas().length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Nenhuma manutenção encontrada com os filtros selecionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Manutenção */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Manutenção</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a manutenção selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {manutencaoSelecionada && (
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-lg font-medium">{manutencaoSelecionada.titulo}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className={manutencaoSelecionada.tipo === 'Preventiva' ? 'border-blue-500' : 'border-orange-500'}>
                    {manutencaoSelecionada.tipo}
                  </Badge>
                  <Badge className={getStatusBadgeColor(manutencaoSelecionada.status)}>
                    {manutencaoSelecionada.status}
                  </Badge>
                  <Badge className={getPrioridadeBadgeColor(manutencaoSelecionada.prioridade)}>
                    {manutencaoSelecionada.prioridade}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="font-medium">{manutencaoSelecionada.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Local</Label>
                  <p className="font-medium">{manutencaoSelecionada.local}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Técnico Responsável</Label>
                  <p className="font-medium">{manutencaoSelecionada.tecnico}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data Agendada</Label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{manutencaoSelecionada.dataAgendada}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Realizada</Label>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{manutencaoSelecionada.dataRealizada || 'Não realizada'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-medium">{manutencaoSelecionada.observacoes || 'Nenhuma observação'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalhesAberto(false)}>Fechar</Button>
            <Button onClick={() => {
              setModalDetalhesAberto(false);
               manutencaoSelecionada && abrirEdicao(manutencaoSelecionada);
            }}>Editar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário (Nova Manutenção ou Edição) */}
      <Dialog open={modalFormularioAberto} onOpenChange={setModalFormularioAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modoEdicao ? 'Editar Manutenção' : 'Nova Manutenção'}</DialogTitle>
            <DialogDescription>
              {modoEdicao 
                ? 'Atualize as informações da manutenção selecionada.' 
                : 'Preencha os dados para agendar uma nova manutenção.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Manutenção</Label>
                <Select 
                  value={formulario.tipo} 
                  onValueChange={(value) => setFormulario({...formulario, tipo: value})}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={formulario.prioridade} 
                  onValueChange={(value) => setFormulario({...formulario, prioridade: value})}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Inspeção de rotina CTO-001"
                value={formulario.titulo}
                onChange={(e) => setFormulario({...formulario, titulo: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descreva detalhadamente a manutenção a ser realizada"
                value={formulario.descricao}
                onChange={(e) => setFormulario({...formulario, descricao: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input 
                  id="local" 
                  placeholder="Ex: CTO-001 ou endereço"
                  value={formulario.local}
                  onChange={(e) => setFormulario({...formulario, local: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataAgendada">Data Agendada</Label>
                <Input 
                  id="dataAgendada" 
                  type="date"
                  value={formulario.dataAgendada}
                  onChange={(e) => setFormulario({...formulario, dataAgendada: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tecnico">Técnico Responsável</Label>
                <Input 
                  id="tecnico" 
                  placeholder="Nome do técnico"
                  value={formulario.tecnico}
                  onChange={(e) => setFormulario({...formulario, tecnico: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formulario.status} 
                  onValueChange={(value) => setFormulario({...formulario, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendada">Agendada</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações adicionais"
                value={formulario.observacoes}
                onChange={(e) => setFormulario({...formulario, observacoes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalFormularioAberto(false)}>Cancelar</Button>
            <Button onClick={salvarManutencao}>{modoEdicao ? 'Atualizar' : 'Agendar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
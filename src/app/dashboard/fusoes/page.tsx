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
  id: string;
  capilarOrigemId: string;
  capilarDestinoId: string;
  tipoFusao: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente' | '';
  status: 'Ativa' | 'Inativa' | 'Manutencao';
  qualidadeSinal?: number;
  perdaInsercao?: number;
  posicaoFusao?: number;
  observacoes?: string;
  caixaId: string;
  bandejaId?: string;
  criadoPorId?: string;
  createdAt: string;
  updatedAt: string;
  // Campos para exibição (vindos das relações)
  capilarOrigem?: { numero: number; cor: string };
  capilarDestino?: { numero: number; cor: string };
  caixa?: { nome: string; tipo: string };
  bandeja?: { numero: number };
  criadoPor?: { nome: string };
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
  const [fusoes, setFusoes] = useState<Fusao[]>([
    {
      id: '1',
      capilarOrigemId: 'cap-001',
      capilarDestinoId: 'cap-002',
      tipoFusao: '' as const,
      status: 'Ativa',
      qualidadeSinal: 95.5,
      perdaInsercao: 0.1,
      posicaoFusao: 1,
      caixaId: 'cto-001',
      bandejaId: 'bandeja-001',
      criadoPorId: 'user-001',
      createdAt: '2023-10-15T10:00:00Z',
      updatedAt: '2023-10-15T10:00:00Z',
      observacoes: 'Fusão realizada com sucesso',
      capilarOrigem: { numero: 1, cor: 'Azul' },
      capilarDestino: { numero: 3, cor: 'Verde' },
      caixa: { nome: 'CTO-001', tipo: 'CTO' },
      bandeja: { numero: 1 },
      criadoPor: { nome: 'João Silva' }
    },
    {
      id: '2',
      capilarOrigemId: 'cap-003',
      capilarDestinoId: 'cap-004',
      tipoFusao: 'capilar_splitter',
      status: 'Ativa',
      qualidadeSinal: 92.3,
      perdaInsercao: 0.2,
      posicaoFusao: 2,
      caixaId: 'cto-001',
      bandejaId: 'bandeja-001',
      criadoPorId: 'user-001',
      createdAt: '2023-10-15T11:00:00Z',
      updatedAt: '2023-10-15T11:00:00Z',
      observacoes: 'Fusão realizada com sucesso',
      capilarOrigem: { numero: 2, cor: 'Verde' },
      capilarDestino: { numero: 4, cor: 'Azul' },
      caixa: { nome: 'CTO-001', tipo: 'CTO' },
      bandeja: { numero: 1 },
      criadoPor: { nome: 'João Silva' }
    },
    {
      id: '3',
      capilarOrigemId: 'cap-005',
      capilarDestinoId: 'cap-006',
      tipoFusao: 'splitter_cliente',
      status: 'Ativa',
      qualidadeSinal: 88.7,
      perdaInsercao: 0.15,
      posicaoFusao: 1,
      caixaId: 'ceo-002',
      bandejaId: 'bandeja-002',
      criadoPorId: 'user-002',
      createdAt: '2023-10-16T09:00:00Z',
      updatedAt: '2023-10-16T09:00:00Z',
      observacoes: 'Fusão realizada com atenuação de 0.15dB',
      capilarOrigem: { numero: 1, cor: 'Azul' },
      capilarDestino: { numero: 1, cor: 'Azul' },
      caixa: { nome: 'CEO-002', tipo: 'CEO' },
      bandeja: { numero: 2 },
      criadoPor: { nome: 'Maria Santos' }
    },
    {
      id: '4',
      capilarOrigemId: 'cap-007',
      capilarDestinoId: 'cap-008',
      tipoFusao: 'capilar_capilar',
      status: 'Manutencao',
      qualidadeSinal: 75.2,
      perdaInsercao: 0.8,
      posicaoFusao: 3,
      caixaId: 'cto-003',
      bandejaId: 'bandeja-003',
      criadoPorId: 'user-003',
      createdAt: '2023-10-17T14:00:00Z',
      updatedAt: '2023-10-20T16:00:00Z',
      observacoes: 'Fusão com problema, necessita revisão',
      capilarOrigem: { numero: 3, cor: 'Laranja' },
      capilarDestino: { numero: 2, cor: 'Marrom' },
      caixa: { nome: 'CTO-003', tipo: 'CTO' },
      bandeja: { numero: 1 },
      criadoPor: { nome: 'Carlos Oliveira' }
    },
  ]);

  // Formulário para nova fusão ou edição
  const [formulario, setFormulario] = useState<{
    caixaId: string;
    bandejaId: string;
    capilarOrigemId: string;
    capilarDestinoId: string;
    tipoFusao: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente' | '';
    status: 'Ativa' | 'Inativa' | 'Manutencao';
    qualidadeSinal: string;
    perdaInsercao: string;
    posicaoFusao: string;
    observacoes: string;
  }>({
    caixaId: '',
    bandejaId: '',
    capilarOrigemId: '',
    capilarDestinoId: '',
    tipoFusao: '' as const,
    status: 'Ativa',
    qualidadeSinal: '',
    perdaInsercao: '',
    posicaoFusao: '',
    observacoes: ''
  });

  // Função para filtrar fusões
  const fusoesFiltradas = () => {
    return fusoes
      .filter(fusao => {
        // Filtro por pesquisa
        const termoPesquisa = pesquisa.toLowerCase();
        if (termoPesquisa && !(
          fusao.caixa?.nome.toLowerCase().includes(termoPesquisa) ||
          fusao.capilarOrigem?.cor.toLowerCase().includes(termoPesquisa) ||
          fusao.capilarDestino?.cor.toLowerCase().includes(termoPesquisa) ||
          fusao.tipoFusao.toLowerCase().includes(termoPesquisa) ||
          fusao.status.toLowerCase().includes(termoPesquisa)
        )) {
          return false;
        }

        // Filtro por tipo de caixa
        if (filtroTipo !== 'todos' && fusao.caixa?.tipo !== filtroTipo) {
          return false;
        }

        // Filtro por caixa específica
        if (filtroCaixa !== 'todas' && fusao.caixa?.nome !== filtroCaixa) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Ordenação
        switch (ordenacao) {
          case 'recentes':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'antigos':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'caixa-asc':
            return (a.caixa?.nome || '').localeCompare(b.caixa?.nome || '');
          case 'caixa-desc':
            return (b.caixa?.nome || '').localeCompare(a.caixa?.nome || '');
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
      caixaId: '',
      bandejaId: '',
      capilarOrigemId: '',
      capilarDestinoId: '',
      tipoFusao: '' as const,
      status: 'Ativa',
      qualidadeSinal: '',
      perdaInsercao: '',
      posicaoFusao: '',
      observacoes: ''
    });
    setModalFormularioAberto(true);
  };

  // Função para abrir formulário de edição
  const abrirEdicao = (fusao: Fusao) => {
    setModoEdicao(true);
    setFormulario({
      caixaId: fusao.caixaId,
      bandejaId: fusao.bandejaId || '',
      capilarOrigemId: fusao.capilarOrigemId,
      capilarDestinoId: fusao.capilarDestinoId,
      tipoFusao: fusao.tipoFusao,
      status: fusao.status,
      qualidadeSinal: fusao.qualidadeSinal?.toString() || '',
      perdaInsercao: fusao.perdaInsercao?.toString() || '',
      posicaoFusao: fusao.posicaoFusao?.toString() || '',
      observacoes: fusao.observacoes || ''
    });
    setFusaoSelecionada(fusao);
    setModalFormularioAberto(true);
  };

  // Função para editar fusão (compatibilidade)
  const editarFusao = (fusao: Fusao) => {
    abrirEdicao(fusao);
  };

  // Função para salvar fusão (nova ou editada)
  const salvarFusao = () => {
    // Validação básica
    if (!formulario.caixaId || !formulario.capilarOrigemId || !formulario.capilarDestinoId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const getCoresCapilares = () => {
      return ['Azul', 'Verde', 'Laranja', 'Marrom', 'Cinza', 'Branco', 'Vermelho', 'Preto', 'Amarelo', 'Violeta', 'Rosa', 'Ciano'];
    };

    const getCaixaNome = (caixaId: string) => {
      const caixaMap: { [key: string]: { nome: string; tipo: string } } = {
        'cto-001': { nome: 'CTO-001', tipo: 'CTO' },
        'cto-002': { nome: 'CTO-002', tipo: 'CTO' },
        'cto-003': { nome: 'CTO-003', tipo: 'CTO' },
        'ceo-002': { nome: 'CEO-002', tipo: 'CEO' }
      };
      return caixaMap[caixaId] || { nome: 'N/A', tipo: 'N/A' };
    };

    if (modoEdicao && fusaoSelecionada) {
      // Atualizar fusão existente
      const fusaoAtualizada: Fusao = {
        ...fusaoSelecionada,
        capilarOrigemId: formulario.capilarOrigemId,
        capilarDestinoId: formulario.capilarDestinoId,
        tipoFusao: formulario.tipoFusao,
        status: formulario.status,
        qualidadeSinal: formulario.qualidadeSinal ? parseFloat(formulario.qualidadeSinal) : undefined,
        perdaInsercao: formulario.perdaInsercao ? parseFloat(formulario.perdaInsercao) : undefined,
        posicaoFusao: formulario.posicaoFusao ? parseInt(formulario.posicaoFusao) : undefined,
        caixaId: formulario.caixaId,
        bandejaId: formulario.bandejaId || undefined,
        observacoes: formulario.observacoes || undefined,
        updatedAt: new Date().toISOString()
      };

      setFusoes(fusoes.map(f => f.id === fusaoSelecionada.id ? fusaoAtualizada : f));
      toast.success('Fusão atualizada com sucesso!');
    } else {
      // Criar nova fusão
      const caixaInfo = getCaixaNome(formulario.caixaId);
      const novaFusao: Fusao = {
        id: (Math.max(...fusoes.map(f => parseInt(f.id))) + 1).toString(),
        capilarOrigemId: formulario.capilarOrigemId,
        capilarDestinoId: formulario.capilarDestinoId,
        tipoFusao: formulario.tipoFusao,
        status: formulario.status,
        qualidadeSinal: formulario.qualidadeSinal ? parseFloat(formulario.qualidadeSinal) : undefined,
        perdaInsercao: formulario.perdaInsercao ? parseFloat(formulario.perdaInsercao) : undefined,
        posicaoFusao: formulario.posicaoFusao ? parseInt(formulario.posicaoFusao) : undefined,
        caixaId: formulario.caixaId,
        bandejaId: formulario.bandejaId || undefined,
        criadoPorId: 'user-current', // Em um sistema real, seria o usuário logado
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        observacoes: formulario.observacoes || undefined,
        // Dados relacionados para exibição
        caixa: caixaInfo,
        bandeja: { numero: parseInt(formulario.bandejaId?.replace('bandeja-', '') || '1') },
        capilarOrigem: { 
          numero: parseInt(formulario.capilarOrigemId.replace('cap-', '')) || 1, 
          cor: getCoresCapilares()[parseInt(formulario.capilarOrigemId.replace('cap-', '')) - 1] || 'Azul' 
        },
        capilarDestino: { 
          numero: parseInt(formulario.capilarDestinoId.replace('cap-', '')) || 1, 
          cor: getCoresCapilares()[parseInt(formulario.capilarDestinoId.replace('cap-', '')) - 1] || 'Azul' 
        },
        criadoPor: { nome: 'Usuário Atual' }
      };

      setFusoes([...fusoes, novaFusao]);
      toast.success('Fusão adicionada com sucesso!');
    }

    setModalFormularioAberto(false);
  };

  // Função para excluir fusão
  const excluirFusao = (id: string) => {
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
      const header = 'ID,Caixa,Bandeja,Capilar Origem,Capilar Destino,Tipo Fusão,Status,Qualidade Sinal,Perda Inserção,Posição,Data Criação,Observações';
      const rows = fusoes.map(f => `${f.id},${f.caixa?.nome || ''},${f.bandeja?.numero || ''},${f.capilarOrigem?.numero || ''},${f.capilarDestino?.numero || ''},${f.tipoFusao},${f.status},${f.qualidadeSinal || ''},${f.perdaInsercao || ''},${f.posicaoFusao || ''},${f.createdAt},${f.observacoes || ''}`);
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
          const [id, caixa, bandeja, capilarOrigem, capilarDestino, tipoFusao, status, qualidadeSinal, perdaInsercao, posicao, dataCriacao, observacoes] = line.split(',');
          return {
            id: id || (Math.max(...fusoes.map(f => parseInt(f.id))) + idx + 1).toString(),
            capilarOrigemId: `cap-${capilarOrigem}`,
            capilarDestinoId: `cap-${capilarDestino}`,
            tipoFusao: (tipoFusao as 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente') || 'capilar_capilar',
            status: (status as 'Ativa' | 'Inativa' | 'Manutencao') || 'Ativa',
            qualidadeSinal: qualidadeSinal ? parseFloat(qualidadeSinal) : undefined,
            perdaInsercao: perdaInsercao ? parseFloat(perdaInsercao) : undefined,
            posicaoFusao: posicao ? parseInt(posicao) : undefined,
            caixaId: `caixa-${caixa}`,
            bandejaId: bandeja ? `bandeja-${bandeja}` : undefined,
            criadoPorId: 'user-imported',
            createdAt: dataCriacao || new Date().toISOString(),
            updatedAt: dataCriacao || new Date().toISOString(),
            observacoes: observacoes || undefined
          } as Fusao;
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
          <h1 className="text-2xl text-primary font-bold">Gerenciamento de Fusões</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 text-foreground">
          <Button onClick={() => exportarDados('csv')} variant="outline" className="flex cursor-pointer items-center gap-1">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => exportarDados('pdf')} variant="outline" className="flex items-center gap-1  cursor-pointer ">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <input id="input-importar-fusoes" type="file" accept=".csv" style={{ display: 'none' }} onChange={importarDados} />
          <Button onClick={abrirInputImportacao} variant="outline" className="flex items-center gap-1  cursor-pointer ">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={abrirNovaFusao} className="flex items-center gap-1  cursor-pointer ">
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
                  <th className="p-2 text-left">Bandeja</th>
                  <th className="p-2 text-left">Capilar Origem</th>
                  <th className="p-2 text-left">Capilar Destino</th>
                  <th className="p-2 text-left">Tipo Fusão</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fusoesFiltradas().map((fusao) => (
                  <tr key={fusao.id} className="border-b last:border-b-0">
                    <td className="p-2">{fusao.caixa?.nome || 'N/A'}</td>
                    <td className="p-2">B{fusao.bandeja?.numero || 'N/A'}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: fusao.capilarOrigem?.cor || '#ccc' }}
                        />
                        Cap {fusao.capilarOrigem?.numero || 'N/A'}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: fusao.capilarDestino?.cor || '#ccc' }}
                        />
                        Cap {fusao.capilarDestino?.numero || 'N/A'}
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {fusao.tipoFusao.replace('_', '-')}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          fusao.status === 'Ativa' ? 'bg-green-500' : 
                          fusao.status === 'Inativa' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
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
                          onClick={() => editarFusao(fusao)}
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
                  <Label className="text-muted-foreground">Caixa</Label>
                  <p className="font-medium">{fusaoSelecionada.caixa?.nome || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo Caixa</Label>
                  <p className="font-medium">{fusaoSelecionada.caixa?.tipo || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Bandeja</Label>
                  <p className="font-medium">B{fusaoSelecionada.bandeja?.numero || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Fusão</Label>
                  <p className="font-medium">{fusaoSelecionada.tipoFusao.replace('_', '-')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Capilar Origem</Label>
                  <div className="flex items-center mt-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: fusaoSelecionada.capilarOrigem?.cor || '#ccc' }}
                    />
                    <p className="font-medium">Cap {fusaoSelecionada.capilarOrigem?.numero || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Capilar Destino</Label>
                  <div className="flex items-center mt-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: fusaoSelecionada.capilarDestino?.cor || '#ccc' }}
                    />
                    <p className="font-medium">Cap {fusaoSelecionada.capilarDestino?.numero || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Qualidade do Sinal</Label>
                  <p className="font-medium">{fusaoSelecionada.qualidadeSinal ? `${fusaoSelecionada.qualidadeSinal}%` : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Perda de Inserção</Label>
                  <p className="font-medium">{fusaoSelecionada.perdaInsercao ? `${fusaoSelecionada.perdaInsercao}dB` : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Posição da Fusão</Label>
                  <p className="font-medium">{fusaoSelecionada.posicaoFusao || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center mt-1">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      fusaoSelecionada.status === 'Ativa' ? 'bg-green-500' : 
                      fusaoSelecionada.status === 'Inativa' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <p className="font-medium">{fusaoSelecionada.status}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="font-medium">{fusaoSelecionada.observacoes || 'Nenhuma observação'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data de Criação</Label>
                  <p className="font-medium">{new Date(fusaoSelecionada.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criado Por</Label>
                  <p className="font-medium">{fusaoSelecionada.criadoPor?.nome || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Última Atualização</Label>
                <p className="font-medium">{new Date(fusaoSelecionada.updatedAt).toLocaleString('pt-BR')}</p>
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
                <Label htmlFor="caixaId">Caixa</Label>
                <Select
                  value={formulario.caixaId}
                  onValueChange={(value) => setFormulario({ ...formulario, caixaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a caixa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cto-001">CTO-001</SelectItem>
                    <SelectItem value="cto-002">CTO-002</SelectItem>
                    <SelectItem value="cto-003">CTO-003</SelectItem>
                    <SelectItem value="ceo-002">CEO-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandejaId">Bandeja</Label>
                <Select
                  value={formulario.bandejaId}
                  onValueChange={(value) => setFormulario({ ...formulario, bandejaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bandeja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bandeja-001">Bandeja 1</SelectItem>
                    <SelectItem value="bandeja-002">Bandeja 2</SelectItem>
                    <SelectItem value="bandeja-003">Bandeja 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capilarOrigemId">Capilar Origem</Label>
                <Select
                  value={formulario.capilarOrigemId}
                  onValueChange={(value) => setFormulario({ ...formulario, capilarOrigemId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o capilar origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cap-001">Capilar 1 (Azul)</SelectItem>
                    <SelectItem value="cap-002">Capilar 2 (Verde)</SelectItem>
                    <SelectItem value="cap-003">Capilar 3 (Laranja)</SelectItem>
                    <SelectItem value="cap-004">Capilar 4 (Marrom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capilarDestinoId">Capilar Destino</Label>
                <Select
                  value={formulario.capilarDestinoId}
                  onValueChange={(value) => setFormulario({ ...formulario, capilarDestinoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o capilar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cap-001">Capilar 1 (Azul)</SelectItem>
                    <SelectItem value="cap-002">Capilar 2 (Verde)</SelectItem>
                    <SelectItem value="cap-003">Capilar 3 (Laranja)</SelectItem>
                    <SelectItem value="cap-004">Capilar 4 (Marrom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoFusao">Tipo de Fusão</Label>
                <Select
                   value={formulario.tipoFusao}
                   onValueChange={(value: 'capilar_capilar' | 'capilar_splitter' | 'splitter_cliente') => setFormulario({ ...formulario, tipoFusao: value })}
                 >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capilar_capilar">Capilar-Capilar</SelectItem>
                    <SelectItem value="capilar_splitter">Capilar-Splitter</SelectItem>
                    <SelectItem value="splitter_cliente">Splitter-Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                   value={formulario.status}
                   onValueChange={(value: 'Ativa' | 'Inativa' | 'Manutencao') => setFormulario({ ...formulario, status: value })}
                 >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                    <SelectItem value="Manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualidadeSinal">Qualidade do Sinal (%)</Label>
                <Input
                  id="qualidadeSinal"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ex: 95.5"
                  value={formulario.qualidadeSinal}
                  onChange={(e) => setFormulario({ ...formulario, qualidadeSinal: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perdaInsercao">Perda de Inserção (dB)</Label>
                <Input
                  id="perdaInsercao"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.15"
                  value={formulario.perdaInsercao}
                  onChange={(e) => setFormulario({ ...formulario, perdaInsercao: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="posicaoFusao">Posição da Fusão</Label>
              <Input
                id="posicaoFusao"
                type="number"
                placeholder="Ex: 1"
                value={formulario.posicaoFusao}
                onChange={(e) => setFormulario({ ...formulario, posicaoFusao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Observações sobre a fusão"
                value={formulario.observacoes}
                onChange={(e) => setFormulario({ ...formulario, observacoes: e.target.value })}
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
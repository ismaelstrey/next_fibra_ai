'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  BoxIcon,
  SearchIcon,
  PlusIcon,
  FilterIcon,
  ArrowUpDownIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  LoaderIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCaixa, CaixaAPI } from '@/hooks/useCaixa';
import { useApiService } from '@/hooks/useApiService';

/**
 * Página de gerenciamento de caixas
 * Permite visualizar, criar, editar e excluir caixas de fibra óptica
 */
export default function CaixasPage() {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'tipo' | 'cidade'>('nome');
  const [ordem, setOrdem] = useState<'asc' | 'desc'>('asc');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroCidade, setFiltroCidade] = useState<string>('');
  const [filtroCapacidade, setFiltroCapacidade] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);

  // Hooks para API
  const {
    listarCaixa,
    excluirCaixa,
    isLoading: loadingCaixas,
    error: errorCaixas
  } = useCaixa();
  
  const {
    cidades,
    isLoading: loadingCidades
  } = useApiService();

  // Estados para dados
  const [caixas, setCaixas] = useState<CaixaAPI[]>([]);
  const [cidades_lista, setCidadesLista] = useState<any[]>([]);
  const [paginacao, setPaginacao] = useState<any>(null);
  const [carregandoExclusao, setCarregandoExclusao] = useState<string | null>(null);

  // Carrega dados iniciais
  useEffect(() => {
    carregarCaixas();
    carregarCidades();
  }, [pagina, filtroTipo, filtroCidade, filtroCapacidade]);

  /**
   * Carrega a lista de caixas da API
   */
  const carregarCaixas = async () => {
    try {
      const params: any = {
        pagina,
        limite,
        busca: busca.trim() || undefined,
        tipo: filtroTipo || undefined,
        cidadeId: filtroCidade || undefined
      };

      const response = await listarCaixa(params);
      if (response.data) {
        setCaixas(response.data.caixas || []);
        setPaginacao(response.data.paginacao);
      }
    } catch (error) {
      toast.error('Erro ao carregar caixas');
    }
  };

  /**
   * Carrega a lista de cidades
   */
  const carregarCidades = async () => {
    try {
      const response = await cidades.listar();
      if (response.data) {
        setCidadesLista(response.data.cidades || []);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  /**
   * Função para lidar com a busca de caixas
   * @param e - Evento de formulário
   */
  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    carregarCaixas();
  };

  /**
   * Aplica os filtros selecionados
   */
  const aplicarFiltros = () => {
    setPagina(1);
    carregarCaixas();
  };

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroCidade('');
    setFiltroCapacidade('');
    setBusca('');
    setPagina(1);
  };

  /**
   * Função para alternar a ordenação da tabela
   * @param campo - Campo a ser ordenado
   */
  const alternarOrdenacao = (campo: 'nome' | 'tipo' | 'cidade') => {
    if (ordenacao === campo) {
      setOrdem(ordem === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(campo);
      setOrdem('asc');
    }
  };

  /**
   * Função para visualizar detalhes de uma caixa
   * @param id - ID da caixa
   */
  const visualizarCaixa = (id: string) => {
    toast.success(`Visualizando caixa ${id}`);
    // Aqui seria a navegação para a página de detalhes da caixa
  };

  /**
   * Função para editar uma caixa
   * @param id - ID da caixa
   */
  const editarCaixa = (id: string) => {
    toast.success(`Editando caixa ${id}`);
    // Aqui seria a navegação para a página de edição da caixa
  };

  /**
   * Função para excluir uma caixa
   * @param id - ID da caixa
   * @param nome - Nome da caixa para confirmação
   */
  const handleExcluirCaixa = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a caixa "${nome}"?`)) {
      return;
    }

    setCarregandoExclusao(id);
    try {
      const response = await excluirCaixa(id);
      if (response.status === 200) {
        toast.success('Caixa excluída com sucesso!');
        carregarCaixas(); // Recarrega a lista
      }
    } catch (error) {
      toast.error('Erro ao excluir caixa');
    } finally {
      setCarregandoExclusao(null);
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
          <BoxIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Gerenciamento de Caixas</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleBusca} className="flex">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar caixas..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">Buscar</Button>
          </form>
          <Button className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" />
            Nova Caixa
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Painel de filtros */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo de Caixa</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="CTO">CTO</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cidade</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtroCidade}
                  onChange={(e) => setFiltroCidade(e.target.value)}
                  disabled={loadingCidades}
                >
                  <option value="">Todas</option>
                  {cidades_lista.map((cidade) => (
                    <option key={cidade.id} value={cidade.id}>
                      {cidade.nome} - {cidade.estado}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Capacidade</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={filtroCapacidade}
                  onChange={(e) => setFiltroCapacidade(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="8">8 portas</option>
                  <option value="16">16 portas</option>
                  <option value="24">24 portas</option>
                  <option value="48">48 portas</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={aplicarFiltros}
                  disabled={loadingCaixas}
                >
                  Aplicar Filtros
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={limparFiltros}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de caixas */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('nome')}
                      >
                        <div className="flex items-center">
                          Nome
                          {ordenacao === 'nome' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('tipo')}
                      >
                        <div className="flex items-center">
                          Tipo
                          {ordenacao === 'tipo' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Modelo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Capacidade</th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => alternarOrdenacao('cidade')}
                      >
                        <div className="flex items-center">
                          Cidade
                          {ordenacao === 'cidade' && (
                            <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCaixas ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <LoaderIcon className="h-4 w-4 animate-spin" />
                            <span>Carregando caixas...</span>
                          </div>
                        </td>
                      </tr>
                    ) : caixas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhuma caixa encontrada
                        </td>
                      </tr>
                    ) : (
                      caixas.map((caixa) => (
                        <tr key={caixa.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">{caixa.nome}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              caixa.tipo === 'CTO' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {caixa.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{caixa.modelo}</td>
                          <td className="px-4 py-3 text-sm">
                            {caixa.capacidade}
                            {caixa._count && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({caixa._count.fusoes || 0} em uso)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {caixa.cidade?.nome || 'N/A'}
                            {caixa.cidade?.estado && (
                              <span className="text-xs text-muted-foreground ml-1">
                                - {caixa.cidade.estado}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => visualizarCaixa(caixa.id)}
                                title="Visualizar"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editarCaixa(caixa.id)}
                                title="Editar"
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExcluirCaixa(caixa.id, caixa.nome)}
                                title="Excluir"
                                disabled={carregandoExclusao === caixa.id}
                              >
                                {carregandoExclusao === caixa.id ? (
                                  <LoaderIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TrashIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Paginação */}
              {paginacao && paginacao.totalPaginas > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((paginacao.pagina - 1) * paginacao.limite) + 1} a{' '}
                    {Math.min(paginacao.pagina * paginacao.limite, paginacao.total)} de{' '}
                    {paginacao.total} caixas
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagina(paginacao.pagina - 1)}
                      disabled={paginacao.pagina <= 1 || loadingCaixas}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagina(paginacao.pagina + 1)}
                      disabled={paginacao.pagina >= paginacao.totalPaginas || loadingCaixas}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
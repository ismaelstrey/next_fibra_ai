'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Plus, Trash2, Edit, MapPin, Box, Cable, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ui/themeToggle';

/**
 * Página de configurações do sistema
 * Permite gerenciar cidades, tipos de caixas, tipos de cabos e configurações gerais
 */
export default function ConfiguracoesPage() {
  // Estado para as configurações gerais
  const [configGerais, setConfigGerais] = useState({
    nomeEmpresa: 'Fibra Telecom',
    emailContato: 'contato@fibratelecom.com.br',
    notificacoesEmail: true,
    notificacoesSistema: true,
    tempoSessao: 60,
    modoEscuro: false,
  });

  // Acesso ao contexto de tema
  const { theme, setTheme, toggleTheme } = useTheme();

  // Sincroniza o estado do modo escuro com o tema atual
  useEffect(() => {
    setConfigGerais(prev => ({
      ...prev,
      modoEscuro: theme === 'dark'
    }));
  }, [theme]);

  // Estado para as cidades
  const [cidades, setCidades] = useState([
    { id: 1, nome: 'São Paulo', estado: 'SP', ativa: true },
    { id: 2, nome: 'Rio de Janeiro', estado: 'RJ', ativa: true },
  ]);
  const [novaCidade, setNovaCidade] = useState({ nome: '', estado: '' });
  const [editandoCidade, setEditandoCidade] = useState<number | null>(null);

  // Estado para os tipos de caixas
  const [tiposCaixa, setTiposCaixa] = useState([
    { id: 1, nome: 'CTO', descricao: 'Caixa de Terminação Óptica', cor: '#3b82f6' },
    { id: 2, nome: 'CEO', descricao: 'Caixa de Emenda Óptica', cor: '#ef4444' },
  ]);
  const [novoTipoCaixa, setNovoTipoCaixa] = useState({ nome: '', descricao: '', cor: '#000000' });
  const [editandoTipoCaixa, setEditandoTipoCaixa] = useState<number | null>(null);

  // Estado para os tipos de cabos
  const [tiposCabo, setTiposCabo] = useState([
    { id: 1, nome: 'Cabo 6F', descricao: '6 fibras', cor: '#22c55e' },
    { id: 2, nome: 'Cabo 12F', descricao: '12 fibras', cor: '#3b82f6' },
    { id: 3, nome: 'Cabo 24F', descricao: '24 fibras', cor: '#a855f7' },
    { id: 4, nome: 'Cabo 48F', descricao: '48 fibras', cor: '#f59e0b' },
    { id: 5, nome: 'Cabo 96F', descricao: '96 fibras', cor: '#ef4444' },
  ]);
  const [novoTipoCabo, setNovoTipoCabo] = useState({ nome: '', descricao: '', cor: '#000000' });
  const [editandoTipoCabo, setEditandoTipoCabo] = useState<number | null>(null);

  // Funções para gerenciar cidades
  const adicionarCidade = () => {
    if (!novaCidade.nome || !novaCidade.estado) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (editandoCidade !== null) {
      setCidades(cidades.map(cidade =>
        cidade.id === editandoCidade
          ? { ...cidade, nome: novaCidade.nome, estado: novaCidade.estado }
          : cidade
      ));
      setEditandoCidade(null);
      toast.success('Cidade atualizada com sucesso!');
    } else {
      const novaCidadeObj = {
        id: cidades.length > 0 ? Math.max(...cidades.map(c => c.id)) + 1 : 1,
        nome: novaCidade.nome,
        estado: novaCidade.estado,
        ativa: true
      };
      setCidades([...cidades, novaCidadeObj]);
      toast.success('Cidade adicionada com sucesso!');
    }

    setNovaCidade({ nome: '', estado: '' });
  };

  const editarCidade = (id: number) => {
    const cidade = cidades.find(c => c.id === id);
    if (cidade) {
      setNovaCidade({ nome: cidade.nome, estado: cidade.estado });
      setEditandoCidade(id);
    }
  };

  const removerCidade = (id: number) => {
    setCidades(cidades.filter(cidade => cidade.id !== id));
    toast.success('Cidade removida com sucesso!');
  };

  const alterarStatusCidade = (id: number) => {
    setCidades(cidades.map(cidade =>
      cidade.id === id ? { ...cidade, ativa: !cidade.ativa } : cidade
    ));
  };

  // Funções para gerenciar tipos de caixas
  const adicionarTipoCaixa = () => {
    if (!novoTipoCaixa.nome || !novoTipoCaixa.descricao) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (editandoTipoCaixa !== null) {
      setTiposCaixa(tiposCaixa.map(tipo =>
        tipo.id === editandoTipoCaixa
          ? { ...tipo, nome: novoTipoCaixa.nome, descricao: novoTipoCaixa.descricao, cor: novoTipoCaixa.cor }
          : tipo
      ));
      setEditandoTipoCaixa(null);
      toast.success('Tipo de caixa atualizado com sucesso!');
    } else {
      const novoTipo = {
        id: tiposCaixa.length > 0 ? Math.max(...tiposCaixa.map(t => t.id)) + 1 : 1,
        nome: novoTipoCaixa.nome,
        descricao: novoTipoCaixa.descricao,
        cor: novoTipoCaixa.cor
      };
      setTiposCaixa([...tiposCaixa, novoTipo]);
      toast.success('Tipo de caixa adicionado com sucesso!');
    }

    setNovoTipoCaixa({ nome: '', descricao: '', cor: '#000000' });
  };

  const editarTipoCaixa = (id: number) => {
    const tipo = tiposCaixa.find(t => t.id === id);
    if (tipo) {
      setNovoTipoCaixa({ nome: tipo.nome, descricao: tipo.descricao, cor: tipo.cor });
      setEditandoTipoCaixa(id);
    }
  };

  const removerTipoCaixa = (id: number) => {
    setTiposCaixa(tiposCaixa.filter(tipo => tipo.id !== id));
    toast.success('Tipo de caixa removido com sucesso!');
  };

  // Funções para gerenciar tipos de cabos
  const adicionarTipoCabo = () => {
    if (!novoTipoCabo.nome || !novoTipoCabo.descricao) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (editandoTipoCabo !== null) {
      setTiposCabo(tiposCabo.map(tipo =>
        tipo.id === editandoTipoCabo
          ? { ...tipo, nome: novoTipoCabo.nome, descricao: novoTipoCabo.descricao, cor: novoTipoCabo.cor }
          : tipo
      ));
      setEditandoTipoCabo(null);
      toast.success('Tipo de cabo atualizado com sucesso!');
    } else {
      const novoTipo = {
        id: tiposCabo.length > 0 ? Math.max(...tiposCabo.map(t => t.id)) + 1 : 1,
        nome: novoTipoCabo.nome,
        descricao: novoTipoCabo.descricao,
        cor: novoTipoCabo.cor
      };
      setTiposCabo([...tiposCabo, novoTipo]);
      toast.success('Tipo de cabo adicionado com sucesso!');
    }

    setNovoTipoCabo({ nome: '', descricao: '', cor: '#000000' });
  };

  const editarTipoCabo = (id: number) => {
    const tipo = tiposCabo.find(t => t.id === id);
    if (tipo) {
      setNovoTipoCabo({ nome: tipo.nome, descricao: tipo.descricao, cor: tipo.cor });
      setEditandoTipoCabo(id);
    }
  };

  const removerTipoCabo = (id: number) => {
    setTiposCabo(tiposCabo.filter(tipo => tipo.id !== id));
    toast.success('Tipo de cabo removido com sucesso!');
  };

  // Função para salvar configurações gerais
  const salvarConfiguracoesGerais = () => {
    // Aqui seria implementada a lógica para salvar no banco de dados
    toast.success('Configurações salvas com sucesso!');
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
      <header className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Configurações do Sistema</h1>
      </header>

      <Tabs defaultValue="gerais" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="gerais" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerais
          </TabsTrigger>
          <TabsTrigger value="cidades" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Cidades
          </TabsTrigger>
          <TabsTrigger value="tiposCaixa" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Tipos de Caixa
          </TabsTrigger>
          <TabsTrigger value="tiposCabo" className="flex items-center gap-2">
            <Cable className="h-4 w-4" />
            Tipos de Cabo
          </TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="gerais">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure os parâmetros gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configGerais.nomeEmpresa}
                    onChange={(e) => setConfigGerais({ ...configGerais, nomeEmpresa: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailContato">Email de Contato</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={configGerais.emailContato}
                    onChange={(e) => setConfigGerais({ ...configGerais, emailContato: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempoSessao">Tempo de Sessão (minutos)</Label>
                  <Input
                    id="tempoSessao"
                    type="number"
                    value={configGerais.tempoSessao}
                    onChange={(e) => setConfigGerais({ ...configGerais, tempoSessao: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacoesEmail">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Receba alertas e notificações por email</p>
                  </div>
                  <Switch
                    id="notificacoesEmail"
                    checked={configGerais.notificacoesEmail}
                    onCheckedChange={(checked) => setConfigGerais({ ...configGerais, notificacoesEmail: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificacoesSistema">Notificações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">Exibir notificações no sistema</p>
                  </div>
                  <Switch
                    id="notificacoesSistema"
                    checked={configGerais.notificacoesSistema}
                    onCheckedChange={(checked) => setConfigGerais({ ...configGerais, notificacoesSistema: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="modoEscuro" className="flex items-center gap-2">
                      Modo Escuro
                      {configGerais.modoEscuro ?
                        <Moon className="h-4 w-4 text-blue-400" /> :
                        <Sun className="h-4 w-4 text-amber-500" />
                      }
                    </Label>
                    <p className="text-sm text-muted-foreground">Ativar tema escuro por padrão</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Switch
                      id="modoEscuro"
                      checked={configGerais.modoEscuro}
                      onCheckedChange={(checked) => {
                        setConfigGerais({ ...configGerais, modoEscuro: checked });
                        // Usa setTheme diretamente para garantir o tema específico
                        setTheme(checked ? 'dark' : 'light');
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={salvarConfiguracoesGerais} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cidades */}
        <TabsContent value="cidades">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Cidades</CardTitle>
              <CardDescription>Adicione, edite ou remova cidades atendidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeCidade">Nome da Cidade</Label>
                  <Input
                    id="nomeCidade"
                    placeholder="Ex: São Paulo"
                    value={novaCidade.nome}
                    onChange={(e) => setNovaCidade({ ...novaCidade, nome: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoCidade">Estado (UF)</Label>
                  <Input
                    id="estadoCidade"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={novaCidade.estado}
                    onChange={(e) => setNovaCidade({ ...novaCidade, estado: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={adicionarCidade} className="flex items-center gap-2">
                    {editandoCidade !== null ? (
                      <>
                        <Save className="h-4 w-4" />
                        Atualizar Cidade
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Adicionar Cidade
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Estado</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cidades.map((cidade) => (
                      <tr key={cidade.id} className="border-b last:border-b-0">
                        <td className="p-2">{cidade.nome}</td>
                        <td className="p-2">{cidade.estado}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${cidade.ativa ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {cidade.ativa ? 'Ativa' : 'Inativa'}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alterarStatusCidade(cidade.id)}
                            >
                              {cidade.ativa ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editarCidade(cidade.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removerCidade(cidade.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {cidades.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          Nenhuma cidade cadastrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tipos de Caixa */}
        <TabsContent value="tiposCaixa">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Tipos de Caixa</CardTitle>
              <CardDescription>Adicione, edite ou remova tipos de caixas de fibra óptica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeTipoCaixa">Nome do Tipo</Label>
                  <Input
                    id="nomeTipoCaixa"
                    placeholder="Ex: CTO"
                    value={novoTipoCaixa.nome}
                    onChange={(e) => setNovoTipoCaixa({ ...novoTipoCaixa, nome: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoTipoCaixa">Descrição</Label>
                  <Input
                    id="descricaoTipoCaixa"
                    placeholder="Ex: Caixa de Terminação Óptica"
                    value={novoTipoCaixa.descricao}
                    onChange={(e) => setNovoTipoCaixa({ ...novoTipoCaixa, descricao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corTipoCaixa">Cor</Label>
                  <Input
                    id="corTipoCaixa"
                    type="color"
                    value={novoTipoCaixa.cor}
                    onChange={(e) => setNovoTipoCaixa({ ...novoTipoCaixa, cor: e.target.value })}
                    className="h-10 p-1 w-full"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={adicionarTipoCaixa} className="flex items-center gap-2">
                    {editandoTipoCaixa !== null ? (
                      <>
                        <Save className="h-4 w-4" />
                        Atualizar Tipo
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Adicionar Tipo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Cor</th>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Descrição</th>
                      <th className="p-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiposCaixa.map((tipo) => (
                      <tr key={tipo.id} className="border-b last:border-b-0">
                        <td className="p-2">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: tipo.cor }}
                          ></div>
                        </td>
                        <td className="p-2">{tipo.nome}</td>
                        <td className="p-2">{tipo.descricao}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editarTipoCaixa(tipo.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removerTipoCaixa(tipo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tiposCaixa.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          Nenhum tipo de caixa cadastrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tipos de Cabo */}
        <TabsContent value="tiposCabo">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Tipos de Cabo</CardTitle>
              <CardDescription>Adicione, edite ou remova tipos de cabos de fibra óptica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeTipoCabo">Nome do Tipo</Label>
                  <Input
                    id="nomeTipoCabo"
                    placeholder="Ex: Cabo 12F"
                    value={novoTipoCabo.nome}
                    onChange={(e) => setNovoTipoCabo({ ...novoTipoCabo, nome: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoTipoCabo">Descrição</Label>
                  <Input
                    id="descricaoTipoCabo"
                    placeholder="Ex: 12 fibras"
                    value={novoTipoCabo.descricao}
                    onChange={(e) => setNovoTipoCabo({ ...novoTipoCabo, descricao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corTipoCabo">Cor</Label>
                  <Input
                    id="corTipoCabo"
                    type="color"
                    value={novoTipoCabo.cor}
                    onChange={(e) => setNovoTipoCabo({ ...novoTipoCabo, cor: e.target.value })}
                    className="h-10 p-1 w-full"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={adicionarTipoCabo} className="flex items-center gap-2">
                    {editandoTipoCabo !== null ? (
                      <>
                        <Save className="h-4 w-4" />
                        Atualizar Tipo
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Adicionar Tipo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Cor</th>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Descrição</th>
                      <th className="p-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiposCabo.map((tipo) => (
                      <tr key={tipo.id} className="border-b last:border-b-0">
                        <td className="p-2">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: tipo.cor }}
                          ></div>
                        </td>
                        <td className="p-2">{tipo.nome}</td>
                        <td className="p-2">{tipo.descricao}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editarTipoCabo(tipo.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removerTipoCabo(tipo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tiposCabo.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          Nenhum tipo de cabo cadastrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMapa } from '@/hooks/useMapa';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, PencilIcon, BoxIcon, MapPinIcon, ZapIcon, ScissorsIcon, MergeIcon, SettingsIcon, RefreshCcw } from 'lucide-react';

/**
 * Componente de ferramentas para o mapa
 * Permite adicionar e editar elementos no mapa
 */
export default function ToolsMap() {
    // Contexto do mapa
    const { 
        modoEdicao, 
        setModoEdicao, 
        tipoCaboSelecionado, 
        setTipoCaboSelecionado, 
        camadasVisiveis, 
        atualizarCamadasVisiveis,
        carregarDados,
        atualizarFiltros,
        cidades,
        adicionarRota,
        adicionarCaixa
    } = useMapa();

    // Estado para controlar a expansão do painel
    const [painelExpandido, setPainelExpandido] = useState(true);

    // Estado para controlar a visibilidade das configurações avançadas
    const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
    
    // Estado para armazenar a cidade selecionada
    const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");

    // Função para alternar o modo de edição
    const alternarModoEdicao = (modo: 'rota' | 'cto' | 'ceo' | 'fusao' | 'editar' | 'cortar' | 'mesclar' | null) => {
        if (modoEdicao === modo) {
            setModoEdicao(null);
        } else {
            // Verifica se uma cidade foi selecionada para modos que exigem cidade
            if ((modo === 'rota' || modo === 'cto' || modo === 'ceo' || modo === 'fusao') && !cidadeSelecionada) {
                alert("Selecione uma cidade antes de usar esta ferramenta");
                return;
            }
            setModoEdicao(modo);
        }
    };

    // Função para adicionar uma CTO no mapa
    const adicionarCTO = async () => {
        if (!cidadeSelecionada) {
            alert("Selecione uma cidade antes de adicionar uma CTO");
            return;
        }
        setModoEdicao('cto');
    };

    // Função para adicionar um CEO no mapa
    const adicionarCEO = async () => {
        if (!cidadeSelecionada) {
            alert("Selecione uma cidade antes de adicionar um CEO");
            return;
        }
        setModoEdicao('ceo');
    };

    // Função para adicionar uma rota no mapa
    const adicionarCabo = async () => {
        if (!cidadeSelecionada) {
            alert("Selecione uma cidade antes de adicionar um cabo");
            return;
        }
        setModoEdicao('rota');
    };

    return (
        <motion.div
            className="absolute top-4 left-4 z-10 bg-background rounded-lg shadow-lg overflow-hidden"
            initial={{ width: 60 }}
            animate={{ width: painelExpandido ? 400 : 60 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex">
                <div className="w-[60px] p-2 flex flex-col items-center border-r border-border/50">
                    {/* Botão para expandir/recolher o painel */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mb-2"
                        onClick={() => setPainelExpandido(!painelExpandido)}
                    >
                        {painelExpandido ? <ChevronLeft /> : <ChevronRight />}
                    </Button>

                    <Separator className="mb-2" />

                    {/* Botões de ferramentas */}
                    <ToggleGroup type="single" value={modoEdicao || ''} className="flex flex-col gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="rota"
                                        aria-label="Desenhar rota"
                                        onClick={() => alternarModoEdicao('rota')}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Desenhar rota</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="cto"
                                        aria-label="Adicionar CTO"
                                        onClick={() => alternarModoEdicao('cto')}
                                    >
                                        <BoxIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Adicionar CTO</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="ceo"
                                        aria-label="Adicionar CEO"
                                        onClick={() => alternarModoEdicao('ceo')}
                                    >
                                        <MapPinIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Adicionar CEO</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="fusao"
                                        aria-label="Adicionar ponto de fusão"
                                        onClick={() => alternarModoEdicao('fusao')}
                                    >
                                        <ZapIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Adicionar ponto de fusão</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="editar"
                                        aria-label="Editar elementos"
                                        onClick={() => alternarModoEdicao('editar')}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Editar elementos</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="cortar"
                                        aria-label="Cortar rota"
                                        onClick={() => alternarModoEdicao('cortar')}
                                    >
                                        <ScissorsIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Cortar rota</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem
                                        value="mesclar"
                                        aria-label="Mesclar rotas"
                                        onClick={() => alternarModoEdicao('mesclar')}
                                    >
                                        <MergeIcon className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Mesclar rotas</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </ToggleGroup>

                    <Separator className="my-2" />

                    {/* Botão para atualizar o mapa */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => carregarDados(cidadeSelecionada)}
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Atualizar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {painelExpandido && (
                    <div className="flex-1 p-3 space-y-3">
                        {/* Seleção de cidade */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Cidade</h4>
                            <Select 
                                value={cidadeSelecionada} 
                                onValueChange={(value) => {
                                    setCidadeSelecionada(value);
                                    // Atualiza o filtro de cidade no contexto do mapa
                                    atualizarFiltros({ cidade: value });
                                }}
                            >
                                <SelectTrigger className="w-full h-8 text-xs">
                                    <SelectValue placeholder="Selecione uma cidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cidades.map((cidade) => (
                                        <SelectItem key={cidade.id} value={cidade.id}>
                                            {cidade.nome} - {cidade.estado}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Seleção de tipo de cabo */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Tipo de Cabo</h4>
                            <ToggleGroup
                                type="single"
                                value={tipoCaboSelecionado}
                                onValueChange={(value) => value && setTipoCaboSelecionado(value as '6' | '12' | '24' | '48' | '96')}
                                className="flex justify-between"
                            >
                                <ToggleGroupItem value="6" className="h-8 text-xs flex-1">6</ToggleGroupItem>
                                <ToggleGroupItem value="12" className="h-8 text-xs flex-1">12</ToggleGroupItem>
                                <ToggleGroupItem value="24" className="h-8 text-xs flex-1">24</ToggleGroupItem>
                                <ToggleGroupItem value="48" className="h-8 text-xs flex-1">48</ToggleGroupItem>
                                <ToggleGroupItem value="96" className="h-8 text-xs flex-1">96</ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {/* Ações rápidas */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Ações Rápidas</h4>
                            <div className="grid grid-cols-3 gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={adicionarCabo}
                                >
                                    <PencilIcon className="h-3 w-3 mr-1" />
                                    Cabo
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={adicionarCTO}
                                >
                                    <BoxIcon className="h-3 w-3 mr-1" />
                                    CTO
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={adicionarCEO}
                                >
                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                    CEO
                                </Button>
                            </div>
                        </div>

                        {/* Camadas visíveis */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Camadas</h4>
                            <div className="flex justify-between">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.caixas ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 text-xs flex-1 mx-0.5"
                                                onClick={() => atualizarCamadasVisiveis({ caixas: !camadasVisiveis.caixas })}
                                            >
                                                Caixas
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{camadasVisiveis.caixas ? "Ocultar" : "Mostrar"} caixas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.rotas ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 text-xs flex-1 mx-0.5"
                                                onClick={() => atualizarCamadasVisiveis({ rotas: !camadasVisiveis.rotas })}
                                            >
                                                Rotas
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{camadasVisiveis.rotas ? "Ocultar" : "Mostrar"} rotas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.fusoes ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 text-xs flex-1 mx-0.5"
                                                onClick={() => atualizarCamadasVisiveis({ fusoes: !camadasVisiveis.fusoes })}
                                            >
                                                Fusões
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{camadasVisiveis.fusoes ? "Ocultar" : "Mostrar"} pontos de fusão</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Botão de configurações avançadas */}
                        <div className="pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-1 text-xs"
                                onClick={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
                            >
                                <SettingsIcon className="h-3 w-3" />
                                Configurações Avançadas
                            </Button>
                        </div>

                        {/* Painel de configurações avançadas */}
                        {mostrarConfiguracoes && (
                            <motion.div
                                className="space-y-2 pt-2 border-t border-border/50"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.2 }}
                            >
                                <h4 className="text-xs font-medium text-muted-foreground">Configurações Avançadas</h4>
                                {/* Aqui podem ser adicionadas mais opções de configuração */}
                                <div className="grid grid-cols-2 gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setModoEdicao('rota')}
                                    >
                                        <PencilIcon className="h-3 w-3 mr-1" />
                                        Adicionar Cabo
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setModoEdicao('cto')}
                                    >
                                        <BoxIcon className="h-3 w-3 mr-1" />
                                        Adicionar CTO
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setModoEdicao('ceo')}
                                    >
                                        <MapPinIcon className="h-3 w-3 mr-1" />
                                        Adicionar CEO
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setModoEdicao('fusao')}
                                    >
                                        <ZapIcon className="h-3 w-3 mr-1" />
                                        Adicionar Fusão
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
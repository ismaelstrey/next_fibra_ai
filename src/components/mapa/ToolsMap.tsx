'use client';

import {
    PencilIcon,
    MapPinIcon,
    BoxIcon,
    XIcon,
    ScissorsIcon,
    MoveIcon,
    LayersIcon,
    ZapIcon,
    EyeIcon,
    EyeOffIcon,
    Combine,
    SettingsIcon,
    SaveIcon
} from 'lucide-react';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import useMapa from '@/hooks/useMapa';
import { toast } from 'react-hot-toast';

export default function ToolsMap() {
    const {
        modoEdicao,
        setModoEdicao,
        tipoCaboSelecionado,
        setTipoCaboSelecionado,
        camadasVisiveis,
        atualizarCamadasVisiveis,
        carregarDados
    } = useMapa();

    // Estado para controlar a expansão do painel de ferramentas
    const [expandido, setExpandido] = useState(true);
    // Estado para controlar a visibilidade do painel de configurações
    const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);

    // Mapeamento de cores para os tipos de cabos
    const coresCabos = {
        '6': '#3498db',   // Azul
        '12': '#2ecc71',  // Verde
        '24': '#f1c40f',  // Amarelo
        '48': '#e67e22',  // Laranja
        '96': '#e74c3c'   // Vermelho
    };

    return (
        <motion.div
            className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col">
                {/* Cabeçalho com título e botão de expandir/recolher */}
                <div className="flex items-center justify-between p-2 bg-background/90 border-b border-border/50">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                        <LayersIcon className="h-4 w-4 text-primary" />
                        <span>Ferramentas do Mapa</span>
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setExpandido(!expandido)}
                    >
                        {expandido ? <XIcon className="h-4 w-4" /> : <LayersIcon className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Conteúdo principal que pode ser expandido/recolhido */}
                {expandido && (
                    <div className="p-2 space-y-3">
                        {/* Grupo de ferramentas de edição */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Ferramentas de Edição</h4>
                            <ToggleGroup
                                type="single"
                                value={modoEdicao || ''}
                                onValueChange={(value) => setModoEdicao(value as any || null)}
                                className="flex flex-wrap gap-1"
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ToggleGroupItem
                                                value="rota"
                                                size="sm"
                                                className={`${modoEdicao === 'rota' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Desenhar Rota</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ToggleGroupItem
                                                value="cto"
                                                size="sm"
                                                className={`${modoEdicao === 'cto' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
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
                                                size="sm"
                                                className={`${modoEdicao === 'ceo' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
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
                                                size="sm"
                                                className={`${modoEdicao === 'fusao' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
                                            >
                                                <ZapIcon className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Adicionar Ponto de Fusão</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ToggleGroupItem
                                                value="editar"
                                                size="sm"
                                                className={`${modoEdicao === 'editar' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
                                            >
                                                <MoveIcon className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Editar Elementos</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ToggleGroupItem
                                                value="cortar"
                                                size="sm"
                                                className={`${modoEdicao === 'cortar' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
                                            >
                                                <ScissorsIcon className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Cortar Rota</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ToggleGroupItem
                                                value="mesclar"
                                                size="sm"
                                                className={`${modoEdicao === 'mesclar' ? 'bg-primary/20 hover:bg-primary/30' : ''}`}
                                            >
                                                <Combine className="h-4 w-4" />
                                            </ToggleGroupItem>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Mesclar Rotas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </ToggleGroup>
                        </div>

                        <Separator />

                        {/* Seleção de tipo de cabo */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Tipo de Cabo</h4>
                            <Select
                                value={tipoCaboSelecionado}
                                onValueChange={(value) => setTipoCaboSelecionado(value as any)}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Selecione o tipo de cabo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(coresCabos).map(([tipo, cor]) => (
                                        <SelectItem key={tipo} value={tipo}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cor }}></div>
                                                <span>{tipo} fibras</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        {/* Botões de ação rápida */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-medium text-muted-foreground">Ações Rápidas</h4>
                                {modoEdicao && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-primary animate-pulse flex items-center">
                                            <span className="h-2 w-2 rounded-full bg-primary mr-1"></span>
                                            Modo: {modoEdicao.charAt(0).toUpperCase() + modoEdicao.slice(1)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-full"
                                            onClick={() => setModoEdicao(null)}
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-2 text-xs bg-primary/80 hover:bg-primary"
                                                onClick={() => setModoEdicao('rota')}
                                            >
                                                <PencilIcon className="h-3 w-3 mr-1" />
                                                Cabo
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Adicionar novo cabo</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-2 text-xs bg-primary/80 hover:bg-primary"
                                                onClick={() => setModoEdicao('cto')}
                                            >
                                                <BoxIcon className="h-3 w-3 mr-1" />
                                                CTO
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Adicionar nova CTO</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-2 text-xs bg-primary/80 hover:bg-primary"
                                                onClick={() => setModoEdicao('ceo')}
                                            >
                                                <MapPinIcon className="h-3 w-3 mr-1" />
                                                CEO
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Adicionar nova CEO</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => {
                                                    // Recarrega os dados para atualizar a visualização
                                                    toast.promise(carregarDados(), {
                                                        loading: 'Atualizando visualização...',
                                                        success: 'Visualização atualizada com sucesso!',
                                                        error: 'Erro ao atualizar visualização'
                                                    });
                                                }}
                                            >
                                                <SaveIcon className="h-3 w-3 mr-1" />
                                                Atualizar
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Atualizar visualização do mapa</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <Separator />

                        {/* Controles de visibilidade */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Camadas Visíveis</h4>
                            <div className="flex flex-wrap gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.caixas ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 px-2 text-xs"
                                                onClick={() => atualizarCamadasVisiveis({ caixas: !camadasVisiveis.caixas })}
                                            >
                                                {camadasVisiveis.caixas ? <EyeIcon className="h-3 w-3 mr-1" /> : <EyeOffIcon className="h-3 w-3 mr-1" />}
                                                Caixas
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{camadasVisiveis.caixas ? "Ocultar" : "Mostrar"} CTOs e CEOs</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.rotas ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 px-2 text-xs"
                                                onClick={() => atualizarCamadasVisiveis({ rotas: !camadasVisiveis.rotas })}
                                            >
                                                {camadasVisiveis.rotas ? <EyeIcon className="h-3 w-3 mr-1" /> : <EyeOffIcon className="h-3 w-3 mr-1" />}
                                                Rotas
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>{camadasVisiveis.rotas ? "Ocultar" : "Mostrar"} rotas de cabos</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={camadasVisiveis.fusoes ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 px-2 text-xs"
                                                onClick={() => atualizarCamadasVisiveis({ fusoes: !camadasVisiveis.fusoes })}
                                            >
                                                {camadasVisiveis.fusoes ? <EyeIcon className="h-3 w-3 mr-1" /> : <EyeOffIcon className="h-3 w-3 mr-1" />}
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
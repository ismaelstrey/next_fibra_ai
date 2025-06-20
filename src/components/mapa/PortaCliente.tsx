'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, User, Phone, Home, Wifi } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface Cliente {
    id: number;
    nome: string;
    endereco: string;
    casa: string;
    apto: string;
    telefone: string;
    plano: string;
    wifi?: string;
    password?: string;
}

interface PortaClienteProps {
    id: number;
    ativa: boolean;
    cliente?: Cliente;
}

/**
 * Componente PortaCliente que exibe informações sobre uma porta de cliente na CTO
 * com opção de expandir para mostrar mais detalhes
 */
export function PortaCliente({ id, ativa, cliente }: PortaClienteProps) {
    // Estado para controlar se os detalhes estão expandidos ou não
    const [expandido, setExpandido] = useState(false);

    // Função para alternar entre expandido e contraído
    const toggleExpandir = () => {
        setExpandido(!expandido);
    };

    return (
        <motion.div
            initial={{ opacity: 0.8, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-md border transition-all duration-200 ${ativa ? 'bg-primary/10 border-primary hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/25' : 'bg-muted border-muted-foreground/20 hover:bg-muted/80 dark:bg-muted/20 dark:border-muted-foreground/30 dark:hover:bg-muted/30'}`}
        >
            <div className="flex items-center justify-between">
                <span className="font-medium">Porta {id}</span>
                <div className="flex items-center gap-2">
                    <Badge variant={ativa ? 'default' : 'outline'}>
                        {ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {cliente && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={toggleExpandir}
                            title={expandido ? "Contrair" : "Expandir"}
                        >
                            {expandido ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                            }
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Informações básicas do cliente */}
            {ativa && cliente && (
                <div className="text-sm mt-1 text-muted-foreground">
                    Cliente: {cliente.nome || 'Sem cliente'}
                </div>
            )}
            
            {/* Detalhes expandidos do cliente */}
            <AnimatePresence>
                {expandido && cliente && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 pt-2 border-t border-dashed border-border dark:border-border/70 text-sm space-y-2 overflow-hidden"
                    >
                        <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div>{cliente.endereco}</div>
                                {cliente.casa && <div className="text-xs text-muted-foreground">Casa: {cliente.casa}</div>}
                                {cliente.apto && <div className="text-xs text-muted-foreground">Apto: {cliente.apto}</div>}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>{cliente.telefone}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>Plano: <span className="font-medium">{cliente.plano}</span></div>
                        </div>
                        
                        {cliente.wifi && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 cursor-help">
                                            <Wifi className="h-4 w-4 text-muted-foreground" />
                                            <div>WiFi: <span className="font-medium">{cliente.wifi}</span></div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Senha: {cliente.password || 'Não definida'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, User, Phone,  Wifi, Zap, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { ClienteAPI } from '@/types/cliente';

interface PortaClienteProps {
    ativa: boolean;
    cliente?: ClienteAPI;
}

/**
 * Componente PortaCliente que exibe informações sobre uma porta de cliente na CTO
 * com opção de expandir para mostrar mais detalhes
 */
export function PortaCliente({ ativa, cliente }: PortaClienteProps) {
    // Estado para controlar se os detalhes estão expandidos ou não
    const [expandido, setExpandido] = useState(false);

    // Função para alternar entre expandido e contraído
    const toggleExpandir = () => {
        setExpandido(!expandido);
    };

    return (
        <motion.div
            initial={{ opacity: 0.8, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`p-4 rounded-lg border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                ativa 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 hover:border-emerald-400 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-600' 
                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 dark:from-gray-900/30 dark:to-slate-900/30 dark:border-gray-600'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ rotate: ativa ? 360 : 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`w-3 h-3 rounded-full ${
                            ativa ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-400'
                        }`}
                    />
                    <span className="font-semibold text-lg">Porta {cliente?.porta?.numero || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge 
                        variant={ativa ? 'default' : 'outline'}
                        className={`font-medium ${
                            ativa 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                : 'border-gray-400 text-gray-600'
                        }`}
                    >
                        {cliente?.porta?.status || (ativa ? 'Em uso' : 'Disponível')}
                    </Badge>
                    {cliente && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/50 dark:hover:bg-black/20"
                            onClick={toggleExpandir}
                            title={expandido ? "Contrair" : "Expandir"}
                        >
                            <motion.div
                                animate={{ rotate: expandido ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </motion.div>
                        </Button>
                    )}
                </div>
            </div>

            {/* Informações básicas do cliente */}
            {ativa && cliente && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm mt-3 p-2 bg-white/60 dark:bg-black/20 rounded-md border border-white/40 dark:border-gray-700/40"
                >
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {cliente.nome || 'Cliente não identificado'}
                        </span>
                    </div>
                    {cliente.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {cliente.email}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Detalhes expandidos do cliente */}
            <AnimatePresence>
                {expandido && cliente && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mt-4 pt-4 border-t border-dashed border-emerald-200 dark:border-emerald-700 text-sm space-y-3 overflow-hidden"
                    >
                        {/* Endereço */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start gap-3 p-2 bg-white/40 dark:bg-black/10 rounded-md"
                        >
                            <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                    {cliente.endereco || 'Endereço não informado'}
                                </div>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {cliente.casa && <span>Casa: {cliente.casa}</span>}
                                    {cliente.apartamento && <span>Apto: {cliente.apartamento}</span>}
                                    <span>Nº: {cliente.numero}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Telefone */}
                        {cliente.telefone && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 p-2 bg-white/40 dark:bg-black/10 rounded-md"
                            >
                                <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                    {cliente.telefone}
                                </div>
                            </motion.div>
                        )}

                        {/* Potência */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 p-2 bg-white/40 dark:bg-black/10 rounded-md"
                        >
                            <Zap className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Potência: </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {cliente.potencia ? `${cliente.potencia} dBm` : 'Não informada'}
                                </span>
                            </div>
                        </motion.div>

                        {/* WiFi */}
                        {cliente.wifi && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-3 p-2 bg-white/40 dark:bg-black/10 rounded-md cursor-help hover:bg-white/60 dark:hover:bg-black/20 transition-colors">
                                                <Wifi className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-700 dark:text-gray-300">
                                                        {cliente.wifi}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Clique para ver a senha
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-emerald-600 text-white border-emerald-500">
                                            <p className="font-medium">Senha WiFi:</p>
                                            <p className="font-mono text-sm">{cliente.senhaWifi || 'Não definida'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        )}

                        {/* Neutra */}
                        {cliente.neutra && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-3 p-2 bg-white/40 dark:bg-black/10 rounded-md"
                            >
                                <div className="w-4 h-4 bg-emerald-600 rounded-sm flex-shrink-0" />
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Neutra: </span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {cliente.neutra.nome} (VLAN: {cliente.neutra.vlan})
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
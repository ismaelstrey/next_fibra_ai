// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * @param inputs - Classes CSS a serem combinadas
 * @returns String de classes CSS combinadas e otimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor monetário para o formato brasileiro
 * @param value - Valor a ser formatado
 * @returns String formatada como moeda brasileira
 */
export function formatarMoeda(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada como data brasileira (DD/MM/YYYY)
 */
export function formatarData(date: Date | string): string {
  const dataObj = typeof date === 'string' ? new Date(date) : date;
  return dataObj.toLocaleDateString('pt-BR');
}

/**
 * Gera um ID único baseado em timestamp e número aleatório
 * @returns String contendo ID único
 */
export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Trunca um texto para um tamanho máximo
 * @param text - Texto a ser truncado
 * @param maxLength - Tamanho máximo do texto
 * @returns Texto truncado com reticências se necessário
 */
export function truncarTexto(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
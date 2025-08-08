'use client';

import React from 'react';
import { ExemploProtoboard } from '@/components/mapa/exemploProtoboard';

/**
 * Página de exemplo do componente ProtoboardFibra
 * Demonstra o uso interativo do protoboard de fibra óptica
 */
export default function ProtoboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <ExemploProtoboard />
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { getSwaggerUI } from '@/docs/swagger';

// Importação do CSS do Swagger UI
import 'swagger-ui-react/swagger-ui.css';

// Importação dinâmica do SwaggerUI para evitar problemas de SSR
const SwaggerUI = dynamic<any>(() => import('swagger-ui-react').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Carregando documentação...</span>
    </div>
  ),
});

export default function SwaggerPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Busca a especificação da API
    setLoading(true);
    fetch('/api/docs')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar a documentação: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar a documentação:', error);
        setError(error.message || 'Erro ao carregar a documentação');
        setLoading(false);
      });
  }, []);

  // Configurações da UI do Swagger
  const uiConfig = getSwaggerUI('/api/docs');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando documentação...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Documentação da API Fibra AI</h1>
      <p className="mb-4 text-gray-600">Explore e teste os endpoints da API</p>
      <div className="border rounded-lg overflow-hidden">
        <SwaggerUI spec={spec} {...uiConfig} />
      </div>
    </div>
  );
}
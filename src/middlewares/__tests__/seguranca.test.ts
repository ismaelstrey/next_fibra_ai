// src/middlewares/__tests__/seguranca.test.ts

import { NextRequest, NextResponse } from 'next/server';
import { adicionarCabecalhosSeguranca, configurarCORS, prevenirCSRF } from '../seguranca';

// Mock do NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => {
        const response = new originalModule.NextResponse();
        response.headers = new Headers();
        return response;
      }),
      json: jest.fn((data, options) => ({
        status: options?.status || 200,
        data,
        headers: new Headers(),
      })),
    },
  };
});

describe('Middleware de Segurança', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Usar Object.defineProperty para contornar a restrição de somente leitura
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true
    });
  });

  describe('adicionarCabecalhosSeguranca', () => {
    it('deve adicionar cabeçalhos de segurança básicos', () => {
      // Arrange
      const req = {} as NextRequest;

      // Act
      const result = adicionarCabecalhosSeguranca(req);

      // Assert
      expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(result.headers.get('X-Frame-Options')).toBe('DENY');
      expect(result.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(result.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('deve adicionar Content-Security-Policy em ambiente de produção', () => {
      // Arrange
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      });
      const req = {} as NextRequest;

      // Act
      const result = adicionarCabecalhosSeguranca(req);

      // Assert
      expect(result.headers.get('Content-Security-Policy')).toBeTruthy();
      expect(result.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    });
  });

  describe('configurarCORS', () => {
    it('deve permitir origens específicas em ambiente de produção', () => {
      // Arrange
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      });
      const req = {
        headers: {
          get: jest.fn().mockReturnValue('https://exemplo.com'),
        },
      } as unknown as NextRequest;

      // Mock da configuração de segurança
      const originalConfig = process.env.SECURITY_ALLOWED_ORIGINS;
      process.env.SECURITY_ALLOWED_ORIGINS = 'https://exemplo.com,https://api.exemplo.com';

      // Act
      const result = configurarCORS(req);

      // Restore
      process.env.SECURITY_ALLOWED_ORIGINS = originalConfig;

      // Assert
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://exemplo.com');
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('deve permitir qualquer origem em ambiente de desenvolvimento', () => {
      // Arrange
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true
      });
      const req = {
        headers: {
          get: jest.fn().mockReturnValue('http://localhost:3000'),
        },
      } as unknown as NextRequest;

      // Act
      const result = configurarCORS(req);

      // Assert
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(result.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('deve bloquear origens não permitidas em ambiente de produção', () => {
      // Arrange
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      });
      const req = {
        headers: {
          get: jest.fn().mockReturnValue('https://site-malicioso.com'),
        },
      } as unknown as NextRequest;

      // Mock da configuração de segurança
      const originalConfig = process.env.SECURITY_ALLOWED_ORIGINS;
      process.env.SECURITY_ALLOWED_ORIGINS = 'https://exemplo.com,https://api.exemplo.com';

      // Act
      const result = configurarCORS(req);

      // Restore
      process.env.SECURITY_ALLOWED_ORIGINS = originalConfig;

      // Assert
      expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });

  describe('prevenirCSRF', () => {
    it('deve permitir métodos seguros (GET, HEAD, OPTIONS)', async () => {
      // Arrange
      const req = {
        method: 'GET',
        headers: {
          get: jest.fn(),
        },
      } as unknown as NextRequest;
      const handler = jest.fn().mockReturnValue(new NextResponse());

      // Act
      const response = prevenirCSRF(req);

      // Assert
      expect(response).toBeUndefined(); // Se não retornar nada, o Next.js continua o processamento
    });

    it('deve verificar cabeçalhos Referer e Origin para métodos não seguros', async () => {
      // Arrange
      const req = {
        method: 'POST',
        headers: {
          get: jest.fn((header) => {
            if (header === 'referer') return 'https://exemplo.com/form';
            if (header === 'origin') return 'https://exemplo.com';
            return null;
          }),
        },
        url: 'https://exemplo.com/api/dados',
      } as unknown as NextRequest;
      const handler = jest.fn().mockReturnValue(new NextResponse());

      // Act
      const response = prevenirCSRF(req);

      // Assert
      expect(response).toBeUndefined(); // Se não retornar nada, o Next.js continua o processamento
    });

    it('deve bloquear requisições sem cabeçalhos Referer ou Origin para métodos não seguros', async () => {
      // Arrange
      const req = {
        method: 'POST',
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        url: 'https://exemplo.com/api/dados',
      } as unknown as NextRequest;
      const handler = jest.fn();

      // Act
      const response = prevenirCSRF(req);

      // Assert
      expect(response).toBeDefined();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Cabeçalho Referer ou Origin ausente',
        }),
        expect.objectContaining({ status: 403 })
      );
    });

    it('deve bloquear requisições com origens diferentes para métodos não seguros', async () => {
      // Arrange
      const req = {
        method: 'POST',
        headers: {
          get: jest.fn((header) => {
            if (header === 'referer') return 'https://site-malicioso.com/form';
            if (header === 'origin') return 'https://site-malicioso.com';
            return null;
          }),
        },
        url: 'https://exemplo.com/api/dados',
      } as unknown as NextRequest;
      const handler = jest.fn();

      // Act
      const response = prevenirCSRF(req);

      // Assert
      expect(response).toBeDefined();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Requisição bloqueada por proteção CSRF',
        }),
        expect.objectContaining({ status: 403 })
      );
    });
  });
});
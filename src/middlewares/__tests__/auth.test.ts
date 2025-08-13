// src/middlewares/__tests__/auth.test.ts

import { NextRequest, NextResponse } from 'next/server';
import { autenticarRota, verificarPermissaoRecurso, extrairTokenJWT, UsuarioToken } from '../auth';
import { jwtVerify } from 'jose';

// Mock do módulo jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

// Mock do NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => ({ status: 200 })),
      redirect: jest.fn((url) => ({ status: 302, url })),
      json: jest.fn((data, options) => ({ status: options?.status || 200, data })),
    },
  };
});

describe('Middleware de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(process.env, 'NEXTAUTH_SECRET', {
      value: 'test-secret',
      configurable: true
    });
  });

  describe('autenticarRota', () => {
    it('deve permitir acesso a rotas públicas', async () => {
      // Arrange
      const req = {
        nextUrl: { pathname: '/login' },
        url: 'http://localhost:3000/login',
      } as unknown as NextRequest;

      // Act
      const result = await autenticarRota(req);

      // Assert
      expect(NextResponse.next).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('deve permitir acesso a rotas de API públicas', async () => {
      // Arrange
      const req = {
        nextUrl: { pathname: '/api/auth/signin' },
        url: 'http://localhost:3000/api/auth/signin',
      } as unknown as NextRequest;

      // Act
      const result = await autenticarRota(req);

      // Assert
      expect(NextResponse.next).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('deve redirecionar para login quando não há token', async () => {
      // Arrange
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost:3000/dashboard',
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      // Act
      const result = await autenticarRota(req);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(result.status).toBe(302);
    });

    it('deve permitir acesso quando o token é válido', async () => {
      // Arrange
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost:3000/dashboard',
        headers: {
          get: jest.fn().mockReturnValue('Bearer valid-token'),
        },
      } as unknown as NextRequest;

      // Mock do jwtVerify para retornar um payload válido
      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          id: '123',
          nome: 'Teste',
          email: 'teste@example.com',
          cargo: 'Gerente',
          permissoes: [],
        },
      });

      // Act
      const result = await autenticarRota(req);

      // Assert
      expect(NextResponse.next).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });
  });

  describe('verificarPermissaoRecurso', () => {
    it('deve retornar true para gerentes independente do recurso', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Gerente',
        email: 'gerente@example.com',
        cargo: 'Gerente',
        permissoes: [],
      };

      // Act
      const result = verificarPermissaoRecurso(usuario, 'qualquer-recurso', 'admin');

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar true quando o usuário tem a permissão específica', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [
          { recurso: 'caixas', acoes: ['ler', 'criar'] },
        ],
      };

      // Act
      const result = verificarPermissaoRecurso(usuario, 'caixas', 'ler');

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false quando o usuário não tem a permissão específica', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [
          { recurso: 'caixas', acoes: ['ler'] },
        ],
      };

      // Act
      const result = verificarPermissaoRecurso(usuario, 'caixas', 'excluir');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('extrairTokenJWT', () => {
    it('deve retornar null quando o cabeçalho de autorização está ausente', async () => {
      // Act
      const result = await extrairTokenJWT(null);

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null quando o formato do token é inválido', async () => {
      // Act
      const result = await extrairTokenJWT('InvalidToken');

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar o payload quando o token é válido', async () => {
      // Arrange
      const payload = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };

      // Mock do jwtVerify para retornar um payload válido
      (jwtVerify as jest.Mock).mockResolvedValue({ payload });

      // Act
      const result = await extrairTokenJWT('Bearer valid-token');

      // Assert
      expect(result).toEqual(payload);
      expect(jwtVerify).toHaveBeenCalled();
    });

    it('deve retornar null quando ocorre um erro na verificação do token', async () => {
      // Arrange
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Token inválido'));

      // Act
      const result = await extrairTokenJWT('Bearer invalid-token');

      // Assert
      expect(result).toBeNull();
    });
  });
});
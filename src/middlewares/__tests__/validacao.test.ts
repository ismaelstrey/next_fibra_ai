// src/middlewares/__tests__/validacao.test.ts

import { NextRequest, NextResponse } from 'next/server';
import { validarCorpo, validarQuery, validarParametroRota } from '../validacao';
import { z } from 'zod';

// Mock do NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn((data, options) => ({ status: options?.status || 200, data })),
      next: jest.fn(() => ({ status: 200 })),
    },
  };
});

describe('Middleware de Validação', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validarCorpo', () => {
    const schema = z.object({
      nome: z.string().min(3),
      email: z.string().email(),
      idade: z.number().min(18),
    });

    it('deve validar um corpo de requisição válido', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          nome: 'João Silva',
          email: 'joao@example.com',
          idade: 25,
        }),
      } as unknown as NextRequest;

      const mockHandler = jest.fn().mockReturnValue(new NextResponse());

      // Act
      const middleware = validarCorpo(schema);
      await middleware(mockRequest);

      // Assert
      expect(mockHandler).toHaveBeenCalled();
      expect(NextResponse.json).not.toHaveBeenCalled();
    });

    it('deve retornar erro para um corpo de requisição inválido', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          nome: 'Jo', // Nome muito curto
          email: 'email-invalido',
          idade: 16, // Idade abaixo do mínimo
        }),
      } as unknown as NextRequest;

      const mockHandler = jest.fn();

      // Act
      const middleware = validarCorpo(schema);
      await middleware(mockRequest);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: expect.any(String),
          erros: expect.any(Array),
        }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('deve lidar com erros ao processar o corpo da requisição', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Erro ao processar JSON')),
      } as unknown as NextRequest;

      const mockHandler = jest.fn();

      // Act
      const middleware = validarCorpo(schema);
      await middleware(mockRequest);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Erro ao processar o corpo da requisição',
        }),
        expect.objectContaining({ status: 400 })
      );
    });
  });

  describe('validarQuery', () => {
    const schema = z.object({
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      search: z.string().optional(),
    });

    it('deve validar parâmetros de consulta válidos', async () => {
      // Arrange
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('page=1&limit=10&search=teste'),
        },
      } as unknown as NextRequest;

      const mockHandler = jest.fn().mockReturnValue(new NextResponse());

      // Act
      const middleware = validarQuery(schema as z.ZodType<{
        page?: number;
        limit?: number;
        search?: string;
      }>);
      await middleware(mockRequest);

      // Assert
      expect(mockHandler).toHaveBeenCalled();
      expect(NextResponse.json).not.toHaveBeenCalled();
    });

    it('deve retornar erro para parâmetros de consulta inválidos', async () => {
      // Arrange
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('page=abc&limit=xyz'),
        },
      } as unknown as NextRequest;

      const mockHandler = jest.fn();

      // Act
      const middleware = validarQuery(schema as z.ZodType<{
        page?: number;
        limit?: number;
        search?: string;
      }>);
      await middleware(mockRequest);

      // Assert
      expect(mockHandler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: expect.any(String),
          erros: expect.any(Array),
        }),
        expect.objectContaining({ status: 400 })
      );
    });
  });

  describe('validarParametroRota', () => {
    it('deve validar um parâmetro de rota válido', () => {
      // Arrange
      const pattern = /^\d+$/;
      const req = {
        url: 'http://localhost:3000/api/usuarios/123',
      } as unknown as NextRequest;

      // Act
      const middleware = validarParametroRota('id', pattern);
      const result = middleware(req);

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar erro para um parâmetro de rota que não corresponde ao padrão', () => {
      // Arrange
      const pattern = /^\d+$/;
      const req = {
        url: 'http://localhost:3000/api/usuarios/abc',
      } as unknown as NextRequest;

      // Act
      const middleware = validarParametroRota('id', pattern);
      const result = middleware(req);

      // Assert
      expect(result).not.toBeNull();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: expect.stringContaining('Parâmetro id inválido'),
        }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('deve continuar quando o parâmetro de rota não está presente no caminho', () => {
      // Arrange
      const pattern = /^\d+$/;
      const req = {
        url: 'http://localhost:3000/api/usuarios',
      } as unknown as NextRequest;

      // Act
      const middleware = validarParametroRota('id', pattern);
      const result = middleware(req);

      // Assert
      expect(result).toBeNull();
    });
  });
});

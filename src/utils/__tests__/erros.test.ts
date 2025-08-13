// src/utils/__tests__/erros.test.ts

import { NextResponse } from 'next/server';
import { tratarErro, criarErro, erroNaoAutorizado, erroProibido, erroNaoEncontrado, erroValidacao } from '../erros';
import { ZodError, z } from 'zod';
import { Prisma } from '@prisma/client';

// Mock do NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ status: options?.status || 200, data })),
  },
}));

describe('Utilitários de Tratamento de Erros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tratarErro', () => {
    it('deve tratar erros de validação do Zod', () => {
      // Arrange
      const schema = z.object({
        nome: z.string().min(3),
        email: z.string().email(),
      });
      let zodError: ZodError;
      try {
        schema.parse({ nome: 'Jo', email: 'email-invalido' });
      } catch (error) {
        zodError = error as ZodError;
      }

      // Act
      const response = tratarErro(zodError);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Erro de validação',
          erros: expect.any(Array),
        }),
        expect.objectContaining({ status: 400 })
      );
      expect(response.status).toBe(400);
    });

    it('deve tratar erros de aplicação personalizados', () => {
      // Arrange
      const erro = criarErro('Erro personalizado', 403, 'ACESSO_NEGADO');

      // Act
      const response = tratarErro(erro);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Erro personalizado',
          codigo: 'ACESSO_NEGADO',
        }),
        expect.objectContaining({ status: 403 })
      );
      expect(response.status).toBe(403);
    });

    it('deve tratar erros do Prisma', () => {
      // Arrange
      const erro = new Prisma.PrismaClientKnownRequestError('Registro não encontrado', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });

      // Act
      const response = tratarErro(erro);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: expect.stringContaining('Erro de banco de dados'),
          codigo: 'P2025',
        }),
        expect.objectContaining({ status: 500 })
      );
      expect(response.status).toBe(500);
    });

    it('deve tratar erros genéricos', () => {
      // Arrange
      const erro = new Error('Erro inesperado');

      // Act
      const response = tratarErro(erro);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Erro interno do servidor',
        }),
        expect.objectContaining({ status: 500 })
      );
      expect(response.status).toBe(500);
    });
  });

  describe('criarErro', () => {
    it('deve criar um objeto de erro com as propriedades corretas', () => {
      // Act
      const erro = criarErro('Mensagem de erro', 400, 'CODIGO_ERRO');

      // Assert
      expect(erro).toEqual({
        mensagem: 'Mensagem de erro',
        status: 400,
        codigo: 'CODIGO_ERRO',
      });
    });
  });

  describe('erroNaoAutorizado', () => {
    it('deve lançar um erro de não autorizado', () => {
      // Act & Assert
      expect(() => erroNaoAutorizado()).toThrow();
      try {
        erroNaoAutorizado();
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Não autorizado',
          status: 401,
          codigo: 'NAO_AUTORIZADO',
        });
      }
    });

    it('deve permitir personalizar a mensagem', () => {
      // Act & Assert
      try {
        erroNaoAutorizado('Acesso negado');
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Acesso negado',
          status: 401,
          codigo: 'NAO_AUTORIZADO',
        });
      }
    });
  });

  describe('erroProibido', () => {
    it('deve lançar um erro de proibido', () => {
      // Act & Assert
      expect(() => erroProibido()).toThrow();
      try {
        erroProibido();
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Acesso proibido',
          status: 403,
          codigo: 'ACESSO_PROIBIDO',
        });
      }
    });

    it('deve permitir personalizar a mensagem', () => {
      // Act & Assert
      try {
        erroProibido('Permissão insuficiente');
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Permissão insuficiente',
          status: 403,
          codigo: 'ACESSO_PROIBIDO',
        });
      }
    });
  });

  describe('erroNaoEncontrado', () => {
    it('deve lançar um erro de não encontrado', () => {
      // Act & Assert
      expect(() => erroNaoEncontrado()).toThrow();
      try {
        erroNaoEncontrado();
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Recurso não encontrado',
          status: 404,
          codigo: 'NAO_ENCONTRADO',
        });
      }
    });

    it('deve permitir personalizar a mensagem', () => {
      // Act & Assert
      try {
        erroNaoEncontrado('Usuário não encontrado');
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Usuário não encontrado',
          status: 404,
          codigo: 'NAO_ENCONTRADO',
        });
      }
    });
  });

  describe('erroValidacao', () => {
    it('deve lançar um erro de validação', () => {
      // Act & Assert
      expect(() => erroValidacao()).toThrow();
      try {
        erroValidacao();
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Erro de validação',
          status: 400,
          codigo: 'VALIDACAO',
        });
      }
    });

    it('deve permitir personalizar a mensagem', () => {
      // Act & Assert
      try {
        erroValidacao('Dados inválidos');
      } catch (erro) {
        expect(erro).toEqual({
          mensagem: 'Dados inválidos',
          status: 400,
          codigo: 'VALIDACAO',
        });
      }
    });
  });
});
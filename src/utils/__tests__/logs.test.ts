// src/utils/__tests__/logs.test.ts

import { registrarLog, registrarErro, registrarAcessoNegado } from '../logs';
import { UsuarioToken } from '@/middlewares/auth';
import { PrismaClient } from '@prisma/client';

// Mock do Prisma
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn().mockResolvedValue({ id: 'log-id' });
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      log: {
        create: mockCreate,
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('Utilitários de Logs', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });

  describe('registrarLog', () => {
    it('deve registrar um log de ação do usuário', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const acao = 'criar';
      const recurso = 'fusoes';
      const detalhes = { id: '456', nome: 'Fusão Teste' };

      // Act
      await registrarLog(usuario, acao, recurso, detalhes, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          usuarioId: '123',
          usuarioNome: 'Teste',
          usuarioEmail: 'teste@example.com',
          usuarioCargo: 'Técnico',
          acao,
          recurso,
          detalhes: JSON.stringify(detalhes),
        },
      });
    });

    it('deve registrar um log sem detalhes', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const acao = 'consultar';
      const recurso = 'caixas';

      // Act
      await registrarLog(usuario, acao, recurso, undefined, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          usuarioId: '123',
          usuarioNome: 'Teste',
          usuarioEmail: 'teste@example.com',
          usuarioCargo: 'Técnico',
          acao,
          recurso,
          detalhes: null,
        },
      });
    });

    it('deve criar uma nova instância do Prisma quando não fornecida', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const acao = 'atualizar';
      const recurso = 'usuarios';

      // Act
      await registrarLog(usuario, acao, recurso);

      // Assert
      expect(PrismaClient).toHaveBeenCalled();
      expect(prisma.log.create).toHaveBeenCalled();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('registrarErro', () => {
    it('deve registrar um log de erro do sistema', async () => {
      // Arrange
      const erro = new Error('Erro de teste');
      erro.stack = 'Error: Erro de teste\n    at Test.it';
      const contexto = { rota: '/api/fusoes', metodo: 'GET' };

      // Act
      await registrarErro(erro, contexto, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          acao: 'erro',
          recurso: 'sistema',
          detalhes: JSON.stringify({
            mensagem: 'Erro de teste',
            stack: 'Error: Erro de teste\n    at Test.it',
            contexto,
          }),
        },
      });
    });

    it('deve registrar um erro sem stack trace', async () => {
      // Arrange
      const erro = { mensagem: 'Erro personalizado' };
      const contexto = { rota: '/api/usuarios', metodo: 'POST' };

      // Act
      await registrarErro(erro, contexto, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          acao: 'erro',
          recurso: 'sistema',
          detalhes: JSON.stringify({
            mensagem: JSON.stringify(erro),
            contexto,
          }),
        },
      });
    });

    it('deve criar uma nova instância do Prisma quando não fornecida', async () => {
      // Arrange
      const erro = new Error('Erro de teste');
      const contexto = { rota: '/api/caixas', metodo: 'PUT' };

      // Act
      await registrarErro(erro, contexto);

      // Assert
      expect(PrismaClient).toHaveBeenCalled();
      expect(prisma.log.create).toHaveBeenCalled();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('registrarAcessoNegado', () => {
    it('deve registrar um log de acesso negado', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const recurso = 'fusoes';
      const acao = 'excluir';
      const detalhes = { id: '456' };

      // Act
      await registrarAcessoNegado(usuario, recurso, acao, detalhes, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          usuarioId: '123',
          usuarioNome: 'Teste',
          usuarioEmail: 'teste@example.com',
          usuarioCargo: 'Técnico',
          acao: 'acesso_negado',
          recurso,
          detalhes: JSON.stringify({
            acao,
            detalhes,
          }),
        },
      });
    });

    it('deve registrar acesso negado sem detalhes adicionais', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const recurso = 'configuracoes';
      const acao = 'ler';

      // Act
      await registrarAcessoNegado(usuario, recurso, acao, undefined, prisma);

      // Assert
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: {
          usuarioId: '123',
          usuarioNome: 'Teste',
          usuarioEmail: 'teste@example.com',
          usuarioCargo: 'Técnico',
          acao: 'acesso_negado',
          recurso,
          detalhes: JSON.stringify({
            acao,
            detalhes: undefined,
          }),
        },
      });
    });

    it('deve criar uma nova instância do Prisma quando não fornecida', async () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const recurso = 'relatorios';
      const acao = 'gerar';

      // Act
      await registrarAcessoNegado(usuario, recurso, acao);

      // Assert
      expect(PrismaClient).toHaveBeenCalled();
      expect(prisma.log.create).toHaveBeenCalled();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });
});
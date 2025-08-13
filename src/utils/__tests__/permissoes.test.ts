// src/utils/__tests__/permissoes.test.ts

import { verificarPermissao, verificarAcessoCidade, verificarMultiplasPermissoes } from '../permissoes';
import { UsuarioToken } from '@/middlewares/auth';

describe('Utilitários de Permissões', () => {
  describe('verificarPermissao', () => {
    it('deve permitir acesso para gerentes independente do recurso', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Gerente',
        email: 'gerente@example.com',
        cargo: 'Gerente',
        permissoes: [],
      };

      // Act
      const result = verificarPermissao(usuario, 'qualquer-recurso', 'qualquer-acao');

      // Assert
      expect(result).toBe(true);
    });

    it('deve permitir acesso quando o usuário tem a permissão específica', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [
          { recurso: 'caixas', acoes: ['ler', 'criar'] },
          { recurso: 'fusoes', acoes: ['ler'] },
        ],
      };

      // Act
      const result = verificarPermissao(usuario, 'caixas', 'criar');

      // Assert
      expect(result).toBe(true);
    });

    it('deve negar acesso quando o usuário não tem a permissão específica', () => {
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
      const result = verificarPermissao(usuario, 'caixas', 'excluir');

      // Assert
      expect(result).toBe(false);
    });

    it('deve negar acesso quando o usuário não tem permissões para o recurso', () => {
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
      const result = verificarPermissao(usuario, 'fusoes', 'ler');

      // Assert
      expect(result).toBe(false);
    });

    it('deve negar acesso quando o usuário não tem permissões definidas', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };

      // Act
      const result = verificarPermissao(usuario, 'caixas', 'ler');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verificarAcessoCidade', () => {
    it('deve permitir acesso para gerentes independente da cidade', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Gerente',
        email: 'gerente@example.com',
        cargo: 'Gerente',
        permissoes: [],
        cidadesPermitidas: [],
      };

      // Act
      const result = verificarAcessoCidade(usuario, '456');

      // Assert
      expect(result).toBe(true);
    });

    it('deve permitir acesso quando a cidade está na lista de cidades permitidas', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [],
        cidadesPermitidas: ['123', '456', '789'],
      };

      // Act
      const result = verificarAcessoCidade(usuario, '456');

      // Assert
      expect(result).toBe(true);
    });

    it('deve negar acesso quando a cidade não está na lista de cidades permitidas', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [],
        cidadesPermitidas: ['123', '789'],
      };

      // Act
      const result = verificarAcessoCidade(usuario, '456');

      // Assert
      expect(result).toBe(false);
    });

    it('deve negar acesso quando o usuário não tem cidades permitidas definidas', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };

      // Act
      const result = verificarAcessoCidade(usuario, '456');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('verificarMultiplasPermissoes', () => {
    it('deve permitir acesso para gerentes independente das permissões', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Gerente',
        email: 'gerente@example.com',
        cargo: 'Gerente',
        permissoes: [],
      };
      const permissoes = [
        { recurso: 'caixas', acao: 'ler' },
        { recurso: 'fusoes', acao: 'criar' },
      ];

      // Act
      const result = verificarMultiplasPermissoes(usuario, permissoes);

      // Assert
      expect(result).toBe(true);
    });

    it('deve permitir acesso quando o usuário tem todas as permissões necessárias', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [
          { recurso: 'caixas', acoes: ['ler', 'criar', 'atualizar'] },
          { recurso: 'fusoes', acoes: ['ler', 'criar'] },
        ],
      };
      const permissoes = [
        { recurso: 'caixas', acao: 'ler' },
        { recurso: 'fusoes', acao: 'criar' },
      ];

      // Act
      const result = verificarMultiplasPermissoes(usuario, permissoes);

      // Assert
      expect(result).toBe(true);
    });

    it('deve negar acesso quando o usuário não tem todas as permissões necessárias', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [
          { recurso: 'caixas', acoes: ['ler', 'criar'] },
          { recurso: 'fusoes', acoes: ['ler'] },
        ],
      };
      const permissoes = [
        { recurso: 'caixas', acao: 'ler' },
        { recurso: 'fusoes', acao: 'criar' }, // Não tem esta permissão
      ];

      // Act
      const result = verificarMultiplasPermissoes(usuario, permissoes);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar true quando a lista de permissões necessárias está vazia', () => {
      // Arrange
      const usuario: UsuarioToken = {
        id: '123',
        nome: 'Técnico',
        email: 'tecnico@example.com',
        cargo: 'Técnico',
        permissoes: [],
      };
      const permissoes = [];

      // Act
      const result = verificarMultiplasPermissoes(usuario, permissoes);

      // Assert
      expect(result).toBe(true);
    });
  });
});
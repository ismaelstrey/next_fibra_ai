// src/utils/__tests__/jwt.test.ts

import { gerarToken, verificarToken, extrairTokenDoHeader, tokenExpirado } from '../jwt';
import { SignJWT, jwtVerify } from 'jose';

// Mock do módulo jose
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-token'),
  })),
  jwtVerify: jest.fn(),
}));

describe('Utilitários JWT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1h';
  });

  describe('gerarToken', () => {
    it('deve gerar um token JWT válido', async () => {
      // Arrange
      const payload = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
      };

      // Act
      const token = await gerarToken(payload);

      // Assert
      expect(token).toBe('mock-token');
      expect(SignJWT).toHaveBeenCalledWith(payload);
    });

    it('deve usar o tempo de expiração configurado', async () => {
      // Arrange
      const payload = { id: '123' };
      const mockSetExpirationTime = jest.fn().mockReturnThis();
      (SignJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: mockSetExpirationTime,
        sign: jest.fn().mockResolvedValue('mock-token'),
      }));

      // Act
      await gerarToken(payload);

      // Assert
      expect(mockSetExpirationTime).toHaveBeenCalledWith('1h');
    });
  });

  describe('verificarToken', () => {
    it('deve verificar um token JWT válido', async () => {
      // Arrange
      const token = 'valid-token';
      const payload = {
        id: '123',
        nome: 'Teste',
        email: 'teste@example.com',
      };
      (jwtVerify as jest.Mock).mockResolvedValue({ payload });

      // Act
      const result = await verificarToken(token);

      // Assert
      expect(result).toEqual(payload);
      expect(jwtVerify).toHaveBeenCalled();
    });

    it('deve retornar null quando o token é inválido', async () => {
      // Arrange
      const token = 'invalid-token';
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Token inválido'));

      // Act
      const result = await verificarToken(token);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('extrairTokenDoHeader', () => {
    it('deve extrair o token do cabeçalho de autorização', () => {
      // Arrange
      const authHeader = 'Bearer valid-token';

      // Act
      const token = extrairTokenDoHeader(authHeader);

      // Assert
      expect(token).toBe('valid-token');
    });

    it('deve retornar null quando o cabeçalho de autorização está ausente', () => {
      // Act
      const token = extrairTokenDoHeader(null);

      // Assert
      expect(token).toBeNull();
    });

    it('deve retornar null quando o formato do cabeçalho é inválido', () => {
      // Arrange
      const authHeader = 'InvalidFormat';

      // Act
      const token = extrairTokenDoHeader(authHeader);

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('tokenExpirado', () => {
    it('deve retornar true para um token expirado', () => {
      // Arrange
      const payload = {
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hora atrás
      };

      // Act
      const result = tokenExpirado(payload);

      // Assert
      expect(result).toBe(true);
    });

    it('deve retornar false para um token válido', () => {
      // Arrange
      const payload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hora no futuro
      };

      // Act
      const result = tokenExpirado(payload);

      // Assert
      expect(result).toBe(false);
    });

    it('deve retornar true quando o payload não contém exp', () => {
      // Arrange
      const payload = {};

      // Act
      const result = tokenExpirado(payload);

      // Assert
      expect(result).toBe(true);
    });
  });
});
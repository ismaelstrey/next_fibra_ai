import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma/prisma';
import * as utils from '../../utils';

// Mock do Prisma
jest.mock('@/prisma/prisma', () => ({
  prisma: {
    fusao: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    caixa: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock das funções de utilidade
jest.mock('../../utils', () => ({
  verificarAutenticacao: jest.fn(),
  verificarPermissao: jest.fn(),
  tratarErro: jest.fn(),
  registrarLog: jest.fn(),
}));

describe('API de Fusões', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/fusoes', () => {
    it('deve retornar uma lista de fusões quando autenticado', async () => {
      // Arrange
      const mockFusoes = [
        { id: '1', capilarOrigemId: 'cap1', capilarDestinoId: 'cap2', tipoFusao: 'capilar_capilar' },
        { id: '2', capilarOrigemId: 'cap3', capilarDestinoId: 'cap4', tipoFusao: 'capilar_splitter' },
      ];
      
      (utils.verificarAutenticacao as jest.Mock).mockResolvedValue({ id: 'user1', cargo: 'Gerente' });
      (prisma.fusao.findMany as jest.Mock).mockResolvedValue(mockFusoes);
      
      const req = new NextRequest('http://localhost:3000/api/fusoes');
      
      // Act
      const response = await GET(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockFusoes);
      expect(prisma.fusao.findMany).toHaveBeenCalled();
      expect(utils.verificarAutenticacao).toHaveBeenCalledWith(req);
    });

    it('deve retornar 401 quando não autenticado', async () => {
      // Arrange
      (utils.verificarAutenticacao as jest.Mock).mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/fusoes');
      
      // Act
      const response = await GET(req);
      
      // Assert
      expect(response.status).toBe(401);
      expect(utils.verificarAutenticacao).toHaveBeenCalledWith(req);
      expect(prisma.fusao.findMany).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/fusoes', () => {
    it('deve criar uma nova fusão quando dados válidos são fornecidos', async () => {
      // Arrange
      const mockFusao = {
        capilarOrigemId: 'cap1',
        capilarDestinoId: 'cap2',
        tipoFusao: 'capilar_capilar',
        status: 'Ativa',
        caixaId: 'caixa1',
      };
      
      const mockCaixa = {
        id: 'caixa1',
        cidadeId: 'cidade1',
        tipo: 'CTO',
        cidade: {
          usuarios: [{ id: 'user1' }],
        },
      };
      
      (utils.verificarAutenticacao as jest.Mock).mockResolvedValue({ id: 'user1', cargo: 'Técnico' });
      (prisma.caixa.findUnique as jest.Mock).mockResolvedValue(mockCaixa);
      (prisma.fusao.create as jest.Mock).mockResolvedValue({ id: 'fusao1', ...mockFusao });
      
      const req = new NextRequest('http://localhost:3000/api/fusoes', {
        method: 'POST',
        body: JSON.stringify(mockFusao),
      });
      
      // Act
      const response = await POST(req);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id', 'fusao1');
      expect(prisma.fusao.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockFusao),
      });
    });

    it('deve retornar 400 quando dados inválidos são fornecidos', async () => {
      // Arrange
      const mockInvalidFusao = {
        // Faltando campos obrigatórios
        capilarOrigemId: 'cap1',
      };
      
      (utils.verificarAutenticacao as jest.Mock).mockResolvedValue({ id: 'user1', cargo: 'Técnico' });
      
      const req = new NextRequest('http://localhost:3000/api/fusoes', {
        method: 'POST',
        body: JSON.stringify(mockInvalidFusao),
      });
      
      // Act
      const response = await POST(req);
      
      // Assert
      expect(response.status).toBe(400);
      expect(prisma.fusao.create).not.toHaveBeenCalled();
    });
  });
});
// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock do Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Configuração global para testes
global.fetch = jest.fn();

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
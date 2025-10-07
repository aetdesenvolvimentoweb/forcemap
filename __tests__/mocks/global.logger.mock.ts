/**
 * Mock do globalLogger para testes
 * O mock real está configurado em jest.setup.ts
 */
import { mockGlobalLogger as globalLoggerMock } from "../../jest.setup";

export const mockGlobalLogger = globalLoggerMock;

// Helper para resetar mocks
export const resetGlobalLoggerMocks = () => {
  mockGlobalLogger.info.mockClear();
  mockGlobalLogger.warn.mockClear();
  mockGlobalLogger.error.mockClear();
  mockGlobalLogger.debug.mockClear();
};

import { LoggerProtocol } from "../src/application/protocols";

export const mockLogger = (): jest.Mocked<LoggerProtocol> => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

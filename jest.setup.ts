// Mock globalLogger globally for all tests
export const mockGlobalLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

jest.mock("./src/infra/adapters/global.logger", () => ({
  globalLogger: mockGlobalLogger,
}));

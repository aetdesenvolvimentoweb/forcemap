type MockLogger = {
  info: jest.MockedFunction<any>;
  warn: jest.MockedFunction<any>;
  error: jest.MockedFunction<any>;
  debug: jest.MockedFunction<any>;
  child: jest.MockedFunction<any>;
};

const mockLogger: MockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn((): MockLogger => mockLogger),
};

const pino = jest.fn((): MockLogger => mockLogger);

export default pino;

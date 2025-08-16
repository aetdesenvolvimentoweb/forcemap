import pino from "pino";

import { PinoLogger } from "@infra/loggers";

describe("PinoLogger", () => {
  let sut: PinoLogger;
  let mockPinoInstance: jest.Mocked<pino.Logger>;

  beforeEach(() => {
    mockPinoInstance = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<pino.Logger>;

    sut = new PinoLogger(mockPinoInstance);
  });

  describe("info", () => {
    it("should call pino info with message and context", () => {
      const message = "test message";
      const context = { userId: "123" };

      sut.info(message, context);

      expect(mockPinoInstance.info).toHaveBeenCalledWith(context, message);
    });

    it("should call pino info with empty object when context is not provided", () => {
      const message = "test message";

      sut.info(message);

      expect(mockPinoInstance.info).toHaveBeenCalledWith({}, message);
    });
  });

  describe("warn", () => {
    it("should call pino warn with message and context", () => {
      const message = "test warning";
      const context = { action: "test" };

      sut.warn(message, context);

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(context, message);
    });

    it("should call pino warn with empty object when context is not provided", () => {
      const message = "test warning";

      sut.warn(message);

      expect(mockPinoInstance.warn).toHaveBeenCalledWith({}, message);
    });
  });

  describe("error", () => {
    it("should call pino error with message and context", () => {
      const message = "test error";
      const context = { error: new Error("test") };

      sut.error(message, context);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(context, message);
    });

    it("should call pino error with empty object when context is not provided", () => {
      const message = "test error";

      sut.error(message);

      expect(mockPinoInstance.error).toHaveBeenCalledWith({}, message);
    });
  });

  describe("debug", () => {
    it("should call pino debug with message and context", () => {
      const message = "test debug";
      const context = { data: "test" };

      sut.debug(message, context);

      expect(mockPinoInstance.debug).toHaveBeenCalledWith(context, message);
    });

    it("should call pino debug with empty object when context is not provided", () => {
      const message = "test debug";

      sut.debug(message);

      expect(mockPinoInstance.debug).toHaveBeenCalledWith({}, message);
    });
  });

  describe("child", () => {
    it("should create a child logger with bindings", () => {
      const bindings = { module: "test" };
      
      // Para testes de child, é melhor testar a implementação real
      // pois envolve criação de nova instância do PinoLogger
      const sutWithRealPino = new PinoLogger();
      const childLogger = sutWithRealPino.child(bindings);

      expect(childLogger).toBeInstanceOf(PinoLogger);
    });
  });
});

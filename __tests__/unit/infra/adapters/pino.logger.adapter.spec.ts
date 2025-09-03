import pino from "pino";

import { PinoLoggerAdapter } from "../../../../src/infra/adapters/pino.logger.adapter";

// Create mock logger instance
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Mock pino
jest.mock("pino", () => {
  return jest.fn(() => mockLogger);
});

const mockedPino = pino as jest.MockedFunction<typeof pino>;

describe("PinoLoggerAdapter", () => {
  let sut: PinoLoggerAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new PinoLoggerAdapter();
  });

  describe("constructor", () => {
    it("should create pino logger with no options", () => {
      new PinoLoggerAdapter();

      expect(mockedPino).toHaveBeenCalledWith(undefined);
    });

    it("should create pino logger with provided options", () => {
      const options: pino.LoggerOptions = {
        level: "debug",
        transport: {
          target: "pino-pretty",
        },
      };

      new PinoLoggerAdapter(options);

      expect(mockedPino).toHaveBeenCalledWith(options);
    });

    it("should expose pino logger instance", () => {
      const adapter = new PinoLoggerAdapter();

      expect(adapter.logger).toBeDefined();
      expect(adapter.logger).toBe(mockLogger);
    });
  });

  describe("info", () => {
    it("should call pino info with message and empty meta when meta is not provided", () => {
      const message = "Info message";

      sut.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith({}, message);
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it("should call pino info with message and provided meta", () => {
      const message = "Info message";
      const meta = { userId: "123", action: "create" };

      sut.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(meta, message);
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined meta", () => {
      const message = "Info message";

      sut.info(message, undefined);

      expect(mockLogger.info).toHaveBeenCalledWith({}, message);
    });

    it("should handle null meta", () => {
      const message = "Info message";

      sut.info(message, null as any);

      expect(mockLogger.info).toHaveBeenCalledWith({}, message);
    });

    it("should handle empty meta object", () => {
      const message = "Info message";
      const meta = {};

      sut.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(meta, message);
    });

    it("should handle complex meta object", () => {
      const message = "Info message";
      const meta = {
        user: { id: "123", name: "John" },
        request: { method: "POST", path: "/api/test" },
        timestamp: new Date().toISOString(),
      };

      sut.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(meta, message);
    });
  });

  describe("warn", () => {
    it("should call pino warn with message and empty meta when meta is not provided", () => {
      const message = "Warning message";

      sut.warn(message);

      expect(mockLogger.warn).toHaveBeenCalledWith({}, message);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it("should call pino warn with message and provided meta", () => {
      const message = "Warning message";
      const meta = { reason: "validation failed" };

      sut.warn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(meta, message);
    });

    it("should handle undefined meta", () => {
      const message = "Warning message";

      sut.warn(message, undefined);

      expect(mockLogger.warn).toHaveBeenCalledWith({}, message);
    });

    it("should handle complex warning scenarios", () => {
      const message = "Deprecated API usage";
      const meta = {
        endpoint: "/api/v1/old",
        deprecationDate: "2024-01-01",
        alternativeEndpoint: "/api/v2/new",
      };

      sut.warn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(meta, message);
    });
  });

  describe("error", () => {
    it("should call pino error with message and empty meta when meta is not provided", () => {
      const message = "Error message";

      sut.error(message);

      expect(mockLogger.error).toHaveBeenCalledWith({}, message);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it("should call pino error with message and provided meta", () => {
      const message = "Database connection failed";
      const meta = { error: "CONNECTION_TIMEOUT", retryCount: 3 };

      sut.error(message, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(meta, message);
    });

    it("should handle error objects in meta", () => {
      const message = "Unexpected error occurred";
      const error = new Error("Something went wrong");
      const meta = { error, stack: error.stack };

      sut.error(message, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(meta, message);
    });

    it("should handle complex error scenarios", () => {
      const message = "Request processing failed";
      const meta = {
        requestId: "req-123",
        userId: "user-456",
        error: {
          name: "ValidationError",
          message: "Required field missing",
          code: "VALIDATION_FAILED",
        },
        timestamp: Date.now(),
      };

      sut.error(message, meta);

      expect(mockLogger.error).toHaveBeenCalledWith(meta, message);
    });
  });

  describe("debug", () => {
    it("should call pino debug with message and empty meta when meta is not provided", () => {
      const message = "Debug message";

      sut.debug(message);

      expect(mockLogger.debug).toHaveBeenCalledWith({}, message);
      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
    });

    it("should call pino debug with message and provided meta", () => {
      const message = "Processing request";
      const meta = { step: 1, processingTime: 100 };

      sut.debug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(meta, message);
    });

    it("should handle detailed debug information", () => {
      const message = "Database query executed";
      const meta = {
        query: "SELECT * FROM users WHERE id = ?",
        params: ["123"],
        executionTime: 25,
        resultCount: 1,
      };

      sut.debug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(meta, message);
    });
  });

  describe("all log levels", () => {
    it("should handle all log levels with same message", () => {
      const message = "Test message";
      const meta = { testData: "test" };

      sut.info(message, meta);
      sut.warn(message, meta);
      sut.error(message, meta);
      sut.debug(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(meta, message);
      expect(mockLogger.warn).toHaveBeenCalledWith(meta, message);
      expect(mockLogger.error).toHaveBeenCalledWith(meta, message);
      expect(mockLogger.debug).toHaveBeenCalledWith(meta, message);

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple calls to same log level", () => {
      sut.info("First message");
      sut.info("Second message");
      sut.info("Third message");

      expect(mockLogger.info).toHaveBeenCalledTimes(3);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, {}, "First message");
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, {}, "Second message");
      expect(mockLogger.info).toHaveBeenNthCalledWith(3, {}, "Third message");
    });
  });

  describe("edge cases", () => {
    it("should handle empty message", () => {
      sut.info("");

      expect(mockLogger.info).toHaveBeenCalledWith({}, "");
    });

    it("should handle very long message", () => {
      const longMessage = "a".repeat(10000);

      sut.info(longMessage);

      expect(mockLogger.info).toHaveBeenCalledWith({}, longMessage);
    });

    it("should handle special characters in message", () => {
      const message = "Message with special chars: !@#$%^&*()[]{}|;:,.<>?";

      sut.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith({}, message);
    });

    it("should handle unicode characters", () => {
      const message = "Unicode message: 🚀 测试 émoji";

      sut.info(message);

      expect(mockLogger.info).toHaveBeenCalledWith({}, message);
    });

    it("should handle meta with various data types", () => {
      const message = "Mixed data types";
      const meta = {
        string: "text",
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: "value" },
        date: new Date(),
      };

      sut.info(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(meta, message);
    });

    it("should not modify original meta object", () => {
      const message = "Test message";
      const originalMeta = { count: 1 };
      const metaCopy = { ...originalMeta };

      sut.info(message, originalMeta);

      expect(originalMeta).toEqual(metaCopy);
    });

    it("should handle concurrent logging calls", async () => {
      const promises = [
        Promise.resolve(sut.info("Concurrent 1")),
        Promise.resolve(sut.warn("Concurrent 2")),
        Promise.resolve(sut.error("Concurrent 3")),
        Promise.resolve(sut.debug("Concurrent 4")),
      ];

      await Promise.all(promises);

      expect(mockLogger.info).toHaveBeenCalledWith({}, "Concurrent 1");
      expect(mockLogger.warn).toHaveBeenCalledWith({}, "Concurrent 2");
      expect(mockLogger.error).toHaveBeenCalledWith({}, "Concurrent 3");
      expect(mockLogger.debug).toHaveBeenCalledWith({}, "Concurrent 4");
    });
  });
});

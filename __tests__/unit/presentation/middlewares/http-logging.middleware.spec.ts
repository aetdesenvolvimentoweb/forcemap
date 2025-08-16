import type { Request, Response, NextFunction } from "express";

import type { Logger } from "@application/protocols";
import { HttpLoggingMiddleware } from "@presentation/middlewares";

describe("HttpLoggingMiddleware", () => {
  let sut: HttpLoggingMiddleware;
  let mockLogger: jest.Mocked<Logger>;
  let mockChildLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockChildLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnValue(mockChildLogger),
    };

    mockRequest = {
      method: "GET",
      url: "/test",
      ip: "127.0.0.1",
      get: jest.fn().mockImplementation((header) => {
        if (header === "User-Agent") return "test-agent";
        return undefined;
      }),
    } as Partial<Request>;

    mockResponse = {
      setHeader: jest.fn(),
      get: jest.fn(),
      statusCode: 200,
      on: jest.fn(),
    } as Partial<Response>;

    mockNext = jest.fn();
    sut = new HttpLoggingMiddleware(mockLogger);
  });

  describe("handle", () => {
    it("should set correlation ID header", () => {
      sut.handle(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "X-Correlation-ID",
        expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/),
      );
    });

    it("should create child logger with request context", () => {
      sut.handle(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockLogger.child).toHaveBeenCalledWith({
        correlationId: expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/),
        method: "GET",
        url: "/test",
        userAgent: "test-agent",
        ip: "127.0.0.1",
      });
    });

    it("should log request started", () => {
      sut.handle(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockChildLogger.info).toHaveBeenCalledWith("Request started");
    });

    it("should call next function", () => {
      sut.handle(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should register finish event listener", () => {
      sut.handle(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.on).toHaveBeenCalledWith(
        "finish",
        expect.any(Function),
      );
    });

    describe("on response finish", () => {
      it("should log success response with info level", () => {
        // ARRANGE
        mockResponse.statusCode = 200;
        (mockResponse.get as jest.Mock).mockReturnValue("1024");
        let finishCallback: () => void = () => {};

        (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
          if (event === "finish") {
            finishCallback = callback;
          }
        });

        // ACT
        sut.handle(mockRequest as Request, mockResponse as Response, mockNext);
        finishCallback(); // Executar callback diretamente

        // ASSERT
        expect(mockChildLogger.info).toHaveBeenCalledWith(
          expect.stringMatching(/Request finished - 200 \d+ms/),
          expect.objectContaining({
            statusCode: 200,
            responseTime: expect.stringMatching(/\d+ms/),
            contentLength: "1024",
          }),
        );
      });

      it("should log client error response with warn level", () => {
        // ARRANGE
        mockResponse.statusCode = 400;
        let finishCallback: () => void = () => {};

        (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
          if (event === "finish") {
            finishCallback = callback;
          }
        });

        // ACT
        sut.handle(mockRequest as Request, mockResponse as Response, mockNext);
        finishCallback(); // Executar callback diretamente

        // ASSERT
        expect(mockChildLogger.warn).toHaveBeenCalledWith(
          expect.stringMatching(/Request finished - 400 \d+ms/),
          expect.any(Object),
        );
      });

      it("should log server error response with error level", () => {
        // ARRANGE
        mockResponse.statusCode = 500;
        let finishCallback: () => void = () => {};

        (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
          if (event === "finish") {
            finishCallback = callback;
          }
        });

        // ACT
        sut.handle(mockRequest as Request, mockResponse as Response, mockNext);
        finishCallback(); // Executar callback diretamente

        // ASSERT
        expect(mockChildLogger.error).toHaveBeenCalledWith(
          expect.stringMatching(/Request finished - 500 \d+ms/),
          expect.any(Object),
        );
      });
    });
  });
});

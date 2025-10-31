// Mock logger for tests
const mockGlobalLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const resetGlobalLoggerMocks = () => {
  mockGlobalLogger.info.mockClear();
  mockGlobalLogger.warn.mockClear();
  mockGlobalLogger.error.mockClear();
  mockGlobalLogger.debug.mockClear();
};

import { NextFunction, Request, Response } from "express";

import {
  createExpressSeedMiddleware,
  SeedManagerProtocol,
} from "../../../../../src/infra/adapters/middlewares/express-seed.middleware";

describe("ensureSeedMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSeedManager: jest.Mocked<SeedManagerProtocol>;
  let ensureSeedMiddleware: any;

  beforeEach(() => {
    resetGlobalLoggerMocks();
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    mockSeedManager = {
      getStatus: jest.fn(),
      ensureSeeded: jest.fn(),
    };

    // Criar middleware a partir do adapter puro
    ensureSeedMiddleware = createExpressSeedMiddleware(
      mockSeedManager,
      mockGlobalLogger,
    );
  });

  it("should call next when database is already seeded", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: true,
      isSeeding: false,
    });

    ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Wait for async execution
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should wait for seeding and call next when database is not seeded", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: false,
      isSeeding: false,
    });
    mockSeedManager.ensureSeeded.mockResolvedValue();

    ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Wait for async execution
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should wait for seeding when database is currently seeding", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: false,
      isSeeding: true,
    });
    mockSeedManager.ensureSeeded.mockResolvedValue();

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 503 error when seeding fails", async () => {
    const seedError = new Error("Database connection failed");

    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: false,
      isSeeding: false,
    });
    mockSeedManager.ensureSeeded.mockRejectedValue(seedError);

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(mockGlobalLogger.error).toHaveBeenCalledWith(
      "Seed middleware error",
      expect.objectContaining({
        error: expect.any(String),
      }),
    );
  });

  it("should return 503 error when getStatus throws", async () => {
    const statusError = new Error("Status check failed");

    mockSeedManager.getStatus.mockImplementation(() => {
      throw statusError;
    });

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(mockGlobalLogger.error).toHaveBeenCalledWith(
      "Seed middleware error",
      expect.objectContaining({
        error: expect.any(String),
      }),
    );
  });

  it("should handle different error types during seeding", async () => {
    const errorTypes = [
      new Error("Generic error"),
      new TypeError("Type error"),
      new ReferenceError("Reference error"),
      "String error",
      { message: "Object error" },
      null,
      undefined,
    ];

    for (const error of errorTypes) {
      jest.clearAllMocks();
      resetGlobalLoggerMocks();

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: false,
      });
      mockSeedManager.ensureSeeded.mockRejectedValue(error);

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
      expect(mockGlobalLogger.error).toHaveBeenCalledWith(
        "Seed middleware error",
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    }
  });

  it("should not affect request and response objects when successful", async () => {
    const originalRequest = { ...mockRequest };

    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: true,
      isSeeding: false,
    });

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest).toEqual(originalRequest);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should handle concurrent requests properly", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: false,
      isSeeding: false,
    });

    let resolveEnsureSeeded: () => void;
    const ensureSeededPromise = new Promise<void>((resolve) => {
      resolveEnsureSeeded = resolve;
    });
    mockSeedManager.ensureSeeded.mockReturnValue(ensureSeededPromise);

    const middleware1Promise = ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    const middleware2Promise = ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(2);

    resolveEnsureSeeded!();

    await Promise.all([middleware1Promise, middleware2Promise]);

    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it("should preserve response object methods chain", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: false,
      isSeeding: false,
    });
    mockSeedManager.ensureSeeded.mockRejectedValue(new Error("Seed failed"));

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(mockResponse.status).toHaveReturnedWith(mockResponse);
  });
});

import { NextFunction, Request, Response } from "express";

import { ensureSeedMiddleware } from "../../../../../src/infra/adapters";
import { SeedManager } from "../../../../../src/main/seed";

jest.mock("../../../../../src/main/seed/seed.manager");

describe("ensureSeedMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSeedManager: jest.Mocked<SeedManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    mockSeedManager = {
      getInstance: jest.fn(),
      getStatus: jest.fn(),
      ensureSeeded: jest.fn(),
    } as any;

    (SeedManager.getInstance as jest.Mock).mockReturnValue(mockSeedManager);
  });

  it("should call next when database is already seeded", async () => {
    mockSeedManager.getStatus.mockReturnValue({
      isSeeded: true,
      isSeeding: false,
    });

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
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

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
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

    expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 503 error when seeding fails", async () => {
    const seedError = new Error("Database connection failed");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

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

    expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Seed middleware error:",
      seedError,
    );

    consoleSpy.mockRestore();
  });

  it("should return 503 error when SeedManager.getInstance throws", async () => {
    const managerError = new Error("SeedManager initialization failed");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (SeedManager.getInstance as jest.Mock).mockImplementation(() => {
      throw managerError;
    });

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Seed middleware error:",
      managerError,
    );

    consoleSpy.mockRestore();
  });

  it("should return 503 error when getStatus throws", async () => {
    const statusError = new Error("Status check failed");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockSeedManager.getStatus.mockImplementation(() => {
      throw statusError;
    });

    await ensureSeedMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
    expect(mockSeedManager.ensureSeeded).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Service temporarily unavailable. Database initialization failed.",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Seed middleware error:",
      statusError,
    );

    consoleSpy.mockRestore();
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
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    for (const error of errorTypes) {
      jest.clearAllMocks();

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
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Seed middleware error:",
        error,
      );
    }

    consoleSpy.mockRestore();
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

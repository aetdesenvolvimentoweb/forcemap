import { NextFunction, Request, Response } from "express";

import { ensureSeedMiddleware } from "../../../../src/main/middlewares";
import { SeedManager } from "../../../../src/main/seed";

// Mock SeedManager
jest.mock("../../../../src/main/seed/seed.manager");

describe("ensureSeedMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockSeedManager: jest.Mocked<SeedManager>;
  let jsonSpy: jest.SpyInstance;
  let statusSpy: jest.SpyInstance;

  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};

    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy as any,
      json: jsonSpy as any,
    };

    mockNext = jest.fn();

    // Mock SeedManager instance
    mockSeedManager = {
      getStatus: jest.fn(),
      ensureSeeded: jest.fn(),
      getInstance: jest.fn(),
    } as any;

    (SeedManager.getInstance as jest.Mock).mockReturnValue(mockSeedManager);
  });

  describe("when database is already seeded", () => {
    it("should call next() immediately without running seed", async () => {
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
      expect(mockNext).toHaveBeenCalledWith();
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("should not call response methods when already seeded", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });

  describe("when database is not seeded", () => {
    it("should run seed and call next() on success", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: false,
      });
      mockSeedManager.ensureSeeded.mockResolvedValue(undefined);

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("should wait for seeding to complete before calling next", async () => {
      let resolveSeeding: () => void;
      const seedingPromise = new Promise<void>((resolve) => {
        resolveSeeding = resolve;
      });

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: false,
      });
      mockSeedManager.ensureSeeded.mockReturnValue(seedingPromise);

      const middlewarePromise = ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Verify that next() hasn't been called yet
      expect(mockNext).not.toHaveBeenCalled();

      // Complete the seeding
      resolveSeeding!();
      await middlewarePromise;

      // Now next() should have been called
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("when database is currently seeding", () => {
    it("should wait for seeding to complete", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: true,
      });
      mockSeedManager.ensureSeeded.mockResolvedValue(undefined);

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.ensureSeeded).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent requests while seeding", async () => {
      let resolveSeeding: () => void;
      const seedingPromise = new Promise<void>((resolve) => {
        resolveSeeding = resolve;
      });

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: true,
      });
      mockSeedManager.ensureSeeded.mockReturnValue(seedingPromise);

      // Start multiple concurrent middleware calls
      const promise1 = ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      const promise2 = ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      const promise3 = ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // None should complete yet
      expect(mockNext).not.toHaveBeenCalled();

      // Complete seeding
      resolveSeeding!();
      await Promise.all([promise1, promise2, promise3]);

      // All should call next()
      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });

  describe("error handling", () => {
    it("should return 503 status when seeding fails", async () => {
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

      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should log error when seeding fails", async () => {
      const seedError = new Error("Seeding failed");

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

      expect(console.error).toHaveBeenCalledWith(
        "❌ Seed middleware error:",
        seedError,
      );
    });

    it("should handle SeedManager.getInstance() errors", async () => {
      const getInstanceError = new Error("SeedManager initialization failed");
      (SeedManager.getInstance as jest.Mock).mockImplementation(() => {
        throw getInstanceError;
      });

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Seed middleware error:",
        getInstanceError,
      );
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle getStatus() errors", async () => {
      const statusError = new Error("Status check failed");
      mockSeedManager.getStatus.mockImplementation(() => {
        throw statusError;
      });

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(console.error).toHaveBeenCalledWith(
        "❌ Seed middleware error:",
        statusError,
      );
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(jsonSpy).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not call next() when any error occurs", async () => {
      const seedError = new Error("Any error");
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

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("response handling", () => {
    it("should return proper error structure on failure", async () => {
      const error = new Error("Test error");
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

      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(statusSpy).toHaveBeenCalledTimes(1);
      expect(jsonSpy).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
      expect(jsonSpy).toHaveBeenCalledTimes(1);
    });

    it("should chain status and json calls correctly", async () => {
      const error = new Error("Test error");
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

      // Verify that status(503) was called and returned an object with json method
      expect(statusSpy).toHaveBeenCalledWith(503);
      expect(statusSpy).toHaveReturnedWith({ json: jsonSpy });
    });
  });

  describe("middleware behavior", () => {
    it("should work with different request objects", async () => {
      const requests = [
        { method: "GET", url: "/api/users" },
        { method: "POST", url: "/api/users", body: { name: "test" } },
        { method: "PUT", url: "/api/users/1" },
        { method: "DELETE", url: "/api/users/1" },
      ];

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      for (const request of requests) {
        await ensureSeedMiddleware(
          request as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledWith();
      }

      expect(mockNext).toHaveBeenCalledTimes(requests.length);
    });

    it("should work with different response objects", async () => {
      const responses = [
        { status: statusSpy, json: jsonSpy },
        { status: statusSpy, json: jsonSpy, locals: {} },
        { status: statusSpy, json: jsonSpy, headersSent: false },
      ];

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      for (const response of responses) {
        await ensureSeedMiddleware(
          mockRequest as Request,
          response as any,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledWith();
      }

      expect(mockNext).toHaveBeenCalledTimes(responses.length);
    });

    it("should preserve middleware execution order", async () => {
      const executionOrder: string[] = [];

      mockSeedManager.getStatus.mockImplementation(() => {
        executionOrder.push("getStatus");
        return { isSeeded: false, isSeeding: false };
      });

      mockSeedManager.ensureSeeded.mockImplementation(async () => {
        executionOrder.push("ensureSeeded");
      });

      const nextFunction = jest.fn().mockImplementation(() => {
        executionOrder.push("next");
      });

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(executionOrder).toEqual(["getStatus", "ensureSeeded", "next"]);
    });

    it("should allow next function to be called", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      const customNext = jest.fn();

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        customNext,
      );

      expect(customNext).toHaveBeenCalledTimes(1);
      expect(customNext).toHaveBeenCalledWith();
    });
  });

  describe("performance considerations", () => {
    it("should not create multiple SeedManager instances", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      // Call middleware multiple times
      for (let i = 0; i < 5; i++) {
        await ensureSeedMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );
      }

      // SeedManager.getInstance should be called 5 times but always return the same instance
      expect(SeedManager.getInstance).toHaveBeenCalledTimes(5);
    });

    it("should minimize operations when already seeded", async () => {
      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      await ensureSeedMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Should only call getInstance and getStatus, then next
      expect(SeedManager.getInstance).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.getStatus).toHaveBeenCalledTimes(1);
      expect(mockSeedManager.ensureSeeded).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("type safety", () => {
    it("should handle Request with different generic types", async () => {
      interface CustomRequest extends Request {
        user?: { id: string };
      }

      const customRequest: Partial<CustomRequest> = {
        user: { id: "123" },
      };

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: true,
        isSeeding: false,
      });

      await ensureSeedMiddleware(
        customRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle Response with different methods", async () => {
      const customResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
        end: jest.fn(),
      };

      mockSeedManager.getStatus.mockReturnValue({
        isSeeded: false,
        isSeeding: false,
      });
      mockSeedManager.ensureSeeded.mockRejectedValue(new Error("Test"));

      await ensureSeedMiddleware(
        mockRequest as Request,
        customResponse as any,
        mockNext,
      );

      expect(customResponse.status).toHaveBeenCalledWith(503);
      expect(customResponse.json).toHaveBeenCalledWith({
        error:
          "Service temporarily unavailable. Database initialization failed.",
      });
    });
  });
});

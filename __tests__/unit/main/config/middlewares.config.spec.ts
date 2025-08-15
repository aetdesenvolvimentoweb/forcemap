import { setupMiddlewares } from "@main/config/middlewares.config";
import cors from "cors";
import express from "express";
import type { Express, Request, Response, NextFunction } from "express";

// Mocks
jest.mock("cors");
jest.mock("express");

const mockCors = cors as jest.MockedFunction<typeof cors>;
const mockExpress = express as jest.MockedObject<typeof express>;

interface SutTypes {
  sut: typeof setupMiddlewares;
  mockApp: Express;
}

const makeSut = (): SutTypes => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  } as unknown as Express;

  return {
    sut: setupMiddlewares,
    mockApp,
  };
};

describe("setupMiddlewares", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, "log").mockImplementation(() => {});

    // Mock express methods
    mockExpress.json = jest.fn().mockReturnValue("express.json-middleware");
    mockExpress.urlencoded = jest
      .fn()
      .mockReturnValue("express.urlencoded-middleware");

    // Mock cors
    mockCors.mockReturnValue("cors-middleware" as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("middleware registration", () => {
    it("should register express.json middleware", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockExpress.json).toHaveBeenCalledWith({ limit: "10mb" });
      expect(mockApp.use).toHaveBeenCalledWith("express.json-middleware");
    });

    it("should register express.urlencoded middleware", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(mockApp.use).toHaveBeenCalledWith("express.urlencoded-middleware");
    });

    it("should register CORS middleware", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockCors).toHaveBeenCalledWith({
        origin: "*",
        credentials: true,
      });
      expect(mockApp.use).toHaveBeenCalledWith("cors-middleware");
    });

    it("should register security headers middleware", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));

      // Verificar se o middleware de security headers foi registrado
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const hasSecurityMiddleware = middlewareCalls.some((call) => {
        const middleware = call[0];
        return typeof middleware === "function" && middleware.length === 3;
      });
      expect(hasSecurityMiddleware).toBe(true);
    });

    it("should register request logging middleware", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));

      // Verificar se o middleware de logging foi registrado
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const hasLoggingMiddleware = middlewareCalls.some((call) => {
        const middleware = call[0];
        return typeof middleware === "function" && middleware.length === 3;
      });
      expect(hasLoggingMiddleware).toBe(true);
    });

    it("should register all middlewares in correct order", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockApp.use).toHaveBeenCalledTimes(5);

      const calls = (mockApp.use as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe("express.json-middleware");
      expect(calls[1][0]).toBe("express.urlencoded-middleware");
      expect(calls[2][0]).toBe("cors-middleware");
      expect(typeof calls[3][0]).toBe("function"); // Security headers
      expect(typeof calls[4][0]).toBe("function"); // Request logging
    });
  });

  describe("CORS configuration", () => {
    it("should use ALLOWED_ORIGINS when defined", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const originalEnv = process.env.ALLOWED_ORIGINS;
      process.env.ALLOWED_ORIGINS = "http://localhost:3000,https://example.com";

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockCors).toHaveBeenCalledWith({
        origin: ["http://localhost:3000", "https://example.com"],
        credentials: true,
      });

      // CLEANUP
      process.env.ALLOWED_ORIGINS = originalEnv;
    });

    it("should use '*' when ALLOWED_ORIGINS is undefined", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const originalEnv = process.env.ALLOWED_ORIGINS;
      delete process.env.ALLOWED_ORIGINS;

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockCors).toHaveBeenCalledWith({
        origin: "*",
        credentials: true,
      });

      // CLEANUP
      process.env.ALLOWED_ORIGINS = originalEnv;
    });

    it("should use '*' when ALLOWED_ORIGINS is empty string", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const originalEnv = process.env.ALLOWED_ORIGINS;
      process.env.ALLOWED_ORIGINS = "";

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockCors).toHaveBeenCalledWith({
        origin: [""],
        credentials: true,
      });

      // CLEANUP
      process.env.ALLOWED_ORIGINS = originalEnv;
    });

    it("should handle single origin in ALLOWED_ORIGINS", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const originalEnv = process.env.ALLOWED_ORIGINS;
      process.env.ALLOWED_ORIGINS = "https://myapp.com";

      // ACT
      sut(mockApp);

      // ASSERT
      expect(mockCors).toHaveBeenCalledWith({
        origin: ["https://myapp.com"],
        credentials: true,
      });

      // CLEANUP
      process.env.ALLOWED_ORIGINS = originalEnv;
    });
  });

  describe("security headers behavior", () => {
    it("should set security headers correctly", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const mockReq = {} as Request;
      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp);

      // Encontrar e executar o middleware de security headers
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const securityMiddleware = middlewareCalls.find((call) => {
        const middleware = call[0];
        return (
          typeof middleware === "function" &&
          middleware.length === 3 &&
          middleware.toString().includes("setHeader")
        );
      })?.[0];

      securityMiddleware?.(mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Content-Type-Options",
        "nosniff",
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-XSS-Protection",
        "1; mode=block",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() after setting headers", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const mockReq = {} as Request;
      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp);

      // Encontrar e executar o middleware de security headers
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const securityMiddleware = middlewareCalls.find((call) => {
        const middleware = call[0];
        return (
          typeof middleware === "function" &&
          middleware.length === 3 &&
          middleware.toString().includes("setHeader")
        );
      })?.[0];

      securityMiddleware?.(mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("request logging behavior", () => {
    it("should log requests with timestamp", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const mockReq = {
        method: "GET",
        path: "/api/test",
      } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      // Mock Date.prototype.toISOString para resultado consistente
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2023-01-01T12:00:00.000Z");
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      // ACT
      sut(mockApp);

      // Encontrar e executar o middleware de logging
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const loggingMiddleware = middlewareCalls.find((call) => {
        const middleware = call[0];
        return (
          typeof middleware === "function" &&
          middleware.length === 3 &&
          !middleware.toString().includes("setHeader")
        );
      })?.[0];

      loggingMiddleware?.(mockReq, mockRes, mockNext);

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        "2023-01-01T12:00:00.000Z - GET /api/test",
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() after logging", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const mockReq = {
        method: "POST",
        path: "/api/users",
      } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp);

      // Encontrar e executar o middleware de logging
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const loggingMiddleware = middlewareCalls.find((call) => {
        const middleware = call[0];
        return (
          typeof middleware === "function" &&
          middleware.length === 3 &&
          !middleware.toString().includes("setHeader")
        );
      })?.[0];

      loggingMiddleware?.(mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle different HTTP methods", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2023-01-01T12:00:00.000Z");
      const consoleSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const requests = [
        { method: "GET", path: "/users" },
        { method: "POST", path: "/users" },
        { method: "PUT", path: "/users/1" },
        { method: "DELETE", path: "/users/1" },
      ];

      // ACT
      sut(mockApp);

      // Encontrar o middleware de logging
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const loggingMiddleware = middlewareCalls.find((call) => {
        const middleware = call[0];
        return (
          typeof middleware === "function" &&
          middleware.length === 3 &&
          !middleware.toString().includes("setHeader")
        );
      })?.[0];

      // Executar para cada request
      requests.forEach((req) => {
        loggingMiddleware?.(req as Request, mockRes, mockNext);
      });

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        "2023-01-01T12:00:00.000Z - GET /users",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "2023-01-01T12:00:00.000Z - POST /users",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "2023-01-01T12:00:00.000Z - PUT /users/1",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "2023-01-01T12:00:00.000Z - DELETE /users/1",
      );
    });
  });

  describe("function signature", () => {
    it("should be a function named setupMiddlewares", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("setupMiddlewares");
      expect(typeof sut).toBe("function");
    });

    it("should accept Express app parameter", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT & ASSERT
      expect(() => sut(mockApp)).not.toThrow();
      expect(sut.length).toBe(1);
    });

    it("should return void", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      const result = sut(mockApp);

      // ASSERT
      expect(result).toBeUndefined();
    });
  });

  describe("integration scenarios", () => {
    it("should work with different Express app implementations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const originalEnv = process.env.ALLOWED_ORIGINS;
      delete process.env.ALLOWED_ORIGINS; // Garantir estado limpo

      const customApp = {
        use: jest.fn(),
        customMethod: jest.fn(),
      } as unknown as Express;

      // ACT
      sut(customApp);

      // ASSERT
      expect(customApp.use).toHaveBeenCalledTimes(5);
      expect(mockExpress.json).toHaveBeenCalledWith({ limit: "10mb" });
      expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(mockCors).toHaveBeenCalledWith({
        origin: "*",
        credentials: true,
      });

      // CLEANUP
      process.env.ALLOWED_ORIGINS = originalEnv;
    });

    it("should handle complete middlewares setup flow", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();

      // ACT
      sut(mockApp);

      // ASSERT
      // Verifica se todos os middlewares foram registrados
      expect(mockApp.use).toHaveBeenCalledTimes(5);
      expect(mockExpress.json).toHaveBeenCalledTimes(1);
      expect(mockExpress.urlencoded).toHaveBeenCalledTimes(1);
      expect(mockCors).toHaveBeenCalledTimes(1);
    });
  });
});

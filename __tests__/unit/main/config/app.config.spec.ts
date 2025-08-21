import { setupMiddlewares } from "@main/config";
import { setupApp } from "@main/config/app.config";
import { setupRoutes } from "@main/config/routes.config";
import type { RouteRegistry } from "@presentation/protocols";
import type { Express, Request, Response, NextFunction } from "express";

// Mocks
jest.mock("@main/config/middlewares.config", () => ({
  setupMiddlewares: jest.fn(),
}));

jest.mock("@main/config/routes.config", () => ({
  setupRoutes: jest.fn(),
}));

const mockSetupMiddlewares = setupMiddlewares as jest.MockedFunction<
  typeof setupMiddlewares
>;

const mockSetupRoutes = setupRoutes as jest.MockedFunction<typeof setupRoutes>;

interface SutTypes {
  sut: typeof setupApp;
  mockApp: Express;
  mockRouteRegistry: RouteRegistry;
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

  const mockRouteRegistry = {
    register: jest.fn(),
    getRoutes: jest.fn().mockReturnValue([]),
  } as unknown as RouteRegistry;

  return {
    sut: setupApp,
    mockApp,
    mockRouteRegistry,
  };
};

describe("setupApp", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockSetupMiddlewares.mockImplementation(() => {});
    mockSetupRoutes.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("setup orchestration", () => {
    it("should call setupMiddlewares with Express app", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockSetupMiddlewares).toHaveBeenCalledTimes(1);
      expect(mockSetupMiddlewares).toHaveBeenCalledWith(mockApp);
    });

    it("should call setupRoutes with Express app and RouteRegistry", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockSetupRoutes).toHaveBeenCalledTimes(1);
      expect(mockSetupRoutes).toHaveBeenCalledWith(mockApp, mockRouteRegistry);
    });

    it("should execute setupMiddlewares before setupRoutes", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const callOrder: string[] = [];

      mockSetupMiddlewares.mockImplementation(() => {
        callOrder.push("setupMiddlewares");
      });

      mockSetupRoutes.mockImplementation(() => {
        callOrder.push("setupRoutes");
      });

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(callOrder).toEqual(["setupMiddlewares", "setupRoutes"]);
    });
  });

  describe("error handlers", () => {
    it("should register 404 handler", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));

      // Verificar se o handler 404 foi registrado
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const has404Handler = middlewareCalls.some((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 2;
      });
      expect(has404Handler).toBe(true);
    });

    it("should register global error handler", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));

      // Verificar se o error handler foi registrado (função com 4 parâmetros)
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const hasErrorHandler = middlewareCalls.some((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 4;
      });
      expect(hasErrorHandler).toBe(true);
    });

    it("should handle 404 requests correctly", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o handler 404
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const notFoundHandler = middlewareCalls.find((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 2;
      })?.[0];

      notFoundHandler?.(mockReq, mockRes);

      // ASSERT
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Route not found",
        message: "The requested resource does not exist",
      });
    });

    it("should handle global errors correctly", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const testError = new Error("Test error");
      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o error handler
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const errorHandler = middlewareCalls.find((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 4;
      })?.[0];

      errorHandler?.(testError, mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Something went wrong",
      });
    });

    it("should include stack trace in development environment", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const testError = new Error("Test error");
      testError.stack = "Error stack trace";

      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o error handler
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const errorHandler = middlewareCalls.find((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 4;
      })?.[0];

      errorHandler?.(testError, mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Something went wrong",
        stack: "Error stack trace",
      });

      // CLEANUP
      process.env.NODE_ENV = originalEnv;
    });

    it("should not include stack trace in production environment", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const testError = new Error("Test error");
      testError.stack = "Error stack trace";

      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o error handler
      const middlewareCalls = (mockApp.use as jest.Mock).mock.calls;
      const errorHandler = middlewareCalls.find((call) => {
        const handler = call[0];
        return typeof handler === "function" && handler.length === 4;
      })?.[0];

      errorHandler?.(testError, mockReq, mockRes, mockNext);

      // ASSERT
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Something went wrong",
      });

      // CLEANUP
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("function signature", () => {
    it("should be a function named setupApp", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("setupApp");
      expect(typeof sut).toBe("function");
    });

    it("should accept Express app and RouteRegistry parameters", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).not.toThrow();
      expect(sut.length).toBe(2);
    });

    it("should return void", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      const result = sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(result).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle setupMiddlewares errors gracefully", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      mockSetupMiddlewares.mockImplementation(() => {
        throw new Error("Middlewares setup error");
      });

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).toThrow(
        "Middlewares setup error",
      );
    });

    it("should handle setupRoutes errors gracefully", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      mockSetupRoutes.mockImplementation(() => {
        throw new Error("Routes setup error");
      });

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).toThrow(
        "Routes setup error",
      );
      expect(mockSetupMiddlewares).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration scenarios", () => {
    it("should work with different Express app implementations", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const customApp = {
        use: jest.fn(),
        get: jest.fn(),
        customMethod: jest.fn(),
      } as unknown as Express;

      // ACT
      sut(customApp, mockRouteRegistry);

      // ASSERT
      expect(mockSetupMiddlewares).toHaveBeenCalledWith(customApp);
      expect(mockSetupRoutes).toHaveBeenCalledWith(
        customApp,
        mockRouteRegistry,
      );
      expect(customApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should work with different RouteRegistry implementations", () => {
      // ARRANGE
      const { sut, mockApp } = makeSut();
      const customRouteRegistry = {
        register: jest.fn(),
        getRoutes: jest.fn().mockReturnValue([]),
        customMethod: jest.fn(),
      } as unknown as RouteRegistry;

      // ACT
      sut(mockApp, customRouteRegistry);

      // ASSERT
      expect(mockSetupMiddlewares).toHaveBeenCalledWith(mockApp);
      expect(mockSetupRoutes).toHaveBeenCalledWith(
        mockApp,
        customRouteRegistry,
      );
    });

    it("should handle complete application setup flow", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      // Verifica se todos os handlers foram registrados
      expect(mockApp.use).toHaveBeenCalledTimes(3); // 404 + error handler + swagger
      expect(mockSetupMiddlewares).toHaveBeenCalledTimes(1);
      expect(mockSetupRoutes).toHaveBeenCalledTimes(1);
    });
  });
});

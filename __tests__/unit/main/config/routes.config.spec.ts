import { setupRoutes } from "@main/config/routes.config";
import { ExpressRouteBuilder } from "@main/builders";
import type { RouteRegistry } from "@presentation/protocols";
import type { Express, Request, Response } from "express";

// Mocks
jest.mock("@main/builders", () => ({
  ExpressRouteBuilder: jest.fn(),
}));

const mockExpressRouteBuilder = ExpressRouteBuilder as jest.MockedClass<
  typeof ExpressRouteBuilder
>;

interface SutTypes {
  sut: typeof setupRoutes;
  mockApp: Express;
  mockRouteRegistry: RouteRegistry;
  mockRouteBuilder: jest.Mocked<ExpressRouteBuilder>;
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

  const mockRouteBuilder = {
    build: jest.fn(),
    buildWithPrefix: jest.fn(),
    buildWithMiddlewares: jest.fn(),
  } as unknown as jest.Mocked<ExpressRouteBuilder>;

  mockExpressRouteBuilder.mockImplementation(() => mockRouteBuilder);

  return {
    sut: setupRoutes,
    mockApp,
    mockRouteRegistry,
    mockRouteBuilder,
  };
};

describe("setupRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.uptime for health endpoint
    jest.spyOn(process, "uptime").mockReturnValue(12345);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("route builder integration", () => {
    it("should create ExpressRouteBuilder with app and routeRegistry", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockExpressRouteBuilder).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteBuilder).toHaveBeenCalledWith(
        mockApp,
        mockRouteRegistry,
      );
    });

    it("should call buildWithPrefix with '/api/v1'", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry, mockRouteBuilder } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockRouteBuilder.buildWithPrefix).toHaveBeenCalledTimes(1);
      expect(mockRouteBuilder.buildWithPrefix).toHaveBeenCalledWith("/api/v1");
    });
  });

  describe("direct endpoints", () => {
    it("should register GET /api/v1 endpoint", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith("/api/v1", expect.any(Function));
    });

    it("should register GET /api/v1/health endpoint", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith(
        "/api/v1/health",
        expect.any(Function),
      );
    });

    it("should return API info on /api/v1 endpoint", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const mockRoutes = [
        { method: "POST", path: "/military-ranks", controller: {} },
        { method: "GET", path: "/military-ranks", controller: {} },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(mockRoutes);

      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      // Mock Date.prototype.toISOString para resultado consistente
      const mockDate = new Date("2023-01-01T12:00:00Z");
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2023-01-01T12:00:00.000Z");

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o handler do endpoint /api/v1
      const getCalls = (mockApp.get as jest.Mock).mock.calls;
      const apiInfoHandler = getCalls.find(
        (call) => call[0] === "/api/v1",
      )?.[1];
      apiInfoHandler?.(mockReq, mockRes);

      // ASSERT
      expect(mockRes.json).toHaveBeenCalledWith({
        name: "ForceMap API",
        version: "1.0.0",
        status: "running",
        timestamp: "2023-01-01T12:00:00.000Z",
        registeredRoutes: 2,
      });
    });

    it("should return health status on /api/v1/health endpoint", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const mockReq = {} as Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock Date.prototype.toISOString para resultado consistente
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2023-01-01T12:00:00.000Z");

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Encontrar e executar o handler do endpoint /api/v1/health
      const getCalls = (mockApp.get as jest.Mock).mock.calls;
      const healthHandler = getCalls.find(
        (call) => call[0] === "/api/v1/health",
      )?.[1];
      healthHandler?.(mockReq, mockRes);

      // ASSERT
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "ok",
        timestamp: "2023-01-01T12:00:00.000Z",
        uptime: 12345,
      });
    });
  });

  describe("function signature", () => {
    it("should be a function named setupRoutes", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("setupRoutes");
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
    it("should handle ExpressRouteBuilder constructor errors gracefully", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      mockExpressRouteBuilder.mockImplementation(() => {
        throw new Error("RouteBuilder constructor error");
      });

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).toThrow(
        "RouteBuilder constructor error",
      );
    });

    it("should handle buildWithPrefix errors gracefully", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry, mockRouteBuilder } = makeSut();
      mockRouteBuilder.buildWithPrefix.mockImplementation(() => {
        throw new Error("BuildWithPrefix error");
      });

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).toThrow(
        "BuildWithPrefix error",
      );
    });

    it("should handle endpoint registration errors gracefully", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      (mockApp.get as jest.Mock).mockImplementation(() => {
        throw new Error("Endpoint registration error");
      });

      // ACT & ASSERT
      expect(() => sut(mockApp, mockRouteRegistry)).toThrow(
        "Endpoint registration error",
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle RouteRegistry with different route counts", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry } = makeSut();
      const mockRoutes = Array.from({ length: 5 }, (_, i) => ({
        method: "GET",
        path: `/route-${i}`,
        controller: {},
      }));
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(mockRoutes);

      const mockReq = {} as Request;
      const mockRes = {
        json: jest.fn(),
      } as unknown as Response;

      // ACT
      sut(mockApp, mockRouteRegistry);

      // Executar handler do endpoint /api/v1
      const getCalls = (mockApp.get as jest.Mock).mock.calls;
      const apiInfoHandler = getCalls.find(
        (call) => call[0] === "/api/v1",
      )?.[1];
      apiInfoHandler?.(mockReq, mockRes);

      // ASSERT
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          registeredRoutes: 5,
        }),
      );
    });

    it("should work with different Express app implementations", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const customApp = {
        get: jest.fn(),
        customMethod: jest.fn(),
      } as unknown as Express;

      // ACT
      sut(customApp, mockRouteRegistry);

      // ASSERT
      expect(mockExpressRouteBuilder).toHaveBeenCalledWith(
        customApp,
        mockRouteRegistry,
      );
      expect(customApp.get).toHaveBeenCalledTimes(2);
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
      expect(mockExpressRouteBuilder).toHaveBeenCalledWith(
        mockApp,
        customRouteRegistry,
      );
      expect(mockApp.get).toHaveBeenCalledTimes(2);
    });

    it("should handle complete routes setup flow", () => {
      // ARRANGE
      const { sut, mockApp, mockRouteRegistry, mockRouteBuilder } = makeSut();

      // ACT
      sut(mockApp, mockRouteRegistry);

      // ASSERT
      // Verifica se todos os componentes foram utilizados
      expect(mockExpressRouteBuilder).toHaveBeenCalledTimes(1);
      expect(mockRouteBuilder.buildWithPrefix).toHaveBeenCalledTimes(1);
      expect(mockApp.get).toHaveBeenCalledTimes(2); // /api/v1 + /api/v1/health
    });
  });
});

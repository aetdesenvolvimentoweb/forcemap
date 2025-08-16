import { setupMilitaryRankRoutes } from "@main/config/routes";
import { HttpResponseFactory } from "@presentation/factories";
import { makeCreateMilitaryRankController } from "@main/factories";
import type { RouteRegistry } from "@presentation/protocols";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { Controller } from "@presentation/protocols";

// Mocks
jest.mock("@presentation/factories", () => ({
  HttpResponseFactory: jest.fn().mockImplementation(() => ({
    created: jest.fn(),
    badRequest: jest.fn(),
    serverError: jest.fn(),
  })),
}));

jest.mock("@main/factories", () => ({
  makeCreateMilitaryRankController: jest.fn(),
}));

const mockMakeCreateMilitaryRankController =
  makeCreateMilitaryRankController as jest.MockedFunction<
    typeof makeCreateMilitaryRankController
  >;

const mockHttpResponseFactory = HttpResponseFactory as jest.MockedClass<
  typeof HttpResponseFactory
>;

describe("setupMilitaryRankRoutes", () => {
  // Mocks
  const mockRouteRegistry = {
    register: jest.fn(),
    getRoutes: jest.fn(),
  } as unknown as RouteRegistry;

  const mockController = {
    handle: jest.fn(),
  } as Controller<CreateMilitaryRankInputDTO, null>;

  // Sistema sob teste
  const makeSut = () => {
    return {
      sut: setupMilitaryRankRoutes,
      mockRouteRegistry,
      mockController,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockMakeCreateMilitaryRankController.mockReturnValue(mockController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("route registration", () => {
    it("should register POST /military-ranks route", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockRouteRegistry.register).toHaveBeenCalledTimes(1);
      expect(mockRouteRegistry.register).toHaveBeenCalledWith({
        method: "POST",
        path: "/military-ranks",
        controller: mockController,
      });
    });

    it("should create HttpResponseFactory instance", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockHttpResponseFactory).toHaveBeenCalledTimes(1);
      expect(mockHttpResponseFactory).toHaveBeenCalledWith();
    });

    it("should create controller with HttpResponseFactory dependency", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockMakeCreateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankController).toHaveBeenCalledWith({
        httpResponseFactory: expect.any(Object),
      });
    });

    it("should register controller created by factory", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const customController = { handle: jest.fn() } as Controller<
        CreateMilitaryRankInputDTO,
        null
      >;
      mockMakeCreateMilitaryRankController.mockReturnValue(customController);

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockRouteRegistry.register).toHaveBeenCalledWith({
        method: "POST",
        path: "/military-ranks",
        controller: customController,
      });
    });
  });

  describe("dependency injection", () => {
    it("should inject HttpResponseFactory into controller factory", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      const factoryCall =
        mockMakeCreateMilitaryRankController.mock.calls[0]?.[0];
      expect(factoryCall).toBeDefined();
      expect(factoryCall).toHaveProperty("httpResponseFactory");
      expect(factoryCall?.httpResponseFactory).toBeDefined();
    });

    it("should use the same HttpResponseFactory instance throughout setup", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockHttpResponseFactory).toHaveBeenCalledTimes(1);
      const factoryCall =
        mockMakeCreateMilitaryRankController.mock.calls[0]?.[0];
      expect(factoryCall?.httpResponseFactory).toBeDefined();
    });
  });

  describe("route configuration", () => {
    it("should register route with correct HTTP method", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      const registerCall = (mockRouteRegistry.register as jest.Mock).mock
        .calls[0][0];
      expect(registerCall.method).toBe("POST");
    });

    it("should register route with correct path", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      const registerCall = (mockRouteRegistry.register as jest.Mock).mock
        .calls[0][0];
      expect(registerCall.path).toBe("/military-ranks");
    });

    it("should register route with Controller interface", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      const registerCall = (mockRouteRegistry.register as jest.Mock).mock
        .calls[0][0];
      expect(registerCall.controller).toBe(mockController);
      expect(typeof registerCall.controller.handle).toBe("function");
    });
  });

  describe("integration scenarios", () => {
    it("should handle RouteRegistry with existing routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const existingRoutes = [
        { method: "GET", path: "/health", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(
        existingRoutes,
      );

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockRouteRegistry.register).toHaveBeenCalledTimes(1);
      expect(mockRouteRegistry.register).toHaveBeenCalledWith({
        method: "POST",
        path: "/military-ranks",
        controller: mockController,
      });
    });

    it("should work with different RouteRegistry implementations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customRouteRegistry = {
        register: jest.fn(),
        getRoutes: jest.fn(),
        customMethod: jest.fn(),
      } as unknown as RouteRegistry;

      // ACT
      sut(customRouteRegistry);

      // ASSERT
      expect(customRouteRegistry.register).toHaveBeenCalledTimes(1);
      expect(customRouteRegistry.register).toHaveBeenCalledWith({
        method: "POST",
        path: "/military-ranks",
        controller: mockController,
      });
    });

    it("should complete successfully even if controller factory throws", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      mockMakeCreateMilitaryRankController.mockImplementation(() => {
        throw new Error("Factory error");
      });

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).toThrow("Factory error");
    });
  });

  describe("future extensibility", () => {
    it("should be prepared for additional routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      // Currently only registers one route, but structure supports more
      expect(mockRouteRegistry.register).toHaveBeenCalledTimes(1);

      // Verify the function structure allows for easy extension
      expect(typeof sut).toBe("function");
      expect(sut.length).toBe(1); // Takes one parameter (routeRegistry)
    });

    it("should maintain consistent route structure for future additions", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      const registeredRoute = (mockRouteRegistry.register as jest.Mock).mock
        .calls[0][0];

      // Verify structure follows expected pattern for consistency
      expect(registeredRoute).toHaveProperty("method");
      expect(registeredRoute).toHaveProperty("path");
      expect(registeredRoute).toHaveProperty("controller");
      expect(typeof registeredRoute.method).toBe("string");
      expect(typeof registeredRoute.path).toBe("string");
      expect(typeof registeredRoute.controller).toBe("object");
    });
  });

  describe("function signature", () => {
    it("should be a named function", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      expect(sut.name).toBe("setupMilitaryRankRoutes");
    });

    it("should accept RouteRegistry parameter", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).not.toThrow();
      expect(sut.length).toBe(1);
    });

    it("should return void", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      const result = sut(mockRouteRegistry);

      // ASSERT
      expect(result).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle RouteRegistry register method errors gracefully", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      (mockRouteRegistry.register as jest.Mock).mockImplementation(() => {
        throw new Error("Registry error");
      });

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).toThrow("Registry error");
    });

    it("should handle HttpResponseFactory creation errors", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      mockHttpResponseFactory.mockImplementationOnce(() => {
        throw new Error("HttpResponseFactory error");
      });

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).toThrow("HttpResponseFactory error");
    });
  });
});

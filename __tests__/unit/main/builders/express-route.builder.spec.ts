import { ExpressRouteBuilder } from "@main/builders";
import { RouteRegistry } from "@presentation/protocols";
import { adaptExpressRoute } from "@infra/adapters";

import type { Application } from "express";

// Mock do adaptExpressRoute
jest.mock("@infra/adapters", () => ({
  adaptExpressRoute: jest.fn(),
}));

const mockAdaptExpressRoute = adaptExpressRoute as jest.MockedFunction<
  typeof adaptExpressRoute
>;

describe("ExpressRouteBuilder", () => {
  // Mocks
  const mockApp = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  } as unknown as Application;

  const mockRouteRegistry = {
    getRoutes: jest.fn(),
  } as unknown as RouteRegistry;

  const mockController = jest.fn();
  const mockExpressHandler = jest.fn();

  // Sistema sob teste
  const makeSut = () => {
    return {
      sut: ExpressRouteBuilder,
      mockApp,
      mockRouteRegistry,
      mockController,
      mockExpressHandler,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdaptExpressRoute.mockReturnValue(mockExpressHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create ExpressRouteBuilder instance with app and routeRegistry", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const builder = new sut(mockApp, mockRouteRegistry);

      // ASSERT
      expect(builder).toBeInstanceOf(sut);
    });
  });

  describe("build method", () => {
    it("should apply all routes from registry to Express app", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/users", controller: mockController },
        { method: "POST", path: "/users", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
      expect(mockAdaptExpressRoute).toHaveBeenCalledTimes(2);
      expect(mockAdaptExpressRoute).toHaveBeenCalledWith(mockController);
      expect(mockApp.get).toHaveBeenCalledWith("/users", mockExpressHandler);
      expect(mockApp.post).toHaveBeenCalledWith("/users", mockExpressHandler);
    });

    it("should handle empty routes registry gracefully", () => {
      // ARRANGE
      const { sut } = makeSut();
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue([]);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
      expect(mockAdaptExpressRoute).not.toHaveBeenCalled();
    });

    it("should support all HTTP methods", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/get", controller: mockController },
        { method: "POST", path: "/post", controller: mockController },
        { method: "PUT", path: "/put", controller: mockController },
        { method: "DELETE", path: "/delete", controller: mockController },
        { method: "PATCH", path: "/patch", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith("/get", mockExpressHandler);
      expect(mockApp.post).toHaveBeenCalledWith("/post", mockExpressHandler);
      expect(mockApp.put).toHaveBeenCalledWith("/put", mockExpressHandler);
      expect(mockApp.delete).toHaveBeenCalledWith(
        "/delete",
        mockExpressHandler,
      );
      expect(mockApp.patch).toHaveBeenCalledWith("/patch", mockExpressHandler);
    });

    it("should throw InvalidParamError for unsupported HTTP method", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "OPTIONS", path: "/test", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT & ASSERT
      expect(() => builder.build()).toThrow(
        'O campo Método HTTP é inválido: "OPTIONS" não é suportado. Métodos válidos: GET, POST, PUT, DELETE, PATCH',
      );
    });
  });

  describe("buildWithPrefix method", () => {
    it("should apply routes with prefix", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/users", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithPrefix("/api/v1");

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith(
        "/api/v1/users",
        mockExpressHandler,
      );
    });

    it("should support all HTTP methods with prefix", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/get", controller: mockController },
        { method: "POST", path: "/post", controller: mockController },
        { method: "PUT", path: "/put", controller: mockController },
        { method: "DELETE", path: "/delete", controller: mockController },
        { method: "PATCH", path: "/patch", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithPrefix("/api/v1");

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith(
        "/api/v1/get",
        mockExpressHandler,
      );
      expect(mockApp.post).toHaveBeenCalledWith(
        "/api/v1/post",
        mockExpressHandler,
      );
      expect(mockApp.put).toHaveBeenCalledWith(
        "/api/v1/put",
        mockExpressHandler,
      );
      expect(mockApp.delete).toHaveBeenCalledWith(
        "/api/v1/delete",
        mockExpressHandler,
      );
      expect(mockApp.patch).toHaveBeenCalledWith(
        "/api/v1/patch",
        mockExpressHandler,
      );
    });
  });

  describe("buildWithMiddlewares method", () => {
    it("should apply routes with middlewares", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "POST", path: "/protected", controller: mockController },
      ];
      const middlewares = [jest.fn(), jest.fn()];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithMiddlewares(middlewares);

      // ASSERT
      expect(mockApp.post).toHaveBeenCalledWith(
        "/protected",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
    });

    it("should handle empty middlewares array", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/test", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithMiddlewares([]);

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith("/test", mockExpressHandler);
    });

    it("should support all HTTP methods with middlewares", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/get", controller: mockController },
        { method: "POST", path: "/post", controller: mockController },
        { method: "PUT", path: "/put", controller: mockController },
        { method: "DELETE", path: "/delete", controller: mockController },
        { method: "PATCH", path: "/patch", controller: mockController },
      ];
      const middlewares = [jest.fn(), jest.fn()];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithMiddlewares(middlewares);

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith(
        "/get",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
      expect(mockApp.post).toHaveBeenCalledWith(
        "/post",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
      expect(mockApp.put).toHaveBeenCalledWith(
        "/put",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
      expect(mockApp.delete).toHaveBeenCalledWith(
        "/delete",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
      expect(mockApp.patch).toHaveBeenCalledWith(
        "/patch",
        middlewares[0],
        middlewares[1],
        mockExpressHandler,
      );
    });

    it("should throw InvalidParamError for unsupported HTTP method", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "TRACE", path: "/test", controller: mockController },
      ];
      const middlewares = [jest.fn()];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT & ASSERT
      expect(() => builder.buildWithMiddlewares(middlewares)).toThrow(
        'O campo Método HTTP é inválido: "TRACE" não é suportado. Métodos válidos: GET, POST, PUT, DELETE, PATCH',
      );
    });
  });

  describe("edge cases", () => {
    it("should handle multiple routes with different methods and paths", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/users", controller: mockController },
        { method: "POST", path: "/users", controller: mockController },
        { method: "GET", path: "/users/:id", controller: mockController },
        { method: "PUT", path: "/users/:id", controller: mockController },
        { method: "DELETE", path: "/users/:id", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockAdaptExpressRoute).toHaveBeenCalledTimes(5);
      expect(mockApp.get).toHaveBeenCalledTimes(2);
      expect(mockApp.post).toHaveBeenCalledTimes(1);
      expect(mockApp.put).toHaveBeenCalledTimes(1);
      expect(mockApp.delete).toHaveBeenCalledTimes(1);
    });

    it("should handle routes with complex paths", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        {
          method: "GET",
          path: "/api/v1/users/:id/posts",
          controller: mockController,
        },
        {
          method: "POST",
          path: "/api/v2/auth/login",
          controller: mockController,
        },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockApp.get).toHaveBeenCalledWith(
        "/api/v1/users/:id/posts",
        mockExpressHandler,
      );
      expect(mockApp.post).toHaveBeenCalledWith(
        "/api/v2/auth/login",
        mockExpressHandler,
      );
    });

    it("should handle combination of prefix and empty routes", () => {
      // ARRANGE
      const { sut } = makeSut();
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue([]);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithPrefix("/api");

      // ASSERT
      expect(mockAdaptExpressRoute).not.toHaveBeenCalled();
    });

    it("should handle combination of middlewares and empty routes", () => {
      // ARRANGE
      const { sut } = makeSut();
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue([]);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.buildWithMiddlewares([jest.fn()]);

      // ASSERT
      expect(mockAdaptExpressRoute).not.toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should work with realistic route configuration", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/", controller: mockController },
        { method: "GET", path: "/health", controller: mockController },
        { method: "POST", path: "/military-ranks", controller: mockController },
        { method: "GET", path: "/military-ranks", controller: mockController },
        {
          method: "GET",
          path: "/military-ranks/:id",
          controller: mockController,
        },
        {
          method: "PUT",
          path: "/military-ranks/:id",
          controller: mockController,
        },
        {
          method: "DELETE",
          path: "/military-ranks/:id",
          controller: mockController,
        },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();

      // ASSERT
      expect(mockAdaptExpressRoute).toHaveBeenCalledTimes(7);
    });

    it("should maintain consistency across multiple build calls", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        { method: "GET", path: "/test", controller: mockController },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(routes);
      const builder = new sut(mockApp, mockRouteRegistry);

      // ACT
      builder.build();
      builder.build();

      // ASSERT
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(2);
      expect(mockAdaptExpressRoute).toHaveBeenCalledTimes(2);
      expect(mockApp.get).toHaveBeenCalledTimes(2);
    });
  });
});

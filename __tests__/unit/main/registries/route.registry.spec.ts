import { DefaultRouteRegistry } from "@main/registries/route.registry";
import type { RouteConfig, RouteRegistry } from "@presentation/protocols";

interface SutTypes {
  sut: DefaultRouteRegistry;
}

const makeSut = (): SutTypes => {
  const sut = new DefaultRouteRegistry();

  return {
    sut,
  };
};

const makeRouteConfig = (
  overrides: Partial<RouteConfig> = {},
): RouteConfig => ({
  method: "POST",
  path: "/military-ranks",
  controller: { handle: jest.fn() } as any,
  ...overrides,
});

describe("DefaultRouteRegistry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("RouteRegistry interface compliance", () => {
    it("should implement RouteRegistry interface", () => {
      // ARRANGE & ACT
      const { sut } = makeSut();

      // ASSERT
      expect(sut).toBeInstanceOf(DefaultRouteRegistry);
      expect(typeof sut.register).toBe("function");
      expect(typeof sut.getRoutes).toBe("function");
    });

    it("should have register method that accepts RouteConfig", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routeConfig = makeRouteConfig();

      // ACT & ASSERT
      expect(() => sut.register(routeConfig)).not.toThrow();
    });

    it("should have getRoutes method that returns RouteConfig array", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut.getRoutes();

      // ASSERT
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });

  describe("register method", () => {
    it("should register a single route correctly", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routeConfig = makeRouteConfig();

      // ACT
      sut.register(routeConfig);

      // ASSERT
      const routes = sut.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual(routeConfig);
    });

    it("should register multiple routes correctly", () => {
      // ARRANGE
      const { sut } = makeSut();
      const route1 = makeRouteConfig({ method: "POST", path: "/route1" });
      const route2 = makeRouteConfig({ method: "GET", path: "/route2" });
      const route3 = makeRouteConfig({ method: "PUT", path: "/route3" });

      // ACT
      sut.register(route1);
      sut.register(route2);
      sut.register(route3);

      // ASSERT
      const routes = sut.getRoutes();
      expect(routes).toHaveLength(3);
      expect(routes[0]).toEqual(route1);
      expect(routes[1]).toEqual(route2);
      expect(routes[2]).toEqual(route3);
    });

    it("should handle different HTTP methods", () => {
      // ARRANGE
      const { sut } = makeSut();
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

      // ACT
      methods.forEach((method) => {
        sut.register(
          makeRouteConfig({ method, path: `/${method.toLowerCase()}` }),
        );
      });

      // ASSERT
      const routes = sut.getRoutes();
      expect(routes).toHaveLength(5);
      methods.forEach((method, index) => {
        expect(routes[index]?.method).toBe(method);
        expect(routes[index]?.path).toBe(`/${method.toLowerCase()}`);
      });
    });
  });

  describe("getRoutes method", () => {
    it("should return empty array when no routes registered", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut.getRoutes();

      // ASSERT
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return copy of routes (immutability)", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routeConfig = makeRouteConfig();
      sut.register(routeConfig);

      // ACT
      const routes1 = sut.getRoutes();
      const routes2 = sut.getRoutes();

      // ASSERT
      expect(routes1).toEqual(routes2);
      expect(routes1).not.toBe(routes2); // Different references

      // Modifying returned array should not affect internal state
      routes1.pop();
      expect(sut.getRoutes()).toHaveLength(1);
    });

    it("should return all registered routes in order", () => {
      // ARRANGE
      const { sut } = makeSut();
      const route1 = makeRouteConfig({ path: "/first" });
      const route2 = makeRouteConfig({ path: "/second" });
      const route3 = makeRouteConfig({ path: "/third" });

      // ACT
      sut.register(route1);
      sut.register(route2);
      sut.register(route3);

      const result = sut.getRoutes();

      // ASSERT
      expect(result).toEqual([route1, route2, route3]);
    });
  });

  describe("getRoutesByMethod helper method", () => {
    it("should return routes filtered by method", () => {
      // ARRANGE
      const { sut } = makeSut();
      const getRoute = makeRouteConfig({ method: "GET", path: "/get1" });
      const postRoute1 = makeRouteConfig({ method: "POST", path: "/post1" });
      const postRoute2 = makeRouteConfig({ method: "POST", path: "/post2" });

      sut.register(getRoute);
      sut.register(postRoute1);
      sut.register(postRoute2);

      // ACT
      const postRoutes = sut.getRoutesByMethod("POST");
      const getRoutes = sut.getRoutesByMethod("GET");

      // ASSERT
      expect(postRoutes).toHaveLength(2);
      expect(postRoutes).toEqual([postRoute1, postRoute2]);
      expect(getRoutes).toHaveLength(1);
      expect(getRoutes).toEqual([getRoute]);
    });

    it("should return empty array when no routes match method", () => {
      // ARRANGE
      const { sut } = makeSut();
      const postRoute = makeRouteConfig({ method: "POST", path: "/post" });
      sut.register(postRoute);

      // ACT
      const deleteRoutes = sut.getRoutesByMethod("DELETE");

      // ASSERT
      expect(deleteRoutes).toEqual([]);
    });
  });

  describe("findRoute helper method", () => {
    it("should find route by method and path", () => {
      // ARRANGE
      const { sut } = makeSut();
      const targetRoute = makeRouteConfig({ method: "GET", path: "/target" });
      const otherRoute = makeRouteConfig({ method: "POST", path: "/other" });

      sut.register(targetRoute);
      sut.register(otherRoute);

      // ACT
      const result = sut.findRoute("GET", "/target");

      // ASSERT
      expect(result).toEqual(targetRoute);
    });

    it("should return undefined when route not found", () => {
      // ARRANGE
      const { sut } = makeSut();
      const existingRoute = makeRouteConfig({
        method: "GET",
        path: "/existing",
      });
      sut.register(existingRoute);

      // ACT
      const result = sut.findRoute("POST", "/nonexistent");

      // ASSERT
      expect(result).toBeUndefined();
    });

    it("should distinguish between same path but different methods", () => {
      // ARRANGE
      const { sut } = makeSut();
      const getRoute = makeRouteConfig({ method: "GET", path: "/resource" });
      const postRoute = makeRouteConfig({ method: "POST", path: "/resource" });

      sut.register(getRoute);
      sut.register(postRoute);

      // ACT
      const foundGet = sut.findRoute("GET", "/resource");
      const foundPost = sut.findRoute("POST", "/resource");

      // ASSERT
      expect(foundGet).toEqual(getRoute);
      expect(foundPost).toEqual(postRoute);
      expect(foundGet).not.toEqual(foundPost);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete route management workflow", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routes = [
        makeRouteConfig({ method: "GET", path: "/users" }),
        makeRouteConfig({ method: "POST", path: "/users" }),
        makeRouteConfig({ method: "GET", path: "/posts" }),
        makeRouteConfig({ method: "DELETE", path: "/users" }),
      ];

      // ACT - Register routes
      routes.forEach((route) => sut.register(route));

      // ASSERT - Verify all operations work together
      expect(sut.getRoutes()).toHaveLength(4);
      expect(sut.getRoutesByMethod("GET")).toHaveLength(2);
      expect(sut.getRoutesByMethod("POST")).toHaveLength(1);
      expect(sut.findRoute("DELETE", "/users")).toEqual(routes[3]);
      expect(sut.findRoute("PUT", "/nonexistent")).toBeUndefined();
    });

    it("should maintain registry state across multiple operations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const initialRoute = makeRouteConfig({ method: "GET", path: "/initial" });

      // ACT & ASSERT - Step by step verification
      expect(sut.getRoutes()).toHaveLength(0);

      sut.register(initialRoute);
      expect(sut.getRoutes()).toHaveLength(1);

      const moreRoutes = [
        makeRouteConfig({ method: "POST", path: "/more1" }),
        makeRouteConfig({ method: "PUT", path: "/more2" }),
      ];

      moreRoutes.forEach((route) => sut.register(route));
      expect(sut.getRoutes()).toHaveLength(3);

      // State should remain consistent
      expect(sut.getRoutes()[0]).toEqual(initialRoute);
      expect(sut.getRoutes()[1]).toEqual(moreRoutes[0]);
      expect(sut.getRoutes()[2]).toEqual(moreRoutes[1]);
    });
  });

  describe("edge cases and robustness", () => {
    it("should handle routes with same method and path (allowing duplicates)", () => {
      // ARRANGE
      const { sut } = makeSut();
      const route1 = makeRouteConfig({ method: "GET", path: "/duplicate" });
      const route2 = makeRouteConfig({ method: "GET", path: "/duplicate" });

      // ACT
      sut.register(route1);
      sut.register(route2);

      // ASSERT
      const routes = sut.getRoutes();
      expect(routes).toHaveLength(2);
      expect(routes[0]).toEqual(route1);
      expect(routes[1]).toEqual(route2);
    });

    it("should handle routes with special characters in path", () => {
      // ARRANGE
      const { sut } = makeSut();
      const specialRoutes = [
        makeRouteConfig({ path: "/users/:id" }),
        makeRouteConfig({ path: "/api/v1/users" }),
        makeRouteConfig({ path: "/search?query=*" }),
      ];

      // ACT
      specialRoutes.forEach((route) => sut.register(route));

      // ASSERT
      const routes = sut.getRoutes();
      expect(routes).toHaveLength(3);
      specialRoutes.forEach((expectedRoute, index) => {
        expect(routes[index]?.path).toBe(expectedRoute.path);
      });
    });

    it("should handle large number of routes efficiently", () => {
      // ARRANGE
      const { sut } = makeSut();
      const routeCount = 100;

      // ACT
      for (let i = 0; i < routeCount; i++) {
        sut.register(makeRouteConfig({ path: `/route${i}` }));
      }

      // ASSERT
      expect(sut.getRoutes()).toHaveLength(routeCount);
      expect(sut.getRoutesByMethod("POST")).toHaveLength(routeCount);
      expect(sut.findRoute("POST", "/route50")).toBeDefined();
    });
  });

  describe("class instantiation", () => {
    it("should create new instance with empty routes", () => {
      // ACT
      const registry = new DefaultRouteRegistry();

      // ASSERT
      expect(registry).toBeInstanceOf(DefaultRouteRegistry);
      expect(registry.getRoutes()).toEqual([]);
    });

    it("should create independent instances", () => {
      // ARRANGE
      const registry1 = new DefaultRouteRegistry();
      const registry2 = new DefaultRouteRegistry();

      const route1 = makeRouteConfig({ path: "/registry1" });
      const route2 = makeRouteConfig({ path: "/registry2" });

      // ACT
      registry1.register(route1);
      registry2.register(route2);

      // ASSERT
      expect(registry1.getRoutes()).toHaveLength(1);
      expect(registry2.getRoutes()).toHaveLength(1);
      expect(registry1.getRoutes()[0]).toEqual(route1);
      expect(registry2.getRoutes()[0]).toEqual(route2);
    });
  });
});

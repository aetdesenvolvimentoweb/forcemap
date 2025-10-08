import {
  mockExpressRouteAdapter,
  mockMakeLoginController,
  mockMakeLogoutController,
  mockMakeRefreshTokenController,
  mockRouter,
  mockRouterMethods,
} from "../../../../__mocks__";

// Mock modules using imported mocks - must be before any imports that use these modules
jest.mock("../../../../src/infra/adapters", () => ({
  expressRouteAdapter: mockExpressRouteAdapter,
  requireAuth: jest.fn(),
  requireAuthWithRoles: jest.fn((_roles) => jest.fn()),
  requireRoles: jest.fn((_roles) => jest.fn()),
  ensureSeedMiddleware: jest.fn(),
  PinoLoggerAdapter: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock("../../../../src/main/factories/controllers/auth", () => ({
  makeLoginController: mockMakeLoginController,
  makeLogoutController: mockMakeLogoutController,
  makeRefreshTokenController: mockMakeRefreshTokenController,
}));

jest.mock("../../../../src/main/factories/middlewares", () => ({
  makeExpressAuthMiddleware: jest.fn(() => ({
    requireAuth: jest.fn(),
    requireAuthWithRoles: jest.fn(() => jest.fn()),
    requireRoles: jest.fn(() => jest.fn()),
  })),
  makeExpressSeedMiddleware: jest.fn(() => jest.fn()),
}));

jest.mock("express", () => ({
  Router: mockRouter,
}));

describe("authRoutes", () => {
  const mockLoginController = { handle: jest.fn() };
  const mockLogoutController = { handle: jest.fn() };
  const mockRefreshTokenController = { handle: jest.fn() };

  const mockLoginAdapter = jest.fn();
  const mockLogoutAdapter = jest.fn();
  const mockRefreshTokenAdapter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock factory functions to return mock controllers
    mockMakeLoginController.mockReturnValue(mockLoginController);
    mockMakeLogoutController.mockReturnValue(mockLogoutController);
    mockMakeRefreshTokenController.mockReturnValue(mockRefreshTokenController);

    // Mock expressRouteAdapter to return different adapters
    // The order must match the execution order in auth.routes.ts
    mockExpressRouteAdapter
      .mockReturnValueOnce(mockLoginAdapter) // POST /login
      .mockReturnValueOnce(mockRefreshTokenAdapter) // POST /refresh-token
      .mockReturnValueOnce(mockLogoutAdapter); // POST /logout
  });

  describe("route registration", () => {
    it("should register POST /login route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeLoginController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(mockLoginController);
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        mockLoginAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledTimes(3);
    });

    it("should register POST /refresh-token route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeRefreshTokenController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockRefreshTokenController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        mockRefreshTokenAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledTimes(3);
    });

    it("should register POST /logout route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeLogoutController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockLogoutController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        mockLogoutAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledTimes(3);
    });
  });

  describe("route methods", () => {
    it("should use POST method for all auth routes", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledTimes(3);
      expect(mockRouterMethods.get).not.toHaveBeenCalled();
      expect(mockRouterMethods.put).not.toHaveBeenCalled();
      expect(mockRouterMethods.patch).not.toHaveBeenCalled();
      expect(mockRouterMethods.delete).not.toHaveBeenCalled();
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        expect.any(Function), // expressRouteAdapter
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        expect.any(Function),
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockExpressRouteAdapter).toHaveBeenCalledTimes(3);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(mockLoginController);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockRefreshTokenController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockLogoutController,
      );
    });

    it("should pass adapted controllers to router methods", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        mockLoginAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        mockRefreshTokenAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        mockLogoutAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call all auth controller factories once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeLoginController).toHaveBeenCalledTimes(1);
      expect(mockMakeLogoutController).toHaveBeenCalledTimes(1);
      expect(mockMakeRefreshTokenController).toHaveBeenCalledTimes(1);
    });

    it("should call factories without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeLoginController).toHaveBeenCalledWith();
      expect(mockMakeLogoutController).toHaveBeenCalledWith();
      expect(mockMakeRefreshTokenController).toHaveBeenCalledWith();
    });
  });

  describe("router instance", () => {
    it("should create Express router instance", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouter).toHaveBeenCalledTimes(1);
      expect(mockRouter).toHaveBeenCalledWith();
    });
  });

  describe("authentication route specifics", () => {
    it("should have three auth routes registered", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Count all route method calls
      const totalRoutes =
        mockRouterMethods.post.mock.calls.length +
        mockRouterMethods.get.mock.calls.length +
        mockRouterMethods.put.mock.calls.length +
        mockRouterMethods.patch.mock.calls.length +
        mockRouterMethods.delete.mock.calls.length;

      expect(totalRoutes).toBe(3);
    });

    it("should use auth-specific endpoints", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      const postCalls = mockRouterMethods.post.mock.calls;
      expect(postCalls).toHaveLength(3);
      expect(postCalls[0][0]).toBe("/login");
      expect(postCalls[1][0]).toBe("/refresh-token");
      expect(postCalls[2][0]).toBe("/logout");
    });

    it("should follow authentication convention", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // All authentication routes should use POST method
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        expect.any(Function), // expressRouteAdapter
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        expect.any(Function),
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("should have protected logout route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Logout route should have middleware (requireAuth) before the adapter
      const logoutCall = mockRouterMethods.post.mock.calls.find(
        (call) => call[0] === "/logout",
      );
      expect(logoutCall).toBeDefined();
      expect(logoutCall).toHaveLength(3); // path, middleware, adapter
    });
  });

  describe("security considerations", () => {
    it("should expose login, refresh-token, and logout endpoints", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Verify all auth endpoints are exposed
      const allCalls = [
        ...mockRouterMethods.post.mock.calls,
        ...mockRouterMethods.get.mock.calls,
        ...mockRouterMethods.put.mock.calls,
        ...mockRouterMethods.patch.mock.calls,
        ...mockRouterMethods.delete.mock.calls,
      ];

      expect(allCalls).toHaveLength(3);
      expect(allCalls[0][0]).toBe("/login");
      expect(allCalls[1][0]).toBe("/refresh-token");
      expect(allCalls[2][0]).toBe("/logout");
    });

    it("should use POST method for token operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // All auth operations should use POST for security
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        expect.any(Function), // expressRouteAdapter
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        expect.any(Function),
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).not.toHaveBeenCalled();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all auth operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Verify all auth operations are configured
      const postCalls = mockRouterMethods.post.mock.calls;

      expect(postCalls).toHaveLength(3);

      // Verify routes are properly mapped
      expect(postCalls[0][0]).toBe("/login");
      expect(postCalls[1][0]).toBe("/refresh-token");
      expect(postCalls[2][0]).toBe("/logout");
    });

    it("should follow JWT token management pattern", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Login and refresh-token have 2 arguments (path, adapter)
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function), // ensureSeedMiddleware
        expect.any(Function), // expressRouteAdapter
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/refresh-token",
        expect.any(Function),
      );

      // Logout has 3 arguments (path, middleware, adapter)
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        expect.any(Function),
      );
    });
  });
});

import {
  mockExpressRouteAdapter,
  mockMakeAuthenticateUserController,
  mockRouter,
  mockRouterMethods,
} from "../../../../__mocks__";

// Mock modules using imported mocks - must be before any imports that use these modules
jest.mock("../../../../src/infra/adapters", () => ({
  expressRouteAdapter: mockExpressRouteAdapter,
}));

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeAuthenticateUserController: mockMakeAuthenticateUserController,
}));

jest.mock("express", () => ({
  Router: mockRouter,
}));

describe("authRoutes", () => {
  const mockAuthenticateController = { handle: jest.fn() };
  const mockAuthenticateAdapter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock factory functions to return mock controllers
    mockMakeAuthenticateUserController.mockReturnValue(
      mockAuthenticateController,
    );

    // Mock expressRouteAdapter to return adapter
    mockExpressRouteAdapter.mockReturnValue(mockAuthenticateAdapter);
  });

  describe("route registration", () => {
    it("should register POST /login route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeAuthenticateUserController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockAuthenticateController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        mockAuthenticateAdapter,
      );
    });
  });

  describe("route methods", () => {
    it("should use POST method for login route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.get).not.toHaveBeenCalled();
      expect(mockRouterMethods.put).not.toHaveBeenCalled();
      expect(mockRouterMethods.patch).not.toHaveBeenCalled();
      expect(mockRouterMethods.delete).not.toHaveBeenCalled();
    });

    it("should use correct path for login route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for authenticate controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockExpressRouteAdapter).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockAuthenticateController,
      );
    });

    it("should pass adapted controller to router method", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        mockAuthenticateAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call authenticate controller factory once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeAuthenticateUserController).toHaveBeenCalledTimes(1);
    });

    it("should call factory without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      expect(mockMakeAuthenticateUserController).toHaveBeenCalledWith();
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
    it("should have only one route registered", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Count all route method calls
      const totalRoutes =
        mockRouterMethods.post.mock.calls.length +
        mockRouterMethods.get.mock.calls.length +
        mockRouterMethods.put.mock.calls.length +
        mockRouterMethods.patch.mock.calls.length +
        mockRouterMethods.delete.mock.calls.length;

      expect(totalRoutes).toBe(1);
    });

    it("should use /login endpoint for authentication", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      const postCalls = mockRouterMethods.post.mock.calls;
      expect(postCalls).toHaveLength(1);
      expect(postCalls[0][0]).toBe("/login");
    });

    it("should follow authentication convention", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Authentication should use POST method
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
      );
    });

    it("should be a stateless authentication endpoint", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Auth routes should not have session-related endpoints
      expect(mockRouterMethods.get).not.toHaveBeenCalled(); // No session retrieval
      expect(mockRouterMethods.delete).not.toHaveBeenCalled(); // No logout endpoint
    });
  });

  describe("security considerations", () => {
    it("should only expose login endpoint", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Verify only login is exposed, no registration or password reset
      const allCalls = [
        ...mockRouterMethods.post.mock.calls,
        ...mockRouterMethods.get.mock.calls,
        ...mockRouterMethods.put.mock.calls,
        ...mockRouterMethods.patch.mock.calls,
        ...mockRouterMethods.delete.mock.calls,
      ];

      expect(allCalls).toHaveLength(1);
      expect(allCalls[0][0]).toBe("/login");
    });

    it("should use POST method for credentials transmission", () => {
      jest.resetModules();
      require("../../../../src/main/routes/auth.routes");

      // Login should use POST to avoid credentials in URL
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
      );
      expect(mockRouterMethods.get).not.toHaveBeenCalled();
    });
  });
});

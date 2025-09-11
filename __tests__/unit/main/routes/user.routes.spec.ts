import {
  mockExpressRouteAdapter,
  mockMakeCreateUserController,
  mockMakeDeleteUserController,
  mockMakeFindByIdUserController,
  mockMakeListAllUserController,
  mockMakeUpdateUserPasswordController,
  mockMakeUpdateUserRoleController,
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

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeCreateUserController: mockMakeCreateUserController,
  makeDeleteUserController: mockMakeDeleteUserController,
  makeFindByIdUserController: mockMakeFindByIdUserController,
  makeListAllUserController: mockMakeListAllUserController,
  makeUpdateUserPasswordController: mockMakeUpdateUserPasswordController,
  makeUpdateUserRoleController: mockMakeUpdateUserRoleController,
}));

jest.mock("express", () => ({
  Router: mockRouter,
}));

describe("userRoutes", () => {
  const mockCreateController = { handle: jest.fn() };
  const mockDeleteController = { handle: jest.fn() };
  const mockFindByIdController = { handle: jest.fn() };
  const mockListAllController = { handle: jest.fn() };
  const mockUpdatePasswordController = { handle: jest.fn() };
  const mockUpdateRoleController = { handle: jest.fn() };

  const mockCreateAdapter = jest.fn();
  const mockDeleteAdapter = jest.fn();
  const mockFindByIdAdapter = jest.fn();
  const mockListAllAdapter = jest.fn();
  const mockUpdatePasswordAdapter = jest.fn();
  const mockUpdateRoleAdapter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock factory functions to return mock controllers
    mockMakeCreateUserController.mockReturnValue(mockCreateController);
    mockMakeDeleteUserController.mockReturnValue(mockDeleteController);
    mockMakeFindByIdUserController.mockReturnValue(mockFindByIdController);
    mockMakeListAllUserController.mockReturnValue(mockListAllController);
    mockMakeUpdateUserPasswordController.mockReturnValue(
      mockUpdatePasswordController,
    );
    mockMakeUpdateUserRoleController.mockReturnValue(mockUpdateRoleController);

    // Mock expressRouteAdapter to return different adapters
    // The order must match the execution order in user.routes.ts
    mockExpressRouteAdapter
      .mockReturnValueOnce(mockCreateAdapter) // POST /user
      .mockReturnValueOnce(mockDeleteAdapter) // DELETE /user/:id
      .mockReturnValueOnce(mockUpdateRoleAdapter) // PATCH /user/update-role/:id
      .mockReturnValueOnce(mockListAllAdapter) // GET /user
      .mockReturnValueOnce(mockFindByIdAdapter) // GET /user/:id
      .mockReturnValueOnce(mockUpdatePasswordAdapter); // PATCH /user/update-password/:id
  });

  describe("route registration", () => {
    it("should register POST /user route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeCreateUserController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/user",
        expect.any(Function),
        mockCreateAdapter,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledTimes(1);
    });

    it("should register GET /user route", () => {
      // Clear previous require cache and re-import
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeListAllUserController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user",
        mockListAllAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledTimes(2);
    });

    it("should register GET /user/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeFindByIdUserController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledTimes(2);
    });

    it("should register DELETE /user/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeDeleteUserController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledTimes(1);
    });

    it("should register PATCH /user/update-role/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeUpdateUserRoleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateRoleController,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-role/:id",
        expect.any(Function),
        mockUpdateRoleAdapter,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledTimes(2);
    });

    it("should register PATCH /user/update-password/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeUpdateUserPasswordController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdatePasswordController,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-password/:id",
        expect.any(Function),
        mockUpdatePasswordAdapter,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledTimes(2);
    });
  });

  describe("route methods", () => {
    it("should use correct HTTP methods for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.get).toHaveBeenCalledTimes(2);
      expect(mockRouterMethods.delete).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.patch).toHaveBeenCalledTimes(2);
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/user",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user",
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-role/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-password/:id",
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockExpressRouteAdapter).toHaveBeenCalledTimes(6);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateRoleController,
      );
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdatePasswordController,
      );
    });

    it("should pass adapted controllers to router methods", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/user",
        expect.any(Function),
        mockCreateAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user",
        mockListAllAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/user/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-role/:id",
        expect.any(Function),
        mockUpdateRoleAdapter,
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-password/:id",
        expect.any(Function),
        mockUpdatePasswordAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call all controller factories once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeCreateUserController).toHaveBeenCalledTimes(1);
      expect(mockMakeDeleteUserController).toHaveBeenCalledTimes(1);
      expect(mockMakeFindByIdUserController).toHaveBeenCalledTimes(1);
      expect(mockMakeListAllUserController).toHaveBeenCalledTimes(1);
      expect(mockMakeUpdateUserPasswordController).toHaveBeenCalledTimes(1);
      expect(mockMakeUpdateUserRoleController).toHaveBeenCalledTimes(1);
    });

    it("should call factories without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockMakeCreateUserController).toHaveBeenCalledWith();
      expect(mockMakeDeleteUserController).toHaveBeenCalledWith();
      expect(mockMakeFindByIdUserController).toHaveBeenCalledWith();
      expect(mockMakeListAllUserController).toHaveBeenCalledWith();
      expect(mockMakeUpdateUserPasswordController).toHaveBeenCalledWith();
      expect(mockMakeUpdateUserRoleController).toHaveBeenCalledWith();
    });
  });

  describe("router instance", () => {
    it("should create Express router instance", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      expect(mockRouter).toHaveBeenCalledTimes(1);
      expect(mockRouter).toHaveBeenCalledWith();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all user operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      // Verify all user operations are configured
      const postCalls = mockRouterMethods.post.mock.calls;
      const getCalls = mockRouterMethods.get.mock.calls;
      const deleteCalls = mockRouterMethods.delete.mock.calls;
      const patchCalls = mockRouterMethods.patch.mock.calls;

      expect(postCalls).toHaveLength(1); // CREATE
      expect(getCalls).toHaveLength(2); // READ (list all + find by id)
      expect(deleteCalls).toHaveLength(1); // DELETE
      expect(patchCalls).toHaveLength(2); // UPDATE (role + password)

      // Verify routes are properly mapped
      expect(postCalls[0][0]).toBe("/user");
      expect(getCalls[0][0]).toBe("/user");
      expect(getCalls[1][0]).toBe("/user/:id");
      expect(deleteCalls[0][0]).toBe("/user/:id");
      expect(patchCalls[0][0]).toBe("/user/update-role/:id");
      expect(patchCalls[1][0]).toBe("/user/update-password/:id");
    });

    /* it("should follow RESTful convention with user-specific endpoints", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      const routes = [
        { method: "post", path: "/user" }, // CREATE
        { method: "get", path: "/user" }, // READ ALL
        { method: "get", path: "/user/:id" }, // READ ONE
        { method: "delete", path: "/user/:id" }, // DELETE
        { method: "patch", path: "/user/update-role/:id" }, // UPDATE ROLE
        { method: "patch", path: "/user/update-password/:id" }, // UPDATE PASSWORD
      ];

      routes.forEach(({ method, path }) => {
        expect(
          mockRouterMethods[method as keyof typeof mockRouterMethods],
        ).toHaveBeenCalledWith(
          path,
          expect.any(Function),
          expect.any(Function),
        );
      });
    }); */
  });

  describe("user-specific route patterns", () => {
    it("should have specialized update routes for role and password", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      // Verify specialized user routes
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-role/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.patch).toHaveBeenCalledWith(
        "/user/update-password/:id",
        expect.any(Function),
        expect.any(Function),
      );

      // Verify these are the only patch routes
      expect(mockRouterMethods.patch).toHaveBeenCalledTimes(2);
    });

    it("should use PATCH method for partial updates", () => {
      jest.resetModules();
      require("../../../../src/main/routes/user.routes");

      // User entity uses PATCH for updates instead of PUT
      expect(mockRouterMethods.patch).toHaveBeenCalledTimes(2);
      expect(mockRouterMethods.put).not.toHaveBeenCalled();
    });
  });
});

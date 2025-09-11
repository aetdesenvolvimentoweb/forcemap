import {
  mockExpressRouteAdapter,
  mockMakeCreateMilitaryRankController,
  mockMakeDeleteMilitaryRankController,
  mockMakeFindByIdMilitaryRankController,
  mockMakeListAllMilitaryRankController,
  mockMakeUpdateMilitaryRankController,
  mockRouter,
  mockRouterMethods,
} from "../../../../__mocks__";

// Mock PinoLoggerAdapter for this test file
jest.mock("../../../../src/infra/adapters/pino.logger.adapter", () => ({
  PinoLoggerAdapter: jest.fn().mockImplementation(() => ({
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// Mock the logger factory
jest.mock("../../../../src/main/factories/logger/logger.factory", () => ({
  makeLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// Mock modules using imported mocks - must be before any imports that use these modules
jest.mock("../../../../src/infra/adapters", () => ({
  expressRouteAdapter: mockExpressRouteAdapter,
  requireAuth: jest.fn(),
  requireAuthWithRoles: jest.fn((_roles) => jest.fn()),
  requireRoles: jest.fn((_roles) => jest.fn()),
  ensureSeedMiddleware: jest.fn(),
}));

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeCreateMilitaryRankController: mockMakeCreateMilitaryRankController,
  makeDeleteMilitaryRankController: mockMakeDeleteMilitaryRankController,
  makeFindByIdMilitaryRankController: mockMakeFindByIdMilitaryRankController,
  makeListAllMilitaryRankController: mockMakeListAllMilitaryRankController,
  makeUpdateMilitaryRankController: mockMakeUpdateMilitaryRankController,
}));

jest.mock("express", () => ({
  Router: mockRouter,
}));

describe("militaryRankRoutes", () => {
  const mockCreateController = { handle: jest.fn() };
  const mockDeleteController = { handle: jest.fn() };
  const mockFindByIdController = { handle: jest.fn() };
  const mockListAllController = { handle: jest.fn() };
  const mockUpdateController = { handle: jest.fn() };

  const mockCreateAdapter = jest.fn();
  const mockDeleteAdapter = jest.fn();
  const mockFindByIdAdapter = jest.fn();
  const mockListAllAdapter = jest.fn();
  const mockUpdateAdapter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock factory functions to return mock controllers
    mockMakeCreateMilitaryRankController.mockReturnValue(mockCreateController);
    mockMakeDeleteMilitaryRankController.mockReturnValue(mockDeleteController);
    mockMakeFindByIdMilitaryRankController.mockReturnValue(
      mockFindByIdController,
    );
    mockMakeListAllMilitaryRankController.mockReturnValue(
      mockListAllController,
    );
    mockMakeUpdateMilitaryRankController.mockReturnValue(mockUpdateController);

    // Mock expressRouteAdapter to return different adapters
    mockExpressRouteAdapter
      .mockReturnValueOnce(mockCreateAdapter)
      .mockReturnValueOnce(mockListAllAdapter)
      .mockReturnValueOnce(mockFindByIdAdapter)
      .mockReturnValueOnce(mockDeleteAdapter)
      .mockReturnValueOnce(mockUpdateAdapter);
  });

  describe("route registration", () => {
    it("should register POST /military-rank route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeCreateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        mockCreateAdapter,
      );
    });

    it("should register GET /military-rank route", () => {
      // Clear previous require cache and re-import
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeListAllMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        mockListAllAdapter,
      );
    });

    it("should register GET /military-rank/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeFindByIdMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
    });

    it("should register DELETE /military-rank/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeDeleteMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
    });

    it("should register PUT /military-rank/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeUpdateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockUpdateAdapter,
      );
    });
  });

  describe("route methods", () => {
    it("should use correct HTTP methods for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.get).toHaveBeenCalledTimes(2);
      expect(mockRouterMethods.delete).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.put).toHaveBeenCalledTimes(1);
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockExpressRouteAdapter).toHaveBeenCalledTimes(5);
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
        mockUpdateController,
      );
    });

    it("should pass adapted controllers to router methods", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        mockCreateAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank",
        expect.any(Function),
        mockListAllAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/military-rank/:id",
        expect.any(Function),
        mockUpdateAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call all controller factories once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeCreateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockMakeDeleteMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockMakeFindByIdMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockMakeListAllMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockMakeUpdateMilitaryRankController).toHaveBeenCalledTimes(1);
    });

    it("should call factories without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockMakeCreateMilitaryRankController).toHaveBeenCalledWith();
      expect(mockMakeDeleteMilitaryRankController).toHaveBeenCalledWith();
      expect(mockMakeFindByIdMilitaryRankController).toHaveBeenCalledWith();
      expect(mockMakeListAllMilitaryRankController).toHaveBeenCalledWith();
      expect(mockMakeUpdateMilitaryRankController).toHaveBeenCalledWith();
    });
  });

  describe("router instance", () => {
    it("should create Express router instance", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      expect(mockRouter).toHaveBeenCalledTimes(1);
      expect(mockRouter).toHaveBeenCalledWith();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all CRUD operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      // Verify all CRUD operations are configured
      const postCalls = mockRouterMethods.post.mock.calls;
      const getCalls = mockRouterMethods.get.mock.calls;
      const deleteCalls = mockRouterMethods.delete.mock.calls;
      const putCalls = mockRouterMethods.put.mock.calls;

      expect(postCalls).toHaveLength(1); // CREATE
      expect(getCalls).toHaveLength(2); // READ (list all + find by id)
      expect(putCalls).toHaveLength(1); // UPDATE
      expect(deleteCalls).toHaveLength(1); // DELETE

      // Verify routes are properly mapped
      expect(postCalls[0][0]).toBe("/military-rank");
      expect(getCalls[0][0]).toBe("/military-rank");
      expect(getCalls[1][0]).toBe("/military-rank/:id");
      expect(putCalls[0][0]).toBe("/military-rank/:id");
      expect(deleteCalls[0][0]).toBe("/military-rank/:id");
    });

    it("should follow RESTful convention", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military-rank.routes");

      const routes = [
        { method: "post", path: "/military-rank" }, // CREATE
        { method: "get", path: "/military-rank" }, // READ ALL
        { method: "get", path: "/military-rank/:id" }, // READ ONE
        { method: "put", path: "/military-rank/:id" }, // UPDATE
        { method: "delete", path: "/military-rank/:id" }, // DELETE
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
    });
  });
});

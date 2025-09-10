import {
  mockExpressRouteAdapter,
  mockMakeCreateVehicleController,
  mockMakeDeleteVehicleController,
  mockMakeFindByIdVehicleController,
  mockMakeListAllVehicleController,
  mockMakeUpdateVehicleController,
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
}));

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeCreateVehicleController: mockMakeCreateVehicleController,
  makeDeleteVehicleController: mockMakeDeleteVehicleController,
  makeFindByIdVehicleController: mockMakeFindByIdVehicleController,
  makeListAllVehicleController: mockMakeListAllVehicleController,
  makeUpdateVehicleController: mockMakeUpdateVehicleController,
}));

jest.mock("express", () => ({
  Router: mockRouter,
}));

describe("vehicleRoutes", () => {
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
    mockMakeCreateVehicleController.mockReturnValue(mockCreateController);
    mockMakeDeleteVehicleController.mockReturnValue(mockDeleteController);
    mockMakeFindByIdVehicleController.mockReturnValue(mockFindByIdController);
    mockMakeListAllVehicleController.mockReturnValue(mockListAllController);
    mockMakeUpdateVehicleController.mockReturnValue(mockUpdateController);

    // Mock expressRouteAdapter to return different adapters
    mockExpressRouteAdapter
      .mockReturnValueOnce(mockCreateAdapter)
      .mockReturnValueOnce(mockListAllAdapter)
      .mockReturnValueOnce(mockFindByIdAdapter)
      .mockReturnValueOnce(mockDeleteAdapter)
      .mockReturnValueOnce(mockUpdateAdapter);
  });

  describe("route registration", () => {
    it("should register POST /vehicle route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeCreateVehicleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        mockCreateAdapter,
      );
    });

    it("should register GET /vehicle route", () => {
      // Clear previous require cache and re-import
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeListAllVehicleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        mockListAllAdapter,
      );
    });

    it("should register GET /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeFindByIdVehicleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
    });

    it("should register DELETE /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeDeleteVehicleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
    });

    it("should register PUT /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeUpdateVehicleController).toHaveBeenCalledTimes(1);
      expect(mockExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockUpdateAdapter,
      );
    });
  });

  describe("route methods", () => {
    it("should use correct HTTP methods for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.get).toHaveBeenCalledTimes(2);
      expect(mockRouterMethods.delete).toHaveBeenCalledTimes(1);
      expect(mockRouterMethods.put).toHaveBeenCalledTimes(1);
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

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
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        mockCreateAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
        mockListAllAdapter,
      );
      expect(mockRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockFindByIdAdapter,
      );
      expect(mockRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockDeleteAdapter,
      );
      expect(mockRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
        mockUpdateAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call all controller factories once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeCreateVehicleController).toHaveBeenCalledTimes(1);
      expect(mockMakeDeleteVehicleController).toHaveBeenCalledTimes(1);
      expect(mockMakeFindByIdVehicleController).toHaveBeenCalledTimes(1);
      expect(mockMakeListAllVehicleController).toHaveBeenCalledTimes(1);
      expect(mockMakeUpdateVehicleController).toHaveBeenCalledTimes(1);
    });

    it("should call factories without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeCreateVehicleController).toHaveBeenCalledWith();
      expect(mockMakeDeleteVehicleController).toHaveBeenCalledWith();
      expect(mockMakeFindByIdVehicleController).toHaveBeenCalledWith();
      expect(mockMakeListAllVehicleController).toHaveBeenCalledWith();
      expect(mockMakeUpdateVehicleController).toHaveBeenCalledWith();
    });
  });

  describe("router instance", () => {
    it("should create Express router instance", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockRouter).toHaveBeenCalledTimes(1);
      expect(mockRouter).toHaveBeenCalledWith();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all CRUD operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

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
      expect(postCalls[0][0]).toBe("/vehicle");
      expect(getCalls[0][0]).toBe("/vehicle");
      expect(getCalls[1][0]).toBe("/vehicle/:id");
      expect(putCalls[0][0]).toBe("/vehicle/:id");
      expect(deleteCalls[0][0]).toBe("/vehicle/:id");
    });

    it("should follow RESTful convention", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      const routes = [
        { method: "post", path: "/vehicle" }, // CREATE
        { method: "get", path: "/vehicle" }, // READ ALL
        { method: "get", path: "/vehicle/:id" }, // READ ONE
        { method: "put", path: "/vehicle/:id" }, // UPDATE
        { method: "delete", path: "/vehicle/:id" }, // DELETE
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

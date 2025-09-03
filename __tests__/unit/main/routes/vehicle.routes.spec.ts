// Mock the adapter
const mockVehicleExpressRouteAdapter = jest.fn();
jest.mock("../../../../src/infra/adapters", () => ({
  expressRouteAdapter: mockVehicleExpressRouteAdapter,
}));

// Mock the factory functions
const mockMakeCreateVehicleController = jest.fn();
const mockMakeDeleteVehicleController = jest.fn();
const mockMakeFindByIdVehicleController = jest.fn();
const mockMakeListAllVehicleController = jest.fn();
const mockMakeUpdateVehicleController = jest.fn();

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeCreateVehicleController: mockMakeCreateVehicleController,
  makeDeleteVehicleController: mockMakeDeleteVehicleController,
  makeFindByIdVehicleController: mockMakeFindByIdVehicleController,
  makeListAllVehicleController: mockMakeListAllVehicleController,
  makeUpdateVehicleController: mockMakeUpdateVehicleController,
}));

// Mock Express Router
const mockVehicleRouterMethods = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
};

const mockVehicleRouter = jest.fn(() => mockVehicleRouterMethods);
jest.mock("express", () => ({
  Router: mockVehicleRouter,
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
    mockVehicleExpressRouteAdapter
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
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockVehicleRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        mockCreateAdapter,
      );
    });

    it("should register GET /vehicle route", () => {
      // Clear previous require cache and re-import
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeListAllVehicleController).toHaveBeenCalledTimes(1);
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        mockListAllAdapter,
      );
    });

    it("should register GET /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeFindByIdVehicleController).toHaveBeenCalledTimes(1);
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        mockFindByIdAdapter,
      );
    });

    it("should register DELETE /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeDeleteVehicleController).toHaveBeenCalledTimes(1);
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockVehicleRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        mockDeleteAdapter,
      );
    });

    it("should register PUT /vehicle/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockMakeUpdateVehicleController).toHaveBeenCalledTimes(1);
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
      expect(mockVehicleRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
        mockUpdateAdapter,
      );
    });
  });

  describe("route methods", () => {
    it("should use correct HTTP methods for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockVehicleRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledTimes(2);
      expect(mockVehicleRouterMethods.delete).toHaveBeenCalledTimes(1);
      expect(mockVehicleRouterMethods.put).toHaveBeenCalledTimes(1);
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockVehicleRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        expect.any(Function),
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
      );
      expect(mockVehicleRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
      );
      expect(mockVehicleRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledTimes(5);
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockVehicleExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
    });

    it("should pass adapted controllers to router methods", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      expect(mockVehicleRouterMethods.post).toHaveBeenCalledWith(
        "/vehicle",
        mockCreateAdapter,
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle",
        mockListAllAdapter,
      );
      expect(mockVehicleRouterMethods.get).toHaveBeenCalledWith(
        "/vehicle/:id",
        mockFindByIdAdapter,
      );
      expect(mockVehicleRouterMethods.delete).toHaveBeenCalledWith(
        "/vehicle/:id",
        mockDeleteAdapter,
      );
      expect(mockVehicleRouterMethods.put).toHaveBeenCalledWith(
        "/vehicle/:id",
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

      expect(mockVehicleRouter).toHaveBeenCalledTimes(1);
      expect(mockVehicleRouter).toHaveBeenCalledWith();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all CRUD operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/vehicle.routes");

      // Verify all CRUD operations are configured
      const postCalls = mockVehicleRouterMethods.post.mock.calls;
      const getCalls = mockVehicleRouterMethods.get.mock.calls;
      const deleteCalls = mockVehicleRouterMethods.delete.mock.calls;
      const putCalls = mockVehicleRouterMethods.put.mock.calls;

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
          mockVehicleRouterMethods[
            method as keyof typeof mockVehicleRouterMethods
          ],
        ).toHaveBeenCalledWith(path, expect.any(Function));
      });
    });
  });
});

// Mock the adapter
const mockMilitaryExpressRouteAdapter = jest.fn();
jest.mock("../../../../src/infra/adapters", () => ({
  expressRouteAdapter: mockMilitaryExpressRouteAdapter,
}));

// Mock the factory functions
const mockMakeCreateMilitaryController = jest.fn();
const mockMakeDeleteMilitaryController = jest.fn();
const mockMakeFindByIdMilitaryController = jest.fn();
const mockMakeListAllMilitaryController = jest.fn();
const mockMakeUpdateMilitaryController = jest.fn();

jest.mock("../../../../src/main/factories/controllers", () => ({
  makeCreateMilitaryController: mockMakeCreateMilitaryController,
  makeDeleteMilitaryController: mockMakeDeleteMilitaryController,
  makeFindByIdMilitaryController: mockMakeFindByIdMilitaryController,
  makeListAllMilitaryController: mockMakeListAllMilitaryController,
  makeUpdateMilitaryController: mockMakeUpdateMilitaryController,
}));

// Mock Express Router
const mockMilitaryRouterMethods = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
};

const mockMilitaryRouter = jest.fn(() => mockMilitaryRouterMethods);
jest.mock("express", () => ({
  Router: mockMilitaryRouter,
}));

describe("militaryRoutes", () => {
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
    mockMakeCreateMilitaryController.mockReturnValue(mockCreateController);
    mockMakeDeleteMilitaryController.mockReturnValue(mockDeleteController);
    mockMakeFindByIdMilitaryController.mockReturnValue(mockFindByIdController);
    mockMakeListAllMilitaryController.mockReturnValue(mockListAllController);
    mockMakeUpdateMilitaryController.mockReturnValue(mockUpdateController);

    // Mock expressRouteAdapter to return different adapters
    mockMilitaryExpressRouteAdapter
      .mockReturnValueOnce(mockCreateAdapter)
      .mockReturnValueOnce(mockListAllAdapter)
      .mockReturnValueOnce(mockFindByIdAdapter)
      .mockReturnValueOnce(mockDeleteAdapter)
      .mockReturnValueOnce(mockUpdateAdapter);
  });

  describe("route registration", () => {
    it("should register POST /military route", () => {
      // Import the routes (this will execute the route registration)
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeCreateMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockMilitaryRouterMethods.post).toHaveBeenCalledWith(
        "/military",
        mockCreateAdapter,
      );
    });

    it("should register GET /military route", () => {
      // Clear previous require cache and re-import
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeListAllMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military",
        mockListAllAdapter,
      );
    });

    it("should register GET /military/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeFindByIdMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military/:id",
        mockFindByIdAdapter,
      );
    });

    it("should register DELETE /military/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeDeleteMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockMilitaryRouterMethods.delete).toHaveBeenCalledWith(
        "/military/:id",
        mockDeleteAdapter,
      );
    });

    it("should register PUT /military/:id route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeUpdateMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
      expect(mockMilitaryRouterMethods.put).toHaveBeenCalledWith(
        "/military/:id",
        mockUpdateAdapter,
      );
    });
  });

  describe("route methods", () => {
    it("should use correct HTTP methods for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMilitaryRouterMethods.post).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledTimes(2);
      expect(mockMilitaryRouterMethods.delete).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRouterMethods.put).toHaveBeenCalledTimes(1);
    });

    it("should use correct paths for each route", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMilitaryRouterMethods.post).toHaveBeenCalledWith(
        "/military",
        expect.any(Function),
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military",
        expect.any(Function),
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military/:id",
        expect.any(Function),
      );
      expect(mockMilitaryRouterMethods.delete).toHaveBeenCalledWith(
        "/military/:id",
        expect.any(Function),
      );
      expect(mockMilitaryRouterMethods.put).toHaveBeenCalledWith(
        "/military/:id",
        expect.any(Function),
      );
    });
  });

  describe("adapter integration", () => {
    it("should call expressRouteAdapter for each controller", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledTimes(5);
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockCreateController,
      );
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockListAllController,
      );
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockFindByIdController,
      );
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockDeleteController,
      );
      expect(mockMilitaryExpressRouteAdapter).toHaveBeenCalledWith(
        mockUpdateController,
      );
    });

    it("should pass adapted controllers to router methods", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMilitaryRouterMethods.post).toHaveBeenCalledWith(
        "/military",
        mockCreateAdapter,
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military",
        mockListAllAdapter,
      );
      expect(mockMilitaryRouterMethods.get).toHaveBeenCalledWith(
        "/military/:id",
        mockFindByIdAdapter,
      );
      expect(mockMilitaryRouterMethods.delete).toHaveBeenCalledWith(
        "/military/:id",
        mockDeleteAdapter,
      );
      expect(mockMilitaryRouterMethods.put).toHaveBeenCalledWith(
        "/military/:id",
        mockUpdateAdapter,
      );
    });
  });

  describe("factory integration", () => {
    it("should call all controller factories once", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeCreateMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMakeDeleteMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMakeFindByIdMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMakeListAllMilitaryController).toHaveBeenCalledTimes(1);
      expect(mockMakeUpdateMilitaryController).toHaveBeenCalledTimes(1);
    });

    it("should call factories without parameters", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMakeCreateMilitaryController).toHaveBeenCalledWith();
      expect(mockMakeDeleteMilitaryController).toHaveBeenCalledWith();
      expect(mockMakeFindByIdMilitaryController).toHaveBeenCalledWith();
      expect(mockMakeListAllMilitaryController).toHaveBeenCalledWith();
      expect(mockMakeUpdateMilitaryController).toHaveBeenCalledWith();
    });
  });

  describe("router instance", () => {
    it("should create Express router instance", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      expect(mockMilitaryRouter).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRouter).toHaveBeenCalledWith();
    });
  });

  describe("route configuration completeness", () => {
    it("should configure all CRUD operations", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      // Verify all CRUD operations are configured
      const postCalls = mockMilitaryRouterMethods.post.mock.calls;
      const getCalls = mockMilitaryRouterMethods.get.mock.calls;
      const deleteCalls = mockMilitaryRouterMethods.delete.mock.calls;
      const putCalls = mockMilitaryRouterMethods.put.mock.calls;

      expect(postCalls).toHaveLength(1); // CREATE
      expect(getCalls).toHaveLength(2); // READ (list all + find by id)
      expect(putCalls).toHaveLength(1); // UPDATE
      expect(deleteCalls).toHaveLength(1); // DELETE

      // Verify routes are properly mapped
      expect(postCalls[0][0]).toBe("/military");
      expect(getCalls[0][0]).toBe("/military");
      expect(getCalls[1][0]).toBe("/military/:id");
      expect(putCalls[0][0]).toBe("/military/:id");
      expect(deleteCalls[0][0]).toBe("/military/:id");
    });

    it("should follow RESTful convention", () => {
      jest.resetModules();
      require("../../../../src/main/routes/military.routes");

      const routes = [
        { method: "post", path: "/military" }, // CREATE
        { method: "get", path: "/military" }, // READ ALL
        { method: "get", path: "/military/:id" }, // READ ONE
        { method: "put", path: "/military/:id" }, // UPDATE
        { method: "delete", path: "/military/:id" }, // DELETE
      ];

      routes.forEach(({ method, path }) => {
        expect(
          mockMilitaryRouterMethods[
            method as keyof typeof mockMilitaryRouterMethods
          ],
        ).toHaveBeenCalledWith(path, expect.any(Function));
      });
    });
  });
});

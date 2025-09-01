import { Request, Response } from "express";
import { expressRouteAdapter } from "../../../../src/infra/adapters/express.route.adapter";
import {
  ControllerProtocol,
  HttpRequest,
  HttpResponse,
} from "../../../../src/presentation/protocols";

describe("expressRouteAdapter", () => {
  let mockController: jest.Mocked<ControllerProtocol>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJsonFn: jest.Mock;
  let mockStatusFn: jest.Mock;

  beforeEach(() => {
    mockController = {
      handle: jest.fn(),
    };

    mockJsonFn = jest.fn();
    mockStatusFn = jest.fn().mockReturnValue({ json: mockJsonFn });

    mockRequest = {
      body: undefined,
      params: {},
      query: {},
      headers: {},
    };

    mockResponse = {
      status: mockStatusFn,
      json: mockJsonFn,
    } as Partial<Response>;
  });

  describe("adapter function", () => {
    it("should create adapter function for controller", () => {
      const adapter = expressRouteAdapter(mockController);

      expect(typeof adapter).toBe("function");
    });

    it("should pass correct HttpRequest to controller", async () => {
      const requestData = {
        body: { name: "test" },
        params: { id: "123" },
        query: { page: "1" },
        headers: { authorization: "Bearer token" },
      };

      mockRequest = { ...requestData };
      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "success" },
      });

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: requestData.body,
        params: requestData.params,
        query: requestData.query,
        headers: requestData.headers,
      });
    });

    it("should handle request with only body", async () => {
      mockRequest = {
        body: { name: "test", email: "test@example.com" },
        params: {},
        query: {},
        headers: {},
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 201,
        body: { data: "created" },
      });

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: { name: "test", email: "test@example.com" },
        params: {},
        query: {},
        headers: {},
      });
    });

    it("should handle request with only params", async () => {
      mockRequest = {
        body: undefined,
        params: { id: "123", type: "user" },
        query: {},
        headers: {},
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "found" },
      });

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: undefined,
        params: { id: "123", type: "user" },
        query: {},
        headers: {},
      });
    });

    it("should handle request with only query", async () => {
      mockRequest = {
        body: undefined,
        params: {},
        query: { page: "1", limit: "10", sort: "name" },
        headers: {},
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: [] },
      });

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: undefined,
        params: {},
        query: { page: "1", limit: "10", sort: "name" },
        headers: {},
      });
    });

    it("should handle request with only headers", async () => {
      mockRequest = {
        body: undefined,
        params: {},
        query: {},
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
          "user-agent": "test-client",
        },
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "authorized" },
      });

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: undefined,
        params: {},
        query: {},
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
          "user-agent": "test-client",
        },
      });
    });

    it("should handle 200 OK responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 200,
        body: { data: [1, 2, 3] },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(200);
      expect(mockJsonFn).toHaveBeenCalledWith({ data: [1, 2, 3] });
    });

    it("should handle 204 No Content responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 204,
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(204);
      expect(mockJsonFn).toHaveBeenCalledWith(undefined);
    });

    it("should handle 400 Bad Request responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 400,
        body: { error: "Invalid request data" },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(400);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Invalid request data",
      });
    });

    it("should handle 404 Not Found responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 404,
        body: { error: "Resource not found" },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(404);
      expect(mockJsonFn).toHaveBeenCalledWith({ error: "Resource not found" });
    });

    it("should handle 422 Unprocessable Entity responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 422,
        body: { error: "Campos obrigatórios não foram preenchidos." },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(422);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Campos obrigatórios não foram preenchidos.",
      });
    });

    it("should handle 500 Internal Server Error responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 500,
        body: { error: "Erro interno no servidor." },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Erro interno no servidor.",
      });
    });

    it("should handle controller throwing errors", async () => {
      mockController.handle.mockRejectedValueOnce(
        new Error("Controller error"),
      );

      const adapter = expressRouteAdapter(mockController);

      await expect(
        adapter(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow("Controller error");
    });
  });
});

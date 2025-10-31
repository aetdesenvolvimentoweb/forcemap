import { Request, Response } from "express";

import { LoggerProtocol } from "../../../../src/application/protocols";
import { expressRouteAdapter } from "../../../../src/infra/adapters/express.route.adapter";
import {
  ControllerProtocol,
  HttpResponse,
} from "../../../../src/presentation/protocols";

describe("expressRouteAdapter", () => {
  let mockController: jest.Mocked<ControllerProtocol>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJsonFn: jest.Mock;
  let mockStatusFn: jest.Mock;
  let mockLogger: jest.Mocked<LoggerProtocol>;

  beforeEach(() => {
    mockController = {
      handle: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
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
      const adapter = expressRouteAdapter(mockController, mockLogger);

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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

    it("should return Express response with correct status and body", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 201,
        body: { data: { id: "123", message: "created successfully" } },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(201);
      expect(mockJsonFn).toHaveBeenCalledWith({
        data: { id: "123", message: "created successfully" },
      });
    });

    it("should handle 200 OK responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 200,
        body: { data: [1, 2, 3] },
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(200);
      expect(mockJsonFn).toHaveBeenCalledWith({ data: [1, 2, 3] });
    });

    it("should handle 204 No Content responses", async () => {
      const controllerResponse: HttpResponse = {
        statusCode: 204,
      };

      mockController.handle.mockResolvedValueOnce(controllerResponse);

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
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

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Erro interno no servidor.",
      });
    });

    it("should handle empty request", async () => {
      mockRequest = {
        body: undefined,
        params: {},
        query: {},
        headers: {},
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "empty request handled" },
      });

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: undefined,
        params: {},
        query: {},
        headers: {},
      });
    });

    it("should handle complex nested request data", async () => {
      const complexRequest = {
        body: {
          user: { name: "John", profile: { age: 30, preferences: ["a", "b"] } },
          metadata: { timestamp: Date.now(), version: "1.0" },
        },
        params: { id: "user-123", section: "profile" },
        query: { include: "details", format: "json", deep: "true" },
        headers: {
          authorization: "Bearer complex-token-123",
          "content-type": "application/json",
          "x-request-id": "req-456",
          "user-agent": "MyApp/1.0",
        },
      };

      mockRequest = { ...complexRequest };
      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: { processed: true } },
      });

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith(complexRequest);
    });

    it("should handle null and undefined values in request", async () => {
      mockRequest = {
        body: null,
        params: undefined as any,
        query: null as any,
        headers: undefined as any,
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "handled nulls" },
      });

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledWith({
        body: null,
        params: undefined,
        query: null,
        headers: undefined,
      });
    });

    it("should handle controller throwing errors", async () => {
      mockController.handle.mockRejectedValueOnce(
        new Error("Controller error"),
      );

      const adapter = expressRouteAdapter(mockController, mockLogger);

      await adapter(mockRequest as Request, mockResponse as Response);

      // Should catch the error and return 500
      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should handle async controller execution", async () => {
      let resolveController: (value: HttpResponse) => void;
      const controllerPromise = new Promise<HttpResponse>((resolve) => {
        resolveController = resolve;
      });

      mockController.handle.mockReturnValueOnce(controllerPromise);

      const adapter = expressRouteAdapter(mockController, mockLogger);
      const adapterPromise = adapter(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Controller hasn't resolved yet
      expect(mockStatusFn).not.toHaveBeenCalled();

      // Resolve controller
      resolveController!({
        statusCode: 200,
        body: { data: "async complete" },
      });

      await adapterPromise;

      expect(mockStatusFn).toHaveBeenCalledWith(200);
      expect(mockJsonFn).toHaveBeenCalledWith({ data: "async complete" });
    });

    it("should preserve original request objects", async () => {
      const originalBody = { name: "test" };
      const originalParams = { id: "123" };

      mockRequest = {
        body: originalBody,
        params: originalParams,
        query: {},
        headers: {},
      };

      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: { success: true } },
      });

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      // Original objects should not be modified
      expect(mockRequest.body).toBe(originalBody);
      expect(mockRequest.params).toBe(originalParams);
    });

    it("should handle multiple sequential requests", async () => {
      const adapter = expressRouteAdapter(mockController, mockLogger);

      mockController.handle
        .mockResolvedValueOnce({
          statusCode: 200,
          body: { data: { request: 1 } },
        })
        .mockResolvedValueOnce({
          statusCode: 201,
          body: { data: { request: 2 } },
        })
        .mockResolvedValueOnce({ statusCode: 204 });

      await adapter(mockRequest as Request, mockResponse as Response);
      await adapter(mockRequest as Request, mockResponse as Response);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockController.handle).toHaveBeenCalledTimes(3);
      expect(mockStatusFn).toHaveBeenNthCalledWith(1, 200);
      expect(mockStatusFn).toHaveBeenNthCalledWith(2, 201);
      expect(mockStatusFn).toHaveBeenNthCalledWith(3, 204);
    });

    it("should call Express response methods correctly", async () => {
      mockController.handle.mockResolvedValueOnce({
        statusCode: 200,
        body: { data: "test" },
      });

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      // Should call status and json methods properly
      expect(mockStatusFn).toHaveBeenCalledWith(200);
      expect(mockJsonFn).toHaveBeenCalledWith({ data: "test" });
    });

    it("should handle non-Error exceptions with unknown error", async () => {
      // Mock que lança uma string ao invés de um Error
      mockController.handle.mockRejectedValueOnce("Some string error");

      mockRequest = {
        url: "/test",
        method: "GET",
        body: undefined,
        params: {},
        query: {},
        headers: {},
      };

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Express route adapter error",
        {
          error: "Unknown error",
          stack: undefined,
          path: "/test",
          method: "GET",
        },
      );
      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should handle non-Error object exceptions", async () => {
      // Mock que lança um objeto simples ao invés de um Error
      const nonErrorObject = { code: 500, message: "Internal error" };
      mockController.handle.mockRejectedValueOnce(nonErrorObject);

      mockRequest = {
        url: "/api/users",
        method: "POST",
        body: undefined,
        params: {},
        query: {},
        headers: {},
      };

      const adapter = expressRouteAdapter(mockController, mockLogger);
      await adapter(mockRequest as Request, mockResponse as Response);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Express route adapter error",
        {
          error: "Unknown error",
          stack: undefined,
          path: "/api/users",
          method: "POST",
        },
      );
      expect(mockStatusFn).toHaveBeenCalledWith(500);
      expect(mockJsonFn).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});

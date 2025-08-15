import { adaptExpressRoute } from "@infra/adapters";
import type {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@presentation/protocols";

import type { Request, Response } from "express";

interface SutTypes {
  sut: (req: Request, res: Response) => Promise<void>;
  controller: jest.Mocked<Controller<unknown, unknown>>;
  req: Partial<Request>;
  res: jest.Mocked<Partial<Response>>;
}

const makeSut = (): SutTypes => {
  const controller = {
    handle: jest.fn(),
  } as jest.Mocked<Controller<unknown, unknown>>;

  const req = {
    body: { abbreviation: "CEL", order: 1 },
    headers: { "content-type": "application/json" },
    query: { page: "1", limit: "10" },
    params: { id: "123" },
    method: "POST",
    path: "/military-ranks",
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as jest.Mocked<Partial<Response>>;

  const sut = adaptExpressRoute(controller);

  return {
    sut,
    controller,
    req,
    res,
  };
};

describe("Express Route Adapter", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
    jest.clearAllMocks();
  });

  describe("Request conversion", () => {
    it("should convert Express Request to HttpRequest correctly", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const expectedHttpRequest: HttpRequest = {
        body: {
          data: { abbreviation: "CEL", order: 1 },
        },
        header: { "content-type": "application/json" },
        query: { page: "1", limit: "10" },
        params: { id: "123" },
      };

      controller.handle.mockResolvedValue({
        statusCode: 201,
        body: { data: "success" },
      });

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(controller.handle).toHaveBeenCalledWith(expectedHttpRequest);
    });

    it("should handle array query parameters by taking the first value", async () => {
      // ARRANGE
      const { sut, controller, res } = sutInstance;
      const req = {
        body: {},
        headers: {},
        query: { tags: ["tag1", "tag2"], single: "value" },
        params: {},
        method: "GET",
        path: "/test",
      } as Partial<Request>;

      controller.handle.mockResolvedValue({
        statusCode: 200,
        body: { data: "success" },
      });

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(controller.handle).toHaveBeenCalledWith({
        body: { data: {} },
        header: {},
        query: { tags: "tag1", single: "value" },
        params: {},
      });
    });

    it("should handle empty query values gracefully", async () => {
      // ARRANGE
      const { sut, controller, res } = sutInstance;
      const req = {
        body: {},
        headers: {},
        query: { empty: undefined, zero: 0 } as any,
        params: {},
        method: "GET",
        path: "/test",
      } as Partial<Request>;

      controller.handle.mockResolvedValue({
        statusCode: 200,
        body: { data: "success" },
      });

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(controller.handle).toHaveBeenCalledWith({
        body: { data: {} },
        header: {},
        query: { empty: "", zero: "0" },
        params: {},
      });
    });
  });

  describe("Response conversion", () => {
    it("should convert HttpResponse to Express Response correctly", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const httpResponse: HttpResponse = {
        statusCode: 201,
        body: { data: { id: "123", message: "Created successfully" } },
      };

      controller.handle.mockResolvedValue(httpResponse);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: { id: "123", message: "Created successfully" },
      });
    });

    it("should handle different status codes", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const httpResponse: HttpResponse = {
        statusCode: 400,
        body: { error: "Bad Request" },
      };

      controller.handle.mockResolvedValue(httpResponse);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Bad Request" });
    });
  });

  describe("Error handling", () => {
    it("should handle controller errors and return 500", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const error = new Error("Controller error");

      controller.handle.mockRejectedValue(error);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Erro interno do servidor",
      });
    });

    it("should handle controller throwing non-Error objects", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;

      controller.handle.mockRejectedValue("String error");

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
        message: "Erro interno do servidor",
      });
    });
  });

  describe("Integration flow", () => {
    it("should execute the complete request-response cycle", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: { data: "success" },
      };

      controller.handle.mockResolvedValue(httpResponse);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      // Verify request conversion
      expect(controller.handle).toHaveBeenCalledWith({
        body: { data: { abbreviation: "CEL", order: 1 } },
        header: { "content-type": "application/json" },
        query: { page: "1", limit: "10" },
        params: { id: "123" },
      });

      // Verify response conversion
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: "success" });
    });

    it("should maintain Express response chain pattern", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;

      controller.handle.mockResolvedValue({
        statusCode: 204,
      });

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.status).toHaveReturnedWith(res); // Verifica que retorna this
      expect(res.json).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Logging behavior", () => {
    let consoleSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("should log request and response information", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;

      controller.handle.mockResolvedValue({
        statusCode: 200,
        body: { data: "success" },
      });

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        "🏗️ [INFRA-EXPRESS] POST /military-ranks - Executando controller...",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "✅ [INFRA-EXPRESS] Response 200",
      );
    });

    it("should log errors when they occur", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      const error = new Error("Test error");

      controller.handle.mockRejectedValue(error);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "🚨 [INFRA-EXPRESS] Erro no adaptador:",
        error,
      );
    });
  });
});

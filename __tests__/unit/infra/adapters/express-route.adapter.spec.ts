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
        body: {},
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
        error: "Erro interno no servidor.",
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
        error: "Erro interno no servidor.",
      });
    });

    it("should handle AppError and return client error status", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;
      // Cria um objeto que simula um AppError
      const appError = {
        name: "AppError",
        message: "Campo obrigatório não informado",
        statusCode: 422,
      };

      controller.handle.mockRejectedValue(appError);

      // ACT
      await sut(req as Request, res as Response);

      // ASSERT
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: "Campo obrigatório não informado",
      });
    });

    it("should differentiate between AppError and server errors", async () => {
      // ARRANGE
      const { sut, controller, req, res } = sutInstance;

      // Primeiro testa com AppError
      const appError = {
        name: "InvalidParamError",
        message: "Parâmetro inválido",
        statusCode: 400,
      };

      controller.handle.mockRejectedValueOnce(appError);

      // ACT - primeira chamada (AppError)
      await sut(req as Request, res as Response);

      // ASSERT - primeira chamada
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Parâmetro inválido",
      });

      // Reset mocks
      jest.clearAllMocks();

      // Agora testa com erro de servidor
      const serverError = new TypeError("Unexpected null");
      controller.handle.mockRejectedValueOnce(serverError);

      // ACT - segunda chamada (Server Error)
      await sut(req as Request, res as Response);

      // ASSERT - segunda chamada
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro interno no servidor.",
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
});

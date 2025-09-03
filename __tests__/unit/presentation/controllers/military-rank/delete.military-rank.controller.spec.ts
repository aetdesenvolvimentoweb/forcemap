import {
  mockDeleteMilitaryRankService,
  mockLogger,
} from "../../../../../__mocks__";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { DeleteMilitaryRankController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("DeleteMilitaryRankController", () => {
  let sut: DeleteMilitaryRankController;
  let mockedService = mockDeleteMilitaryRankService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteMilitaryRankController({
      deleteMilitaryRankService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const validRequest: HttpRequest = {
      params: { id: validId },
    };

    it("should delete military rank successfully with valid id", async () => {
      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
      expect(mockedService.delete).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para deletar posto/graduação",
      );
    });

    it("should log info when military rank is deleted successfully", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Posto/graduação deletado com sucesso",
        { id: validId },
      );
    });

    it("should return empty request error when params is missing", async () => {
      const requestWithoutParams: HttpRequest = {};

      const result = await sut.handle(requestWithoutParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {
        params: {},
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is empty string", async () => {
      const requestWithEmptyId: HttpRequest = {
        params: { id: "" },
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {
        params: {},
      };

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should handle entity not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("posto/graduação");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should handle invalid param error and return appropriate response", async () => {
      const serviceError = new InvalidParamError("id", "formato inválido");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("posto/graduação");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao deletar posto/graduação",
        {
          error: serviceError,
          requestData: { id: validId },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.delete.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should handle different valid UUID formats", async () => {
      const uuidFormats = [
        "123e4567-e89b-12d3-a456-426614174000",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      mockedService.delete.mockResolvedValue();

      for (const uuid of uuidFormats) {
        const request: HttpRequest = {
          params: { id: uuid },
        };

        const result = await sut.handle(request);

        expect(result).toEqual({ statusCode: 204 });
        expect(mockedService.delete).toHaveBeenCalledWith(uuid);
      }

      expect(mockedService.delete).toHaveBeenCalledTimes(uuidFormats.length);
    });

    it("should handle concurrent delete requests independently", async () => {
      const id1 = "123e4567-e89b-12d3-a456-426614174001";
      const id2 = "123e4567-e89b-12d3-a456-426614174002";

      const request1: HttpRequest = { params: { id: id1 } };
      const request2: HttpRequest = { params: { id: id2 } };

      mockedService.delete.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 204 });
      expect(result2).toEqual({ statusCode: 204 });
      expect(mockedService.delete).toHaveBeenCalledTimes(2);
      expect(mockedService.delete).toHaveBeenNthCalledWith(1, id1);
      expect(mockedService.delete).toHaveBeenNthCalledWith(2, id2);
    });

    it("should preserve id parameter integrity", async () => {
      const originalId = "123e4567-e89b-12d3-a456-426614174000";
      const request: HttpRequest = {
        params: { id: originalId },
      };

      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.delete).toHaveBeenCalledWith(originalId);
      expect(request.params?.id).toBe(originalId);
    });

    it("should handle request with additional params", async () => {
      const requestWithExtraParams: HttpRequest = {
        params: {
          id: validId,
          extraParam: "shouldBeIgnored",
        },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(requestWithExtraParams);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should handle request with query parameters", async () => {
      const requestWithQuery: HttpRequest = {
        params: { id: validId },
        query: { force: "true" },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(requestWithQuery);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should handle request with headers", async () => {
      const requestWithHeaders: HttpRequest = {
        params: { id: validId },
        headers: { authorization: "Bearer token" },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(requestWithHeaders);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
    });

    it("should handle null id param", async () => {
      const requestWithNullId: HttpRequest = {
        params: { id: null as any },
      };

      const result = await sut.handle(requestWithNullId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should handle undefined id param", async () => {
      const requestWithUndefinedId: HttpRequest = {
        params: { id: undefined as any },
      };

      const result = await sut.handle(requestWithUndefinedId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });
  });
});

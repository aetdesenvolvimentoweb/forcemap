import {
  mockDeleteMilitaryService,
  mockLogger,
} from "../../../../../__mocks__";
import { DeleteMilitaryController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import { EntityNotFoundError } from "../../../../../src/application/errors";

describe("DeleteMilitaryController", () => {
  let sut: DeleteMilitaryController;
  let mockedService = mockDeleteMilitaryService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteMilitaryController({
      deleteMilitaryService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validRequest: HttpRequest = {
      params: { id: "military-123" },
    };

    it("should delete military successfully with valid id", async () => {
      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("military-123");
      expect(mockedService.delete).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para deletar militar",
      );
    });

    it("should log info when military is deleted successfully", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militar deletado com sucesso",
        { id: "military-123" },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is null", async () => {
      const requestWithNullParams: HttpRequest = {
        params: null as any,
      };

      const result = await sut.handle(requestWithNullParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when id is empty string", async () => {
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

    it("should return empty request error when id param doesn't exist", async () => {
      const requestWithoutIdParam: HttpRequest = {
        params: { otherparam: "value" },
      };

      const result = await sut.handle(requestWithoutIdParam);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should handle not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("military-123");
    });

    it("should handle database error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("military-123");
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao deletar militar",
        {
          error: serviceError,
          requestData: { id: "military-123" },
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
      expect(mockedService.delete).toHaveBeenCalledWith("military-123");
    });

    it("should handle different id formats correctly", async () => {
      const uuidRequest: HttpRequest = {
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(uuidRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });

    it("should handle concurrent delete requests independently", async () => {
      const request1: HttpRequest = { params: { id: "military-1" } };
      const request2: HttpRequest = { params: { id: "military-2" } };

      mockedService.delete.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 204 });
      expect(result2).toEqual({ statusCode: 204 });
      expect(mockedService.delete).toHaveBeenCalledTimes(2);
      expect(mockedService.delete).toHaveBeenNthCalledWith(1, "military-1");
      expect(mockedService.delete).toHaveBeenNthCalledWith(2, "military-2");
    });

    it("should not modify the original request params", async () => {
      const originalParams = { id: "military-123" };
      const request: HttpRequest = {
        params: { ...originalParams },
      };

      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
    });

    it("should handle special characters in id correctly", async () => {
      const specialIdRequest: HttpRequest = {
        params: { id: "military-123-àáâã" },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(specialIdRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("military-123-àáâã");
    });

    it("should handle numeric string ids correctly", async () => {
      const numericIdRequest: HttpRequest = {
        params: { id: "12345" },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(numericIdRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("12345");
    });

    it("should preserve id string format", async () => {
      const idWithLeadingZeros: HttpRequest = {
        params: { id: "00123" },
      };

      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(idWithLeadingZeros);

      expect(mockedService.delete).toHaveBeenCalledWith("00123");

      const calledWith = mockedService.delete.mock.calls[0][0];
      expect(typeof calledWith).toBe("string");
      expect(calledWith).toBe("00123");
    });

    it("should handle very long ids correctly", async () => {
      const longId = "a".repeat(100);
      const longIdRequest: HttpRequest = {
        params: { id: longId },
      };

      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(longIdRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(longId);
    });

    it("should handle deletion of already deleted resource gracefully", async () => {
      const serviceError = new EntityNotFoundError("Military not found");
      mockedService.delete.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.delete).toHaveBeenCalledWith("military-123");
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao deletar militar",
        {
          error: serviceError,
          requestData: { id: "military-123" },
        },
      );
    });
  });
});

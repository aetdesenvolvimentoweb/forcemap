import {
  mockLogger,
  mockUpdateMilitaryService,
} from "../../../../../__mocks__";
import {
  DuplicatedKeyError,
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { MilitaryInputDTO } from "../../../../../src/domain/dtos";
import { UpdateMilitaryController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("UpdateMilitaryController", () => {
  let sut: UpdateMilitaryController;
  let mockedService = mockUpdateMilitaryService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateMilitaryController({
      updateMilitaryService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: MilitaryInputDTO = {
      militaryRankId: "rank-456",
      rg: 87654321,
      name: "João Silva Updated",
    };

    const validRequest: HttpRequest<MilitaryInputDTO> = {
      params: { id: "military-123" },
      body: validBody,
    };

    it("should update military successfully with valid data", async () => {
      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        "military-123",
        validBody,
      );
      expect(mockedService.update).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar militar",
        {
          params: validRequest.params,
          body: validBody,
        },
      );
    });

    it("should log info when military is updated successfully", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militar atualizado com sucesso",
        {
          id: "military-123",
          militaryRankId: validBody.militaryRankId,
          rg: validBody.rg,
          name: validBody.name,
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<MilitaryInputDTO> = {
        body: validBody,
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-123" },
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when both id and body are missing", async () => {
      const emptyRequest: HttpRequest<MilitaryInputDTO> = {};

      const result = await sut.handle(emptyRequest);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is null", async () => {
      const requestWithNullParams: HttpRequest<MilitaryInputDTO> = {
        params: null as any,
        body: validBody,
      };

      const result = await sut.handle(requestWithNullParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-123" },
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<MilitaryInputDTO> = {
        body: validBody,
      };

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-123" },
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.update.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        "military-123",
        validBody,
      );
    });

    it("should handle duplicated key error and return appropriate response", async () => {
      const serviceError = new DuplicatedKeyError("rg");
      mockedService.update.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        "military-123",
        validBody,
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("rg", "formato inválido");
      mockedService.update.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao atualizar militar",
        {
          error: serviceError,
          requestData: { id: "military-123", data: validBody },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.update.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        "military-123",
        validBody,
      );
    });

    it("should handle concurrent update requests independently", async () => {
      const body1: MilitaryInputDTO = {
        militaryRankId: "rank-1",
        rg: 11111111,
        name: "João Updated",
      };
      const body2: MilitaryInputDTO = {
        militaryRankId: "rank-2",
        rg: 22222222,
        name: "Maria Updated",
      };

      const request1: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-1" },
        body: body1,
      };
      const request2: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-2" },
        body: body2,
      };

      mockedService.update.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 204 });
      expect(result2).toEqual({ statusCode: 204 });
      expect(mockedService.update).toHaveBeenCalledTimes(2);
      expect(mockedService.update).toHaveBeenNthCalledWith(
        1,
        "military-1",
        body1,
      );
      expect(mockedService.update).toHaveBeenNthCalledWith(
        2,
        "military-2",
        body2,
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: MilitaryInputDTO = {
        militaryRankId: "rank-999",
        rg: 99999999,
        name: "Complex Name Test",
      };

      const request: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-complex" },
        body: complexBody,
      };

      mockedService.update.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.update).toHaveBeenCalledWith(
        "military-complex",
        complexBody,
      );

      const [calledId, calledBody] = mockedService.update.mock.calls[0];
      expect(typeof calledId).toBe("string");
      expect(calledBody).toHaveProperty("militaryRankId");
      expect(calledBody).toHaveProperty("rg");
      expect(calledBody).toHaveProperty("name");
      expect(typeof calledBody.militaryRankId).toBe("string");
      expect(typeof calledBody.rg).toBe("number");
      expect(typeof calledBody.name).toBe("string");
    });

    it("should not modify the original request data", async () => {
      const originalParams = { id: "military-123" };
      const originalBody: MilitaryInputDTO = {
        militaryRankId: "rank-456",
        rg: 87654321,
        name: "João Silva Updated",
      };

      const request: HttpRequest<MilitaryInputDTO> = {
        params: { ...originalParams },
        body: { ...originalBody },
      };

      mockedService.update.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
      expect(request.body).toEqual(originalBody);
    });

    it("should handle special characters in id and data correctly", async () => {
      const bodyWithSpecialChars: MilitaryInputDTO = {
        militaryRankId: "rank-àáâã",
        rg: 12345678,
        name: "João da Silva Çâmara",
      };

      const requestWithSpecialChars: HttpRequest<MilitaryInputDTO> = {
        params: { id: "military-123-àáâã" },
        body: bodyWithSpecialChars,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithSpecialChars);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.update).toHaveBeenCalledWith(
        "military-123-àáâã",
        bodyWithSpecialChars,
      );
    });

    it("should handle empty string id as invalid", async () => {
      const requestWithEmptyId: HttpRequest<MilitaryInputDTO> = {
        params: { id: "" },
        body: validBody,
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });
  });
});

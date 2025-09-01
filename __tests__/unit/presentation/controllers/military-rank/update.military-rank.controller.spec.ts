import {
  mockUpdateMilitaryRankService,
  mockLogger,
} from "../../../../../__mocks__";
import { UpdateMilitaryRankController } from "../../../../../src/presentation/controllers";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import {
  EntityNotFoundError,
  InvalidParamError,
  DuplicatedKeyError,
} from "../../../../../src/application/errors";

describe("UpdateMilitaryRankController", () => {
  let sut: UpdateMilitaryRankController;
  let mockedService = mockUpdateMilitaryRankService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateMilitaryRankController({
      updateMilitaryRankService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const validBody: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    const validRequest: HttpRequest<MilitaryRankInputDTO> = {
      params: { id: validId },
      body: validBody,
    };

    it("should update military rank successfully with valid data", async () => {
      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
      expect(mockedService.update).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar posto/graduação",
        {
          params: validRequest.params,
          body: validRequest.body,
        },
      );
    });

    it("should log info when military rank is updated successfully", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Posto/graduação atualizado com sucesso",
        {
          id: validId,
          abbreviation: validBody.abbreviation,
          order: validBody.order,
        },
      );
    });

    it("should return empty request error when params is missing", async () => {
      const requestWithoutParams: HttpRequest<MilitaryRankInputDTO> = {
        body: validBody,
      };

      const result = await sut.handle(requestWithoutParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<MilitaryRankInputDTO> = {
        params: {},
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
      const requestWithoutBody: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when both id and body are missing", async () => {
      const requestWithoutIdAndBody: HttpRequest<MilitaryRankInputDTO> = {};

      const result = await sut.handle(requestWithoutIdAndBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<MilitaryRankInputDTO> = {
        params: {},
        body: validBody,
      };

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle entity not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("posto/graduação");
      mockedService.update.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle invalid param error and return appropriate response", async () => {
      const serviceError = new InvalidParamError(
        "abbreviation",
        "formato inválido",
      );
      mockedService.update.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle duplicated key error and return appropriate response", async () => {
      const serviceError = new DuplicatedKeyError("abbreviation");
      mockedService.update.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("posto/graduação");
      mockedService.update.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao atualizar posto/graduação",
        {
          error: serviceError,
          requestData: { id: validId, data: validBody },
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
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle empty abbreviation in body", async () => {
      const bodyWithEmptyAbbreviation: MilitaryRankInputDTO = {
        abbreviation: "",
        order: 10,
      };

      const requestWithEmptyAbbreviation: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: bodyWithEmptyAbbreviation,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithEmptyAbbreviation);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        validId,
        bodyWithEmptyAbbreviation,
      );
    });

    it("should handle zero order in body", async () => {
      const bodyWithZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "REC",
        order: 0,
      };

      const requestWithZeroOrder: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: bodyWithZeroOrder,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithZeroOrder);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        validId,
        bodyWithZeroOrder,
      );
    });

    it("should handle special characters in abbreviation", async () => {
      const bodyWithSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      const requestWithSpecialChars: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: bodyWithSpecialChars,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithSpecialChars);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        validId,
        bodyWithSpecialChars,
      );
    });

    it("should handle different valid UUID formats", async () => {
      const uuidFormats = [
        "123e4567-e89b-12d3-a456-426614174001",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      mockedService.update.mockResolvedValue();

      for (const uuid of uuidFormats) {
        const request: HttpRequest<MilitaryRankInputDTO> = {
          params: { id: uuid },
          body: validBody,
        };

        const result = await sut.handle(request);

        expect(result).toEqual({ statusCode: 204 });
        expect(mockedService.update).toHaveBeenCalledWith(uuid, validBody);
      }

      expect(mockedService.update).toHaveBeenCalledTimes(uuidFormats.length);
    });

    it("should handle concurrent update requests independently", async () => {
      const id1 = "123e4567-e89b-12d3-a456-426614174001";
      const id2 = "123e4567-e89b-12d3-a456-426614174002";
      const body1: MilitaryRankInputDTO = { abbreviation: "CEL", order: 10 };
      const body2: MilitaryRankInputDTO = { abbreviation: "MAJ", order: 8 };

      const request1: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: id1 },
        body: body1,
      };
      const request2: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: id2 },
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
      expect(mockedService.update).toHaveBeenNthCalledWith(1, id1, body1);
      expect(mockedService.update).toHaveBeenNthCalledWith(2, id2, body2);
    });

    it("should preserve id and body parameter integrity", async () => {
      const originalId = "123e4567-e89b-12d3-a456-426614174000";
      const originalBody: MilitaryRankInputDTO = {
        abbreviation: "CAP",
        order: 6,
      };

      const request: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: originalId },
        body: { ...originalBody },
      };

      mockedService.update.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.update).toHaveBeenCalledWith(
        originalId,
        originalBody,
      );
      expect(request.params?.id).toBe(originalId);
      expect(request.body).toEqual(originalBody);
    });

    it("should handle request with additional params", async () => {
      const requestWithExtraParams: HttpRequest<MilitaryRankInputDTO> = {
        params: {
          id: validId,
          extraParam: "shouldBeIgnored",
        },
        body: validBody,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithExtraParams);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle request with query parameters", async () => {
      const requestWithQuery: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: validBody,
        query: { force: "true" },
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithQuery);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle request with headers", async () => {
      const requestWithHeaders: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: validBody,
        headers: { authorization: "Bearer token" },
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithHeaders);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
    });

    it("should handle null id param", async () => {
      const requestWithNullId: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: null as any },
        body: validBody,
      };

      const result = await sut.handle(requestWithNullId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should handle null body", async () => {
      const requestWithNullBody: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should handle undefined id param", async () => {
      const requestWithUndefinedId: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: undefined as any },
        body: validBody,
      };

      const result = await sut.handle(requestWithUndefinedId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should handle undefined body", async () => {
      const requestWithUndefinedBody: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: validId },
        body: undefined,
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });
  });
});

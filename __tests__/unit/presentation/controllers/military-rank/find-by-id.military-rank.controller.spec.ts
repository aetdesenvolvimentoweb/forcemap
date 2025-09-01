import {
  mockFindByIdMilitaryRankService,
  mockLogger,
} from "../../../../../__mocks__";
import { FindByIdMilitaryRankController } from "../../../../../src/presentation/controllers";
import { MilitaryRank } from "../../../../../src/domain/entities";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";

describe("FindByIdMilitaryRankController", () => {
  let sut: FindByIdMilitaryRankController;
  let mockedService = mockFindByIdMilitaryRankService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdMilitaryRankController({
      findByIdMilitaryRankService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const validRequest: HttpRequest = {
      params: { id: validId },
    };

    const mockMilitaryRank: MilitaryRank = {
      id: validId,
      abbreviation: "CEL",
      order: 10,
    };

    it("should find military rank successfully with valid id", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: mockMilitaryRank },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
      expect(mockedService.findById).toHaveBeenCalledTimes(1);
    });

    it("should return null when military rank is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: null },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should log info when receiving request", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar posto/graduação por ID",
        { params: validRequest.params },
      );
    });

    it("should log info when military rank is found", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Posto/graduação encontrado com sucesso",
        {
          id: validId,
          found: true,
        },
      );
    });

    it("should log info when military rank is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Posto/graduação encontrado com sucesso",
        {
          id: validId,
          found: false,
        },
      );
    });

    it("should return empty request error when params is missing", async () => {
      const requestWithoutParams: HttpRequest = {};

      const result = await sut.handle(requestWithoutParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
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
      expect(mockedService.findById).not.toHaveBeenCalled();
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
      expect(mockedService.findById).not.toHaveBeenCalled();
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

    it("should handle invalid param error and return appropriate response", async () => {
      const serviceError = new InvalidParamError("id", "formato inválido");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("id", "formato inválido");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar posto/graduação",
        {
          error: serviceError,
          requestData: { id: validId },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.findById.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should return military rank with all properties", async () => {
      const fullMilitaryRank: MilitaryRank = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        abbreviation: "1º SGT",
        order: 5,
      };

      mockedService.findById.mockResolvedValueOnce(fullMilitaryRank);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: fullMilitaryRank },
        statusCode: 200,
      });

      const returnedData = result.body?.data as MilitaryRank;
      expect(returnedData).toHaveProperty("id");
      expect(returnedData).toHaveProperty("abbreviation");
      expect(returnedData).toHaveProperty("order");
      expect(typeof returnedData.id).toBe("string");
      expect(typeof returnedData.abbreviation).toBe("string");
      expect(typeof returnedData.order).toBe("number");
    });

    it("should handle different valid UUID formats", async () => {
      const uuidFormats = [
        "123e4567-e89b-12d3-a456-426614174000",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      ];

      mockedService.findById.mockResolvedValue(mockMilitaryRank);

      for (const uuid of uuidFormats) {
        const request: HttpRequest = {
          params: { id: uuid },
        };

        const result = await sut.handle(request);

        expect(result).toEqual({
          body: { data: mockMilitaryRank },
          statusCode: 200,
        });
        expect(mockedService.findById).toHaveBeenCalledWith(uuid);
      }

      expect(mockedService.findById).toHaveBeenCalledTimes(uuidFormats.length);
    });

    it("should handle concurrent find requests independently", async () => {
      const id1 = "123e4567-e89b-12d3-a456-426614174001";
      const id2 = "123e4567-e89b-12d3-a456-426614174002";

      const militaryRank1: MilitaryRank = {
        id: id1,
        abbreviation: "CEL",
        order: 10,
      };
      const militaryRank2: MilitaryRank = {
        id: id2,
        abbreviation: "MAJ",
        order: 8,
      };

      const request1: HttpRequest = { params: { id: id1 } };
      const request2: HttpRequest = { params: { id: id2 } };

      mockedService.findById
        .mockResolvedValueOnce(militaryRank1)
        .mockResolvedValueOnce(militaryRank2);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        body: { data: militaryRank1 },
        statusCode: 200,
      });
      expect(result2).toEqual({
        body: { data: militaryRank2 },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledTimes(2);
      expect(mockedService.findById).toHaveBeenNthCalledWith(1, id1);
      expect(mockedService.findById).toHaveBeenNthCalledWith(2, id2);
    });

    it("should preserve id parameter integrity", async () => {
      const originalId = "123e4567-e89b-12d3-a456-426614174000";
      const request: HttpRequest = {
        params: { id: originalId },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      await sut.handle(request);

      expect(mockedService.findById).toHaveBeenCalledWith(originalId);
      expect(request.params?.id).toBe(originalId);
    });

    it("should handle request with additional params", async () => {
      const requestWithExtraParams: HttpRequest = {
        params: {
          id: validId,
          extraParam: "shouldBeIgnored",
        },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      const result = await sut.handle(requestWithExtraParams);

      expect(result).toEqual({
        body: { data: mockMilitaryRank },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should handle request with query parameters", async () => {
      const requestWithQuery: HttpRequest = {
        params: { id: validId },
        query: { include: "relations" },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      const result = await sut.handle(requestWithQuery);

      expect(result).toEqual({
        body: { data: mockMilitaryRank },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should handle request with headers", async () => {
      const requestWithHeaders: HttpRequest = {
        params: { id: validId },
        headers: { authorization: "Bearer token" },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitaryRank);

      const result = await sut.handle(requestWithHeaders);

      expect(result).toEqual({
        body: { data: mockMilitaryRank },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
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
      expect(mockedService.findById).not.toHaveBeenCalled();
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
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should handle military rank with special characters in abbreviation", async () => {
      const militaryRankWithSpecialChars: MilitaryRank = {
        id: validId,
        abbreviation: "1º TEN",
        order: 4,
      };

      mockedService.findById.mockResolvedValueOnce(
        militaryRankWithSpecialChars,
      );

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: militaryRankWithSpecialChars },
        statusCode: 200,
      });
    });

    it("should handle military rank with zero order", async () => {
      const militaryRankWithZeroOrder: MilitaryRank = {
        id: validId,
        abbreviation: "REC",
        order: 0,
      };

      mockedService.findById.mockResolvedValueOnce(militaryRankWithZeroOrder);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: militaryRankWithZeroOrder },
        statusCode: 200,
      });
    });
  });
});

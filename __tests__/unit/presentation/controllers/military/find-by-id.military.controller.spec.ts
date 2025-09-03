import {
  mockFindByIdMilitaryService,
  mockLogger,
} from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";
import { FindByIdMilitaryController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("FindByIdMilitaryController", () => {
  let sut: FindByIdMilitaryController;
  let mockedService = mockFindByIdMilitaryService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdMilitaryController({
      findByIdMilitaryService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockMilitary: MilitaryOutputDTO = {
      id: "military-123",
      militaryRankId: "rank-456",
      militaryRank: { id: "rank-456", abbreviation: "CAP", order: 6 },
      rg: 12345678,
      name: "João da Silva",
    };

    const validRequest: HttpRequest = {
      params: { id: "military-123" },
    };

    it("should find military by id successfully", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockMilitary },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("military-123");
      expect(mockedService.findById).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar militar por ID",
        { params: validRequest.params },
      );
    });

    it("should log info when military is found successfully", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militar encontrado com sucesso",
        {
          id: "military-123",
          found: true,
        },
      );
    });

    it("should return military as null when not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: null },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("military-123");
    });

    it("should log info when military is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militar encontrado com sucesso",
        {
          id: "military-123",
          found: false,
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
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
      expect(mockedService.findById).not.toHaveBeenCalled();
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
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.findById).toHaveBeenCalledWith("military-123");
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar militar",
        {
          error: serviceError,
          requestData: { id: "military-123" },
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
      expect(mockedService.findById).toHaveBeenCalledWith("military-123");
    });

    it("should handle different id formats correctly", async () => {
      const uuidRequest: HttpRequest = {
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      const result = await sut.handle(uuidRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockMilitary },
      });
      expect(mockedService.findById).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });

    it("should handle concurrent requests with different ids independently", async () => {
      const request1: HttpRequest = { params: { id: "military-1" } };
      const request2: HttpRequest = { params: { id: "military-2" } };
      const military1: MilitaryOutputDTO = {
        ...mockMilitary,
        id: "military-1",
      };
      const military2: MilitaryOutputDTO = {
        ...mockMilitary,
        id: "military-2",
      };

      mockedService.findById
        .mockResolvedValueOnce(military1)
        .mockResolvedValueOnce(military2);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: military1 },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: military2 },
      });
      expect(mockedService.findById).toHaveBeenCalledTimes(2);
      expect(mockedService.findById).toHaveBeenNthCalledWith(1, "military-1");
      expect(mockedService.findById).toHaveBeenNthCalledWith(2, "military-2");
    });

    it("should preserve military data structure integrity", async () => {
      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      const result = await sut.handle(validRequest);

      expect(result.body).toEqual({ data: mockMilitary });
      expect(result.body?.data).toHaveProperty("id");
      expect(result.body?.data).toHaveProperty("militaryRankId");
      expect(result.body?.data).toHaveProperty("rg");
      expect(result.body?.data).toHaveProperty("name");
    });

    it("should not modify the original request params", async () => {
      const originalParams = { id: "military-123" };
      const request: HttpRequest = {
        params: { ...originalParams },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
    });

    it("should handle special characters in id correctly", async () => {
      const specialIdRequest: HttpRequest = {
        params: { id: "military-123-àáâã" },
      };

      mockedService.findById.mockResolvedValueOnce(mockMilitary);

      const result = await sut.handle(specialIdRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockMilitary },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("military-123-àáâã");
    });
  });
});

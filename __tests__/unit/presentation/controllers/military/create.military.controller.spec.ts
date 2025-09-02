import {
  mockCreateMilitaryService,
  mockLogger,
} from "../../../../../__mocks__";
import { CreateMilitaryController } from "../../../../../src/presentation/controllers";
import { MilitaryInputDTO } from "../../../../../src/domain/dtos";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import {
  DuplicatedKeyError,
  InvalidParamError,
} from "../../../../../src/application/errors";

describe("CreateMilitaryController", () => {
  let sut: CreateMilitaryController;
  let mockedService = mockCreateMilitaryService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateMilitaryController({
      createMilitaryService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: MilitaryInputDTO = {
      militaryRankId: "rank-123",
      rg: 12345678,
      name: "João da Silva",
    };

    const validRequest: HttpRequest<MilitaryInputDTO> = {
      body: validBody,
    };

    it("should create military successfully with valid data", async () => {
      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
      expect(mockedService.create).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para criar militar",
        { body: validBody },
      );
    });

    it("should log info when military is created successfully", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militar criado com sucesso",
        {
          militaryRankId: validBody.militaryRankId,
          rg: validBody.rg,
          name: validBody.name,
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryInputDTO> = {};

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<MilitaryInputDTO> = {
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is undefined", async () => {
      const requestWithUndefinedBody: HttpRequest<MilitaryInputDTO> = {
        body: undefined,
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryInputDTO> = {};

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new DuplicatedKeyError("rg");
      mockedService.create.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("rg", "formato inválido");
      mockedService.create.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao criar militar", {
        error: serviceError,
        requestData: validBody,
      });
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.create.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
    });

    it("should handle concurrent requests independently", async () => {
      const body1: MilitaryInputDTO = {
        militaryRankId: "rank-123",
        rg: 11111111,
        name: "João da Silva",
      };
      const body2: MilitaryInputDTO = {
        militaryRankId: "rank-456",
        rg: 22222222,
        name: "Maria dos Santos",
      };

      const request1: HttpRequest<MilitaryInputDTO> = { body: body1 };
      const request2: HttpRequest<MilitaryInputDTO> = { body: body2 };

      mockedService.create.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 201 });
      expect(result2).toEqual({ statusCode: 201 });
      expect(mockedService.create).toHaveBeenCalledTimes(2);
      expect(mockedService.create).toHaveBeenNthCalledWith(1, body1);
      expect(mockedService.create).toHaveBeenNthCalledWith(2, body2);
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: MilitaryInputDTO = {
        militaryRankId: "rank-789",
        rg: 33333333,
        name: "Carlos Alberto",
      };

      const request: HttpRequest<MilitaryInputDTO> = {
        body: complexBody,
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.create).toHaveBeenCalledWith(complexBody);

      const calledWith = mockedService.create.mock.calls[0][0];
      expect(calledWith).toHaveProperty("militaryRankId");
      expect(calledWith).toHaveProperty("rg");
      expect(calledWith).toHaveProperty("name");
      expect(typeof calledWith.militaryRankId).toBe("string");
      expect(typeof calledWith.rg).toBe("number");
      expect(typeof calledWith.name).toBe("string");
    });

    it("should not modify the original request body", async () => {
      const originalBody: MilitaryInputDTO = {
        militaryRankId: "rank-999",
        rg: 44444444,
        name: "Ana Paula",
      };

      const request: HttpRequest<MilitaryInputDTO> = {
        body: { ...originalBody },
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });
  });
});

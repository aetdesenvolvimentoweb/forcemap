import {
  mockCreateMilitaryRankService,
  mockLogger,
} from "../../../../../__mocks__";
import {
  DuplicatedKeyError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";
import { CreateMilitaryRankController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("CreateMilitaryRankController", () => {
  let sut: CreateMilitaryRankController;
  let mockedService = mockCreateMilitaryRankService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateMilitaryRankController({
      createMilitaryRankService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    const validRequest: HttpRequest<MilitaryRankInputDTO> = {
      body: validBody,
    };

    it("should create military rank successfully with valid data", async () => {
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
        "Recebida requisição para criar posto/graduação",
        { body: validBody },
      );
    });

    it("should log info when military rank is created successfully", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Posto/graduação criado com sucesso",
        {
          abbreviation: validBody.abbreviation,
          order: validBody.order,
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<MilitaryRankInputDTO> = {};

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<MilitaryRankInputDTO> = {
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
      const requestWithUndefinedBody: HttpRequest<MilitaryRankInputDTO> = {
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
      const requestWithoutBody: HttpRequest<MilitaryRankInputDTO> = {};

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new DuplicatedKeyError("abbreviation");
      mockedService.create.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError(
        "abbreviation",
        "formato inválido",
      );
      mockedService.create.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao criar posto/graduação",
        {
          error: serviceError,
          requestData: validBody,
        },
      );
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

    it("should handle empty abbreviation in body", async () => {
      const bodyWithEmptyAbbreviation: MilitaryRankInputDTO = {
        abbreviation: "",
        order: 10,
      };

      const requestWithEmptyAbbreviation: HttpRequest<MilitaryRankInputDTO> = {
        body: bodyWithEmptyAbbreviation,
      };

      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(requestWithEmptyAbbreviation);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(
        bodyWithEmptyAbbreviation,
      );
    });

    it("should handle zero order in body", async () => {
      const bodyWithZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "REC",
        order: 0,
      };

      const requestWithZeroOrder: HttpRequest<MilitaryRankInputDTO> = {
        body: bodyWithZeroOrder,
      };

      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(requestWithZeroOrder);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(bodyWithZeroOrder);
    });

    it("should handle special characters in abbreviation", async () => {
      const bodyWithSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      const requestWithSpecialChars: HttpRequest<MilitaryRankInputDTO> = {
        body: bodyWithSpecialChars,
      };

      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(requestWithSpecialChars);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(bodyWithSpecialChars);
    });

    it("should handle concurrent requests independently", async () => {
      const body1: MilitaryRankInputDTO = { abbreviation: "CEL", order: 10 };
      const body2: MilitaryRankInputDTO = { abbreviation: "MAJ", order: 8 };

      const request1: HttpRequest<MilitaryRankInputDTO> = { body: body1 };
      const request2: HttpRequest<MilitaryRankInputDTO> = { body: body2 };

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
      const complexBody: MilitaryRankInputDTO = {
        abbreviation: "1º TEN",
        order: 4,
      };

      const request: HttpRequest<MilitaryRankInputDTO> = {
        body: complexBody,
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.create).toHaveBeenCalledWith(complexBody);

      const calledWith = mockedService.create.mock.calls[0][0];
      expect(calledWith).toHaveProperty("abbreviation");
      expect(calledWith).toHaveProperty("order");
      expect(typeof calledWith.abbreviation).toBe("string");
      expect(typeof calledWith.order).toBe("number");
    });

    it("should not modify the original request body", async () => {
      const originalBody: MilitaryRankInputDTO = {
        abbreviation: "CAP",
        order: 6,
      };

      const request: HttpRequest<MilitaryRankInputDTO> = {
        body: { ...originalBody },
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });
  });
});

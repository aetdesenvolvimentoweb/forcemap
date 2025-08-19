import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";
import { CreateMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { HttpRequest } from "@presentation/protocols";

interface SutTypes {
  sut: CreateMilitaryRankController;
  httpResponseFactory: jest.Mocked<HttpResponseFactory>;
  createMilitaryRankService: jest.Mocked<CreateMilitaryRankUseCase>;
}

const makeSut = (): SutTypes => {
  const httpResponseFactory = jest.mocked<HttpResponseFactory>({
    created: jest.fn().mockReturnValue({ statusCode: 201 }),
    badRequest: jest
      .fn()
      .mockReturnValue({ statusCode: 400, body: { error: "Bad Request" } }),
    serverError: jest.fn().mockReturnValue({
      statusCode: 500,
      body: { error: "Erro interno no servidor." },
    }),
    ok: jest.fn().mockReturnValue({ statusCode: 200, body: { data: [] } }),
  });

  const createMilitaryRankService = jest.mocked<CreateMilitaryRankUseCase>({
    create: jest.fn().mockResolvedValue(undefined),
  });

  const sut = new CreateMilitaryRankController({
    httpResponseFactory,
    createMilitaryRankService,
  });

  return {
    sut,
    httpResponseFactory,
    createMilitaryRankService,
  };
};

describe("CreateMilitaryRankController", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Successful creation", () => {
    it("should return 201 on successful creation", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, createMilitaryRankService } =
        sutInstance;
      const httpRequest: HttpRequest<CreateMilitaryRankInputDTO> = {
        body: {
          data: {
            abbreviation: "CEL",
            order: 1,
          },
        },
      };

      // ACT
      const response = await sut.handle(httpRequest);

      // ASSERT
      expect(createMilitaryRankService.create).toHaveBeenCalledWith({
        abbreviation: "CEL",
        order: 1,
      });
      expect(createMilitaryRankService.create).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.created).toHaveBeenCalledWith();
      expect(httpResponseFactory.created).toHaveBeenCalledTimes(1);
      expect(response).toEqual({
        statusCode: 201,
      });
    });
  });

  describe("Error handling", () => {
    it("should return 400 when request body data is missing", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, createMilitaryRankService } =
        sutInstance;
      const httpRequest: HttpRequest<CreateMilitaryRankInputDTO> = {
        body: {},
      } as HttpRequest<CreateMilitaryRankInputDTO>;

      // ACT
      const response = await sut.handle(httpRequest);

      // ASSERT
      expect(createMilitaryRankService.create).not.toHaveBeenCalled();
      expect(httpResponseFactory.badRequest).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when service throws AppError", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, createMilitaryRankService } =
        sutInstance;
      const { InvalidParamError } = await import("@application/errors");
      const error = new InvalidParamError("Abreviatura", "é obrigatória");
      createMilitaryRankService.create.mockRejectedValueOnce(error);

      const httpRequest: HttpRequest<CreateMilitaryRankInputDTO> = {
        body: {
          data: {
            abbreviation: "CEL",
            order: 1,
          },
        },
      };

      // ACT
      const response = await sut.handle(httpRequest);

      // ASSERT
      expect(createMilitaryRankService.create).toHaveBeenCalledWith({
        abbreviation: "CEL",
        order: 1,
      });
      expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(error);
      expect(response.statusCode).toBe(400);
    });

    it("should return 500 when service throws unexpected error", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, createMilitaryRankService } =
        sutInstance;
      const error = new Error("Database connection failed");
      createMilitaryRankService.create.mockRejectedValueOnce(error);

      const httpRequest: HttpRequest<CreateMilitaryRankInputDTO> = {
        body: {
          data: {
            abbreviation: "CEL",
            order: 1,
          },
        },
      };

      // ACT
      const response = await sut.handle(httpRequest);

      // ASSERT
      expect(createMilitaryRankService.create).toHaveBeenCalledWith({
        abbreviation: "CEL",
        order: 1,
      });
      expect(httpResponseFactory.serverError).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(500);
    });
  });
});

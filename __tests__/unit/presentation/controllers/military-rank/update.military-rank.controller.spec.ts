import type { MilitaryRankInputDTO } from "@domain/dtos";
import type { UpdateMilitaryRankUseCase } from "@domain/usecases";
import { UpdateMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { HttpRequest } from "@presentation/protocols";
import { AppError } from "@domain/errors";

interface SutTypes {
  sut: UpdateMilitaryRankController;
  httpResponseFactory: jest.Mocked<HttpResponseFactory>;
  updateMilitaryRankService: jest.Mocked<UpdateMilitaryRankUseCase>;
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
    ok: jest.fn().mockReturnValue({ statusCode: 200 }),
  });

  const updateMilitaryRankService = jest.mocked<UpdateMilitaryRankUseCase>({
    update: jest.fn().mockResolvedValue(undefined),
  });

  const sut = new UpdateMilitaryRankController({
    httpResponseFactory,
    updateMilitaryRankService,
  });

  return {
    sut,
    httpResponseFactory,
    updateMilitaryRankService,
  };
};

describe("UpdateMilitaryRankController", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Successful update", () => {
    it("should return 200 on successful update", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, updateMilitaryRankService } =
        sutInstance;
      const httpRequest: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: "123" },
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
      expect(updateMilitaryRankService.update).toHaveBeenCalledWith("123", {
        abbreviation: "CEL",
        order: 1,
      });
      expect(updateMilitaryRankService.update).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.ok).toHaveBeenCalledWith();
      expect(httpResponseFactory.ok).toHaveBeenCalledTimes(1);
      expect(response).toEqual({ statusCode: 200 });
    });
  });

  describe("Error handling", () => {
    it("should return 400 when request param id is missing", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, updateMilitaryRankService } =
        sutInstance;
      const httpRequest: HttpRequest<MilitaryRankInputDTO> = {
        params: {},
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
      expect(updateMilitaryRankService.update).not.toHaveBeenCalled();
      expect(httpResponseFactory.badRequest).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when request body data is missing", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, updateMilitaryRankService } =
        sutInstance;
      const httpRequest: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: "123" },
        body: {},
      } as HttpRequest<MilitaryRankInputDTO>;

      // ACT
      const response = await sut.handle(httpRequest);

      // ASSERT
      expect(updateMilitaryRankService.update).not.toHaveBeenCalled();
      expect(httpResponseFactory.badRequest).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when service throws AppError", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, updateMilitaryRankService } =
        sutInstance;
      const error = new AppError("Erro de negócio");
      updateMilitaryRankService.update.mockRejectedValueOnce(error);

      const httpRequest: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: "123" },
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
      expect(updateMilitaryRankService.update).toHaveBeenCalledWith("123", {
        abbreviation: "CEL",
        order: 1,
      });
      expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(error);
      expect(response.statusCode).toBe(400);
    });

    it("should return 500 when service throws unexpected error", async () => {
      // ARRANGE
      const { sut, httpResponseFactory, updateMilitaryRankService } =
        sutInstance;
      const error = new Error("Database connection failed");
      updateMilitaryRankService.update.mockRejectedValueOnce(error);

      const httpRequest: HttpRequest<MilitaryRankInputDTO> = {
        params: { id: "123" },
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
      expect(updateMilitaryRankService.update).toHaveBeenCalledWith("123", {
        abbreviation: "CEL",
        order: 1,
      });
      expect(httpResponseFactory.serverError).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(500);
    });
  });
});

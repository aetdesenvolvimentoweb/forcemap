import { DeleteMilitaryRankController } from "@presentation/controllers/military-rank/delete.military-rank.controller";
import { MissingParamError } from "@application/errors";
import { AppError } from "@domain/errors";

describe("DeleteMilitaryRankController", () => {
  const makeHttpResponseFactory = () => ({
    ok: jest.fn(() => ({ statusCode: 200 })),
    badRequest: jest.fn((error) => ({ statusCode: 400, body: error })),
    serverError: jest.fn(() => ({
      statusCode: 500,
      body: { error: "Erro interno no servidor." },
    })),
    created: jest.fn(() => ({ statusCode: 201 })),
  });

  const makeDeleteMilitaryRankService = () => ({
    delete: jest.fn(),
  });

  const makeSut = () => {
    const httpResponseFactory = makeHttpResponseFactory();
    const deleteMilitaryRankService = makeDeleteMilitaryRankService();
    const sut = new DeleteMilitaryRankController({
      httpResponseFactory,
      deleteMilitaryRankService,
    });
    return { sut, httpResponseFactory, deleteMilitaryRankService };
  };

  it("should return 400 if params.id is missing", async () => {
    const { sut, httpResponseFactory } = makeSut();
    const httpRequest = { params: {}, body: { data: "" } };
    await sut.handle(httpRequest);
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(
      expect.any(MissingParamError),
    );
  });

  it("should call service with correct id and return 200", async () => {
    const { sut, httpResponseFactory, deleteMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    await sut.handle(httpRequest);
    expect(deleteMilitaryRankService.delete).toHaveBeenCalledWith("123");
    expect(httpResponseFactory.ok).toHaveBeenCalled();
  });

  it("should return 400 if service throws AppError", async () => {
    const { sut, httpResponseFactory, deleteMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    const error = new AppError("Erro", 400);
    deleteMilitaryRankService.delete.mockRejectedValue(error);
    await sut.handle(httpRequest);
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(error);
  });

  it("should return 500 if service throws unknown error", async () => {
    const { sut, httpResponseFactory, deleteMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    deleteMilitaryRankService.delete.mockRejectedValue(
      new Error("Unknown error"),
    );
    await sut.handle(httpRequest);
    expect(httpResponseFactory.serverError).toHaveBeenCalled();
  });
});

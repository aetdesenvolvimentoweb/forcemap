import { MissingParamError } from "@application/errors";
import { AppError } from "@domain/errors";
import { ListByIdMilitaryRankController } from "@presentation/controllers";

describe("ListByIdMilitaryRankController", () => {
  const makeHttpResponseFactory = () => ({
    ok: jest.fn((data) => ({ statusCode: 200, body: data })),
    badRequest: jest.fn((error) => ({ statusCode: 400, body: error })),
    serverError: jest.fn(() => ({
      statusCode: 500,
      body: { error: "Erro interno no servidor." },
    })),
    created: jest.fn(() => ({ statusCode: 201 })),
  });

  const makeListByIdMilitaryRankService = () => ({
    listById: jest.fn(),
  });

  const makeSut = () => {
    const httpResponseFactory = makeHttpResponseFactory();
    const listByIdMilitaryRankService = makeListByIdMilitaryRankService();
    const sut = new ListByIdMilitaryRankController({
      httpResponseFactory,
      listByIdMilitaryRankService,
    });
    return { sut, httpResponseFactory, listByIdMilitaryRankService };
  };

  it("should return 400 if params.id is missing", async () => {
    const { sut, httpResponseFactory } = makeSut();
    const httpRequest = { params: {}, body: { data: "" } };
    await sut.handle(httpRequest);
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(
      expect.any(MissingParamError),
    );
  });

  it("should call service with correct id", async () => {
    const { sut, listByIdMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    listByIdMilitaryRankService.listById.mockResolvedValue({ id: "123" });
    await sut.handle(httpRequest);
    expect(listByIdMilitaryRankService.listById).toHaveBeenCalledWith("123");
  });

  it("should return 200 and data if service succeeds", async () => {
    const { sut, httpResponseFactory, listByIdMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    const result = { id: "123", abbreviation: "CEL", order: 1 };
    listByIdMilitaryRankService.listById.mockResolvedValue(result);
    await sut.handle(httpRequest);
    expect(httpResponseFactory.ok).toHaveBeenCalledWith(result);
  });

  it("should return 400 if service throws AppError", async () => {
    const { sut, httpResponseFactory, listByIdMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    const error = new AppError("Erro", 400);
    listByIdMilitaryRankService.listById.mockRejectedValue(error);
    await sut.handle(httpRequest);
    expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(error);
  });

  it("should return 500 if service throws unknown error", async () => {
    const { sut, httpResponseFactory, listByIdMilitaryRankService } = makeSut();
    const httpRequest = { params: { id: "123" }, body: { data: "123" } };
    listByIdMilitaryRankService.listById.mockRejectedValue(
      new Error("Unknown error"),
    );
    await sut.handle(httpRequest);
    expect(httpResponseFactory.serverError).toHaveBeenCalled();
  });
});

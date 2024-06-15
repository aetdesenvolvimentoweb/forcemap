import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { invalidParamError, missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { GetMilitaryRankByIdService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { GetMilitaryRankByIdController } from "@/backend/presentation/controllers";
import { serverError } from "@/backend/presentation/helpers";
import { HttpRequest } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: GetMilitaryRankByIdController;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryRankValidator({
    repository,
    idValidator,
  });
  const getMilitaryRankByIdService = new GetMilitaryRankByIdService({
    repository,
    validator,
  });

  const sut = new GetMilitaryRankByIdController(getMilitaryRankByIdService);

  return { repository, idValidator, sut };
};

describe("GetMilitaryRankByIdController", () => {
  test("should be return 200 on success", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    const httpRequest: HttpRequest = {
      body: {},
      params: {
        id,
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.data).toEqual(militaryRank);
  });

  test("should be return 400 on missing id", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest = {
      body: {},
      params: { id: "" },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("ID").message
    );
  });

  test("should be return 400 on invalid id", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockImplementationOnce(() => false);

    const httpRequest: HttpRequest = {
      body: {},
      params: { id: "invalid-id" },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      invalidParamError("ID").message
    );

    mockInvalidId.mockRestore();
  });

  test("should be return 500 on server error", async () => {
    const { repository, sut } = makeSut();

    const mockServerError = vi.spyOn(repository, "getById");
    mockServerError.mockRejectedValueOnce(new Error());

    const httpRequest: HttpRequest = {
      body: {},
      params: { id: "valid-id" },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body.errorMessage).toEqual(
      serverError().body.errorMessage
    );

    mockServerError.mockRestore();
  });
});

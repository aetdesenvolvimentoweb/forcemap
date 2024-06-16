import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { UpdateMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MilitaryRankProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import { UpdateMilitaryRankController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: UpdateMilitaryRankController;
}

const makeSut = (): SutResponse => {
  const repository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const idValidator: IdValidator = new IdValidatorStub();
  const validator: MilitaryRankValidator = new MilitaryRankValidator({
    repository,
    idValidator,
  });
  const updateMilitaryRankService = new UpdateMilitaryRankService({
    repository,
    validator,
  });

  const sut = new UpdateMilitaryRankController(updateMilitaryRankService);

  return { repository, idValidator, sut };
};

describe("UpdateMilitaryRankController", () => {
  test("should be return 200 on success", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      body: {
        order: 2,
        abbreviatedName: "TC",
      },
      params: {
        id,
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
  });

  test("should be return 400 on missing id", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      body: {
        order: 2,
        abbreviatedName: "TC",
      },
      params: { id: "" },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("ID").message
    );
  });

  test("should be return 400 on invalid id", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockImplementationOnce(() => false);

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      body: {
        order: 2,
        abbreviatedName: "TC",
      },
      params: { id: "invalid-id" },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      invalidParamError("ID").message
    );

    mockInvalidId.mockRestore();
  });

  test("should be return 404 on unregistered id", async () => {
    const { repository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(repository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      body: {
        order: 2,
        abbreviatedName: "TC",
      },
      params: { id: "valid-id" },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body.errorMessage).toEqual(
      unregisteredFieldIdError("posto/graduação").message
    );

    mockUnregisteredId.mockRestore();
  });
});

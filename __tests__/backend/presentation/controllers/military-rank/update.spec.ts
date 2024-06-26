import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  duplicatedKeyError,
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
import { serverError } from "@/backend/presentation/helpers";
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

  test("should be return 400 on missing order", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      // @ts-expect-error
      body: {
        abbreviatedName: "TC",
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("ordem").message
    );
  });

  test("should be return 400 on missing abbreviated name", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      // @ts-expect-error
      body: {
        order: 2,
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("nome abreviado").message
    );
  });

  test("should be return 400 on duplicated abbreviated name", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await repository.add({
      order: 2,
      abbreviatedName: "TC",
    });

    const httpResponse: HttpResponse = await sut.handle({
      body: {
        order: 3,
        abbreviatedName: "TC",
      },
      params: { id },
    });

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      duplicatedKeyError("nome abreviado").message
    );
  });

  test("should be return 500 on server error", async () => {
    const { repository, sut } = makeSut();

    const mockServerError = vi.spyOn(repository, "update");
    mockServerError.mockRejectedValueOnce(new Error());

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
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body.errorMessage).toEqual(
      serverError().body.errorMessage
    );

    mockServerError.mockRestore();
  });
});

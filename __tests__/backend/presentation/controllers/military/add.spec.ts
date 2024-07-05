import {
  IdValidatorStub,
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "@/backend/data/helpers";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MilitaryProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import { AddMilitaryController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: AddMilitaryController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryValidator({
    idValidator,
    militaryRankRepository,
  });
  const addMilitaryService = new AddMilitaryService({
    validator,
    repository: militaryRepository,
  });

  const sut = new AddMilitaryController(addMilitaryService);

  return { militaryRepository, militaryRankRepository, idValidator, sut };
};

describe("AddMilitaryController", () => {
  test("should be return 201 on success", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryProps> = {
      body: {
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
  });

  test("should be return 400 on missing military rank id", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<MilitaryProps> = {
      // @ts-expect-error
      body: {
        rg: 1,
        name: "Cel",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("posto/graduação").message
    );
  });

  test("should be return 400 on invalid military rank id", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockImplementationOnce(() => false);

    const httpRequest: HttpRequest<MilitaryProps> = {
      body: {
        militaryRankId: "invalid-id",
        rg: 1,
        name: "Cel",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      invalidParamError("posto/graduação").message
    );

    mockInvalidId.mockRestore();
  });

  test("should be return 400 on unregistered military rank id", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<MilitaryProps> = {
      body: {
        militaryRankId: "invalid-id",
        rg: 1,
        name: "Cel",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body.errorMessage).toBe(
      unregisteredFieldIdError("posto/graduação").message
    );
  });
});

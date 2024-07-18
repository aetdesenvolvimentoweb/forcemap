import {
  EncrypterStub,
  HashCompareStub,
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
import { Encrypter, IdValidator } from "@/backend/domain/usecases";
import { AddMilitaryController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
  encrypter: Encrypter;
  sut: AddMilitaryController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new IdValidatorStub();
  const hashCompare = new HashCompareStub();
  const validator = new MilitaryValidator({
    militaryRankRepository,
    militaryRepository,
    idValidator,
    hashCompare,
  });
  const encrypter = new EncrypterStub();
  const addMilitaryService = new AddMilitaryService({
    validator,
    repository: militaryRepository,
    encrypter,
  });

  const sut = new AddMilitaryController(addMilitaryService);

  return {
    militaryRepository,
    militaryRankRepository,
    idValidator,
    encrypter,
    sut,
  };
};

describe("AddMilitaryController", () => {
  test("should be return 201 on success", async () => {
    const { militaryRankRepository, militaryRepository, encrypter, sut } =
      makeSut();
    const addSpy = vi.spyOn(militaryRepository, "add");

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
    expect(addSpy).toHaveBeenCalledWith(
      Object.assign({}, httpRequest.body, {
        password: await encrypter.encrypt(httpRequest.body.password),
      })
    );
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

  test("should be return 400 on missing RG", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryProps> = {
      // @ts-expect-error
      body: {
        militaryRankId,
        name: "Cel",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("RG").message
    );
  });

  test("should be return 400 on missing role", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryProps> = {
      // @ts-expect-error
      body: {
        militaryRankId,
        rg: 1,
        name: "Cel",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("função").message
    );
  });

  test("should be return 400 on invalid role", async () => {
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
        name: "Cel",
        // @ts-expect-error
        role: "invalid-role",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      invalidParamError("função").message
    );
  });

  test("should be return 400 on missing password", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryProps> = {
      // @ts-expect-error
      body: {
        militaryRankId,
        rg: 1,
        name: "Cel",
        role: "Usuário",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("senha").message
    );
  });

  test("should be return 400 on invalid password", async () => {
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
        name: "Cel",
        role: "Usuário",
        password: "invalid", // less then 8 characters
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      invalidParamError("senha").message
    );
  });
});

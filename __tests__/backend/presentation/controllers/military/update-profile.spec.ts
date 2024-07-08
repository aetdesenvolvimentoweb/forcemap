import {
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
import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { UpdateMilitaryProfileProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import { MongoIdValidator } from "@/backend/infra/adapters";
import { UpdateMilitaryProfileController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { ObjectId } from "mongodb";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  idValidator: IdValidator;
  sut: UpdateMilitaryProfileController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new MongoIdValidator();
  const validator = new MilitaryValidator({
    idValidator,
    militaryRankRepository,
    militaryRepository,
  });
  const updateMilitaryProfileService = new UpdateMilitaryProfileService({
    repository: militaryRepository,
    validator,
  });

  const sut = new UpdateMilitaryProfileController(updateMilitaryProfileService);

  return { militaryRankRepository, militaryRepository, idValidator, sut };
};

describe("UpdateMilitaryProfileController", () => {
  test("should be return 200 on success", async () => {
    const { militaryRankRepository, militaryRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId,
        rg: 2,
        name: "another-name",
      },
      params: {
        id,
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
  });

  test("should be return 400 on missing ID", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: "valid-id",
        rg: 1,
        name: "any-name",
      },
      params: { id: "" },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("ID").message
    );
  });

  test("should be return 400 on invalid ID", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockImplementationOnce(() => false);

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: "valid-id",
        rg: 2,
        name: "any-name",
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

  test("should be return 404 on unregistered ID", async () => {
    const { militaryRepository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: "valid-id",
        rg: 2,
        name: "any-name",
      },
      params: { id: new ObjectId().toString() },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body.errorMessage).toEqual(
      unregisteredFieldIdError("militar").message
    );

    mockUnregisteredId.mockRestore();
  });

  test("should be return 400 on missing military rank ID", async () => {
    const { sut, militaryRankRepository, militaryRepository } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: "",
        rg: 1,
        name: "any-name",
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("posto/graduação").message
    );
  });

  test("should be return 400 on invalid military rank ID", async () => {
    const { militaryRankRepository, militaryRepository, idValidator, sut } =
      makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockImplementationOnce(() => true);
    mockInvalidId.mockImplementationOnce(() => false);

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: "invalid-id",
        rg: 2,
        name: "any-name",
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      invalidParamError("posto/graduação").message
    );

    mockInvalidId.mockRestore();
  });

  test("should be return 404 on unregistered military rank ID", async () => {
    const { militaryRankRepository, militaryRepository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(militaryRankRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      body: {
        militaryRankId: new ObjectId().toString(),
        rg: 2,
        name: "any-name",
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(404);
    expect(httpResponse.body.errorMessage).toEqual(
      unregisteredFieldIdError("posto/graduação").message
    );

    mockUnregisteredId.mockRestore();
  });

  test("should be return 400 on missing RG", async () => {
    const { sut, militaryRankRepository, militaryRepository } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryProfileProps, "id">> = {
      // @ts-expect-error
      body: {
        militaryRankId,
        name: "any-name",
      },
      params: { id },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toEqual(
      missingParamError("RG").message
    );
  });
});

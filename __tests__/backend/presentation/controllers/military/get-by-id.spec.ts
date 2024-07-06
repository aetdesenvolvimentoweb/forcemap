import {
  IdValidatorStub,
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { missingParamError } from "@/backend/data/helpers";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { GetMilitaryByIdService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { GetMilitaryByIdController } from "@/backend/presentation/controllers";
import { HttpRequest } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  idValidator: IdValidator;
  sut: GetMilitaryByIdController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator: IdValidator = new IdValidatorStub();
  const validator: MilitaryValidator = new MilitaryValidator({
    militaryRepository,
    militaryRankRepository,
    idValidator,
  });
  const getMilitaryByIdService = new GetMilitaryByIdService({
    repository: militaryRepository,
    validator,
  });

  const sut = new GetMilitaryByIdController(getMilitaryByIdService);

  return { militaryRankRepository, militaryRepository, idValidator, sut };
};

describe("GetMilitaryByIdController", () => {
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

    const httpRequest: HttpRequest = {
      body: {},
      params: {
        id,
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body.data).toEqual(military);
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
});

import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { GetMilitaryRankByIdService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { GetMilitaryRankByIdController } from "@/backend/presentation/controllers";
import { HttpRequest } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: GetMilitaryRankByIdController;
}

const makeSut = (): SutResponse => {
  const repository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const idValidator: IdValidator = new IdValidatorStub();
  const validator: MilitaryRankValidator = new MilitaryRankValidator({
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
});

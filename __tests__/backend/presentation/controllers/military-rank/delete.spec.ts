import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { DeleteMilitaryRankService } from "@/backend/data/services/military-rank/delete";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { DeleteMilitaryRankController } from "@/backend/presentation/controllers";
import { HttpRequest } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: DeleteMilitaryRankController;
}

const makeSut = (): SutResponse => {
  const repository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const idValidator: IdValidator = new IdValidatorStub();
  const validator: MilitaryRankValidator = new MilitaryRankValidator({
    repository,
    idValidator,
  });
  const deleteMilitaryRankService = new DeleteMilitaryRankService({
    repository,
    validator,
  });

  const sut = new DeleteMilitaryRankController(deleteMilitaryRankService);

  return { repository, idValidator, sut };
};

describe("DeleteMilitaryRankByIdController", () => {
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
  });
});

import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { DeleteMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: DeleteMilitaryRankService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryRankValidator({ idValidator, repository });
  const sut = new DeleteMilitaryRankService({ repository, validator });

  return { repository, idValidator, sut };
};

describe("DeleteMilitaryRankService", () => {
  test("should be able to delete a military rank", async () => {
    const { repository, sut } = makeSut();

    await repository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await expect(sut.delete(id)).resolves.not.toThrow();
  });

  test("should be throws if no id is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.delete("")).rejects.toThrow(missingParamError("ID"));
  });
});

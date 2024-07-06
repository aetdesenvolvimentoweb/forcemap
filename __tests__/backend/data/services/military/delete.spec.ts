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
import { DeleteMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  sut: DeleteMilitaryService;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository = new MilitaryRankInMemoryRepository();
  const militaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryValidator({
    idValidator,
    militaryRankRepository,
    militaryRepository,
  });
  const sut = new DeleteMilitaryService({
    repository: militaryRepository,
    validator,
  });

  return { militaryRepository, militaryRankRepository, sut };
};

describe("DeleteMilitaryService", () => {
  test("should be able to delete a military ", async () => {
    const { militaryRepository, militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
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

    await expect(sut.delete(id)).resolves.not.toThrow();
  });

  test("should be throws if no id is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.delete("")).rejects.toThrow(missingParamError("ID"));
  });
});

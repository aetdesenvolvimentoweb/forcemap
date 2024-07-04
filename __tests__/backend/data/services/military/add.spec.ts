import {
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  sut: AddMilitaryService;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository = new MilitaryRankInMemoryRepository();
  const militaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const validator = new MilitaryValidator({});

  const sut = new AddMilitaryService({
    validator,
    repository: militaryRepository,
  });

  return { militaryRankRepository, sut };
};

describe("AddMilitaryService", () => {
  test("should be able to create a new military", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).resolves.not.toThrow();
  });

  test("should be throws if no military rank id is provided", async () => {
    const { sut } = makeSut();

    await expect(
      // @ts-expect-error
      sut.add({
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(missingParamError("posto/graduação"));
  });
});

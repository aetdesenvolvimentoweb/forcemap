import {
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryService } from "@/backend/data/services";
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
  const sut = new AddMilitaryService({
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
});

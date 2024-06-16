import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { UpdateMilitaryRankService } from "@/backend/data/services";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: UpdateMilitaryRankService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const sut = new UpdateMilitaryRankService(repository);

  return { repository, sut };
};

describe("UpdateMilitaryRankService", () => {
  test("should be able to update a military rank", async () => {
    const { repository, sut } = makeSut();

    await repository.add({ order: 1, abbreviatedName: "Cel" });

    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await expect(
      sut.update({ id, order: 2, abbreviatedName: "TC" })
    ).resolves.not.toThrow();
  });
});

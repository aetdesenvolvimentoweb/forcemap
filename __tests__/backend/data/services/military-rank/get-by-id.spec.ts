import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { GetMilitaryRankByIdService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: GetMilitaryRankByIdService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const validator = new MilitaryRankValidator(repository);
  const sut = new GetMilitaryRankByIdService({ repository, validator });

  return { repository, sut };
};

describe("GetMilitaryRankByIdService", () => {
  test("should be able to get a military rank by id", async () => {
    const { repository, sut } = makeSut();

    await repository.add({ order: 1, abbreviatedName: "Cel" });

    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await expect(sut.getById(id)).resolves.toEqual(militaryRank);
  });
});

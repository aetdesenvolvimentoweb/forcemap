import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { GetAllMilitaryRanksService } from "@/backend/data/services";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: GetAllMilitaryRanksService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const sut = new GetAllMilitaryRanksService(repository);

  return { repository, sut };
};

describe("GetAllMilitaryRanksService", () => {
  test("should be able to get all military ranks registereds", async () => {
    const { repository, sut } = makeSut();

    await repository.add({ order: 1, abbreviatedName: "Cel" });

    const militaryRanks = await sut.getAll();

    expect(Array.isArray(militaryRanks)).toBeTruthy();
    expect(militaryRanks.length).toBe(1);
    expect(militaryRanks[0]).toHaveProperty("id");
    expect(militaryRanks[0]).toHaveProperty("order");
    expect(militaryRanks[0]).toHaveProperty("abbreviatedName");
    expect(militaryRanks[0]).toHaveProperty("createdAt");
    expect(militaryRanks[0]).toHaveProperty("updatedAt");
  });
});

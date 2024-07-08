import {
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { GetAllMilitaryService } from "@/backend/data/services";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  sut: GetAllMilitaryService;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository = new MilitaryRankInMemoryRepository();
  const militaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const sut = new GetAllMilitaryService(militaryRepository);

  return { militaryRepository, militaryRankRepository, sut };
};

describe("GetAllMilitaryService", () => {
  test("should be able to get all military registereds", async () => {
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

    const military = await sut.getAll();

    expect(Array.isArray(military)).toBeTruthy();
    expect(military.length).toBe(1);
    expect(military[0]).toHaveProperty("id");
    expect(military[0]).toHaveProperty("militaryRankId");
    expect(military[0]).toHaveProperty("militaryRank");
    expect(military[0]).toHaveProperty("rg");
    expect(military[0]).toHaveProperty("name");
    expect(military[0]).toHaveProperty("role");
    expect(military[0]).not.toHaveProperty("password");
    expect(military[0]).toHaveProperty("createdAt");
    expect(military[0]).toHaveProperty("updatedAt");
  });
});

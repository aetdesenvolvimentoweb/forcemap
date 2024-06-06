import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { AddMilitaryRankService } from "@/backend/data/services";
import { describe, expect, test } from "vitest";

interface SutResponse {
  sut: AddMilitaryRankService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const sut = new AddMilitaryRankService(repository);

  return { sut };
};

describe("AddMilitaryRankService", () => {
  test("should be able to create a new military rank", async () => {
    const { sut } = makeSut();

    await expect(
      sut.add({ order: 1, abbreviatedName: "Cel" })
    ).resolves.not.toThrow();
  });
});

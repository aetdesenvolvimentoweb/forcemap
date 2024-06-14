import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { duplicatedKeyError, missingParamError } from "@/backend/data/helpers";
import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { describe, expect, test } from "vitest";

interface SutResponse {
  sut: AddMilitaryRankService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const validator = new MilitaryRankValidator(repository);
  const sut = new AddMilitaryRankService({ repository, validator });

  return { sut };
};

describe("AddMilitaryRankService", () => {
  test("should be able to create a new military rank", async () => {
    const { sut } = makeSut();

    await expect(
      sut.add({ order: 1, abbreviatedName: "Cel" })
    ).resolves.not.toThrow();
  });
  test("should be throws if no order is provided", async () => {
    const { sut } = makeSut();

    // @ts-expect-error
    await expect(sut.add({ abbreviatedName: "Cel" })).rejects.toThrow(
      missingParamError("ordem")
    );
  });
  test("should be throws if no abbreviated name is provided", async () => {
    const { sut } = makeSut();

    // @ts-expect-error
    await expect(sut.add({ order: 1 })).rejects.toThrow(
      missingParamError("nome abreviado")
    );
  });
  test("should be throws if duplicated abbreviated name is provided", async () => {
    const { sut } = makeSut();

    await sut.add({ order: 1, abbreviatedName: "Cel" });

    await expect(sut.add({ order: 1, abbreviatedName: "Cel" })).rejects.toThrow(
      duplicatedKeyError("nome abreviado")
    );
  });
});

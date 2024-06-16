import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { invalidParamError, missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { UpdateMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: UpdateMilitaryRankService;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryRankValidator({ idValidator, repository });
  const sut = new UpdateMilitaryRankService({ repository, validator });

  return { repository, idValidator, sut };
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

  test("should be throws if no id is provided", async () => {
    const { sut } = makeSut();

    await expect(
      //@ts-expect-error
      sut.update({ order: 2, abbreviatedName: "TC" })
    ).rejects.toThrow(missingParamError("ID"));
  });

  test("should be throws if invalid id is provided", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(false);

    await expect(
      sut.update({
        id: "invalid-id",
        order: 2,
        abbreviatedName: "TC",
      })
    ).rejects.toThrow(invalidParamError("ID"));

    mockInvalidId.mockRestore();
  });
});

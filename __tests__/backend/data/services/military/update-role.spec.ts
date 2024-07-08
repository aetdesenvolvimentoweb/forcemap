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
import { UpdateMilitaryRoleService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  sut: UpdateMilitaryRoleService;
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
  const sut = new UpdateMilitaryRoleService({
    repository: militaryRepository,
    validator,
  });

  return { militaryRepository, militaryRankRepository, sut };
};

describe("UpdateMilitaryRoleService", () => {
  test("should be able to update a military role", async () => {
    const { militaryRepository, militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      password: "any-password",
      role: "Usuário",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    await expect(
      sut.updateRole({
        id,
        newRole: "ACA",
      })
    ).resolves.not.toThrow();
  });

  test("should be throws if no id is provided", async () => {
    const { sut } = makeSut();

    await expect(
      //@ts-expect-error
      sut.updateRole({ newRole: "ACA" })
    ).rejects.toThrow(missingParamError("ID"));
  });
});

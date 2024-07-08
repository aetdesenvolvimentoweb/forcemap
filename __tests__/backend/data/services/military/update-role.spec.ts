import {
  IdValidatorStub,
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "@/backend/data/helpers";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { UpdateMilitaryRoleService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
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

  return { militaryRepository, militaryRankRepository, idValidator, sut };
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

  test("should be throws if no ID is provided", async () => {
    const { sut } = makeSut();

    await expect(
      //@ts-expect-error
      sut.updateRole({ newRole: "ACA" })
    ).rejects.toThrow(missingParamError("ID"));
  });

  test("should be throws if invalid id is provided", async () => {
    const { idValidator, sut } = makeSut();

    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(false);

    await expect(
      sut.updateRole({
        id: "invalid-id",
        newRole: "ACA",
      })
    ).rejects.toThrow(invalidParamError("ID"));

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered id is provided", async () => {
    const { militaryRepository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(
      sut.updateRole({
        id: "valid-id",
        newRole: "ACA",
      })
    ).rejects.toThrow(unregisteredFieldIdError("militar"));

    mockUnregisteredId.mockRestore();
  });

  test("should be throws if no new role is provided", async () => {
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
      // @ts-expect-error
      sut.updateRole({ id })
    ).rejects.toThrow(missingParamError("função"));
  });

  test("should be throws if invalid new role is provided", async () => {
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
      // @ts-expect-error
      sut.updateRole({ id, newRole: "invalid-role" })
    ).rejects.toThrow(invalidParamError("função"));
  });
});

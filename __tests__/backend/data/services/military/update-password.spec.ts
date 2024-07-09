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
import { UpdateMilitaryPasswordService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: UpdateMilitaryPasswordService;
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
  const sut = new UpdateMilitaryPasswordService({
    repository: militaryRepository,
    validator,
  });

  return { militaryRepository, militaryRankRepository, idValidator, sut };
};

describe("UpdateMilitaryPasswordService", () => {
  test("should be able to update a military password", async () => {
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
      sut.updatePassword({
        id,
        currentPassword: "any-password",
        newPassword: "another-password",
      })
    ).resolves.not.toThrow();
  });

  test("should be throws if no ID is provided", async () => {
    const { sut } = makeSut();

    await expect(
      //@ts-expect-error
      sut.updatePassword({
        currentPassword: "any-password",
        newPassword: "another-password",
      })
    ).rejects.toThrow(missingParamError("ID"));
  });

  test("should be throws if invalid ID is provided", async () => {
    const { idValidator, sut } = makeSut();

    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(false);

    await expect(
      sut.updatePassword({
        id: "invalid-id",
        currentPassword: "any-password",
        newPassword: "another-password",
      })
    ).rejects.toThrow(invalidParamError("ID"));

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered ID is provided", async () => {
    const { militaryRepository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(
      sut.updatePassword({
        id: "valid-id",
        currentPassword: "any-password",
        newPassword: "another-password",
      })
    ).rejects.toThrow(unregisteredFieldIdError("militar"));

    mockUnregisteredId.mockRestore();
  });

  test("should be throws if no current password is provided", async () => {
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
      sut.updatePassword({ id, newPassword: "another-password" })
    ).rejects.toThrow(missingParamError("senha atual"));
  });

  test("should be throws if invalid current password is provided", async () => {
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
      sut.updatePassword({
        id,
        currentPassword: "invalid", //less than 8 characters
        newPassword: "new-password",
      })
    ).rejects.toThrow(invalidParamError("senha atual"));
  });

  test("should be throws if current password no matches", async () => {
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
      sut.updatePassword({
        id,
        currentPassword: "wrong-password",
        newPassword: "another-password",
      })
    ).rejects.toThrow(invalidParamError("senha atual"));
  });
});

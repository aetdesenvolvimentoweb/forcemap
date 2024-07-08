import {
  IdValidatorStub,
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  duplicatedKeyError,
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "@/backend/data/helpers";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { UpdateMilitaryProfileService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: UpdateMilitaryProfileService;
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
  const sut = new UpdateMilitaryProfileService({
    repository: militaryRepository,
    validator,
  });

  return { militaryRepository, militaryRankRepository, idValidator, sut };
};

describe("UpdateMilitaryProfileService", () => {
  test("should be able to update a military profile", async () => {
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
      sut.updateProfile({
        id,
        militaryRankId,
        rg: 2,
        name: "another-name",
      })
    ).resolves.not.toThrow();
  });

  test("should be throws if no ID is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      //@ts-expect-error
      sut.updateProfile({ militaryRankId, rg: 2, name: "another-name" })
    ).rejects.toThrow(missingParamError("ID"));
  });

  test("should be throws if invalid ID is provided", async () => {
    const { militaryRankRepository, idValidator, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(false);

    await expect(
      sut.updateProfile({
        id: "invalid-id",
        militaryRankId,
        rg: 2,
        name: "another-name",
      })
    ).rejects.toThrow(invalidParamError("ID"));

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered ID is provided", async () => {
    const { militaryRepository, militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(
      sut.updateProfile({
        id: "valid-id",
        militaryRankId,
        rg: 2,
        name: "another-name",
      })
    ).rejects.toThrow(unregisteredFieldIdError("militar"));

    mockUnregisteredId.mockRestore();
  });

  test("should be throws if no military rank id is provided", async () => {
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
      sut.updateProfile({ id, rg: 2, name: "another-name" })
    ).rejects.toThrow(missingParamError("posto/graduação"));
  });

  test("should be throws if invalid military rank ID is provided", async () => {
    const { militaryRankRepository, militaryRepository, idValidator, sut } =
      makeSut();

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

    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(true);
    mockInvalidId.mockReturnValueOnce(false);

    await expect(
      sut.updateProfile({
        id,
        militaryRankId: "invalid-id",
        rg: 2,
        name: "another-name",
      })
    ).rejects.toThrow(invalidParamError("posto/graduação"));

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered military rank ID is provided", async () => {
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

    const mockUnregisteredId = vi.spyOn(militaryRankRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(
      sut.updateProfile({
        id,
        militaryRankId: "valid-id",
        rg: 2,
        name: "another-name",
      })
    ).rejects.toThrow(unregisteredFieldIdError("posto/graduação"));

    mockUnregisteredId.mockRestore();
  });

  test("should be throws if no RG is provided", async () => {
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
      sut.updateProfile({ id, militaryRankId, name: "another-name" })
    ).rejects.toThrow(missingParamError("RG"));
  });

  test("should be throws if already registered RG is provided", async () => {
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
    await militaryRepository.add({
      militaryRankId,
      rg: 2,
      name: "another-name",
      password: "any-password",
      role: "Usuário",
    });

    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    await expect(
      sut.updateProfile({
        id,
        militaryRankId,
        rg: 2,
        name: "another-name",
      })
    ).rejects.toThrow(duplicatedKeyError("RG"));
  });

  test("should be throws if no name is provided", async () => {
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
      sut.updateProfile({ id, militaryRankId, rg: 2 })
    ).rejects.toThrow(missingParamError("nome"));
  });
});

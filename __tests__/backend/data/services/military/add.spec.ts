import {
  EncrypterStub,
  HashCompareStub,
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
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MilitaryRole } from "@/backend/domain/entities";
import { Encrypter, IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryInMemoryRepository;
  idValidator: IdValidator;
  encrypter: Encrypter;
  sut: AddMilitaryService;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository = new MilitaryRankInMemoryRepository();
  const militaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new IdValidatorStub();
  const hashCompare = new HashCompareStub();
  const validator = new MilitaryValidator({
    militaryRankRepository,
    militaryRepository,
    idValidator,
    hashCompare,
  });
  const encrypter = new EncrypterStub();

  const sut = new AddMilitaryService({
    validator,
    repository: militaryRepository,
    encrypter,
  });

  return {
    militaryRankRepository,
    militaryRepository,
    idValidator,
    encrypter,
    sut,
  };
};

describe("AddMilitaryService", () => {
  test("should be able to create a new military with a hashed password", async () => {
    const { militaryRankRepository, militaryRepository, encrypter, sut } =
      makeSut();
    const addSpy = vi.spyOn(militaryRepository, "add");

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const militaryProps = {
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário" as MilitaryRole,
      password: "any-password",
    };

    await expect(sut.add(militaryProps)).resolves.not.toThrow();
    expect(addSpy).toHaveBeenCalledWith({
      ...militaryProps,
      password: await encrypter.encrypt(militaryProps.password),
    });
  });

  test("should be throws if no military rank id is provided", async () => {
    const { sut } = makeSut();

    await expect(
      // @ts-expect-error
      sut.add({
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(missingParamError("posto/graduação"));
  });

  test("should be throws if invalid military rank id is provided", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValue(false);

    await expect(
      sut.add({
        militaryRankId: "invalid-id",
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(invalidParamError("posto/graduação"));

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered military rank id is provided", async () => {
    const { militaryRepository, sut } = makeSut();

    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(
      sut.add({
        militaryRankId: "unregistered-id",
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(unregisteredFieldIdError("posto/graduação"));

    mockUnregisteredId.mockRestore();
  });

  test("should be throws if no RG is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      // @ts-expect-error
      sut.add({
        militaryRankId,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(missingParamError("RG"));
  });

  test("should be throws if already registered RG is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await sut.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "any-password",
    });

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(duplicatedKeyError("RG"));
  });

  test("should be throws if no name is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      // @ts-expect-error
      sut.add({
        militaryRankId,
        rg: 1,
        role: "Usuário",
        password: "any-password",
      })
    ).rejects.toThrow(missingParamError("nome"));
  });

  test("should be throws if no role is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      // @ts-expect-error
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        password: "any-password",
      })
    ).rejects.toThrow(missingParamError("função"));
  });

  test("should be throws if invalid role is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        // @ts-expect-error
        role: "invalid-role",
        password: "any-password",
      })
    ).rejects.toThrow(invalidParamError("função"));
  });

  test("should be throws if no password is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      // @ts-expect-error
      sut.add({ militaryRankId, rg: 1, name: "any-name", role: "Usuário" })
    ).rejects.toThrow(missingParamError("senha"));
  });

  test("should be throws if invalid password is provided", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "invalid", //less than 8 characters
      })
    ).rejects.toThrow(invalidParamError("senha"));
  });
});

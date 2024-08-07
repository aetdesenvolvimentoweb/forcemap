import {
  HashCompareStub,
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
import { GetMilitaryByIdService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { IdValidator } from "@/backend/domain/usecases";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidator;
  sut: GetMilitaryByIdService;
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
  const sut = new GetMilitaryByIdService({
    repository: militaryRepository,
    validator,
  });

  return { militaryRepository, militaryRankRepository, idValidator, sut };
};

describe("GetMilitaryByIdService", () => {
  test("should be able to get a military by id", async () => {
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
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    await expect(sut.getById(id)).resolves.not.toThrow();
  });

  test("should be throws if no ID is provided", async () => {
    const { sut } = makeSut();

    await expect(sut.getById("")).rejects.toThrow(missingParamError("ID"));
  });

  test("should be throws if invalid ID is provided", async () => {
    const { idValidator, sut } = makeSut();
    const mockInvalidId = vi.spyOn(idValidator, "isValid");
    mockInvalidId.mockReturnValueOnce(false);

    await expect(sut.getById("invalid-id")).rejects.toThrow(
      invalidParamError("ID")
    );

    mockInvalidId.mockRestore();
  });

  test("should be throws if unregistered id is provided", async () => {
    const { militaryRepository, sut } = makeSut();
    const mockUnregisteredId = vi.spyOn(militaryRepository, "getById");
    mockUnregisteredId.mockResolvedValueOnce(null);

    await expect(sut.getById("valid-id")).rejects.toThrow(
      unregisteredFieldIdError("militar")
    );

    mockUnregisteredId.mockRestore();
  });
});

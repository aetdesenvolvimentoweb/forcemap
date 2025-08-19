import { DeleteMilitaryRankService } from "@application/services";
import { MilitaryRankRepository } from "@domain/repositories";
import { IdSanitizer } from "@application/sanitizers";
import { UUIDIdValidatorAdapter } from "@infra/adapters";
import { EntityNotFoundError } from "@application/errors";
import type { MilitaryRank } from "@domain/entities";

interface SutTypes {
  sut: DeleteMilitaryRankService;
  militaryRankRepository: jest.Mocked<MilitaryRankRepository>;
  sanitizer: IdSanitizer;
  validator: UUIDIdValidatorAdapter;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = jest.mocked<MilitaryRankRepository>({
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
    listById: jest.fn(),
    delete: jest.fn(),
  });
  const sanitizer = new IdSanitizer();
  const validator = new UUIDIdValidatorAdapter();
  const sut = new DeleteMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
  return { sut, militaryRankRepository, sanitizer, validator };
};

describe("DeleteMilitaryRankService - Integration Tests", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Successful deletion flow", () => {
    it("should delete military rank when id exists", async () => {
      const { sut, militaryRankRepository } = sutInstance;
      const id = "550e8400-e29b-41d4-a716-446655440000";
      militaryRankRepository.listById.mockResolvedValueOnce({
        id,
        abbreviation: "CEL",
        order: 1,
      });
      militaryRankRepository.delete.mockResolvedValueOnce();
      await expect(sut.delete(id)).resolves.toBeUndefined();
      expect(militaryRankRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe("Error scenarios", () => {
    it("should throw error if id is missing", async () => {
      const { sut } = sutInstance;
      await expect(sut.delete("")).rejects.toThrow(
        "O campo ID é inválido: Erro no formato.",
      );
    });

    it("should throw error if id is not a valid UUID", async () => {
      const { sut } = sutInstance;
      await expect(sut.delete("invalid-id")).rejects.toThrow(
        "O campo ID é inválido: Erro no formato.",
      );
    });

    it("should throw EntityNotFoundError if military rank does not exist", async () => {
      const { sut, militaryRankRepository } = sutInstance;
      const id = "550e8400-e29b-41d4-a716-446655440000";
      militaryRankRepository.listById.mockResolvedValueOnce(null);
      await expect(sut.delete(id)).rejects.toThrow(
        "Posto/Graduação não encontrado(a) com esse ID",
      );
    });
  });
});

import { ListByIdMilitaryRankService } from "@application/services";
import { MilitaryRankRepository } from "@domain/repositories";
import type { MilitaryRank } from "@domain/entities";
import { IdSanitizer } from "@application/sanitizers";
import { UUIDIdValidatorAdapter } from "@infra/adapters";

interface SutTypes {
  sut: ListByIdMilitaryRankService;
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
  const sut = new ListByIdMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
  return { sut, militaryRankRepository, sanitizer, validator };
};

describe("ListByIdMilitaryRankService - Integration Tests", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Successful listing flow", () => {
    it("should return military rank when id exists", async () => {
      const { sut, militaryRankRepository } = sutInstance;
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const expectedRank: MilitaryRank = {
        id,
        abbreviation: "CEL",
        order: 1,
      };
      militaryRankRepository.listById.mockResolvedValueOnce(expectedRank);
      const result = await sut.listById(id);
      expect(militaryRankRepository.listById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedRank);
    });
  });

  describe("Error scenarios", () => {
    it("should throw error if id is missing", async () => {
      const { sut } = sutInstance;
      await expect(sut.listById("")).rejects.toThrow(
        "O campo ID é inválido: Erro no formato.",
      );
    });

    it("should throw error if id is not a valid UUID", async () => {
      const { sut } = sutInstance;
      await expect(sut.listById("invalid-id")).rejects.toThrow(
        "O campo ID é inválido: Erro no formato.",
      );
    });

    it("should throw EntityNotFoundError if military rank does not exist", async () => {
      const { sut, militaryRankRepository } = sutInstance;
      const id = "550e8400-e29b-41d4-a716-446655440000";
      militaryRankRepository.listById.mockResolvedValueOnce(null);
      await expect(sut.listById(id)).rejects.toThrow(
        "Posto/Graduação não encontrado(a) com esse ID",
      );
    });
  });

  describe("Sanitization and validation flow", () => {
    it("should sanitize id before validation", async () => {
      const { sut, sanitizer, militaryRankRepository } = sutInstance;
      const rawId = "  550e8400-e29b-41d4-a716-446655440000  ";
      const sanitizedId = sanitizer.sanitize(rawId);
      militaryRankRepository.listById.mockResolvedValueOnce({
        id: sanitizedId,
        abbreviation: "CEL",
        order: 1,
      });
      const result = await sut.listById(rawId);
      expect(result && result.id).toBe(sanitizedId);
    });
  });
});

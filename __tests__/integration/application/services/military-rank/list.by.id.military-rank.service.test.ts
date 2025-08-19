import { ListByIdMilitaryRankService } from "@application/services";
import { MilitaryRankRepository } from "@domain/repositories";
import type { MilitaryRank } from "@domain/entities";
import { IdSanitizer } from "@application/sanitizers";
import { UUIDIdValidatorAdapter } from "@infra/adapters";
import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import { MilitaryRankInputDTO } from "@domain/dtos";
import { randomUUID } from "crypto";

interface SutTypes {
  sut: ListByIdMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizer;
  validator: UUIDIdValidatorAdapter;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = new InMemoryMilitaryRankRepository();
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
      const listByIdSpy = jest.spyOn(militaryRankRepository, "listById");

      const inputDTO: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      await militaryRankRepository.create(inputDTO);
      const militaryRank = await militaryRankRepository.findByAbbreviation(
        inputDTO.abbreviation,
      );

      const result = await sut.listById(militaryRank!.id);
      expect(listByIdSpy).toHaveBeenCalledWith(militaryRank?.id);
      expect(result).toEqual(militaryRank);
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
      const id = randomUUID();

      await expect(sut.listById(id)).rejects.toThrow(
        "Posto/Graduação não encontrado(a) com esse ID",
      );
    });
  });

  describe("Sanitization and validation flow", () => {
    it("should sanitize id before validation", async () => {
      const { sut, sanitizer, militaryRankRepository } = sutInstance;
      const inputDTO: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      await militaryRankRepository.create(inputDTO);
      const militaryRank = await militaryRankRepository.findByAbbreviation(
        inputDTO.abbreviation,
      );

      const rawId = " " + militaryRank!.id + " ";
      const sanitizedId = sanitizer.sanitize(rawId);

      const result = await sut.listById(rawId);
      expect(result && result.id).toBe(sanitizedId);
    });
  });
});

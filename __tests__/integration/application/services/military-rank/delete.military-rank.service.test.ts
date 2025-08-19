import { DeleteMilitaryRankService } from "@application/services";
import { MilitaryRankRepository } from "@domain/repositories";
import { IdSanitizer } from "@application/sanitizers";
import { UUIDIdValidatorAdapter } from "@infra/adapters";
import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import { randomUUID } from "crypto";

interface SutTypes {
  sut: DeleteMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizer;
  validator: UUIDIdValidatorAdapter;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = new InMemoryMilitaryRankRepository();
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
      const deleteSpy = jest.spyOn(militaryRankRepository, "delete");

      await militaryRankRepository.create({
        abbreviation: "CEL",
        order: 1,
      });

      const militaryRank =
        await militaryRankRepository.findByAbbreviation("CEL");

      await expect(sut.delete(militaryRank!.id)).resolves.not.toThrow();
      expect(deleteSpy).toHaveBeenCalledWith(militaryRank?.id);
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
      const { sut } = sutInstance;
      const id = randomUUID();

      await expect(sut.delete(id)).rejects.toThrow(
        "Posto/Graduação não encontrado(a) com esse ID",
      );
    });
  });
});

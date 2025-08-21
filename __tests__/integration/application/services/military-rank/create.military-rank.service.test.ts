import { InvalidParamError } from "@application/errors";
import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { MilitaryRankValidator } from "@application/validators";
import type { MilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";
import { InMemoryMilitaryRankRepository } from "@infra/repositories";

interface SutTypes {
  sut: CreateMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = new InMemoryMilitaryRankRepository();

  // Usando implementações reais para teste de integração
  const sanitizer = new MilitaryRankInputDTOSanitizer();
  const validator = new MilitaryRankValidator({ militaryRankRepository });

  const sut = new CreateMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });

  return {
    sut,
    militaryRankRepository,
  };
};

describe("CreateMilitaryRankService - Integration Tests", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Successful creation flow", () => {
    it("should create a military rank with valid data", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const spyCreate = jest.spyOn(militaryRankRepository, "create");
      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "  cel  ", // dados que precisam de sanitização
        order: 1,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(spyCreate).toHaveBeenCalledWith({
        abbreviation: "CEL", // verificar se foi sanitizado
        order: 1,
      });
      expect(spyCreate).toHaveBeenCalledTimes(1);
    });

    it("should handle data with special characters in abbreviation", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const spyCreate = jest.spyOn(militaryRankRepository, "create");
      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "  3º sgt  ",
        order: 5,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(spyCreate).toHaveBeenCalledWith({
        abbreviation: "3º SGT",
        order: 5,
      });
    });

    it("should check uniqueness before creating", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const spyFindByAbbreviation = jest.spyOn(
        militaryRankRepository,
        "findByAbbreviation",
      );
      const spyFindByOrder = jest.spyOn(militaryRankRepository, "findByOrder");
      const spyCreate = jest.spyOn(militaryRankRepository, "create");
      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "NOVO",
        order: 10,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(spyFindByAbbreviation).toHaveBeenCalledWith("NOVO");
      expect(spyFindByOrder).toHaveBeenCalledWith(10);
      expect(spyCreate).toHaveBeenCalledWith({
        abbreviation: "NOVO",
        order: 10,
      });
    });
  });

  describe("Validation error scenarios", () => {
    it("should throw error for missing abbreviation", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = {
        abbreviation: "",
        order: 1,
      } as MilitaryRankInputDTO;

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Abreviatura precisa ser preenchido.",
      );
    });

    it("should throw error for missing order", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = {
        abbreviation: "CEL",
      } as MilitaryRankInputDTO;

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Ordem precisa ser preenchido.",
      );
    });

    it("should sanitize invalid characters from abbreviation", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const invalidInput = {
        abbreviation: "SGT@#$%^", // menos que 10 caracteres após sanitização
        order: 1,
      };

      // ASSERT - sanitizer remove caracteres inválidos
      await expect(sut.create(invalidInput)).rejects.toThrow(
        "O campo Abreviatura é inválido: deve conter apenas letras, números, espaços e/ou o caractere ordinal (º).",
      );
    });

    it("should throw error for order out of range", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 25, // fora do range 1-20
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Ordem é inválido: deve ser menor que 20.",
      );
    });
  });

  describe("Uniqueness validation scenarios", () => {
    it("should throw error when abbreviation already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;

      const inputDTO1: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      await militaryRankRepository.create(inputDTO1);

      const spyCreate = jest.spyOn(militaryRankRepository, "create");

      const inputDTO2: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 2,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDTO2)).rejects.toThrow(
        "Abreviatura já está em uso.",
      );
      expect(spyCreate).not.toHaveBeenCalled();
    });

    it("should throw error when order already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDTO1: MilitaryRankInputDTO = {
        abbreviation: "MAJ",
        order: 5,
      };

      await militaryRankRepository.create(inputDTO1);

      const spyCreate = jest.spyOn(militaryRankRepository, "create");

      const inputDTO2: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 5,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDTO2)).rejects.toThrow(
        "Ordem já está em uso.",
      );
      expect(spyCreate).not.toHaveBeenCalled();
    });
  });

  describe("Complete integration flow", () => {
    it("should execute full pipeline: sanitize -> validate -> create with realistic data", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const spyCreate = jest.spyOn(militaryRankRepository, "create");
      const spyFindByAbbreviation = jest.spyOn(
        militaryRankRepository,
        "findByAbbreviation",
      );
      const spyFindByOrder = jest.spyOn(militaryRankRepository, "findByOrder");

      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "  2º ten  ", // precisa sanitização
        order: 8,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT - verificar que todo o pipeline foi executado
      expect(spyFindByAbbreviation).toHaveBeenCalledWith("2º TEN");
      expect(spyFindByOrder).toHaveBeenCalledWith(8);
      expect(spyCreate).toHaveBeenCalledWith({
        abbreviation: "2º TEN",
        order: 8,
      });
    });

    it("should fail fast on first validation error without checking uniqueness", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const spyFindByAbbreviation = jest.spyOn(
        militaryRankRepository,
        "findByAbbreviation",
      );
      const spyFindByOrder = jest.spyOn(militaryRankRepository, "findByOrder");
      const spyCreate = jest.spyOn(militaryRankRepository, "create");

      const inputDto: MilitaryRankInputDTO = {
        abbreviation: "", // erro de campo obrigatório
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Abreviatura precisa ser preenchido.",
      );

      // Não deve chegar até as validações de unicidade
      expect(spyFindByAbbreviation).not.toHaveBeenCalled();
      expect(spyFindByOrder).not.toHaveBeenCalled();
      expect(spyCreate).not.toHaveBeenCalled();
    });
  });
});

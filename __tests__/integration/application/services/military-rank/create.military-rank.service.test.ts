import { CreateMilitaryRankSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { CreateMilitaryRankValidator } from "@application/validators";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";
import type { MilitaryRankRepository } from "@domain/repositories";

interface SutTypes {
  sut: CreateMilitaryRankService;
  militaryRankRepository: jest.Mocked<MilitaryRankRepository>;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = jest.mocked<MilitaryRankRepository>({
    create: jest.fn().mockResolvedValue(undefined),
    findByAbbreviation: jest.fn().mockResolvedValue(null),
    findByOrder: jest.fn().mockResolvedValue(null),
    listAll: jest.fn().mockResolvedValue([]),
    listById: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
  });

  // Usando implementações reais para teste de integração
  const sanitizer = new CreateMilitaryRankSanitizer();
  const validator = new CreateMilitaryRankValidator({ militaryRankRepository });

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
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "  cel  ", // dados que precisam de sanitização
        order: 1,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "CEL", // verificar se foi sanitizado
        order: 1,
      });
      expect(militaryRankRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should handle data with special characters in abbreviation", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "  3º sgt  ",
        order: 5,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "3º SGT",
        order: 5,
      });
    });

    it("should check uniqueness before creating", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "NOVO",
        order: 10,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT
      expect(militaryRankRepository.findByAbbreviation).toHaveBeenCalledWith(
        "NOVO",
      );
      expect(militaryRankRepository.findByOrder).toHaveBeenCalledWith(10);
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
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
      } as CreateMilitaryRankInputDTO;

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
      } as CreateMilitaryRankInputDTO;

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Ordem precisa ser preenchido.",
      );
    });

    it("should sanitize invalid characters from abbreviation", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "invalid@char#", // caracteres inválidos são removidos pelo sanitizer
        order: 1,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT - sanitizer remove caracteres inválidos
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "INVALIDCHA", // @ e # removidos, limitado a 10 chars
        order: 1,
      });
    });

    it("should sanitize and limit abbreviation length", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "VERY_LONG_ABBREVIATION", // será limitado pelo sanitizer
        order: 1,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT - sanitizer limita a 10 caracteres
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "VERYLONGAB", // limitado e _ removido
        order: 1,
      });
    });

    it("should throw error for order out of range", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 25, // fora do range 1-20
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Ordem é inválido: não pode ser maior que 20",
      );
    });

    it("should sanitize decimal order to integer", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1.5, // será convertido pelo sanitizer
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT - sanitizer converte 1.5 para 1
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "CEL",
        order: 1,
      });
    });
  });

  describe("Uniqueness validation scenarios", () => {
    it("should throw error when abbreviation already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const existingMilitaryRank: MilitaryRank = {
        id: "existing-id",
        abbreviation: "CEL",
        order: 2,
      };
      militaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
        existingMilitaryRank,
      );

      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "Abreviatura já está em uso.",
      );
      expect(militaryRankRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when order already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const existingMilitaryRank: MilitaryRank = {
        id: "existing-id",
        abbreviation: "MAJ",
        order: 5,
      };
      militaryRankRepository.findByOrder.mockResolvedValueOnce(
        existingMilitaryRank,
      );

      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 5,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "Ordem já está em uso.",
      );
      expect(militaryRankRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("Complete integration flow", () => {
    it("should execute full pipeline: sanitize -> validate -> create with realistic data", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "  2º ten  ", // precisa sanitização
        order: 8,
      };

      // ACT
      await sut.create(inputDto);

      // ASSERT - verificar que todo o pipeline foi executado
      expect(militaryRankRepository.findByAbbreviation).toHaveBeenCalledWith(
        "2º TEN",
      );
      expect(militaryRankRepository.findByOrder).toHaveBeenCalledWith(8);
      expect(militaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "2º TEN",
        order: 8,
      });
    });

    it("should fail fast on first validation error without checking uniqueness", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "", // erro de campo obrigatório
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.create(inputDto)).rejects.toThrow(
        "O campo Abreviatura precisa ser preenchido.",
      );

      // Não deve chegar até as validações de unicidade
      expect(militaryRankRepository.findByAbbreviation).not.toHaveBeenCalled();
      expect(militaryRankRepository.findByOrder).not.toHaveBeenCalled();
      expect(militaryRankRepository.create).not.toHaveBeenCalled();
    });
  });
});

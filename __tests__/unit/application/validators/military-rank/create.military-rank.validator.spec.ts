import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "@application/errors";
import { CreateMilitaryRankValidator } from "@application/validators";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";

interface SutTypes {
  sut: CreateMilitaryRankValidator;
  militaryRankRepository: jest.Mocked<MilitaryRankRepository>;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = jest.mocked<MilitaryRankRepository>({
    create: jest.fn().mockResolvedValue(undefined),
    findByAbbreviation: jest.fn().mockResolvedValue(null),
    findByOrder: jest.fn().mockResolvedValue(null),
    listAll: jest.fn().mockResolvedValue([]),
  });
  const sut = new CreateMilitaryRankValidator({
    militaryRankRepository,
  });

  return {
    sut,
    militaryRankRepository,
  };
};

describe("CreateMilitaryRankValidator", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("Validation of mandatory fields", () => {
    it("should throw MissingParamError when abbreviation is empty", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "",
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new MissingParamError("Abreviatura"),
      );
    });

    it("should throw MissingParamError when abbreviation is only spaces", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "   ",
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new MissingParamError("Abreviatura"),
      );
    });

    it("should throw MissingParamError when order is null", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = {
        abbreviation: "CABO",
        order: null,
      } as unknown as CreateMilitaryRankInputDTO;

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new MissingParamError("Ordem"),
      );
    });

    it("should throw MissingParamError when order is undefined", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto = {
        abbreviation: "CABO",
        order: undefined,
      } as unknown as CreateMilitaryRankInputDTO;

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new MissingParamError("Ordem"),
      );
    });
  });

  describe("Abbreviation format validation", () => {
    it("should throw InvalidParamError when abbreviation exceeds 10 characters", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "ABCDEFGHIJK", // 11 characters
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError("Abreviatura", "não pode exceder 10 caracteres"),
      );
    });

    it("should throw InvalidParamError when abbreviation contains invalid characters", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO@#",
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError(
          "Abreviatura",
          "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
        ),
      );
    });

    it("should throw InvalidParamError when abbreviation contains lowercase letters", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "Cabo",
        order: 1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError(
          "Abreviatura",
          "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
        ),
      );
    });

    it("should accept abbreviation with uppercase letters", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept abbreviation with numbers", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "SGT1",
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept abbreviation with spaces", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "SUB TEN",
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept abbreviation with ordinal character", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept abbreviation with exactly 10 characters", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "ABCDEFGHIJ", // 10 characters
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("Order range validation", () => {
    it("should throw InvalidParamError when order is not an integer", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 1.5,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError("Ordem", "deve ser um número inteiro"),
      );
    });

    it("should throw InvalidParamError when order is less than 1", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 0,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError("Ordem", "deve ser maior que 0"),
      );
    });

    it("should throw InvalidParamError when order is negative", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: -1,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError("Ordem", "deve ser maior que 0"),
      );
    });

    it("should throw InvalidParamError when order is greater than 20", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 21,
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new InvalidParamError("Ordem", "não pode ser maior que 20"),
      );
    });

    it("should accept order equal to 1 (minimum value)", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 1,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept order equal to 20 (maximum value)", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "GENERAL",
        order: 20,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should accept order in the middle of range", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "SARGENTO",
        order: 10,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("Success stories", () => {
    it("should validate successfully with completely valid data", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 8,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should validate successfully with single letter abbreviation", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "G",
        order: 20,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });

    it("should validate successfully with numbers and ordinal character", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "3º SGT",
        order: 7,
      };

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe("Validation priority", () => {
    it("should check required fields before business rules", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "", // Empty required field
        order: 25, // Invalid value (but should not reach this validation)
      };

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new MissingParamError("Abreviatura"),
      );
    });
  });

  describe("Uniqueness validation", () => {
    it("should throw DuplicatedKeyError when abbreviation already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 1,
      };

      militaryRankRepository.findByAbbreviation.mockResolvedValueOnce({
        id: "existing-id",
        abbreviation: "CABO",
        order: 2,
      });

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new DuplicatedKeyError("Abreviatura"),
      );
    });

    it("should throw DuplicatedKeyError when order already exists", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "SARGENTO",
        order: 5,
      };

      militaryRankRepository.findByOrder.mockResolvedValueOnce({
        id: "existing-id",
        abbreviation: "SGT",
        order: 5,
      });

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new DuplicatedKeyError("Ordem"),
      );
    });

    it("should check abbreviation uniqueness before order uniqueness", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "CABO",
        order: 5,
      };

      militaryRankRepository.findByAbbreviation.mockResolvedValueOnce({
        id: "existing-id",
        abbreviation: "CABO",
        order: 2,
      });

      militaryRankRepository.findByOrder.mockResolvedValueOnce({
        id: "existing-id-2",
        abbreviation: "SGT",
        order: 5,
      });

      // ACT & ASSERT
      await expect(sut.validate(inputDto)).rejects.toThrow(
        new DuplicatedKeyError("Abreviatura"),
      );

      // ASSERT - findByOrder should not be called due to fail-fast behavior
      expect(militaryRankRepository.findByOrder).not.toHaveBeenCalled();
    });

    it("should pass uniqueness validation when both abbreviation and order are unique", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "NOVO",
        order: 15,
      };

      militaryRankRepository.findByAbbreviation.mockResolvedValueOnce(null);
      militaryRankRepository.findByOrder.mockResolvedValueOnce(null);

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
      expect(militaryRankRepository.findByAbbreviation).toHaveBeenCalledWith(
        "NOVO",
      );
      expect(militaryRankRepository.findByOrder).toHaveBeenCalledWith(15);
    });
  });

  describe("Complete validation flow", () => {
    it("should validate all steps in correct order: required fields -> format -> range -> uniqueness", async () => {
      // ARRANGE
      const { sut, militaryRankRepository } = sutInstance;
      const inputDto: CreateMilitaryRankInputDTO = {
        abbreviation: "VALID",
        order: 10,
      };

      militaryRankRepository.findByAbbreviation.mockResolvedValueOnce(null);
      militaryRankRepository.findByOrder.mockResolvedValueOnce(null);

      // ACT
      const result = sut.validate(inputDto);

      // ASSERT
      await expect(result).resolves.toBeUndefined();
      expect(militaryRankRepository.findByAbbreviation).toHaveBeenCalledWith(
        "VALID",
      );
      expect(militaryRankRepository.findByOrder).toHaveBeenCalledWith(10);
    });
  });
});

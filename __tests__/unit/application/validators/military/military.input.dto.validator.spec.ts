import {
  mockMilitaryRankRepository,
  mockMilitaryRepository,
} from "../../../../../__mocks__/repositories";
import { mockIdValidator } from "../../../../../__mocks__/validators";
import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { IdValidatorProtocol } from "../../../../../src/application/protocols";
import { MilitaryInputDTOValidator } from "../../../../../src/application/validators";
import {
  MilitaryInputDTO,
  MilitaryOutputDTO,
} from "../../../../../src/domain/dtos";
import { MilitaryRank } from "../../../../../src/domain/entities";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../../../src/domain/repositories";

describe("MilitaryInputDTOValidator", () => {
  let sut: MilitaryInputDTOValidator;
  let mockedMilitaryRepository: jest.Mocked<MilitaryRepository>;
  let mockedMilitaryRankRepository: jest.Mocked<MilitaryRankRepository>;
  let mockedIdValidator: jest.Mocked<IdValidatorProtocol>;

  const validInputData: MilitaryInputDTO = {
    militaryRankId: "123e4567-e89b-12d3-a456-426614174000",
    name: "JoaoSilva",
    rg: 1234,
  };

  beforeEach(() => {
    mockedMilitaryRepository = mockMilitaryRepository();
    mockedMilitaryRankRepository = mockMilitaryRankRepository();
    mockedIdValidator = mockIdValidator();

    sut = new MilitaryInputDTOValidator({
      militaryRepository: mockedMilitaryRepository,
      militaryRankRepository: mockedMilitaryRankRepository,
      idValidator: mockedIdValidator,
    });
  });

  describe("constructor", () => {
    it("should create instance with repository and id validator dependencies", () => {
      expect(sut).toBeInstanceOf(MilitaryInputDTOValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validateMilitaryRankIdPresence - private method", () => {
    it("should throw MissingParamError when militaryRankId is null", () => {
      expect(() => {
        (sut as any).validateMilitaryRankIdPresence(null);
      }).toThrow(MissingParamError);
      expect(() => {
        (sut as any).validateMilitaryRankIdPresence(null);
      }).toThrow("O campo Posto/Graduação precisa ser preenchido.");
    });

    it("should throw MissingParamError when militaryRankId is undefined", () => {
      expect(() => {
        (sut as any).validateMilitaryRankIdPresence(undefined);
      }).toThrow(MissingParamError);
    });

    it("should throw MissingParamError when militaryRankId is empty string", () => {
      expect(() => {
        (sut as any).validateMilitaryRankIdPresence("");
      }).toThrow(MissingParamError);
    });

    it("should not throw when militaryRankId is valid", () => {
      expect(() => {
        (sut as any).validateMilitaryRankIdPresence("valid-id");
      }).not.toThrow();
    });
  });

  describe("validate - required fields", () => {
    it("should throw MissingParamError when name is null", async () => {
      const invalidData = {
        ...validInputData,
        name: null as any,
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "O campo Nome precisa ser preenchido.",
      );
    });

    it("should throw MissingParamError when name is undefined", async () => {
      const invalidData = {
        ...validInputData,
        name: undefined as any,
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
    });

    it("should throw MissingParamError when name is empty string", async () => {
      const invalidData = {
        ...validInputData,
        name: "",
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
    });

    it("should throw MissingParamError when name is only spaces", async () => {
      const invalidData = {
        ...validInputData,
        name: "   ",
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
    });

    it("should throw MissingParamError when rg is null", async () => {
      const invalidData = {
        ...validInputData,
        rg: null as any,
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "O campo RG precisa ser preenchido.",
      );
    });

    it("should throw MissingParamError when rg is undefined", async () => {
      const invalidData = {
        ...validInputData,
        rg: undefined as any,
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
    });
  });

  describe("validate - business rules", () => {
    it("should call id validator for militaryRankId", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await sut.validate(validInputData);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        validInputData.militaryRankId,
      );
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id validator fails", async () => {
      const idError = new InvalidParamError("ID", "formato UUID inválido");
      mockedIdValidator.validate.mockImplementation(() => {
        throw idError;
      });

      await expect(sut.validate(validInputData)).rejects.toThrow(idError);
    });

    it("should throw EntityNotFoundError when militaryRankId does not exist", async () => {
      mockedMilitaryRankRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(validInputData)).rejects.toThrow(
        "Posto/Graduação não encontrado(a) com esse ID.",
      );
    });

    it("should throw InvalidParamError when name exceeds 100 characters", async () => {
      const longName = "a".repeat(101);
      const invalidData = {
        ...validInputData,
        name: longName,
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "não pode exceder 100 caracteres",
      );
    });

    it("should accept name with exactly 100 characters", async () => {
      const maxName = "a".repeat(100);
      const validData = {
        ...validInputData,
        name: maxName,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should throw InvalidParamError when name contains spaces", async () => {
      const invalidData = {
        ...validInputData,
        name: "Joao Silva",
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "deve conter apenas letras, acentos e/ou espaços",
      );
    });

    it("should throw InvalidParamError when name contains numbers", async () => {
      const invalidData = {
        ...validInputData,
        name: "Joao123",
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
    });

    it("should throw InvalidParamError when name contains special characters", async () => {
      const invalidData = {
        ...validInputData,
        name: "Joao@Silva",
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
    });

    it("should accept name with only letters", async () => {
      const validData = {
        ...validInputData,
        name: "JoaoSilva",
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should throw InvalidParamError when rg is not an integer", async () => {
      const invalidData = {
        ...validInputData,
        rg: 123.45,
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "deve ser um número inteiro",
      );
    });

    it("should throw InvalidParamError when rg is less than 1", async () => {
      const invalidData = {
        ...validInputData,
        rg: 0,
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "deve ser maior que 0",
      );
    });

    it("should throw InvalidParamError when rg is greater than 9999", async () => {
      const invalidData = {
        ...validInputData,
        rg: 10000,
      };
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "deve ser menor que 9999",
      );
    });

    it("should accept rg equal to 1", async () => {
      const validData = {
        ...validInputData,
        rg: 1,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should accept rg equal to 9999", async () => {
      const validData = {
        ...validInputData,
        rg: 9999,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });
  });

  describe("validate - uniqueness", () => {
    it("should throw DuplicatedKeyError when rg already exists for create", async () => {
      const existingMilitary: MilitaryOutputDTO = {
        id: "existing-id",
        rg: validInputData.rg,
        name: "Existing Military",
        militaryRankId: "existing-rank-id",
        militaryRank: {} as MilitaryRank,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(existingMilitary);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validInputData)).rejects.toThrow(
        DuplicatedKeyError,
      );
      await expect(sut.validate(validInputData)).rejects.toThrow("RG");
    });

    it("should not throw when rg does not exist for create", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validInputData)).resolves.not.toThrow();
    });

    it("should throw DuplicatedKeyError when rg exists for different military in update", async () => {
      const existingMilitary: MilitaryOutputDTO = {
        id: "different-id",
        rg: validInputData.rg,
        name: "Different Military",
        militaryRankId: "different-rank-id",
        militaryRank: {} as MilitaryRank,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(existingMilitary);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      const idToIgnore = "current-military-id";
      await expect(sut.validate(validInputData, idToIgnore)).rejects.toThrow(
        DuplicatedKeyError,
      );
    });

    it("should not throw when rg exists for same military in update", async () => {
      const existingMilitary: MilitaryOutputDTO = {
        id: "same-military-id",
        rg: validInputData.rg,
        name: "Same Military",
        militaryRankId: "same-rank-id",
        militaryRank: {} as MilitaryRank,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(existingMilitary);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      const idToIgnore = "same-military-id";
      await expect(
        sut.validate(validInputData, idToIgnore),
      ).resolves.not.toThrow();
    });

    it("should call findByRg with correct rg", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await sut.validate(validInputData);

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(
        validInputData.rg,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledTimes(1);
    });
  });

  describe("validate - complete validation flow", () => {
    it("should pass all validations for valid data", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validInputData)).resolves.not.toThrow();

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        validInputData.militaryRankId,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(
        validInputData.rg,
      );
    });

    it("should validate in correct order: required fields, business rules, then uniqueness", async () => {
      const invalidData = {
        ...validInputData,
        name: null as any, // Should fail at required fields
      };

      // Mock the repository to return an existing military (should not reach this)
      mockedMilitaryRepository.findByRg.mockResolvedValue({
        id: "existing-id",
        rg: validInputData.rg,
        name: "Existing",
        militaryRankId: "rank-id",
        militaryRank: {} as MilitaryRank,
      });

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );

      // Repository should not be called if required fields fail
      expect(mockedMilitaryRepository.findByRg).not.toHaveBeenCalled();
    });

    it("should validate business rules before uniqueness", async () => {
      const invalidData = {
        ...validInputData,
        rg: 0, // Invalid range
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(invalidData)).rejects.toThrow(
        InvalidParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow(
        "deve ser maior que 0",
      );

      // Repository should not be called if business rules fail
      expect(mockedMilitaryRepository.findByRg).not.toHaveBeenCalled();
    });

    it("should handle repository error during uniqueness validation", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedMilitaryRepository.findByRg.mockRejectedValue(repositoryError);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validInputData)).rejects.toThrow(
        repositoryError,
      );
    });

    it("should handle multiple validation errors - required fields first", async () => {
      const invalidData = {
        ...validInputData,
        name: "", // Missing required field
        rg: 0, // Invalid range
      };

      await expect(sut.validate(invalidData)).rejects.toThrow(
        MissingParamError,
      );
      await expect(sut.validate(invalidData)).rejects.toThrow("Nome");
    });
  });

  describe("validate - edge cases", () => {
    it("should handle name with exactly one character", async () => {
      const validData = {
        ...validInputData,
        name: "A",
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should handle maximum valid rg", async () => {
      const validData = {
        ...validInputData,
        rg: 9999,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should handle minimum valid rg", async () => {
      const validData = {
        ...validInputData,
        rg: 1,
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validData)).resolves.not.toThrow();
    });

    it("should handle repository returning undefined", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(undefined as any);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await expect(sut.validate(validInputData)).resolves.not.toThrow();
    });

    it("should validate all dependencies are called", async () => {
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);
      mockedMilitaryRankRepository.findById.mockResolvedValue(
        {} as MilitaryRank,
      );

      await sut.validate(validInputData);

      expect(mockedIdValidator.validate).toHaveBeenCalled();
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalled();
    });
  });
});

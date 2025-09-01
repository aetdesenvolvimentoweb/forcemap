import {
  mockMilitaryRankRepository,
  mockMilitaryRankInputDTOSanitizer,
  mockMilitaryRankInputDTOValidator,
} from "../../../../../__mocks__";
import { CreateMilitaryRankService } from "../../../../../src/application/services";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";

describe("CreateMilitaryRankService", () => {
  let sut: CreateMilitaryRankService;
  let mockedRepository = mockMilitaryRankRepository();
  let mockedSanitizer = mockMilitaryRankInputDTOSanitizer();
  let mockedValidator = mockMilitaryRankInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateMilitaryRankService({
      militaryRankRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      validator: mockedValidator,
    });
  });

  describe("create", () => {
    const inputData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    const sanitizedData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    it("should create military rank successfully with valid data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await expect(sut.create(inputData)).resolves.not.toThrow();
    });

    it("should call sanitizer with input data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call validator with sanitized data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository create with sanitized data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedRepository.create).toHaveBeenCalledWith(sanitizedData);
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should execute operations in correct order", async () => {
      const executionOrder: string[] = [];

      mockedSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("sanitize");
        return sanitizedData;
      });

      mockedValidator.validate.mockImplementation(async () => {
        executionOrder.push("validate");
      });

      mockedRepository.create.mockImplementation(async () => {
        executionOrder.push("create");
      });

      await sut.create(inputData);

      expect(executionOrder).toEqual(["sanitize", "validate", "create"]);
    });

    it("should use sanitized data for validation and repository", async () => {
      const differentSanitizedData: MilitaryRankInputDTO = {
        abbreviation: "CLEAN",
        order: 15,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(differentSanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(
        differentSanitizedData,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        differentSanitizedData,
      );
    });

    it("should propagate sanitizer exceptions", async () => {
      const sanitizerError = new Error("Sanitization failed");

      mockedSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.create(inputData)).rejects.toThrow(sanitizerError);

      expect(mockedValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate validator exceptions", async () => {
      const validatorError = new Error("Validation failed");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockRejectedValueOnce(validatorError);

      await expect(sut.create(inputData)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockRejectedValueOnce(repositoryError);

      await expect(sut.create(inputData)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should handle empty abbreviation after sanitization", async () => {
      const sanitizedWithEmptyAbbreviation: MilitaryRankInputDTO = {
        abbreviation: "",
        order: 10,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(
        sanitizedWithEmptyAbbreviation,
      );
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedWithEmptyAbbreviation,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        sanitizedWithEmptyAbbreviation,
      );
    });

    it("should handle zero order after sanitization", async () => {
      const sanitizedWithZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 0,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedWithZeroOrder);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedWithZeroOrder,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        sanitizedWithZeroOrder,
      );
    });

    it("should handle special characters in abbreviation", async () => {
      const inputWithSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      const sanitizedSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedSpecialChars);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputWithSpecialChars);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(
        inputWithSpecialChars,
      );
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedSpecialChars,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        sanitizedSpecialChars,
      );
    });

    it("should not return any value", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      const result = await sut.create(inputData);

      expect(result).toBeUndefined();
    });

    it("should handle concurrent calls independently", async () => {
      const data1: MilitaryRankInputDTO = { abbreviation: "CEL", order: 10 };
      const data2: MilitaryRankInputDTO = { abbreviation: "MAJ", order: 8 };

      const sanitized1: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 10,
      };
      const sanitized2: MilitaryRankInputDTO = {
        abbreviation: "MAJ",
        order: 8,
      };

      mockedSanitizer.sanitize
        .mockReturnValueOnce(sanitized1)
        .mockReturnValueOnce(sanitized2);

      mockedValidator.validate.mockResolvedValueOnce().mockResolvedValueOnce();

      mockedRepository.create.mockResolvedValueOnce().mockResolvedValueOnce();

      await Promise.all([sut.create(data1), sut.create(data2)]);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedRepository.create).toHaveBeenCalledTimes(2);

      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(1, data1);
      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(2, data2);
    });
  });
});

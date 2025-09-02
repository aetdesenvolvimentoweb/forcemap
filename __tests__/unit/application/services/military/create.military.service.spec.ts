import {
  mockMilitaryRepository,
  mockMilitaryInputDTOSanitizer,
  mockMilitaryInputDTOValidator,
} from "../../../../../__mocks__";
import { CreateMilitaryService } from "../../../../../src/application/services";
import { MilitaryInputDTO } from "../../../../../src/domain/dtos";

describe("CreateMilitaryService", () => {
  let sut: CreateMilitaryService;
  let mockedRepository = mockMilitaryRepository();
  let mockedSanitizer = mockMilitaryInputDTOSanitizer();
  let mockedValidator = mockMilitaryInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateMilitaryService({
      militaryRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      validator: mockedValidator,
    });
  });

  describe("create", () => {
    const inputData: MilitaryInputDTO = {
      militaryRankId: "military-rank-id-1",
      rg: 123456789,
      name: "João Silva",
    };

    const sanitizedData: MilitaryInputDTO = {
      militaryRankId: "military-rank-id-1",
      rg: 123456789,
      name: "João Silva",
    };

    it("should create military successfully with valid data", async () => {
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
      const differentSanitizedData: MilitaryInputDTO = {
        militaryRankId: "clean-military-rank-id",
        rg: 987654321,
        name: "Maria Santos",
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

    it("should handle empty name after sanitization", async () => {
      const sanitizedWithEmptyName: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 123456789,
        name: "",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedWithEmptyName);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedWithEmptyName,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        sanitizedWithEmptyName,
      );
    });

    it("should handle zero rg after sanitization", async () => {
      const sanitizedWithZeroRg: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 0,
        name: "João Silva",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedWithZeroRg);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedWithZeroRg,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(sanitizedWithZeroRg);
    });

    it("should handle special characters in name", async () => {
      const inputWithSpecialChars: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 123456789,
        name: "José da Silva Júnior",
      };

      const sanitizedSpecialChars: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 123456789,
        name: "José da Silva Júnior",
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
      const data1: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 111111111,
        name: "João Silva",
      };
      const data2: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-2",
        rg: 222222222,
        name: "Maria Santos",
      };

      const sanitized1: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-1",
        rg: 111111111,
        name: "João Silva",
      };
      const sanitized2: MilitaryInputDTO = {
        militaryRankId: "military-rank-id-2",
        rg: 222222222,
        name: "Maria Santos",
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

    it("should handle different military rank ids", async () => {
      const inputWithDifferentRankId: MilitaryInputDTO = {
        militaryRankId: "different-military-rank-id",
        rg: 555555555,
        name: "Carlos Oliveira",
      };

      const sanitizedWithDifferentRankId: MilitaryInputDTO = {
        militaryRankId: "different-military-rank-id",
        rg: 555555555,
        name: "Carlos Oliveira",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(
        sanitizedWithDifferentRankId,
      );
      mockedValidator.validate.mockResolvedValueOnce();
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputWithDifferentRankId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(
        inputWithDifferentRankId,
      );
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedWithDifferentRankId,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        sanitizedWithDifferentRankId,
      );
    });
  });
});

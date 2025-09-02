import {
  mockMilitaryRepository,
  mockIdSanitizer,
  mockIdValidator,
  mockMilitaryIdRegisteredValidator,
} from "../../../../../__mocks__";
import { FindByIdMilitaryService } from "../../../../../src/application/services";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";

describe("FindByIdMilitaryService", () => {
  let sut: FindByIdMilitaryService;
  let mockedRepository = mockMilitaryRepository();
  let mockedSanitizer = mockIdSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockMilitaryIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdMilitaryService({
      militaryRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
    });
  });

  describe("findById", () => {
    const inputId = "military-id-123";
    const sanitizedId = "clean-military-id-123";

    const mockMilitaryOutput: MilitaryOutputDTO = {
      id: "military-id-123",
      militaryRankId: "rank-id-1",
      militaryRank: {
        id: "rank-id-1",
        abbreviation: "CEL",
        order: 10,
      },
      rg: 123456789,
      name: "João Silva",
    };

    it("should find military by id successfully", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      const result = await sut.findById(inputId);

      expect(result).toEqual(mockMilitaryOutput);
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      await sut.findById(inputId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      await sut.findById(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      await sut.findById(inputId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository findById with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      await sut.findById(inputId);

      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should execute operations in correct order", async () => {
      const executionOrder: string[] = [];

      mockedSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("sanitize");
        return sanitizedId;
      });

      mockedIdValidator.validate.mockImplementation(() => {
        executionOrder.push("idValidate");
      });

      mockedIdRegisteredValidator.validate.mockImplementation(async () => {
        executionOrder.push("idRegisteredValidate");
      });

      mockedRepository.findById.mockImplementation(async () => {
        executionOrder.push("findById");
        return mockMilitaryOutput;
      });

      await sut.findById(inputId);

      expect(executionOrder).toEqual([
        "sanitize",
        "idValidate",
        "idRegisteredValidate",
        "findById",
      ]);
    });

    it("should use sanitized id for all validations and repository", async () => {
      const differentSanitizedId = "different-clean-id";

      mockedSanitizer.sanitize.mockReturnValueOnce(differentSanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockMilitaryOutput);

      await sut.findById(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedRepository.findById).toHaveBeenCalledWith(
        differentSanitizedId,
      );
    });

    it("should propagate sanitizer exceptions", async () => {
      const sanitizerError = new Error("Sanitization failed");

      mockedSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.findById(inputId)).rejects.toThrow(sanitizerError);

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Invalid ID format");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.findById(inputId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate id registered validator exceptions", async () => {
      const registeredValidatorError = new Error("Military not found");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.findById(inputId)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockRejectedValueOnce(repositoryError);

      await expect(sut.findById(inputId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should return null when military is not found", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(null);

      const result = await sut.findById(inputId);

      expect(result).toBeNull();
    });

    it("should handle empty string after sanitization", async () => {
      const emptySanitizedId = "";

      mockedSanitizer.sanitize.mockReturnValueOnce(emptySanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(null);

      await sut.findById(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(emptySanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        emptySanitizedId,
      );
      expect(mockedRepository.findById).toHaveBeenCalledWith(emptySanitizedId);
    });

    it("should handle concurrent calls independently", async () => {
      const id1 = "military-id-1";
      const id2 = "military-id-2";
      const sanitized1 = "clean-id-1";
      const sanitized2 = "clean-id-2";

      const military1: MilitaryOutputDTO = {
        ...mockMilitaryOutput,
        id: id1,
        name: "João Silva",
      };

      const military2: MilitaryOutputDTO = {
        ...mockMilitaryOutput,
        id: id2,
        name: "Maria Santos",
      };

      mockedSanitizer.sanitize
        .mockReturnValueOnce(sanitized1)
        .mockReturnValueOnce(sanitized2);

      mockedIdValidator.validate.mockReturnValueOnce().mockReturnValueOnce();

      mockedIdRegisteredValidator.validate
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      mockedRepository.findById
        .mockResolvedValueOnce(military1)
        .mockResolvedValueOnce(military2);

      const results = await Promise.all([sut.findById(id1), sut.findById(id2)]);

      expect(results).toEqual([military1, military2]);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(2);

      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(1, id1);
      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(2, id2);
    });

    it("should handle UUID format ids", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      const sanitizedUuidId = "550e8400-e29b-41d4-a716-446655440000";

      const uuidMilitary: MilitaryOutputDTO = {
        ...mockMilitaryOutput,
        id: uuidId,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUuidId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(uuidMilitary);

      const result = await sut.findById(uuidId);

      expect(result).toEqual(uuidMilitary);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(uuidId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUuidId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedUuidId,
      );
      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedUuidId);
    });

    it("should return military with complete data structure", async () => {
      const completeMilitary: MilitaryOutputDTO = {
        id: "complete-military-id",
        militaryRankId: "rank-id-complete",
        militaryRank: {
          id: "rank-id-complete",
          abbreviation: "1º SGT",
          order: 5,
        },
        rg: 987654321,
        name: "Maria Aparecida Silva Santos",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(completeMilitary);

      const result = await sut.findById(inputId);

      expect(result).toEqual(completeMilitary);
      expect(result?.militaryRank).toBeDefined();
      expect(result?.militaryRank.abbreviation).toBe("1º SGT");
      expect(result?.militaryRank.order).toBe(5);
    });
  });
});

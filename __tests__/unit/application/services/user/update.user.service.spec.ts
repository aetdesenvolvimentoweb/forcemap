import {
  mockIdSanitizer,
  mockIdValidator,
  mockUserIdRegisteredValidator,
  mockUserInputDTOSanitizer,
  mockUserInputDTOValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { UpdateUserService } from "../../../../../src/application/services";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("UpdateUserService", () => {
  let sut: UpdateUserService;
  let mockedRepository = mockUserRepository();
  let mockedIdSanitizer = mockIdSanitizer();
  let mockedDataSanitizer = mockUserInputDTOSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockUserIdRegisteredValidator();
  let mockedDataValidator = mockUserInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateUserService({
      userRepository: mockedRepository,
      idSanitizer: mockedIdSanitizer,
      dataSanitizer: mockedDataSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
      dataValidator: mockedDataValidator,
    });
  });

  describe("update", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const sanitizedId = "123e4567-e89b-12d3-a456-426614174000";

    const inputData: UserInputDTO = {
      militaryId: "military-id-456",
      role: UserRole.CHEFE,
      password: "UpdatedPass@456",
    };

    const sanitizedData: UserInputDTO = {
      militaryId: "military-id-456",
      role: UserRole.CHEFE,
      password: "UpdatedPass@456",
    };

    it("should update user successfully with valid data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await expect(sut.update(validId, inputData)).resolves.not.toThrow();
    });

    it("should call id sanitizer with input id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call data sanitizer with input data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call data validator with sanitized data and id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedId,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository update with sanitized id and data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should call all dependencies exactly once", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id sanitizer throws", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedIdSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        sanitizerError,
      );

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when id validator throws", async () => {
      const validatorError = new Error("Invalid UUID format");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        validatorError,
      );

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
    });

    it("should throw error when id registered validator throws", async () => {
      const registeredValidatorError = new Error("User not found");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
    });

    it("should throw error when data sanitizer throws", async () => {
      const dataSanitizerError = new Error("Data sanitization failed");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockImplementationOnce(() => {
        throw dataSanitizerError;
      });

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        dataSanitizerError,
      );

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when data validator throws", async () => {
      const dataValidatorError = new Error("Invalid user data");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockRejectedValueOnce(dataValidatorError);

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        dataValidatorError,
      );

      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedId,
      );
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Database update failed");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockRejectedValueOnce(repositoryError);

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        repositoryError,
      );

      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
    });

    it("should handle different user roles in update", async () => {
      for (const role of Object.values(UserRole)) {
        const testData: UserInputDTO = {
          ...inputData,
          role,
        };

        const testSanitizedData: UserInputDTO = {
          ...sanitizedData,
          role,
        };

        mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockedIdValidator.validate.mockReturnValueOnce();
        mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
        mockedDataSanitizer.sanitize.mockReturnValueOnce(testSanitizedData);
        mockedDataValidator.validate.mockResolvedValueOnce();
        mockedRepository.update.mockResolvedValueOnce();

        await expect(sut.update(validId, testData)).resolves.not.toThrow();

        expect(mockedRepository.update).toHaveBeenCalledWith(
          sanitizedId,
          testSanitizedData,
        );
      }

      expect(mockedRepository.update).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should handle async validation", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockReturnValueOnce(validationPromise);
      mockedRepository.update.mockResolvedValueOnce();

      const updatePromise = sut.update(validId, inputData);

      // Validation should not complete immediately
      let isResolved = false;
      updatePromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockedRepository.update).not.toHaveBeenCalled();

      // Now resolve the validation
      resolveValidation!();

      await expect(updatePromise).resolves.not.toThrow();
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
    });

    it("should handle complex data updates", async () => {
      const complexData: UserInputDTO = {
        militaryId: "complex-military-id-789",
        role: UserRole.ADMIN,
        password: "VeryComplexPassword@2024!",
      };

      const complexSanitizedData: UserInputDTO = {
        militaryId: "sanitized-complex-military-id-789",
        role: UserRole.ADMIN,
        password: "sanitized-complex-password",
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(complexSanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await expect(sut.update(validId, complexData)).resolves.not.toThrow();

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(complexData);
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        complexSanitizedData,
      );
    });

    it("should validate data with correct idToIgnore parameter", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(validId, inputData);

      // The data validator should receive the sanitizedId as idToIgnore parameter
      // to avoid validating uniqueness against the user being updated
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedId,
      );
    });

    it("should handle empty data after sanitization", async () => {
      const emptySanitizedData: UserInputDTO = {
        militaryId: "",
        role: UserRole.BOMBEIRO,
        password: "",
      };

      const validationError = new Error("Military ID and password required");
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(emptySanitizedData);
      mockedDataValidator.validate.mockRejectedValueOnce(validationError);

      await expect(sut.update(validId, inputData)).rejects.toThrow(
        validationError,
      );

      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        emptySanitizedData,
        sanitizedId,
      );
    });
  });
});

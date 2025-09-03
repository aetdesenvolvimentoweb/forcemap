import {
  mockIdSanitizer,
  mockIdValidator,
  mockUserIdRegisteredValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { DeleteUserService } from "../../../../../src/application/services";

describe("DeleteUserService", () => {
  let sut: DeleteUserService;
  let mockedRepository = mockUserRepository();
  let mockedSanitizer = mockIdSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockUserIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteUserService({
      userRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
    });
  });

  describe("delete", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const sanitizedId = "123e4567-e89b-12d3-a456-426614174000";

    it("should delete user successfully with valid id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await expect(sut.delete(validId)).resolves.not.toThrow();
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(validId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(validId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(validId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository delete with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(validId);

      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should call all dependencies exactly once", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(validId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitizer throws", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.delete(validId)).rejects.toThrow(sanitizerError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when id validator throws", async () => {
      const validatorError = new Error("Invalid UUID format");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.delete(validId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when id registered validator throws", async () => {
      const registeredValidatorError = new Error("User not found");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.delete(validId)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockRejectedValueOnce(repositoryError);

      await expect(sut.delete(validId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedId);
    });

    it("should handle empty string id", async () => {
      const emptyId = "";
      const sanitizedEmptyId = "";
      const validatorError = new Error("ID cannot be empty");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedEmptyId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.delete(emptyId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(emptyId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedEmptyId);
    });

    it("should handle whitespace-only id", async () => {
      const whitespaceId = "   ";
      const sanitizedWhitespaceId = "";
      const validatorError = new Error("ID cannot be empty");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedWhitespaceId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.delete(whitespaceId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(whitespaceId);
    });

    it("should handle malformed UUID", async () => {
      const malformedId = "not-a-uuid";
      const validatorError = new Error("Invalid UUID format");

      mockedSanitizer.sanitize.mockReturnValueOnce(malformedId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.delete(malformedId)).rejects.toThrow(validatorError);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(malformedId);
    });

    it("should handle non-existent user id", async () => {
      const nonExistentId = "non-existent-uuid";
      const notFoundError = new Error("User not found");

      mockedSanitizer.sanitize.mockReturnValueOnce(nonExistentId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(notFoundError);

      await expect(sut.delete(nonExistentId)).rejects.toThrow(notFoundError);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        nonExistentId,
      );
    });

    it("should handle async validation", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockReturnValueOnce(
        validationPromise,
      );
      mockedRepository.delete.mockResolvedValueOnce();

      const deletePromise = sut.delete(validId);

      // Validation should not complete immediately
      let isResolved = false;
      deletePromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockedRepository.delete).not.toHaveBeenCalled();

      // Now resolve the validation
      resolveValidation!();

      await expect(deletePromise).resolves.not.toThrow();
      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedId);
    });

    it("should handle multiple delete operations", async () => {
      const ids = ["id1", "id2", "id3"];
      const sanitizedIds = ["id1", "id2", "id3"];

      for (let i = 0; i < ids.length; i++) {
        mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedIds[i]);
        mockedIdValidator.validate.mockReturnValueOnce();
        mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
        mockedRepository.delete.mockResolvedValueOnce();

        await expect(sut.delete(ids[i])).resolves.not.toThrow();
      }

      expect(mockedRepository.delete).toHaveBeenCalledTimes(ids.length);
      ids.forEach((id, index) => {
        expect(mockedRepository.delete).toHaveBeenNthCalledWith(
          index + 1,
          sanitizedIds[index],
        );
      });
    });
  });
});

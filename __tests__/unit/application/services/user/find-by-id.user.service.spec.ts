import {
  mockIdSanitizer,
  mockIdValidator,
  mockUserIdRegisteredValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { FindByIdUserService } from "../../../../../src/application/services";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("FindByIdUserService", () => {
  let sut: FindByIdUserService;
  let mockedRepository = mockUserRepository();
  let mockedSanitizer = mockIdSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockUserIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdUserService({
      userRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
    });
  });

  describe("findById", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";
    const sanitizedId = "123e4567-e89b-12d3-a456-426614174000";

    const mockUserOutput: UserOutputDTO = {
      id: validId,
      role: UserRole.ADMIN,
      military: {
        id: "military-id",
        name: "João Silva",
        rg: 1234,
        militaryRank: {
          id: "rank-id",
          abbreviation: "SGT",
          order: 5,
        },
      },
    };

    it("should find user successfully with valid id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      const result = await sut.findById(validId);

      expect(result).toEqual(mockUserOutput);
    });

    it("should return null when user is not found", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(null);

      const result = await sut.findById(validId);

      expect(result).toBeNull();
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      await sut.findById(validId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      await sut.findById(validId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      await sut.findById(validId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository findById with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      await sut.findById(validId);

      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should call all dependencies exactly once", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      await sut.findById(validId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitizer throws", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.findById(validId)).rejects.toThrow(sanitizerError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error when id validator throws", async () => {
      const validatorError = new Error("Invalid UUID format");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.findById(validId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error when id registered validator throws", async () => {
      const registeredValidatorError = new Error("User not found");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.findById(validId)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockRejectedValueOnce(repositoryError);

      await expect(sut.findById(validId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(validId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedId);
    });

    it("should return user with different roles", async () => {
      for (const role of Object.values(UserRole)) {
        const userWithRole: UserOutputDTO = {
          ...mockUserOutput,
          role,
        };

        mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockedIdValidator.validate.mockReturnValueOnce();
        mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
        mockedRepository.findById.mockResolvedValueOnce(userWithRole);

        const result = await sut.findById(validId);

        expect(result).toEqual(userWithRole);
        expect(result?.role).toBe(role);
      }

      expect(mockedRepository.findById).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should handle complex user data structure", async () => {
      const complexUser: UserOutputDTO = {
        id: "complex-user-id-456",
        role: UserRole.CHEFE,
        military: {
          id: "complex-military-id",
          name: "Complex Military Name",
          rg: 9999,
          militaryRank: {
            id: "complex-rank-id",
            abbreviation: "CEL",
            order: 10,
          },
        },
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(complexUser);

      const result = await sut.findById(validId);

      expect(result).toEqual(complexUser);
      expect(result?.military.name).toBe("Complex Military Name");
      expect(result?.military.militaryRank.abbreviation).toBe("CEL");
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
      mockedRepository.findById.mockResolvedValueOnce(mockUserOutput);

      const findPromise = sut.findById(validId);

      // Validation should not complete immediately
      let isResolved = false;
      findPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockedRepository.findById).not.toHaveBeenCalled();

      // Now resolve the validation
      resolveValidation!();

      const result = await findPromise;
      expect(result).toEqual(mockUserOutput);
      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedId);
    });

    it("should preserve user data integrity", async () => {
      const originalUser: UserOutputDTO = {
        id: "integrity-test-id",
        role: UserRole.BOMBEIRO,
        military: {
          id: "military-integrity-id",
          name: "Integrity Test User",
          rg: 7777,
          militaryRank: {
            id: "rank-integrity-id",
            abbreviation: "SD",
            order: 1,
          },
        },
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(originalUser);

      const result = await sut.findById(validId);

      // Ensure the returned object is exactly the same
      expect(result).toEqual(originalUser);
      expect(result).toBe(originalUser); // Same reference
    });

    it("should handle multiple consecutive finds", async () => {
      const users = [
        { ...mockUserOutput, id: "user1", role: UserRole.ADMIN },
        { ...mockUserOutput, id: "user2", role: UserRole.CHEFE },
        { ...mockUserOutput, id: "user3", role: UserRole.BOMBEIRO },
      ];

      for (let i = 0; i < users.length; i++) {
        mockedSanitizer.sanitize.mockReturnValueOnce(`user${i + 1}`);
        mockedIdValidator.validate.mockReturnValueOnce();
        mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
        mockedRepository.findById.mockResolvedValueOnce(users[i]);

        const result = await sut.findById(`user${i + 1}`);

        expect(result).toEqual(users[i]);
      }

      expect(mockedRepository.findById).toHaveBeenCalledTimes(users.length);
    });

    it("should handle undefined repository response", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedRepository.findById.mockResolvedValueOnce(undefined as any);

      const result = await sut.findById(validId);

      expect(result).toBeUndefined();
    });
  });
});

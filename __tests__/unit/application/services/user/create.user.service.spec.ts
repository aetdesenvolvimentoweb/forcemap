import {
  mockPasswordHasher,
  mockUserRepository,
} from "../../../../../__mocks__";
import { CreateUserService } from "../../../../../src/application/services";
import {
  UserSanitizationService,
  UserValidationService,
} from "../../../../../src/application/services/user";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("CreateUserService", () => {
  let sut: CreateUserService;
  let mockedRepository = mockUserRepository();
  let mockedUserValidationService: jest.Mocked<UserValidationService>;
  let mockedSanitization: jest.Mocked<UserSanitizationService>;
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUserValidationService = {
      validateUserCreation: jest.fn(),
      validateUserPasswordUpdate: jest.fn(),
      validateUserRoleUpdate: jest.fn(),
      validateUserDeletion: jest.fn(),
      validateUserId: jest.fn(),
      validateUserIdExists: jest.fn(),
    } as any;

    mockedSanitization = {
      sanitizeId: jest.fn(),
      sanitizeUserCreation: jest.fn(),
      sanitizeUserCredentials: jest.fn(),
      sanitizePasswordUpdate: jest.fn(),
      sanitizeRoleUpdate: jest.fn(),
    } as any;

    sut = new CreateUserService({
      repository: mockedRepository,
      validation: mockedUserValidationService,
      sanitization: mockedSanitization,
      passwordHasher: mockedPasswordHasher,
    });
  });

  describe("create", () => {
    const mockUserInput: UserInputDTO = {
      militaryId: "military-id-123",
      role: UserRole.ADMIN,
      password: "plainTextPassword123",
    };

    const mockSanitizedData: UserInputDTO = {
      militaryId: "sanitized-military-id-123",
      role: UserRole.ADMIN,
      password: "sanitizedPassword123",
    };

    const hashedPassword = "hashedPassword123!@#";

    it("should create user successfully with all steps", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledWith(mockSanitizedData);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith({
        ...mockSanitizedData,
        password: hashedPassword,
      });
    });

    it("should call sanitization with input data", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledTimes(1);
    });

    it("should call validation with sanitized data", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledWith(mockSanitizedData);
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledTimes(1);
    });

    it("should call password hasher with sanitized password", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(1);
    });

    it("should call repository create with hashed password", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      const expectedData = {
        ...mockSanitizedData,
        password: hashedPassword,
      };
      expect(mockedRepository.create).toHaveBeenCalledWith(expectedData);
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call all dependencies exactly once in correct order", async () => {
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledTimes(1);
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledTimes(1);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(1);
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitization throws", async () => {
      const sanitizationError = new Error("Sanitization failed");
      mockedSanitization.sanitizeUserCreation.mockImplementation(() => {
        throw sanitizationError;
      });

      await expect(sut.create(mockUserInput)).rejects.toThrow(
        sanitizationError,
      );

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(
        mockedUserValidationService.validateUserCreation,
      ).not.toHaveBeenCalled();
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when validation throws", async () => {
      const validationError = new Error("Validation failed");
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockRejectedValue(
        validationError,
      );

      await expect(sut.create(mockUserInput)).rejects.toThrow(validationError);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledWith(mockSanitizedData);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when password hasher throws", async () => {
      const hasherError = new Error("Password hashing failed");
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockRejectedValue(hasherError);

      await expect(sut.create(mockUserInput)).rejects.toThrow(hasherError);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledWith(mockSanitizedData);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockRejectedValue(repositoryError);

      await expect(sut.create(mockUserInput)).rejects.toThrow(repositoryError);

      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(
        mockedUserValidationService.validateUserCreation,
      ).toHaveBeenCalledWith(mockSanitizedData);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith({
        ...mockSanitizedData,
        password: hashedPassword,
      });
    });

    it("should handle different user roles", async () => {
      for (const role of Object.values(UserRole)) {
        const userWithRole: UserInputDTO = {
          ...mockUserInput,
          role,
        };
        const sanitizedUserWithRole: UserInputDTO = {
          ...mockSanitizedData,
          role,
        };

        mockedSanitization.sanitizeUserCreation.mockReturnValue(
          sanitizedUserWithRole,
        );
        mockedUserValidationService.validateUserCreation.mockResolvedValue(
          undefined,
        );
        mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
        mockedRepository.create.mockResolvedValue(undefined);

        await sut.create(userWithRole);

        expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
          userWithRole,
        );
        expect(mockedRepository.create).toHaveBeenCalledWith({
          ...sanitizedUserWithRole,
          password: hashedPassword,
        });
      }

      expect(mockedRepository.create).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should preserve data integrity during transformation", async () => {
      const specificUserInput: UserInputDTO = {
        militaryId: "specific-military-id",
        role: UserRole.CHEFE,
        password: "specificPassword123",
      };

      const specificSanitizedData: UserInputDTO = {
        militaryId: "sanitized-specific-military-id",
        role: UserRole.CHEFE,
        password: "sanitizedSpecificPassword123",
      };

      const specificHashedPassword = "specificHashedPassword!@#$";

      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        specificSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(specificHashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(specificUserInput);

      expect(mockedRepository.create).toHaveBeenCalledWith({
        militaryId: "sanitized-specific-military-id",
        role: UserRole.CHEFE,
        password: specificHashedPassword,
      });
    });

    it("should handle async operations properly", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      let resolveHashing: (value: string) => void;
      const hashingPromise = new Promise<string>((resolve) => {
        resolveHashing = resolve;
      });

      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockReturnValue(
        validationPromise,
      );
      mockedPasswordHasher.hash.mockReturnValue(hashingPromise);
      mockedRepository.create.mockResolvedValue(undefined);

      const createPromise = sut.create(mockUserInput);

      // Validation should not complete immediately
      let isResolved = false;
      createPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();

      // Resolve validation
      resolveValidation!();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );

      // Hash should not complete immediately
      expect(isResolved).toBe(false);
      expect(mockedRepository.create).not.toHaveBeenCalled();

      // Now resolve hashing
      resolveHashing!(hashedPassword);

      await createPromise;
      expect(mockedRepository.create).toHaveBeenCalledWith({
        ...mockSanitizedData,
        password: hashedPassword,
      });
    });

    it("should handle multiple consecutive user creations", async () => {
      const users = [
        { ...mockUserInput, militaryId: "military1", role: UserRole.ADMIN },
        { ...mockUserInput, militaryId: "military2", role: UserRole.CHEFE },
        { ...mockUserInput, militaryId: "military3", role: UserRole.BOMBEIRO },
      ];

      for (let i = 0; i < users.length; i++) {
        const sanitizedUser = { ...users[i], password: `sanitized-${i}` };
        const hashedPass = `hashed-${i}`;

        mockedSanitization.sanitizeUserCreation.mockReturnValueOnce(
          sanitizedUser,
        );
        mockedUserValidationService.validateUserCreation.mockResolvedValueOnce(
          undefined,
        );
        mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPass);
        mockedRepository.create.mockResolvedValueOnce(undefined);

        await sut.create(users[i]);

        expect(mockedRepository.create).toHaveBeenLastCalledWith({
          ...sanitizedUser,
          password: hashedPass,
        });
      }

      expect(mockedRepository.create).toHaveBeenCalledTimes(users.length);
    });

    it("should not modify original input data", async () => {
      const originalInput: UserInputDTO = {
        militaryId: "original-military-id",
        role: UserRole.BOMBEIRO,
        password: "originalPassword",
      };
      const inputCopy = { ...originalInput };

      mockedSanitization.sanitizeUserCreation.mockReturnValue(
        mockSanitizedData,
      );
      mockedUserValidationService.validateUserCreation.mockResolvedValue(
        undefined,
      );
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(originalInput);

      // Original input should remain unchanged
      expect(originalInput).toEqual(inputCopy);
      expect(mockedSanitization.sanitizeUserCreation).toHaveBeenCalledWith(
        originalInput,
      );
    });
  });
});

import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { PasswordHasherProtocol } from "../../../../../src/application/protocols";
import { UpdateUserPasswordService } from "../../../../../src/application/services/user";
import {
  UserSanitizationService,
  UserValidationService,
} from "../../../../../src/application/services/user";
import { UserDomainServices } from "../../../../../src/application/services/user/user-domain-services.interface";
import { UpdateUserInputDTO } from "../../../../../src/domain/dtos";
import { User, UserRole } from "../../../../../src/domain/entities";
import { UserRepository } from "../../../../../src/domain/repositories";

describe("UpdateUserPasswordService", () => {
  let sut: UpdateUserPasswordService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockValidation: jest.Mocked<UserValidationService>;
  let mockSanitization: jest.Mocked<UserSanitizationService>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherProtocol>;
  let mockDependencies: UserDomainServices;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findByMilitaryId: jest.fn(),
      findByMilitaryIdWithPassword: jest.fn(),
      listAll: jest.fn(),
      updateUserPassword: jest.fn(),
      updateUserRole: jest.fn(),
      delete: jest.fn(),
    };

    mockValidation = {
      validateUserCreation: jest.fn(),
      validateUserPasswordUpdate: jest.fn(),
      validateUserRoleUpdate: jest.fn(),
      validateUserDeletion: jest.fn(),
      validateUserId: jest.fn(),
      validateUserIdExists: jest.fn(),
    } as any;

    mockSanitization = {
      sanitizeId: jest.fn(),
      sanitizeUserCreation: jest.fn(),
      sanitizeUserCredentials: jest.fn(),
      sanitizePasswordUpdate: jest.fn(),
      sanitizeRoleUpdate: jest.fn(),
    } as any;

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockDependencies = {
      repository: mockUserRepository,
      validation: mockValidation,
      sanitization: mockSanitization,
      passwordHasher: mockPasswordHasher,
    };

    sut = new UpdateUserPasswordService(mockDependencies);
  });

  describe("updateUserPassword", () => {
    const mockId = "  user-id-123  ";
    const mockUpdateData: UpdateUserInputDTO = {
      currentPassword: "  CurrentPass123!  ",
      newPassword: "  NewPassword456!  ",
    };

    const sanitizedId = "user-id-123";
    const sanitizedData: UpdateUserInputDTO = {
      currentPassword: "CurrentPass123!",
      newPassword: "NewPassword456!",
    };

    const mockUser: User = {
      id: sanitizedId,
      militaryId: "military-123",
      role: UserRole.ADMIN,
      password: "hashedCurrentPassword",
    };

    const hashedNewPassword = "hashedNewPassword456!";

    it("should execute all steps in correct sequence when successful", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(mockId, mockUpdateData);

      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should call all dependencies exactly once", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(mockId, mockUpdateData);

      expect(mockSanitization.sanitizeId).toHaveBeenCalledTimes(1);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledTimes(1);
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledTimes(1);
      expect(mockPasswordHasher.compare).toHaveBeenCalledTimes(1);
      expect(mockPasswordHasher.hash).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledTimes(1);
    });

    it("should complete successfully when all operations pass", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).resolves.toBeUndefined();
    });

    it("should use sanitized data for validation and operations", async () => {
      const specificSanitizedId = "specific-sanitized-id";
      const specificSanitizedData: UpdateUserInputDTO = {
        currentPassword: "SpecificCurrentPass!",
        newPassword: "SpecificNewPass!",
      };

      mockSanitization.sanitizeId.mockReturnValue(specificSanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(
        specificSanitizedData,
      );
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(mockId, mockUpdateData);

      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        specificSanitizedId,
        specificSanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        specificSanitizedId,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        specificSanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        specificSanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        specificSanitizedId,
        {
          ...specificSanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should throw error when validation throws", async () => {
      const validationError = new Error("Validation failed");
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockRejectedValue(
        validationError,
      );

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).rejects.toThrow(validationError);

      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).not.toHaveBeenCalled();
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw EntityNotFoundError when user not found", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).rejects.toThrow(new EntityNotFoundError("Usuário"));

      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw InvalidParamError when current password doesn't match", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).rejects.toThrow(new InvalidParamError("Senha atual", "incorreta"));

      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw error when password hashing throws", async () => {
      const hashingError = new Error("Hashing failed");
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockRejectedValue(hashingError);

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).rejects.toThrow(hashingError);

      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw error when repository update throws", async () => {
      const repositoryError = new Error("Database error");
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockRejectedValue(repositoryError);

      await expect(
        sut.updateUserPassword(mockId, mockUpdateData),
      ).rejects.toThrow(repositoryError);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should handle different password scenarios", async () => {
      const passwordScenarios = [
        {
          current: "Simple123!",
          new: "Complex@New#Pass456!",
          userStoredPassword: "hashedSimple123!",
          expectedHashedNew: "hashedComplex@New#Pass456!",
        },
        {
          current: "AnotherPass789@",
          new: "YetAnotherNew999#",
          userStoredPassword: "hashedAnotherPass789@",
          expectedHashedNew: "hashedYetAnotherNew999#",
        },
      ];

      for (const scenario of passwordScenarios) {
        const testData: UpdateUserInputDTO = {
          currentPassword: scenario.current,
          newPassword: scenario.new,
        };
        const testUser: User = {
          ...mockUser,
          password: scenario.userStoredPassword,
        };

        mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
        mockSanitization.sanitizePasswordUpdate.mockReturnValue(testData);
        mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
        mockUserRepository.findByIdWithPassword.mockResolvedValue(testUser);
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockPasswordHasher.hash.mockResolvedValue(scenario.expectedHashedNew);
        mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

        await sut.updateUserPassword(mockId, testData);

        expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
          scenario.current,
          scenario.userStoredPassword,
        );
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith(scenario.new);
        expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
          sanitizedId,
          {
            ...testData,
            newPassword: scenario.expectedHashedNew,
          },
        );
      }
    });

    it("should handle different user types", async () => {
      const userTypes = [
        { ...mockUser, role: UserRole.ADMIN, militaryId: "admin-123" },
        { ...mockUser, role: UserRole.CHEFE, militaryId: "chefe-456" },
        { ...mockUser, role: UserRole.BOMBEIRO, militaryId: "bombeiro-789" },
      ];

      for (const user of userTypes) {
        mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
        mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
        mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
        mockUserRepository.findByIdWithPassword.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
        mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

        await sut.updateUserPassword(mockId, mockUpdateData);

        expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
          sanitizedData.currentPassword,
          user.password,
        );
        expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
          sanitizedId,
          {
            ...sanitizedData,
            newPassword: hashedNewPassword,
          },
        );
      }
    });

    it("should handle async operations properly", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      let resolveFindUser: (user: User) => void;
      const findUserPromise = new Promise<User>((resolve) => {
        resolveFindUser = resolve;
      });

      let resolveCompare: (match: boolean) => void;
      const comparePromise = new Promise<boolean>((resolve) => {
        resolveCompare = resolve;
      });

      let resolveHash: (hash: string) => void;
      const hashPromise = new Promise<string>((resolve) => {
        resolveHash = resolve;
      });

      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockReturnValue(
        validationPromise,
      );
      mockUserRepository.findByIdWithPassword.mockReturnValue(findUserPromise);
      mockPasswordHasher.compare.mockReturnValue(comparePromise);
      mockPasswordHasher.hash.mockReturnValue(hashPromise);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      const updatePromise = sut.updateUserPassword(mockId, mockUpdateData);

      let isResolved = false;
      updatePromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockUserRepository.findByIdWithPassword).not.toHaveBeenCalled();

      resolveValidation!();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(isResolved).toBe(false);

      resolveFindUser!(mockUser);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(isResolved).toBe(false);

      resolveCompare!(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(isResolved).toBe(false);

      resolveHash!(hashedNewPassword);
      await updatePromise;
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should not modify original input parameters", async () => {
      const originalId = "  original-user-id  ";
      const originalData: UpdateUserInputDTO = {
        currentPassword: "  OriginalCurrent123!  ",
        newPassword: "  OriginalNew456!  ",
      };
      const idCopy = originalId;
      const dataCopy = { ...originalData };

      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(originalId, originalData);

      expect(originalId).toBe(idCopy);
      expect(originalData).toEqual(dataCopy);
      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(originalId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        originalData,
      );
    });

    it("should preserve data integrity through password update process", async () => {
      const specificTestCase = {
        inputId: "  USER-ID-WITH-SPACES  ",
        inputData: {
          currentPassword: "  Current@Pass123!  ",
          newPassword: "  New@Password456!  ",
        } as UpdateUserInputDTO,
        sanitizedId: "user-id-with-spaces",
        sanitizedData: {
          currentPassword: "Current@Pass123!",
          newPassword: "New@Password456!",
        } as UpdateUserInputDTO,
        storedPassword: "storedHashedCurrentPassword",
        newHashedPassword: "newHashedPassword456!",
      };

      mockSanitization.sanitizeId.mockReturnValue(specificTestCase.sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(
        specificTestCase.sanitizedData,
      );
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue({
        ...mockUser,
        password: specificTestCase.storedPassword,
      });
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(
        specificTestCase.newHashedPassword,
      );
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(
        specificTestCase.inputId,
        specificTestCase.inputData,
      );

      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
        specificTestCase.sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        specificTestCase.sanitizedData.currentPassword,
        specificTestCase.storedPassword,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        specificTestCase.sanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
        {
          ...specificTestCase.sanitizedData,
          newPassword: specificTestCase.newHashedPassword,
        },
      );
    });

    it("should handle multiple consecutive password updates", async () => {
      const testCases = [
        {
          id: "user-1",
          data: {
            currentPassword: "current1",
            newPassword: "new1",
          } as UpdateUserInputDTO,
          hashedNew: "hashed1",
        },
        {
          id: "user-2",
          data: {
            currentPassword: "current2",
            newPassword: "new2",
          } as UpdateUserInputDTO,
          hashedNew: "hashed2",
        },
        {
          id: "user-3",
          data: {
            currentPassword: "current3",
            newPassword: "new3",
          } as UpdateUserInputDTO,
          hashedNew: "hashed3",
        },
      ];

      for (const testCase of testCases) {
        mockSanitization.sanitizeId.mockReturnValueOnce(testCase.id);
        mockSanitization.sanitizePasswordUpdate.mockReturnValueOnce(
          testCase.data,
        );
        mockValidation.validateUserPasswordUpdate.mockResolvedValueOnce(
          undefined,
        );
        mockUserRepository.findByIdWithPassword.mockResolvedValueOnce(mockUser);
        mockPasswordHasher.compare.mockResolvedValueOnce(true);
        mockPasswordHasher.hash.mockResolvedValueOnce(testCase.hashedNew);
        mockUserRepository.updateUserPassword.mockResolvedValueOnce(undefined);

        await sut.updateUserPassword(testCase.id, testCase.data);

        expect(mockUserRepository.updateUserPassword).toHaveBeenLastCalledWith(
          testCase.id,
          {
            ...testCase.data,
            newPassword: testCase.hashedNew,
          },
        );
      }

      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledTimes(
        testCases.length,
      );
    });
  });

  describe("constructor", () => {
    it("should initialize with all required dependencies", () => {
      const dependencies: UserDomainServices = {
        repository: mockUserRepository,
        validation: mockValidation,
        sanitization: mockSanitization,
        passwordHasher: mockPasswordHasher,
      };

      const service = new UpdateUserPasswordService(dependencies);

      expect(service).toBeInstanceOf(UpdateUserPasswordService);
    });

    it("should store dependencies privately", () => {
      const service = new UpdateUserPasswordService(mockDependencies);

      mockSanitization.sanitizeId.mockReturnValue("test-id");
      mockSanitization.sanitizePasswordUpdate.mockReturnValue({
        currentPassword: "current",
        newPassword: "new",
      });
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue({
        id: "test-id",
        militaryId: "military-123",
        role: UserRole.ADMIN,
        password: "stored",
      });
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue("hashed");
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      expect(async () => {
        await service.updateUserPassword("test", {
          currentPassword: "current",
          newPassword: "new",
        });
      }).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    const mockId = "test-user-id";
    const mockUpdateData: UpdateUserInputDTO = {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword456!",
    };
    const sanitizedId = "test-user-id";
    const sanitizedData = mockUpdateData;
    const mockUser: User = {
      id: sanitizedId,
      militaryId: "military-123",
      role: UserRole.ADMIN,
      password: "hashedCurrentPassword",
    };
    const hashedNewPassword = "hashedNewPassword456!";

    it("should handle complete password update workflow", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(mockId, mockUpdateData);

      // Verify complete workflow
      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should maintain proper separation of concerns", async () => {
      mockSanitization.sanitizeId.mockReturnValue(sanitizedId);
      mockSanitization.sanitizePasswordUpdate.mockReturnValue(sanitizedData);
      mockValidation.validateUserPasswordUpdate.mockResolvedValue(undefined);
      mockUserRepository.findByIdWithPassword.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(mockId, mockUpdateData);

      // Sanitization operations
      expect(mockSanitization.sanitizeId).toHaveBeenCalledWith(mockId);
      expect(mockSanitization.sanitizePasswordUpdate).toHaveBeenCalledWith(
        mockUpdateData,
      );

      // Validation operations
      expect(mockValidation.validateUserPasswordUpdate).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );

      // Repository operations
      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );

      // Password hashing operations
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
    });
  });
});

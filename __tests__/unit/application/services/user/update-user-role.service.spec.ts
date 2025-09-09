import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UpdateUserRoleSanitizerProtocol,
  UpdateUserRoleValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../../../../src/application/protocols";
import { UpdateUserRoleService } from "../../../../../src/application/services/user";
import { UserRole } from "../../../../../src/domain/entities";
import { UserRepository } from "../../../../../src/domain/repositories";

describe("UpdateUserRoleService", () => {
  let sut: UpdateUserRoleService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockIdSanitizer: jest.Mocked<IdSanitizerProtocol>;
  let mockIdValidator: jest.Mocked<IdValidatorProtocol>;
  let mockIdRegisteredValidator: jest.Mocked<UserIdRegisteredValidatorProtocol>;
  let mockUpdateUserRoleSanitizer: jest.Mocked<UpdateUserRoleSanitizerProtocol>;
  let mockUpdateUserRoleValidator: jest.Mocked<UpdateUserRoleValidatorProtocol>;

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

    mockIdSanitizer = {
      sanitize: jest.fn(),
    };

    mockIdValidator = {
      validate: jest.fn(),
    };

    mockIdRegisteredValidator = {
      validate: jest.fn(),
    };

    mockUpdateUserRoleSanitizer = {
      sanitize: jest.fn(),
    };

    mockUpdateUserRoleValidator = {
      validate: jest.fn(),
    };

    sut = new UpdateUserRoleService({
      userRepository: mockUserRepository,
      idSanitizer: mockIdSanitizer,
      idValidator: mockIdValidator,
      idRegisteredValidator: mockIdRegisteredValidator,
      updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
      updateUserRoleValidator: mockUpdateUserRoleValidator,
    });
  });

  describe("updateUserRole", () => {
    const mockId = "  user-id-123  ";
    const mockRole = UserRole.CHEFE;
    const sanitizedId = "user-id-123";
    const sanitizedRole = UserRole.CHEFE;

    it("should execute all steps in correct sequence", async () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(mockId, mockRole);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        sanitizedRole,
      );
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedRole,
      );
    });

    it("should call all dependencies exactly once", async () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(mockId, mockRole);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledTimes(1);
    });

    it("should complete successfully when all operations pass", async () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await expect(
        sut.updateUserRole(mockId, mockRole),
      ).resolves.toBeUndefined();
    });

    it("should use sanitized ID for validation and repository operations", async () => {
      const specificSanitizedId = "specific-sanitized-id";
      mockIdSanitizer.sanitize.mockReturnValue(specificSanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(mockId, mockRole);

      expect(mockIdValidator.validate).toHaveBeenCalledWith(
        specificSanitizedId,
      );
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        specificSanitizedId,
      );
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        specificSanitizedId,
        sanitizedRole,
      );
    });

    it("should use sanitized role for validation and repository operations", async () => {
      const specificSanitizedRole = UserRole.BOMBEIRO;
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(
        specificSanitizedRole,
      );
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(mockId, mockRole);

      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        specificSanitizedRole,
      );
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        sanitizedId,
        specificSanitizedRole,
      );
    });

    it("should throw error when idValidator throws", async () => {
      const idValidationError = new Error("Invalid ID format");
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockImplementation(() => {
        throw idValidationError;
      });

      await expect(sut.updateUserRole(mockId, mockRole)).rejects.toThrow(
        idValidationError,
      );

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockUpdateUserRoleSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockUpdateUserRoleValidator.validate).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when idRegisteredValidator throws", async () => {
      const idRegisteredError = new Error("User not found");
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockRejectedValue(idRegisteredError);

      await expect(sut.updateUserRole(mockId, mockRole)).rejects.toThrow(
        idRegisteredError,
      );

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockUpdateUserRoleSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockUpdateUserRoleValidator.validate).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when updateUserRoleValidator throws", async () => {
      const roleValidationError = new Error("Invalid role");
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockRejectedValue(
        roleValidationError,
      );

      await expect(sut.updateUserRole(mockId, mockRole)).rejects.toThrow(
        roleValidationError,
      );

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        sanitizedRole,
      );
      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when userRepository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockRejectedValue(repositoryError);

      await expect(sut.updateUserRole(mockId, mockRole)).rejects.toThrow(
        repositoryError,
      );

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        sanitizedRole,
      );
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedRole,
      );
    });

    it("should handle all user roles", async () => {
      for (const role of Object.values(UserRole)) {
        mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(role);
        mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
        mockUserRepository.updateUserRole.mockResolvedValue(undefined);

        await sut.updateUserRole(mockId, role);

        expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(role);
        expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(role);
        expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
          sanitizedId,
          role,
        );
      }

      expect(mockUserRepository.updateUserRole).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should handle different ID formats", async () => {
      const idTestCases = [
        { input: "  user-123  ", sanitized: "user-123" },
        { input: "USER-456", sanitized: "user-456" },
        { input: "user_789", sanitized: "user_789" },
        { input: "  MIXED_Case-123  ", sanitized: "mixed_case-123" },
      ];

      for (const { input, sanitized } of idTestCases) {
        mockIdSanitizer.sanitize.mockReturnValue(sanitized);
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
        mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
        mockUserRepository.updateUserRole.mockResolvedValue(undefined);

        await sut.updateUserRole(input, mockRole);

        expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(input);
        expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitized);
        expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
          sanitized,
          sanitizedRole,
        );
      }
    });

    it("should handle async operations properly", async () => {
      let resolveIdRegisteredValidation: () => void;
      const idRegisteredValidationPromise = new Promise<void>((resolve) => {
        resolveIdRegisteredValidation = resolve;
      });

      let resolveRoleValidation: () => void;
      const roleValidationPromise = new Promise<void>((resolve) => {
        resolveRoleValidation = resolve;
      });

      let resolveRepositoryUpdate: () => void;
      const repositoryUpdatePromise = new Promise<void>((resolve) => {
        resolveRepositoryUpdate = resolve;
      });

      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockReturnValue(
        idRegisteredValidationPromise,
      );
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockReturnValue(
        roleValidationPromise,
      );
      mockUserRepository.updateUserRole.mockReturnValue(
        repositoryUpdatePromise,
      );

      const updatePromise = sut.updateUserRole(mockId, mockRole);

      let isResolved = false;
      updatePromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockUpdateUserRoleSanitizer.sanitize).not.toHaveBeenCalled();

      resolveIdRegisteredValidation!();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        sanitizedRole,
      );
      expect(isResolved).toBe(false);

      resolveRoleValidation!();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedRole,
      );
      expect(isResolved).toBe(false);

      resolveRepositoryUpdate!();
      await updatePromise;
      expect(isResolved).toBe(true);
    });

    it("should handle multiple consecutive role updates", async () => {
      const testCases = [
        {
          id: "user-1",
          role: UserRole.ADMIN,
          sanitizedId: "user-1",
          sanitizedRole: UserRole.ADMIN,
        },
        {
          id: "user-2",
          role: UserRole.CHEFE,
          sanitizedId: "user-2",
          sanitizedRole: UserRole.CHEFE,
        },
        {
          id: "user-3",
          role: UserRole.BOMBEIRO,
          sanitizedId: "user-3",
          sanitizedRole: UserRole.BOMBEIRO,
        },
      ];

      for (const {
        id,
        role,
        sanitizedId: expectedSanitizedId,
        sanitizedRole: expectedSanitizedRole,
      } of testCases) {
        mockIdSanitizer.sanitize.mockReturnValueOnce(expectedSanitizedId);
        mockIdValidator.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValueOnce(
          expectedSanitizedRole,
        );
        mockUpdateUserRoleValidator.validate.mockResolvedValueOnce(undefined);
        mockUserRepository.updateUserRole.mockResolvedValueOnce(undefined);

        await sut.updateUserRole(id, role);

        expect(mockUserRepository.updateUserRole).toHaveBeenLastCalledWith(
          expectedSanitizedId,
          expectedSanitizedRole,
        );
      }

      expect(mockUserRepository.updateUserRole).toHaveBeenCalledTimes(
        testCases.length,
      );
    });

    it("should not modify original input parameters", async () => {
      const originalId = "  original-user-id  ";
      const originalRole = UserRole.ADMIN;
      const idCopy = originalId;
      const roleCopy = originalRole;

      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(originalId, originalRole);

      expect(originalId).toBe(idCopy);
      expect(originalRole).toBe(roleCopy);
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(originalId);
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        originalRole,
      );
    });

    it("should preserve data integrity through the sanitization process", async () => {
      const specificTestCase = {
        inputId: "  USER-ID-WITH-SPACES  ",
        inputRole: UserRole.CHEFE,
        sanitizedId: "user-id-with-spaces",
        sanitizedRole: UserRole.BOMBEIRO,
      };

      mockIdSanitizer.sanitize.mockReturnValue(specificTestCase.sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(
        specificTestCase.sanitizedRole,
      );
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(
        specificTestCase.inputId,
        specificTestCase.inputRole,
      );

      expect(mockIdValidator.validate).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
      );
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        specificTestCase.sanitizedRole,
      );
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        specificTestCase.sanitizedId,
        specificTestCase.sanitizedRole,
      );
    });
  });

  describe("constructor", () => {
    it("should initialize with all required dependencies", () => {
      const props = {
        userRepository: mockUserRepository,
        idSanitizer: mockIdSanitizer,
        idValidator: mockIdValidator,
        idRegisteredValidator: mockIdRegisteredValidator,
        updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
        updateUserRoleValidator: mockUpdateUserRoleValidator,
      };

      const service = new UpdateUserRoleService(props);

      expect(service).toBeInstanceOf(UpdateUserRoleService);
    });

    it("should store dependencies privately", () => {
      const service = new UpdateUserRoleService({
        userRepository: mockUserRepository,
        idSanitizer: mockIdSanitizer,
        idValidator: mockIdValidator,
        idRegisteredValidator: mockIdRegisteredValidator,
        updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
        updateUserRoleValidator: mockUpdateUserRoleValidator,
      });

      mockIdSanitizer.sanitize.mockReturnValue("test-id");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(UserRole.ADMIN);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      expect(async () => {
        await service.updateUserRole("test", UserRole.ADMIN);
      }).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    const mockId = "  user-id-123  ";
    const mockRole = UserRole.CHEFE;
    const sanitizedId = "user-id-123";
    const sanitizedRole = UserRole.CHEFE;

    it("should handle role transitions correctly", async () => {
      const roleTransitions = [
        { from: UserRole.BOMBEIRO, to: UserRole.CHEFE },
        { from: UserRole.CHEFE, to: UserRole.ADMIN },
        { from: UserRole.ADMIN, to: UserRole.BOMBEIRO },
      ];

      for (const { to } of roleTransitions) {
        mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(to);
        mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
        mockUserRepository.updateUserRole.mockResolvedValue(undefined);

        await sut.updateUserRole(mockId, to);

        expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
          sanitizedId,
          to,
        );
      }
    });

    it("should maintain proper separation of concerns", async () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);
      mockUserRepository.updateUserRole.mockResolvedValue(undefined);

      await sut.updateUserRole(mockId, mockRole);

      // ID operations
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );

      // Role operations
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        sanitizedRole,
      );

      // Repository operation
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedRole,
      );
    });
  });
});

import {
  IdValidatorProtocol,
  UpdateUserPasswordValidatorProtocol,
  UpdateUserRoleValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
  UserInputDTOValidatorProtocol,
} from "../../../../../src/application/protocols";
import { UserValidationService } from "../../../../../src/application/services/user";
import {
  UpdateUserInputDTO,
  UserInputDTO,
} from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("UserValidationService", () => {
  let sut: UserValidationService;
  let mockIdValidator: jest.Mocked<IdValidatorProtocol>;
  let mockIdRegisteredValidator: jest.Mocked<UserIdRegisteredValidatorProtocol>;
  let mockUserInputDTOValidator: jest.Mocked<UserInputDTOValidatorProtocol>;
  let mockUpdateUserPasswordValidator: jest.Mocked<UpdateUserPasswordValidatorProtocol>;
  let mockUpdateUserRoleValidator: jest.Mocked<UpdateUserRoleValidatorProtocol>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIdValidator = {
      validate: jest.fn(),
    };

    mockIdRegisteredValidator = {
      validate: jest.fn(),
    };

    mockUserInputDTOValidator = {
      validate: jest.fn(),
    };

    mockUpdateUserPasswordValidator = {
      validate: jest.fn(),
    };

    mockUpdateUserRoleValidator = {
      validate: jest.fn(),
    };

    sut = new UserValidationService({
      idValidator: mockIdValidator,
      idRegisteredValidator: mockIdRegisteredValidator,
      userInputDTOValidator: mockUserInputDTOValidator,
      updateUserPasswordValidator: mockUpdateUserPasswordValidator,
      updateUserRoleValidator: mockUpdateUserRoleValidator,
    });
  });

  describe("validateUserCreation", () => {
    const mockUserInput: UserInputDTO = {
      militaryId: "military-id-123",
      role: UserRole.ADMIN,
      password: "password123",
    };

    it("should call userInputDTOValidator with provided data", async () => {
      mockUserInputDTOValidator.validate.mockResolvedValue(undefined);

      await sut.validateUserCreation(mockUserInput);

      expect(mockUserInputDTOValidator.validate).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(mockUserInputDTOValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when validation passes", async () => {
      mockUserInputDTOValidator.validate.mockResolvedValue(undefined);

      await expect(
        sut.validateUserCreation(mockUserInput),
      ).resolves.toBeUndefined();
    });

    it("should throw when userInputDTOValidator throws", async () => {
      const validationError = new Error("Invalid user input");
      mockUserInputDTOValidator.validate.mockRejectedValue(validationError);

      await expect(sut.validateUserCreation(mockUserInput)).rejects.toThrow(
        validationError,
      );
      expect(mockUserInputDTOValidator.validate).toHaveBeenCalledWith(
        mockUserInput,
      );
    });

    it("should handle different user roles", async () => {
      for (const role of Object.values(UserRole)) {
        const userWithRole = { ...mockUserInput, role };
        mockUserInputDTOValidator.validate.mockResolvedValue(undefined);

        await sut.validateUserCreation(userWithRole);

        expect(mockUserInputDTOValidator.validate).toHaveBeenCalledWith(
          userWithRole,
        );
      }
    });
  });

  describe("validateUserPasswordUpdate", () => {
    const mockId = "user-id-123";
    const mockUpdateData: UpdateUserInputDTO = {
      currentPassword: "currentPassword123",
      newPassword: "newPassword123",
    };

    it("should call all validators in sequence", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);

      await sut.validateUserPasswordUpdate(mockId, mockUpdateData);

      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserPasswordValidator.validate).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserPasswordValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when all validations pass", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);

      await expect(
        sut.validateUserPasswordUpdate(mockId, mockUpdateData),
      ).resolves.toBeUndefined();
    });

    it("should throw when idValidator throws", async () => {
      const idValidationError = new Error("Invalid ID format");
      mockIdValidator.validate.mockImplementation(() => {
        throw idValidationError;
      });

      await expect(
        sut.validateUserPasswordUpdate(mockId, mockUpdateData),
      ).rejects.toThrow(idValidationError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockUpdateUserPasswordValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when idRegisteredValidator throws", async () => {
      const idRegisteredError = new Error("User not found");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockRejectedValue(idRegisteredError);

      await expect(
        sut.validateUserPasswordUpdate(mockId, mockUpdateData),
      ).rejects.toThrow(idRegisteredError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserPasswordValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when updateUserPasswordValidator throws", async () => {
      const passwordValidationError = new Error("Invalid password");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserPasswordValidator.validate.mockRejectedValue(
        passwordValidationError,
      );

      await expect(
        sut.validateUserPasswordUpdate(mockId, mockUpdateData),
      ).rejects.toThrow(passwordValidationError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserPasswordValidator.validate).toHaveBeenCalledWith(
        mockUpdateData,
      );
    });

    it("should handle different update data scenarios", async () => {
      const scenarios = [
        { currentPassword: "current123", newPassword: "shortPwd" },
        {
          currentPassword: "current123",
          newPassword: "verylongpasswordwithmanycharacters123456789",
        },
        { currentPassword: "current123", newPassword: "P@ssw0rd123!" },
      ];

      for (const scenario of scenarios) {
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
        mockUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);

        await sut.validateUserPasswordUpdate(mockId, scenario);

        expect(mockUpdateUserPasswordValidator.validate).toHaveBeenCalledWith(
          scenario,
        );
      }
    });
  });

  describe("validateUserRoleUpdate", () => {
    const mockId = "user-id-123";
    const mockRole = UserRole.CHEFE;

    it("should call all validators in sequence", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);

      await sut.validateUserRoleUpdate(mockId, mockRole);

      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when all validations pass", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);

      await expect(
        sut.validateUserRoleUpdate(mockId, mockRole),
      ).resolves.toBeUndefined();
    });

    it("should throw when idValidator throws", async () => {
      const idValidationError = new Error("Invalid ID format");
      mockIdValidator.validate.mockImplementation(() => {
        throw idValidationError;
      });

      await expect(
        sut.validateUserRoleUpdate(mockId, mockRole),
      ).rejects.toThrow(idValidationError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockUpdateUserRoleValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when idRegisteredValidator throws", async () => {
      const idRegisteredError = new Error("User not found");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockRejectedValue(idRegisteredError);

      await expect(
        sut.validateUserRoleUpdate(mockId, mockRole),
      ).rejects.toThrow(idRegisteredError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserRoleValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when updateUserRoleValidator throws", async () => {
      const roleValidationError = new Error("Invalid role");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUpdateUserRoleValidator.validate.mockRejectedValue(
        roleValidationError,
      );

      await expect(
        sut.validateUserRoleUpdate(mockId, mockRole),
      ).rejects.toThrow(roleValidationError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(
        mockRole,
      );
    });

    it("should handle all user roles", async () => {
      for (const role of Object.values(UserRole)) {
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
        mockUpdateUserRoleValidator.validate.mockResolvedValue(undefined);

        await sut.validateUserRoleUpdate(mockId, role);

        expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledWith(role);
      }

      expect(mockUpdateUserRoleValidator.validate).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });
  });

  describe("validateUserDeletion", () => {
    const mockId = "user-id-123";

    it("should call both validators in sequence", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

      await sut.validateUserDeletion(mockId);

      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when all validations pass", async () => {
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

      await expect(sut.validateUserDeletion(mockId)).resolves.toBeUndefined();
    });

    it("should throw when idValidator throws", async () => {
      const idValidationError = new Error("Invalid ID format");
      mockIdValidator.validate.mockImplementation(() => {
        throw idValidationError;
      });

      await expect(sut.validateUserDeletion(mockId)).rejects.toThrow(
        idValidationError,
      );
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).not.toHaveBeenCalled();
    });

    it("should throw when idRegisteredValidator throws", async () => {
      const idRegisteredError = new Error("User not found");
      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockRejectedValue(idRegisteredError);

      await expect(sut.validateUserDeletion(mockId)).rejects.toThrow(
        idRegisteredError,
      );
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
    });

    it("should handle different ID formats", async () => {
      const idFormats = [
        "uuid-format-12345",
        "123456789",
        "user_id_with_underscores",
        "user-id-with-dashes",
      ];

      for (const id of idFormats) {
        mockIdValidator.validate.mockReturnValue(undefined);
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

        await sut.validateUserDeletion(id);

        expect(mockIdValidator.validate).toHaveBeenCalledWith(id);
        expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(id);
      }
    });
  });

  describe("validateUserId", () => {
    const mockId = "user-id-123";

    it("should call idValidator with provided ID", () => {
      mockIdValidator.validate.mockReturnValue(undefined);

      sut.validateUserId(mockId);

      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when validation passes", () => {
      mockIdValidator.validate.mockReturnValue(undefined);

      expect(() => sut.validateUserId(mockId)).not.toThrow();
    });

    it("should throw when idValidator throws", () => {
      const idValidationError = new Error("Invalid ID format");
      mockIdValidator.validate.mockImplementation(() => {
        throw idValidationError;
      });

      expect(() => sut.validateUserId(mockId)).toThrow(idValidationError);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
    });

    it("should handle various ID formats", () => {
      const idFormats = [
        "uuid-12345",
        "123",
        "very-long-id-with-many-characters",
        "ID_WITH_CAPS",
        "mixedCase123",
      ];

      for (const id of idFormats) {
        mockIdValidator.validate.mockReturnValue(undefined);

        sut.validateUserId(id);

        expect(mockIdValidator.validate).toHaveBeenCalledWith(id);
      }

      expect(mockIdValidator.validate).toHaveBeenCalledTimes(idFormats.length);
    });

    it("should be synchronous", () => {
      mockIdValidator.validate.mockReturnValue(undefined);

      const result = sut.validateUserId(mockId);

      expect(result).toBeUndefined();
      expect(mockIdValidator.validate).toHaveBeenCalledWith(mockId);
    });
  });

  describe("validateUserIdExists", () => {
    const mockId = "user-id-123";

    it("should call idRegisteredValidator with provided ID", async () => {
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

      await sut.validateUserIdExists(mockId);

      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should not throw when validation passes", async () => {
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

      await expect(sut.validateUserIdExists(mockId)).resolves.toBeUndefined();
    });

    it("should throw when idRegisteredValidator throws", async () => {
      const idRegisteredError = new Error("User not found");
      mockIdRegisteredValidator.validate.mockRejectedValue(idRegisteredError);

      await expect(sut.validateUserIdExists(mockId)).rejects.toThrow(
        idRegisteredError,
      );
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
    });

    it("should handle various ID formats", async () => {
      const idFormats = [
        "existing-user-1",
        "user-id-999",
        "admin-user-id",
        "temp-user-123",
      ];

      for (const id of idFormats) {
        mockIdRegisteredValidator.validate.mockResolvedValue(undefined);

        await sut.validateUserIdExists(id);

        expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(id);
      }

      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledTimes(
        idFormats.length,
      );
    });

    it("should handle async validation properly", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      mockIdRegisteredValidator.validate.mockReturnValue(validationPromise);

      const validatePromise = sut.validateUserIdExists(mockId);

      let isResolved = false;
      validatePromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      resolveValidation!();
      await validatePromise;

      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(mockId);
    });
  });

  describe("constructor", () => {
    it("should initialize with all required validators", () => {
      const validators = {
        idValidator: mockIdValidator,
        idRegisteredValidator: mockIdRegisteredValidator,
        userInputDTOValidator: mockUserInputDTOValidator,
        updateUserPasswordValidator: mockUpdateUserPasswordValidator,
        updateUserRoleValidator: mockUpdateUserRoleValidator,
      };

      const service = new UserValidationService(validators);

      expect(service).toBeInstanceOf(UserValidationService);
    });

    it("should store validators privately", () => {
      const service = new UserValidationService({
        idValidator: mockIdValidator,
        idRegisteredValidator: mockIdRegisteredValidator,
        userInputDTOValidator: mockUserInputDTOValidator,
        updateUserPasswordValidator: mockUpdateUserPasswordValidator,
        updateUserRoleValidator: mockUpdateUserRoleValidator,
      });

      // Verify that methods work (indicating validators are stored)
      mockIdValidator.validate.mockReturnValue(undefined);
      service.validateUserId("test-id");
      expect(mockIdValidator.validate).toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple validation calls without interference", async () => {
      const id1 = "user-1";
      const id2 = "user-2";
      const userData: UserInputDTO = {
        militaryId: "military-123",
        role: UserRole.BOMBEIRO,
        password: "password123",
      };

      mockIdValidator.validate.mockReturnValue(undefined);
      mockIdRegisteredValidator.validate.mockResolvedValue(undefined);
      mockUserInputDTOValidator.validate.mockResolvedValue(undefined);

      await Promise.all([
        sut.validateUserIdExists(id1),
        sut.validateUserIdExists(id2),
        sut.validateUserCreation(userData),
        sut.validateUserDeletion(id1),
      ]);

      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(id1);
      expect(mockIdRegisteredValidator.validate).toHaveBeenCalledWith(id2);
      expect(mockUserInputDTOValidator.validate).toHaveBeenCalledWith(userData);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(id1);
    });

    it("should maintain validator state across method calls", async () => {
      const testId = "test-user-id";

      // First call
      mockIdValidator.validate.mockReturnValue(undefined);
      sut.validateUserId(testId);

      // Second call should still work
      mockIdValidator.validate.mockReturnValue(undefined);
      sut.validateUserId(testId);

      expect(mockIdValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockIdValidator.validate).toHaveBeenNthCalledWith(1, testId);
      expect(mockIdValidator.validate).toHaveBeenNthCalledWith(2, testId);
    });
  });
});

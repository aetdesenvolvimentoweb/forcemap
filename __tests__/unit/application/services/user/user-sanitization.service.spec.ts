import {
  IdSanitizerProtocol,
  UpdateUserPasswordSanitizerProtocol,
  UpdateUserRoleSanitizerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
  UserInputDTOSanitizerProtocol,
} from "../../../../../src/application/protocols";
import { UserSanitizationService } from "../../../../../src/application/services/user";
import {
  UpdateUserInputDTO,
  UserCredentialsInputDTO,
  UserInputDTO,
} from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("UserSanitizationService", () => {
  let sut: UserSanitizationService;
  let mockIdSanitizer: jest.Mocked<IdSanitizerProtocol>;
  let mockUserInputDTOSanitizer: jest.Mocked<UserInputDTOSanitizerProtocol>;
  let mockUserCredentialsInputDTOSanitizer: jest.Mocked<UserCredentialsInputDTOSanitizerProtocol>;
  let mockUpdateUserPasswordSanitizer: jest.Mocked<UpdateUserPasswordSanitizerProtocol>;
  let mockUpdateUserRoleSanitizer: jest.Mocked<UpdateUserRoleSanitizerProtocol>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIdSanitizer = {
      sanitize: jest.fn(),
    };

    mockUserInputDTOSanitizer = {
      sanitize: jest.fn(),
    };

    mockUserCredentialsInputDTOSanitizer = {
      sanitize: jest.fn(),
    };

    mockUpdateUserPasswordSanitizer = {
      sanitize: jest.fn(),
    };

    mockUpdateUserRoleSanitizer = {
      sanitize: jest.fn(),
    };

    sut = new UserSanitizationService({
      idSanitizer: mockIdSanitizer,
      userInputDTOSanitizer: mockUserInputDTOSanitizer,
      userCredentialsInputDTOSanitizer: mockUserCredentialsInputDTOSanitizer,
      updateUserPasswordSanitizer: mockUpdateUserPasswordSanitizer,
      updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
    });
  });

  describe("sanitizeId", () => {
    const mockId = "  user-id-123  ";
    const sanitizedId = "user-id-123";

    it("should call idSanitizer with provided ID", () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitizeId(mockId);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(mockId);
      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(result).toBe(sanitizedId);
    });

    it("should return the sanitized ID from idSanitizer", () => {
      const expectedSanitizedId = "cleaned-id-456";
      mockIdSanitizer.sanitize.mockReturnValue(expectedSanitizedId);

      const result = sut.sanitizeId(mockId);

      expect(result).toBe(expectedSanitizedId);
    });

    it("should handle different ID formats", () => {
      const testCases = [
        { input: "  spaced-id  ", output: "spaced-id" },
        { input: "UPPERCASE-ID", output: "uppercase-id" },
        { input: "mixed_Case-123", output: "mixed_case-123" },
        { input: "id@with#special$chars", output: "idwithspecialchars" },
      ];

      testCases.forEach(({ input, output }) => {
        mockIdSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeId(input);

        expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(input);
        expect(result).toBe(output);
      });

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(testCases.length);
    });

    it("should handle empty and edge case IDs", () => {
      const edgeCases = [
        { input: "", output: "" },
        { input: "   ", output: "" },
        { input: "a", output: "a" },
        { input: "123", output: "123" },
      ];

      edgeCases.forEach(({ input, output }) => {
        mockIdSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeId(input);

        expect(result).toBe(output);
      });
    });

    it("should be synchronous", () => {
      mockIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitizeId(mockId);

      expect(typeof result).toBe("string");
      expect(result).toBe(sanitizedId);
    });
  });

  describe("sanitizeUserCreation", () => {
    const mockUserInput: UserInputDTO = {
      militaryId: "  military-123  ",
      role: UserRole.ADMIN,
      password: "  Password123!  ",
    };

    const sanitizedUserInput: UserInputDTO = {
      militaryId: "military-123",
      role: UserRole.ADMIN,
      password: "Password123!",
    };

    it("should call userInputDTOSanitizer with provided data", () => {
      mockUserInputDTOSanitizer.sanitize.mockReturnValue(sanitizedUserInput);

      const result = sut.sanitizeUserCreation(mockUserInput);

      expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sanitizedUserInput);
    });

    it("should return the sanitized data from userInputDTOSanitizer", () => {
      const expectedSanitizedData: UserInputDTO = {
        militaryId: "cleaned-military-456",
        role: UserRole.CHEFE,
        password: "CleanPassword456!",
      };
      mockUserInputDTOSanitizer.sanitize.mockReturnValue(expectedSanitizedData);

      const result = sut.sanitizeUserCreation(mockUserInput);

      expect(result).toEqual(expectedSanitizedData);
    });

    it("should handle different user roles", () => {
      Object.values(UserRole).forEach((role) => {
        const userWithRole = { ...mockUserInput, role };
        const sanitizedWithRole = { ...sanitizedUserInput, role };

        mockUserInputDTOSanitizer.sanitize.mockReturnValue(sanitizedWithRole);

        const result = sut.sanitizeUserCreation(userWithRole);

        expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledWith(
          userWithRole,
        );
        expect(result).toEqual(sanitizedWithRole);
      });
    });

    it("should handle various input scenarios", () => {
      const testCases = [
        {
          input: {
            militaryId: "  MILITARY-ID-UPPER  ",
            role: UserRole.BOMBEIRO,
            password: "  Pass@Word123  ",
          },
          output: {
            militaryId: "military-id-upper",
            role: UserRole.BOMBEIRO,
            password: "Pass@Word123",
          },
        },
        {
          input: {
            militaryId: "military_with_underscores",
            role: UserRole.CHEFE,
            password: "NoSpacesPassword!",
          },
          output: {
            militaryId: "military_with_underscores",
            role: UserRole.CHEFE,
            password: "NoSpacesPassword!",
          },
        },
      ];

      testCases.forEach(({ input, output }) => {
        mockUserInputDTOSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeUserCreation(input);

        expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledWith(input);
        expect(result).toEqual(output);
      });
    });

    it("should not modify original input data", () => {
      const originalInput: UserInputDTO = {
        militaryId: "original-military",
        role: UserRole.ADMIN,
        password: "originalPassword",
      };
      const inputCopy = { ...originalInput };

      mockUserInputDTOSanitizer.sanitize.mockReturnValue(sanitizedUserInput);

      sut.sanitizeUserCreation(originalInput);

      expect(originalInput).toEqual(inputCopy);
    });
  });

  describe("sanitizeUserCredentials", () => {
    const mockCredentials: UserCredentialsInputDTO = {
      rg: 123456,
      password: "  UserPass123!  ",
    };

    const sanitizedCredentials: UserCredentialsInputDTO = {
      rg: 123456,
      password: "UserPass123!",
    };

    it("should call userCredentialsInputDTOSanitizer with provided data", () => {
      mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
        sanitizedCredentials,
      );

      const result = sut.sanitizeUserCredentials(mockCredentials);

      expect(
        mockUserCredentialsInputDTOSanitizer.sanitize,
      ).toHaveBeenCalledWith(mockCredentials);
      expect(
        mockUserCredentialsInputDTOSanitizer.sanitize,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sanitizedCredentials);
    });

    it("should return the sanitized credentials from sanitizer", () => {
      const expectedSanitized: UserCredentialsInputDTO = {
        rg: 789456,
        password: "CleanedPassword789!",
      };
      mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
        expectedSanitized,
      );

      const result = sut.sanitizeUserCredentials(mockCredentials);

      expect(result).toEqual(expectedSanitized);
    });

    it("should handle different credential formats", () => {
      const testCases = [
        {
          input: {
            rg: 111222,
            password: "  Mixed@Password123!  ",
          },
          output: {
            rg: 111222,
            password: "Mixed@Password123!",
          },
        },
        {
          input: {
            rg: 333444,
            password: "simple_password",
          },
          output: {
            rg: 333444,
            password: "simple_password",
          },
        },
        {
          input: {
            rg: 555666,
            password: "Numeric1@Pass",
          },
          output: {
            rg: 555666,
            password: "Numeric1@Pass",
          },
        },
      ];

      testCases.forEach(({ input, output }) => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeUserCredentials(input);

        expect(
          mockUserCredentialsInputDTOSanitizer.sanitize,
        ).toHaveBeenCalledWith(input);
        expect(result).toEqual(output);
      });
    });

    it("should handle edge cases", () => {
      const edgeCases = [
        {
          input: { rg: 0, password: "" },
          output: { rg: 0, password: "" },
        },
        {
          input: { rg: -1, password: "   " },
          output: { rg: -1, password: "" },
        },
      ];

      edgeCases.forEach(({ input, output }) => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeUserCredentials(input);

        expect(result).toEqual(output);
      });
    });
  });

  describe("sanitizePasswordUpdate", () => {
    const mockUpdateData: UpdateUserInputDTO = {
      currentPassword: "  CurrentPass123!  ",
      newPassword: "  NewPassword456!  ",
    };

    const sanitizedUpdateData: UpdateUserInputDTO = {
      currentPassword: "CurrentPass123!",
      newPassword: "NewPassword456!",
    };

    it("should call updateUserPasswordSanitizer with provided data", () => {
      mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(
        sanitizedUpdateData,
      );

      const result = sut.sanitizePasswordUpdate(mockUpdateData);

      expect(mockUpdateUserPasswordSanitizer.sanitize).toHaveBeenCalledWith(
        mockUpdateData,
      );
      expect(mockUpdateUserPasswordSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sanitizedUpdateData);
    });

    it("should return the sanitized data from sanitizer", () => {
      const expectedSanitized: UpdateUserInputDTO = {
        currentPassword: "CleanedCurrentPass!",
        newPassword: "CleanedNewPass!",
      };
      mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(
        expectedSanitized,
      );

      const result = sut.sanitizePasswordUpdate(mockUpdateData);

      expect(result).toEqual(expectedSanitized);
    });

    it("should handle different password update scenarios", () => {
      const testCases = [
        {
          input: {
            currentPassword: "  Old@Pass123  ",
            newPassword: "  New@Pass456  ",
          },
          output: {
            currentPassword: "Old@Pass123",
            newPassword: "New@Pass456",
          },
        },
        {
          input: {
            currentPassword: "SimpleOldPass",
            newPassword: "SimpleNewPass",
          },
          output: {
            currentPassword: "SimpleOldPass",
            newPassword: "SimpleNewPass",
          },
        },
        {
          input: {
            currentPassword: "Complex@Old#Pass123!",
            newPassword: "Complex@New#Pass456!",
          },
          output: {
            currentPassword: "Complex@Old#Pass123!",
            newPassword: "Complex@New#Pass456!",
          },
        },
      ];

      testCases.forEach(({ input, output }) => {
        mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizePasswordUpdate(input);

        expect(mockUpdateUserPasswordSanitizer.sanitize).toHaveBeenCalledWith(
          input,
        );
        expect(result).toEqual(output);
      });
    });

    it("should handle edge cases", () => {
      const edgeCases = [
        {
          input: { currentPassword: "", newPassword: "" },
          output: { currentPassword: "", newPassword: "" },
        },
        {
          input: { currentPassword: "   ", newPassword: "   " },
          output: { currentPassword: "", newPassword: "" },
        },
      ];

      edgeCases.forEach(({ input, output }) => {
        mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizePasswordUpdate(input);

        expect(result).toEqual(output);
      });
    });

    it("should not modify original input data", () => {
      const originalInput: UpdateUserInputDTO = {
        currentPassword: "originalCurrent",
        newPassword: "originalNew",
      };
      const inputCopy = { ...originalInput };

      mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(
        sanitizedUpdateData,
      );

      sut.sanitizePasswordUpdate(originalInput);

      expect(originalInput).toEqual(inputCopy);
    });
  });

  describe("sanitizeRoleUpdate", () => {
    it("should call updateUserRoleSanitizer with provided role", () => {
      const mockRole = UserRole.ADMIN;
      const sanitizedRole = UserRole.ADMIN;

      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(sanitizedRole);

      const result = sut.sanitizeRoleUpdate(mockRole);

      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
        mockRole,
      );
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(result).toBe(sanitizedRole);
    });

    it("should return the sanitized role from sanitizer", () => {
      const inputRole = UserRole.CHEFE;
      const expectedSanitizedRole = UserRole.BOMBEIRO;

      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(
        expectedSanitizedRole,
      );

      const result = sut.sanitizeRoleUpdate(inputRole);

      expect(result).toBe(expectedSanitizedRole);
    });

    it("should handle all user roles", () => {
      Object.values(UserRole).forEach((role) => {
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(role);

        const result = sut.sanitizeRoleUpdate(role);

        expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(role);
        expect(result).toBe(role);
      });

      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should handle role transformation scenarios", () => {
      const transformationCases = [
        { input: UserRole.ADMIN, output: UserRole.ADMIN },
        { input: UserRole.CHEFE, output: UserRole.CHEFE },
        { input: UserRole.BOMBEIRO, output: UserRole.BOMBEIRO },
      ];

      transformationCases.forEach(({ input, output }) => {
        mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(output);

        const result = sut.sanitizeRoleUpdate(input);

        expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledWith(
          input,
        );
        expect(result).toBe(output);
      });
    });

    it("should be synchronous", () => {
      const testRole = UserRole.CHEFE;
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(testRole);

      const result = sut.sanitizeRoleUpdate(testRole);

      expect(result).toBe(testRole);
      expect(typeof result).toBe("string");
    });
  });

  describe("constructor", () => {
    it("should initialize with all required sanitizers", () => {
      const sanitizers = {
        idSanitizer: mockIdSanitizer,
        userInputDTOSanitizer: mockUserInputDTOSanitizer,
        userCredentialsInputDTOSanitizer: mockUserCredentialsInputDTOSanitizer,
        updateUserPasswordSanitizer: mockUpdateUserPasswordSanitizer,
        updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
      };

      const service = new UserSanitizationService(sanitizers);

      expect(service).toBeInstanceOf(UserSanitizationService);
    });

    it("should store sanitizers privately", () => {
      const service = new UserSanitizationService({
        idSanitizer: mockIdSanitizer,
        userInputDTOSanitizer: mockUserInputDTOSanitizer,
        userCredentialsInputDTOSanitizer: mockUserCredentialsInputDTOSanitizer,
        updateUserPasswordSanitizer: mockUpdateUserPasswordSanitizer,
        updateUserRoleSanitizer: mockUpdateUserRoleSanitizer,
      });

      mockIdSanitizer.sanitize.mockReturnValue("test-id");
      service.sanitizeId("test");
      expect(mockIdSanitizer.sanitize).toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple sanitization calls without interference", () => {
      const id = "test-id";
      const userInput: UserInputDTO = {
        militaryId: "military-123",
        role: UserRole.ADMIN,
        password: "password123",
      };
      const credentials: UserCredentialsInputDTO = {
        rg: 987654,
        password: "cred-password",
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");
      mockUserInputDTOSanitizer.sanitize.mockReturnValue(userInput);
      mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
        credentials,
      );

      const idResult = sut.sanitizeId(id);
      const userResult = sut.sanitizeUserCreation(userInput);
      const credResult = sut.sanitizeUserCredentials(credentials);

      expect(idResult).toBe("sanitized-id");
      expect(userResult).toEqual(userInput);
      expect(credResult).toEqual(credentials);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledWith(id);
      expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledWith(
        userInput,
      );
      expect(
        mockUserCredentialsInputDTOSanitizer.sanitize,
      ).toHaveBeenCalledWith(credentials);
    });

    it("should maintain sanitizer state across method calls", () => {
      const testId = "test-user-id";

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-1");
      sut.sanitizeId(testId);

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-2");
      sut.sanitizeId(testId);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockIdSanitizer.sanitize).toHaveBeenNthCalledWith(1, testId);
      expect(mockIdSanitizer.sanitize).toHaveBeenNthCalledWith(2, testId);
    });

    it("should handle all methods being called in sequence", () => {
      const testData = {
        id: "test-id",
        userInput: {
          militaryId: "military-123",
          role: UserRole.CHEFE,
          password: "password123",
        } as UserInputDTO,
        credentials: {
          rg: 987654,
          password: "cred-password",
        } as UserCredentialsInputDTO,
        passwordUpdate: {
          currentPassword: "current123",
          newPassword: "new123",
        } as UpdateUserInputDTO,
        role: UserRole.BOMBEIRO,
      };

      mockIdSanitizer.sanitize.mockReturnValue("sanitized-id");
      mockUserInputDTOSanitizer.sanitize.mockReturnValue(testData.userInput);
      mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
        testData.credentials,
      );
      mockUpdateUserPasswordSanitizer.sanitize.mockReturnValue(
        testData.passwordUpdate,
      );
      mockUpdateUserRoleSanitizer.sanitize.mockReturnValue(testData.role);

      sut.sanitizeId(testData.id);
      sut.sanitizeUserCreation(testData.userInput);
      sut.sanitizeUserCredentials(testData.credentials);
      sut.sanitizePasswordUpdate(testData.passwordUpdate);
      sut.sanitizeRoleUpdate(testData.role);

      expect(mockIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockUserInputDTOSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(
        mockUserCredentialsInputDTOSanitizer.sanitize,
      ).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserPasswordSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockUpdateUserRoleSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });
  });
});

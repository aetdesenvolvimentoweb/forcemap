import { mockIdSanitizer } from "../../../../__mocks__/sanitizers";
import { IdSanitizerProtocol } from "../../../../src/application/protocols";
import { UserInputDTOSanitizer } from "../../../../src/application/sanitizers/user.input.dto.sanitizer";
import { UserInputDTO } from "../../../../src/domain/dtos";
import { UserRole } from "../../../../src/domain/entities";

describe("UserInputDTOSanitizer", () => {
  let sut: UserInputDTOSanitizer;
  let mockedIdSanitizer: jest.Mocked<IdSanitizerProtocol>;

  beforeEach(() => {
    mockedIdSanitizer = mockIdSanitizer();

    sut = new UserInputDTOSanitizer({
      idSanitizer: mockedIdSanitizer,
    });
  });

  describe("constructor", () => {
    it("should create instance with id sanitizer dependency", () => {
      expect(sut).toBeInstanceOf(UserInputDTOSanitizer);
      expect(sut.sanitize).toBeDefined();
    });
  });

  describe("sanitize", () => {
    it("should sanitize all fields in user input data", () => {
      const inputData: UserInputDTO = {
        militaryId: "123e4567-e89b-12d3-a456-426614174000",
        role: UserRole.BOMBEIRO,
        password: "  MyStrongPass@123  ",
      };

      const sanitizedId = "sanitized-id";
      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        militaryId: sanitizedId,
        role: UserRole.BOMBEIRO,
        password: "MyStrongPass@123",
      });
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(
        inputData.militaryId,
      );
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should sanitize militaryId using id sanitizer", () => {
      const inputData: UserInputDTO = {
        militaryId: " dirty-id-with-spaces ",
        role: UserRole.ADMIN,
        password: "ValidPass@123",
      };

      const cleanId = "clean-id";
      mockedIdSanitizer.sanitize.mockReturnValue(cleanId);

      const result = sut.sanitize(inputData);

      expect(result.militaryId).toBe(cleanId);
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(
        " dirty-id-with-spaces ",
      );
    });

    it("should sanitize role by trimming whitespace", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "  admin  " as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("admin");
    });

    it("should sanitize role by replacing multiple spaces with single space", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "  admin    role  " as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("admin role");
    });

    it("should sanitize role by removing dangerous characters", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "admin';DROP TABLE users--" as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("adminDROP TABLE users");
    });

    it("should sanitize role by removing SQL injection patterns", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "admin/*comment*/role--injection" as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("admincommentroleinjection");
    });

    it("should sanitize role by removing backslashes", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "admin\\role\\test" as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("adminroletest");
    });

    it("should sanitize password by trimming whitespace", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.CHEFE,
        password: "   MyStrongPass@123   ",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyStrongPass@123");
    });

    it("should sanitize password by replacing multiple spaces with single space", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.BOMBEIRO,
        password: "My    Strong    Pass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("My Strong Pass@123");
    });

    it("should sanitize password by removing dangerous characters", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.ADMIN,
        password: "MyPass'@123\"DROP;--",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPass@123DROP");
    });

    it("should sanitize password by removing SQL injection patterns", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.CHEFE,
        password: "MyPass/*comment*/@123--injection",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPasscomment@123injection");
    });

    it("should sanitize password by removing backslashes", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.BOMBEIRO,
        password: "MyPass\\@123\\Test",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("MyPass@123Test");
    });

    it("should handle empty role", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: "" as UserRole,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe("");
    });

    it("should handle null role", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: null as any,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe(null);
    });

    it("should handle undefined role", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: undefined as any,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe(undefined);
    });

    it("should handle non-string role", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: 12345 as any,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.role).toBe(12345);
    });

    it("should handle empty password", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.ADMIN,
        password: "",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe("");
    });

    it("should handle null password", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.CHEFE,
        password: null as any,
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(null);
    });

    it("should handle undefined password", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.BOMBEIRO,
        password: undefined as any,
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(undefined);
    });

    it("should handle non-string password", () => {
      const inputData: UserInputDTO = {
        militaryId: "valid-id",
        role: UserRole.ADMIN,
        password: 12345 as any,
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id");

      const result = sut.sanitize(inputData);

      expect(result.password).toBe(12345);
    });

    it("should handle complex sanitization scenario", () => {
      const inputData: UserInputDTO = {
        militaryId: "  123e4567-e89b-12d3-a456-426614174000  ",
        role: '  admin\'role  "test";  DROP--/*comment*/  ' as UserRole,
        password: "  MyPass'@123\"Strong;  DROP--/*pwd*/  ",
      };

      const sanitizedId = "clean-uuid";
      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedId);

      const result = sut.sanitize(inputData);

      expect(result).toEqual({
        militaryId: sanitizedId,
        role: "adminrole test DROPcomment",
        password: "MyPass@123Strong DROPpwd",
      });
    });

    it("should preserve object structure", () => {
      const inputData: UserInputDTO = {
        militaryId: "id-123",
        role: UserRole.BOMBEIRO,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("sanitized-id-123");

      const result = sut.sanitize(inputData);

      expect(result).toHaveProperty("militaryId");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("password");
      expect(Object.keys(result)).toHaveLength(3);
    });

    it("should call id sanitizer exactly once per sanitization", () => {
      const inputData: UserInputDTO = {
        militaryId: "test-id",
        role: UserRole.ADMIN,
        password: "ValidPass@123",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("clean-id");

      sut.sanitize(inputData);
      sut.sanitize(inputData);
      sut.sanitize(inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(3);
    });

    it("should not modify original input data", () => {
      const originalData: UserInputDTO = {
        militaryId: "original-id",
        role: UserRole.CHEFE,
        password: "  Original  Password  ",
      };

      const inputData = { ...originalData };
      mockedIdSanitizer.sanitize.mockReturnValue("clean-id");

      sut.sanitize(inputData);

      expect(originalData.password).toBe("  Original  Password  ");
      expect(originalData.militaryId).toBe("original-id");
      expect(originalData.role).toBe(UserRole.CHEFE);
    });

    it("should handle all UserRole enum values", () => {
      const roles = [UserRole.ADMIN, UserRole.CHEFE, UserRole.BOMBEIRO];

      roles.forEach((role) => {
        const inputData: UserInputDTO = {
          militaryId: "test-id",
          role: role,
          password: "ValidPass@123",
        };

        mockedIdSanitizer.sanitize.mockReturnValue("clean-id");

        const result = sut.sanitize(inputData);

        expect(result.role).toBe(role);
      });

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(roles.length);
    });

    it("should handle multiple calls consistently", () => {
      const inputData: UserInputDTO = {
        militaryId: "test-id",
        role: UserRole.BOMBEIRO,
        password: "  TestPassword@123  ",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("consistent-id");

      const result1 = sut.sanitize(inputData);
      const result2 = sut.sanitize(inputData);
      const result3 = sut.sanitize(inputData);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should preserve valid special characters in password", () => {
      const inputData: UserInputDTO = {
        militaryId: "test-id",
        role: UserRole.ADMIN,
        password: "MyP@ss#123!$%^&*()_+-=[]{}|:,.<>?",
      };

      mockedIdSanitizer.sanitize.mockReturnValue("clean-id");

      const result = sut.sanitize(inputData);

      // Should preserve these special characters but remove dangerous ones
      expect(result.password).toBe("MyP@ss#123!$%^&*()_+-=[]{}|:,.<>?");
    });
  });
});

import { UpdateUserPasswordSanitizer } from "../../../../../src/application/sanitizers/user/update-user-password.sanitizer";
import { UpdateUserInputDTO } from "../../../../../src/domain/dtos";

describe("UpdateUserPasswordSanitizer", () => {
  let sut: UpdateUserPasswordSanitizer;

  beforeEach(() => {
    sut = new UpdateUserPasswordSanitizer();
  });

  describe("sanitize", () => {
    it("should sanitize both current and new passwords", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "  current'password;  ",
        newPassword: '  new"password\\  ',
      };

      const result = sut.sanitize(input);

      expect(result.currentPassword).toBe("currentpassword");
      expect(result.newPassword).toBe("newpassword");
    });

    it("should return new object with sanitized passwords", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "current123",
        newPassword: "new456",
      };

      const result = sut.sanitize(input);

      expect(result).not.toBe(input);
      expect(result).toEqual({
        currentPassword: "current123",
        newPassword: "new456",
      });
    });

    it("should trim whitespace from both passwords", () => {
      const testCases = [
        {
          input: {
            currentPassword: "  current123  ",
            newPassword: "  new456  ",
          },
          expected: {
            currentPassword: "current123",
            newPassword: "new456",
          },
        },
        {
          input: {
            currentPassword: "\tcurrent789\t",
            newPassword: "\nnew012\n",
          },
          expected: {
            currentPassword: "current789",
            newPassword: "new012",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should replace multiple consecutive spaces with single space", () => {
      const testCases = [
        {
          input: {
            currentPassword: "current    password",
            newPassword: "new     password",
          },
          expected: {
            currentPassword: "current password",
            newPassword: "new password",
          },
        },
        {
          input: {
            currentPassword: "current\t\t\tpassword",
            newPassword: "new\n\n\npassword",
          },
          expected: {
            currentPassword: "current password",
            newPassword: "new password",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should remove SQL injection characters", () => {
      const testCases = [
        {
          input: {
            currentPassword: "current'password",
            newPassword: 'new"password',
          },
          expected: {
            currentPassword: "currentpassword",
            newPassword: "newpassword",
          },
        },
        {
          input: {
            currentPassword: "current;password",
            newPassword: "new\\password",
          },
          expected: {
            currentPassword: "currentpassword",
            newPassword: "newpassword",
          },
        },
        {
          input: {
            currentPassword: "current'\";\\password",
            newPassword: "new'\";\\password",
          },
          expected: {
            currentPassword: "currentpassword",
            newPassword: "newpassword",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should remove SQL comment patterns", () => {
      const testCases = [
        {
          input: {
            currentPassword: "current--comment",
            newPassword: "new/*comment*/",
          },
          expected: {
            currentPassword: "currentcomment",
            newPassword: "newcomment",
          },
        },
        {
          input: {
            currentPassword: "current--",
            newPassword: "new/*",
          },
          expected: {
            currentPassword: "current",
            newPassword: "new",
          },
        },
        {
          input: {
            currentPassword: "--current",
            newPassword: "*/new",
          },
          expected: {
            currentPassword: "current",
            newPassword: "new",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle combined sanitization scenarios", () => {
      const testCases = [
        {
          input: {
            currentPassword: "  current'  ;  --comment  ",
            newPassword: '\t new"  /*test*/  \n',
          },
          expected: {
            currentPassword: "current  comment",
            newPassword: "new test",
          },
        },
        {
          input: {
            currentPassword: "  password\\  ;;  --  /**/  ",
            newPassword: "'\"password;\\--/*comment*/",
          },
          expected: {
            currentPassword: "password   ",
            newPassword: "passwordcomment",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle null and undefined passwords gracefully", () => {
      const testCases = [
        {
          input: {
            currentPassword: null as any,
            newPassword: "validPassword",
          },
          expected: {
            currentPassword: null,
            newPassword: "validPassword",
          },
        },
        {
          input: {
            currentPassword: "validPassword",
            newPassword: undefined as any,
          },
          expected: {
            currentPassword: "validPassword",
            newPassword: undefined,
          },
        },
        {
          input: {
            currentPassword: null as any,
            newPassword: null as any,
          },
          expected: {
            currentPassword: null,
            newPassword: null,
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle non-string password values", () => {
      const testCases = [
        {
          input: {
            currentPassword: 123 as any,
            newPassword: "validPassword",
          },
          expected: {
            currentPassword: 123,
            newPassword: "validPassword",
          },
        },
        {
          input: {
            currentPassword: "validPassword",
            newPassword: true as any,
          },
          expected: {
            currentPassword: "validPassword",
            newPassword: true,
          },
        },
        {
          input: {
            currentPassword: {} as any,
            newPassword: [] as any,
          },
          expected: {
            currentPassword: {},
            newPassword: [],
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle empty strings", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "",
        newPassword: "",
      };

      const result = sut.sanitize(input);

      expect(result).toEqual({
        currentPassword: "",
        newPassword: "",
      });
    });

    it("should handle strings with only whitespace", () => {
      const testCases = [
        {
          input: {
            currentPassword: "   ",
            newPassword: "\t\t",
          },
          expected: {
            currentPassword: "",
            newPassword: "",
          },
        },
        {
          input: {
            currentPassword: "\n\n",
            newPassword: " \t\n ",
          },
          expected: {
            currentPassword: "",
            newPassword: "",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle strings with only malicious characters", () => {
      const testCases = [
        {
          input: {
            currentPassword: "'\";\\",
            newPassword: "--",
          },
          expected: {
            currentPassword: "",
            newPassword: "",
          },
        },
        {
          input: {
            currentPassword: "/**/",
            newPassword: "'--;/*",
          },
          expected: {
            currentPassword: "",
            newPassword: "",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should preserve safe special characters", () => {
      const testCases = [
        {
          input: {
            currentPassword: "password@123",
            newPassword: "new#password$",
          },
          expected: {
            currentPassword: "password@123",
            newPassword: "new#password$",
          },
        },
        {
          input: {
            currentPassword: "pass%word&test",
            newPassword: "new(password)test",
          },
          expected: {
            currentPassword: "pass%word&test",
            newPassword: "new(password)test",
          },
        },
        {
          input: {
            currentPassword: "password+test!",
            newPassword: "new=password?",
          },
          expected: {
            currentPassword: "password+test!",
            newPassword: "new=password?",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle unicode characters", () => {
      const testCases = [
        {
          input: {
            currentPassword: "pássword123",
            newPassword: "new密码",
          },
          expected: {
            currentPassword: "pássword123",
            newPassword: "new密码",
          },
        },
        {
          input: {
            currentPassword: "contraseña🔒",
            newPassword: "新しいパスワード",
          },
          expected: {
            currentPassword: "contraseña🔒",
            newPassword: "新しいパスワード",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle very long passwords", () => {
      const longPassword1 = "a".repeat(1000) + "'" + "b".repeat(1000);
      const longPassword2 = "c".repeat(500) + "--" + "d".repeat(500);
      const expectedLong1 = "a".repeat(1000) + "b".repeat(1000);
      const expectedLong2 = "c".repeat(500) + "d".repeat(500);

      const input: UpdateUserInputDTO = {
        currentPassword: longPassword1,
        newPassword: longPassword2,
      };

      const result = sut.sanitize(input);

      expect(result.currentPassword).toBe(expectedLong1);
      expect(result.newPassword).toBe(expectedLong2);
      expect(result.currentPassword.length).toBe(2000);
      expect(result.newPassword.length).toBe(1000);
    });

    it("should handle complex SQL injection attempts", () => {
      const testCases = [
        {
          input: {
            currentPassword: "current'; DROP TABLE users; --",
            newPassword: "new/**/UNION/**/SELECT/**/",
          },
          expected: {
            currentPassword: "current DROP TABLE users ",
            newPassword: "newUNIONSELECT",
          },
        },
        {
          input: {
            currentPassword: "pass\\';/*comment*/--end",
            newPassword: 'new"OR 1=1;--',
          },
          expected: {
            currentPassword: "passcommentend",
            newPassword: "newOR 1=1",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should be consistent across multiple calls with same input", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "  current'  ;  --test  ",
        newPassword: '  new"  /*comment*/  ',
      };
      const expected = {
        currentPassword: "current  test",
        newPassword: "new comment",
      };

      for (let i = 0; i < 5; i++) {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      }
    });

    it("should not modify the original input object", () => {
      const originalInput: UpdateUserInputDTO = {
        currentPassword: "  original'current  ",
        newPassword: '  original"new  ',
      };
      const inputCopy = { ...originalInput };

      sut.sanitize(originalInput);

      expect(originalInput).toEqual(inputCopy);
    });

    it("should handle asymmetric password scenarios", () => {
      const testCases = [
        {
          input: {
            currentPassword: "simple",
            newPassword: "complex'\"--/*password*/",
          },
          expected: {
            currentPassword: "simple",
            newPassword: "complexpassword",
          },
        },
        {
          input: {
            currentPassword: "malicious'--;/*",
            newPassword: "clean123",
          },
          expected: {
            currentPassword: "malicious",
            newPassword: "clean123",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle edge cases with mixed line endings", () => {
      const testCases = [
        {
          input: {
            currentPassword: "current\r\npassword",
            newPassword: "new\rpassword",
          },
          expected: {
            currentPassword: "current password",
            newPassword: "new password",
          },
        },
        {
          input: {
            currentPassword: "current\n\rpassword",
            newPassword: "new\r\n\rpassword",
          },
          expected: {
            currentPassword: "current password",
            newPassword: "new password",
          },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("constructor", () => {
    it("should initialize successfully", () => {
      const sanitizer = new UpdateUserPasswordSanitizer();
      expect(sanitizer).toBeInstanceOf(UpdateUserPasswordSanitizer);
    });

    it("should have sanitize method available", () => {
      const sanitizer = new UpdateUserPasswordSanitizer();
      expect(typeof sanitizer.sanitize).toBe("function");
    });
  });

  describe("integration scenarios", () => {
    it("should work with realistic password update scenarios", () => {
      const realisticScenarios = [
        {
          input: {
            currentPassword: "MyCurrentPass123!",
            newPassword: "MyNewSecurePass456@",
          },
          expected: {
            currentPassword: "MyCurrentPass123!",
            newPassword: "MyNewSecurePass456@",
          },
        },
        {
          input: {
            currentPassword: "  old_password_123  ",
            newPassword: "  new-password-456  ",
          },
          expected: {
            currentPassword: "old_password_123",
            newPassword: "new-password-456",
          },
        },
      ];

      realisticScenarios.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });

    it("should handle security-focused scenarios", () => {
      const securityScenarios = [
        {
          input: {
            currentPassword: "password123'; DROP TABLE users; --",
            newPassword: "newpass/*admin*/--backdoor",
          },
          expected: {
            currentPassword: "password123 DROP TABLE users ",
            newPassword: "newpassadminbackdoor",
          },
        },
        {
          input: {
            currentPassword: 'pass\\"word',
            newPassword: "new'pass\"word;",
          },
          expected: {
            currentPassword: "password",
            newPassword: "newpassword",
          },
        },
      ];

      securityScenarios.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("performance considerations", () => {
    it("should handle multiple sanitizations efficiently", () => {
      const testInput: UpdateUserInputDTO = {
        currentPassword: "  current'  ;  --test  ",
        newPassword: '  new"  /*comment*/  ',
      };
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        sut.sanitize(testInput);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 sanitizations in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should handle large inputs efficiently", () => {
      const largeCurrentPassword = "current" + "'".repeat(10000) + "test";
      const largeNewPassword = "new" + "--".repeat(5000) + "test";
      const startTime = Date.now();

      const result = sut.sanitize({
        currentPassword: largeCurrentPassword,
        newPassword: largeNewPassword,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.currentPassword).not.toContain("'");
      expect(result.newPassword).not.toContain("--");
      expect(duration).toBeLessThan(50);
    });
  });

  describe("type safety and validation", () => {
    it("should maintain proper typing for UpdateUserInputDTO", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "current123",
        newPassword: "new456",
      };

      const result = sut.sanitize(input);

      expect(typeof result.currentPassword).toBe("string");
      expect(typeof result.newPassword).toBe("string");
      expect(Object.keys(result)).toEqual(["currentPassword", "newPassword"]);
    });

    it("should handle all required properties of UpdateUserInputDTO", () => {
      const input: UpdateUserInputDTO = {
        currentPassword: "test'current",
        newPassword: 'test"new',
      };

      const result = sut.sanitize(input);

      expect(result).toHaveProperty("currentPassword");
      expect(result).toHaveProperty("newPassword");
      expect(Object.keys(result).length).toBe(2);
    });
  });
});

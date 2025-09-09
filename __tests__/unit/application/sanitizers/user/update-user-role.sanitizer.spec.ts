import { UpdateUserRoleSanitizer } from "../../../../../src/application/sanitizers/user/update-user-role.sanitizer";
import { UserRole } from "../../../../../src/domain/entities";

describe("UpdateUserRoleSanitizer", () => {
  let sut: UpdateUserRoleSanitizer;

  beforeEach(() => {
    sut = new UpdateUserRoleSanitizer();
  });

  describe("sanitize", () => {
    it("should return the same role when it's a valid UserRole without issues", () => {
      const validRoles = [UserRole.ADMIN, UserRole.CHEFE, UserRole.BOMBEIRO];

      validRoles.forEach((role) => {
        const result = sut.sanitize(role);
        expect(result).toBe(role);
      });
    });

    it("should trim whitespace from role strings", () => {
      const testCases = [
        { input: "  admin  " as UserRole, expected: UserRole.ADMIN },
        { input: "  chefe  " as UserRole, expected: "chefe" as UserRole },
        { input: "  bombeiro  " as UserRole, expected: "bombeiro" as UserRole },
        { input: " admin " as UserRole, expected: UserRole.ADMIN },
        { input: "\tadmin\t" as UserRole, expected: UserRole.ADMIN },
        { input: "\nchefe\n" as UserRole, expected: "chefe" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should replace multiple consecutive spaces with single space", () => {
      const testCases = [
        {
          input: "admin    test" as UserRole,
          expected: "admin test" as UserRole,
        },
        {
          input: "chefe     extra     spaces" as UserRole,
          expected: "chefe extra spaces" as UserRole,
        },
        {
          input: "bombeiro\t\t\ttabs" as UserRole,
          expected: "bombeiro tabs" as UserRole,
        },
        {
          input: "admin\n\n\nnewlines" as UserRole,
          expected: "admin newlines" as UserRole,
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should remove SQL injection characters", () => {
      const testCases = [
        { input: "admin'" as UserRole, expected: "admin" as UserRole },
        { input: 'chefe"' as UserRole, expected: "chefe" as UserRole },
        { input: "bombeiro;" as UserRole, expected: "bombeiro" as UserRole },
        { input: "admin\\" as UserRole, expected: "admin" as UserRole },
        { input: "admin'\";\\" as UserRole, expected: "admin" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should remove SQL comment patterns", () => {
      const testCases = [
        {
          input: "admin--comment" as UserRole,
          expected: "admincomment" as UserRole,
        },
        {
          input: "chefe/*comment*/" as UserRole,
          expected: "chefecomment" as UserRole,
        },
        { input: "bombeiro--" as UserRole, expected: "bombeiro" as UserRole },
        { input: "admin/*" as UserRole, expected: "admin" as UserRole },
        { input: "chefe*/" as UserRole, expected: "chefe" as UserRole },
        { input: "--admin" as UserRole, expected: "admin" as UserRole },
        { input: "/*chefe" as UserRole, expected: "chefe" as UserRole },
        { input: "bombeiro*/" as UserRole, expected: "bombeiro" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle combined sanitization scenarios", () => {
      const testCases = [
        {
          input: "  admin'  ;  --comment  " as UserRole,
          expected: "admin  comment" as UserRole,
        },
        {
          input: '\t chefe"  /*test*/  \n' as UserRole,
          expected: "chefe test" as UserRole,
        },
        {
          input: "  bombeiro\\  ;;  --  /**/  " as UserRole,
          expected: "bombeiro   " as UserRole,
        },
        {
          input: "'\"admin;\\--/*comment*/" as UserRole,
          expected: "admincomment" as UserRole,
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should return the original value when role is null", () => {
      const result = sut.sanitize(null as any);
      expect(result).toBeNull();
    });

    it("should return the original value when role is undefined", () => {
      const result = sut.sanitize(undefined as any);
      expect(result).toBeUndefined();
    });

    it("should return the original value when role is not a string", () => {
      const nonStringValues = [123, true, false, {}, [], () => {}];

      nonStringValues.forEach((value) => {
        const result = sut.sanitize(value as any);
        expect(result).toBe(value);
      });
    });

    it("should handle empty strings", () => {
      const result = sut.sanitize("" as UserRole);
      expect(result).toBe("");
    });

    it("should handle strings with only whitespace", () => {
      const testCases = [
        { input: "   " as UserRole, expected: "" as UserRole },
        { input: "\t\t" as UserRole, expected: "" as UserRole },
        { input: "\n\n" as UserRole, expected: "" as UserRole },
        { input: " \t\n " as UserRole, expected: "" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle strings with only malicious characters", () => {
      const testCases = [
        { input: "'\";\\" as UserRole, expected: "" as UserRole },
        { input: "--" as UserRole, expected: "" as UserRole },
        { input: "/**/" as UserRole, expected: "" as UserRole },
        { input: "'--;/*" as UserRole, expected: "" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should maintain valid role values exactly", () => {
      const validRoleStrings = ["admin", "chefe", "bombeiro"];

      validRoleStrings.forEach((roleString) => {
        const result = sut.sanitize(roleString as UserRole);
        expect(result).toBe(roleString);
      });
    });

    it("should be case sensitive and not alter casing", () => {
      const testCases = [
        { input: "ADMIN" as UserRole, expected: "ADMIN" as UserRole },
        { input: "Admin" as UserRole, expected: "Admin" as UserRole },
        { input: "aDmIn" as UserRole, expected: "aDmIn" as UserRole },
        { input: "CHEFE" as UserRole, expected: "CHEFE" as UserRole },
        { input: "Chefe" as UserRole, expected: "Chefe" as UserRole },
        { input: "BOMBEIRO" as UserRole, expected: "BOMBEIRO" as UserRole },
        { input: "Bombeiro" as UserRole, expected: "Bombeiro" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle special characters that are not SQL injection related", () => {
      const testCases = [
        { input: "admin@test" as UserRole, expected: "admin@test" as UserRole },
        { input: "chefe#123" as UserRole, expected: "chefe#123" as UserRole },
        {
          input: "bombeiro$var" as UserRole,
          expected: "bombeiro$var" as UserRole,
        },
        {
          input: "admin%percent" as UserRole,
          expected: "admin%percent" as UserRole,
        },
        { input: "chefe&and" as UserRole, expected: "chefe&and" as UserRole },
        {
          input: "bombeiro(test)" as UserRole,
          expected: "bombeiro(test)" as UserRole,
        },
        { input: "admin+plus" as UserRole, expected: "admin+plus" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle unicode characters", () => {
      const testCases = [
        { input: "admín" as UserRole, expected: "admín" as UserRole },
        { input: "chêfe" as UserRole, expected: "chêfe" as UserRole },
        { input: "bombeíro" as UserRole, expected: "bombeíro" as UserRole },
        { input: "admin中文" as UserRole, expected: "admin中文" as UserRole },
        { input: "chefe🔥" as UserRole, expected: "chefe🔥" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000) + "'" + "b".repeat(1000);
      const expected = "a".repeat(1000) + "b".repeat(1000);

      const result = sut.sanitize(longString as UserRole);
      expect(result).toBe(expected);
      expect(result.length).toBe(2000);
    });

    it("should handle complex nested SQL injection attempts", () => {
      const testCases = [
        {
          input: "admin'; DROP TABLE users; --" as UserRole,
          expected: "admin DROP TABLE users " as UserRole,
        },
        {
          input: "chefe/**/UNION/**/SELECT/**/" as UserRole,
          expected: "chefeUNIONSELECT" as UserRole,
        },
        {
          input: "bombeiro\\';/*comment*/--end" as UserRole,
          expected: "bombeirocommentend" as UserRole,
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should be consistent across multiple calls with same input", () => {
      const testInput = "  admin'  ;  --test  " as UserRole;
      const expected = "admin  test" as UserRole;

      for (let i = 0; i < 5; i++) {
        const result = sut.sanitize(testInput);
        expect(result).toBe(expected);
      }
    });

    it("should not modify the original input parameter", () => {
      const originalInput = "  admin'  " as UserRole;
      const inputCopy = originalInput;

      sut.sanitize(originalInput);

      expect(originalInput).toBe(inputCopy);
    });
  });

  describe("edge cases and defensive programming", () => {
    it("should handle malformed SQL patterns", () => {
      const testCases = [
        { input: "admin-" as UserRole, expected: "admin-" as UserRole },
        { input: "chefe*" as UserRole, expected: "chefe*" as UserRole },
        { input: "bombeiro/" as UserRole, expected: "bombeiro/" as UserRole },
        {
          input: "admin/*incomplete" as UserRole,
          expected: "adminincomplete" as UserRole,
        },
        {
          input: "chefe*/incomplete" as UserRole,
          expected: "chefeincomplete" as UserRole,
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle mixed line endings", () => {
      const testCases = [
        {
          input: "admin\r\ntest" as UserRole,
          expected: "admin test" as UserRole,
        },
        {
          input: "chefe\rtest" as UserRole,
          expected: "chefe test" as UserRole,
        },
        {
          input: "bombeiro\n\rtest" as UserRole,
          expected: "bombeiro test" as UserRole,
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });

    it("should handle roles with numbers", () => {
      const testCases = [
        { input: "admin123" as UserRole, expected: "admin123" as UserRole },
        { input: "chefe456" as UserRole, expected: "chefe456" as UserRole },
        {
          input: "bombeiro789" as UserRole,
          expected: "bombeiro789" as UserRole,
        },
        { input: "123admin" as UserRole, expected: "123admin" as UserRole },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = sut.sanitize(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("constructor", () => {
    it("should initialize successfully", () => {
      const sanitizer = new UpdateUserRoleSanitizer();
      expect(sanitizer).toBeInstanceOf(UpdateUserRoleSanitizer);
    });

    it("should have sanitize method available", () => {
      const sanitizer = new UpdateUserRoleSanitizer();
      expect(typeof sanitizer.sanitize).toBe("function");
    });
  });

  describe("integration with UserRole enum", () => {
    it("should work correctly with all UserRole enum values", () => {
      Object.values(UserRole).forEach((role) => {
        const result = sut.sanitize(role);
        expect(result).toBe(role);
        expect(typeof result).toBe("string");
      });
    });

    it("should sanitize malicious content while preserving role structure", () => {
      const maliciousRoles = [
        `${UserRole.ADMIN}'; DROP TABLE users; --`,
        `  ${UserRole.CHEFE}  /*comment*/  `,
        `${UserRole.BOMBEIRO}\\\\`,
      ];

      maliciousRoles.forEach((maliciousRole) => {
        const result = sut.sanitize(maliciousRole as UserRole);
        expect(result).not.toContain("'");
        expect(result).not.toContain('"');
        expect(result).not.toContain(";");
        expect(result).not.toContain("\\");
        expect(result).not.toContain("--");
        expect(result).not.toContain("/*");
        expect(result).not.toContain("*/");
      });
    });
  });

  describe("performance considerations", () => {
    it("should handle multiple sanitizations efficiently", () => {
      const testRole = "  admin'  ;  --test  " as UserRole;
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        sut.sanitize(testRole);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 sanitizations in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should handle large inputs efficiently", () => {
      const largeInput = "admin" + "'".repeat(10000) + "test";
      const startTime = Date.now();

      const result = sut.sanitize(largeInput as UserRole);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).not.toContain("'");
      expect(duration).toBeLessThan(50);
    });
  });
});

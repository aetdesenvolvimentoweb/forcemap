import {
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { UpdateUserRoleValidator } from "../../../../../src/application/validators/user/update-user-role.validator";
import { UserRole } from "../../../../../src/domain/entities";

describe("UpdateUserRoleValidator", () => {
  let sut: UpdateUserRoleValidator;

  beforeEach(() => {
    sut = new UpdateUserRoleValidator();
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(UpdateUserRoleValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should validate successfully with valid ADMIN role", async () => {
      await expect(sut.validate(UserRole.ADMIN)).resolves.not.toThrow();
    });

    it("should validate successfully with valid CHEFE role", async () => {
      await expect(sut.validate(UserRole.CHEFE)).resolves.not.toThrow();
    });

    it("should validate successfully with valid BOMBEIRO role", async () => {
      await expect(sut.validate(UserRole.BOMBEIRO)).resolves.not.toThrow();
    });

    it("should validate successfully with all valid user roles", async () => {
      for (const role of Object.values(UserRole)) {
        await expect(sut.validate(role)).resolves.not.toThrow();
      }
    });

    describe("Role presence validation", () => {
      it("should throw MissingParamError when role is null", async () => {
        await expect(sut.validate(null as any)).rejects.toThrow(
          new MissingParamError("Função do Usuário"),
        );
      });

      it("should throw MissingParamError when role is undefined", async () => {
        await expect(sut.validate(undefined as any)).rejects.toThrow(
          new MissingParamError("Função do Usuário"),
        );
      });

      it("should throw MissingParamError when role is empty string", async () => {
        await expect(sut.validate("" as any)).rejects.toThrow(
          new MissingParamError("Função do Usuário"),
        );
      });

      it("should throw MissingParamError when role is whitespace only", async () => {
        await expect(sut.validate("   " as any)).rejects.toThrow(
          new MissingParamError("Função do Usuário"),
        );
      });
    });

    describe("Role range validation", () => {
      it("should throw InvalidParamError when role is invalid string", async () => {
        await expect(sut.validate("INVALID_ROLE" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role is random string", async () => {
        await expect(sut.validate("RANDOM_STRING" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role is number", async () => {
        await expect(sut.validate(123 as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role is object", async () => {
        await expect(sut.validate({} as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role is array", async () => {
        await expect(sut.validate([] as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role is boolean", async () => {
        await expect(sut.validate(true as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate(false as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });
    });

    describe("Case sensitivity", () => {
      it("should throw InvalidParamError when role has wrong case", async () => {
        await expect(sut.validate("ADMIN" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate("CHEFE" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate("BOMBEIRO" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError when role has mixed case", async () => {
        await expect(sut.validate("Admin" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate("Chefe" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate("Bombeiro" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });
    });

    describe("Similar but invalid values", () => {
      it("should throw InvalidParamError for similar role names", async () => {
        const invalidRoles = [
          "ADMINISTRATOR",
          "ADMIN_USER",
          "CHEF",
          "CHEFE_USER",
          "FIREFIGHTER",
          "BOMBEIRO_USER",
          "USER",
          "GUEST",
          "MODERATOR",
        ];

        for (const role of invalidRoles) {
          await expect(sut.validate(role as any)).rejects.toThrow(
            new InvalidParamError("Função do Usuário", "valor inválido"),
          );
        }
      });

      it("should throw InvalidParamError for roles with extra characters", async () => {
        await expect(sut.validate("ADMIN " as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate(" CHEFE" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate("BOMBEIRO\n" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });
    });

    describe("UserRole enum consistency", () => {
      it("should validate all enum values are properly handled", async () => {
        const userRoleValues = Object.values(UserRole);

        expect(userRoleValues).toContain(UserRole.ADMIN);
        expect(userRoleValues).toContain(UserRole.CHEFE);
        expect(userRoleValues).toContain(UserRole.BOMBEIRO);

        // Ensure we test all values that exist
        expect(userRoleValues).toHaveLength(3);

        for (const role of userRoleValues) {
          await expect(sut.validate(role)).resolves.not.toThrow();
        }
      });

      it("should validate enum values match expected strings", async () => {
        expect(UserRole.ADMIN).toBe("admin");
        expect(UserRole.CHEFE).toBe("chefe");
        expect(UserRole.BOMBEIRO).toBe("bombeiro");
      });
    });

    describe("Special characters and unicode", () => {
      it("should throw InvalidParamError for roles with special characters", async () => {
        const invalidRoles = [
          "ADMIN@",
          "CHEFE#",
          "BOMBEIRO!",
          "ADMIN-USER",
          "CHEFE_ROLE",
          "BOMBEIRO.USER",
        ];

        for (const role of invalidRoles) {
          await expect(sut.validate(role as any)).rejects.toThrow(
            new InvalidParamError("Função do Usuário", "valor inválido"),
          );
        }
      });

      it("should throw InvalidParamError for roles with unicode characters", async () => {
        const invalidRoles = ["ADMÍN", "CHÉFE", "BOMBEÏRO", "USÉR"];

        for (const role of invalidRoles) {
          await expect(sut.validate(role as any)).rejects.toThrow(
            new InvalidParamError("Função do Usuário", "valor inválido"),
          );
        }
      });
    });

    describe("Edge cases", () => {
      it("should throw InvalidParamError for very long strings", async () => {
        const longString = "A".repeat(1000);

        await expect(sut.validate(longString as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError for roles with newlines", async () => {
        await expect(sut.validate("ADMIN\nCHEFE" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });

      it("should throw InvalidParamError for roles with tabs", async () => {
        await expect(sut.validate("ADMIN\tCHEFE" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );
      });
    });

    describe("Multiple validation calls", () => {
      it("should validate multiple valid roles in sequence", async () => {
        await expect(sut.validate(UserRole.ADMIN)).resolves.not.toThrow();
        await expect(sut.validate(UserRole.CHEFE)).resolves.not.toThrow();
        await expect(sut.validate(UserRole.BOMBEIRO)).resolves.not.toThrow();
        await expect(sut.validate(UserRole.ADMIN)).resolves.not.toThrow();
      });

      it("should handle mixed valid and invalid calls", async () => {
        await expect(sut.validate(UserRole.ADMIN)).resolves.not.toThrow();

        await expect(sut.validate("INVALID" as any)).rejects.toThrow(
          new InvalidParamError("Função do Usuário", "valor inválido"),
        );

        await expect(sut.validate(UserRole.CHEFE)).resolves.not.toThrow();
      });
    });

    describe("Validation order", () => {
      it("should check presence before range validation", async () => {
        // When role is null/undefined, should throw MissingParamError, not InvalidParamError
        await expect(sut.validate(null as any)).rejects.toThrow(
          MissingParamError,
        );
        await expect(sut.validate(undefined as any)).rejects.toThrow(
          MissingParamError,
        );

        // Should not throw InvalidParamError for these cases
        await expect(sut.validate(null as any)).rejects.not.toThrow(
          InvalidParamError,
        );
        await expect(sut.validate(undefined as any)).rejects.not.toThrow(
          InvalidParamError,
        );
      });
    });
  });
});

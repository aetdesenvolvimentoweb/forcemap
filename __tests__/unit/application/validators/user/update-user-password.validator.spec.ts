import {
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { UpdateUserPasswordValidator } from "../../../../../src/application/validators/user/update-user-password.validator";
import { UpdateUserInputDTO } from "../../../../../src/domain/dtos";

describe("UpdateUserPasswordValidator", () => {
  let sut: UpdateUserPasswordValidator;

  const validInputData: UpdateUserInputDTO = {
    currentPassword: "CurrentPass@123",
    newPassword: "NewSecure#Pass456",
  };

  beforeEach(() => {
    sut = new UpdateUserPasswordValidator();
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(UpdateUserPasswordValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should validate successfully with valid input data", async () => {
      await expect(sut.validate(validInputData)).resolves.not.toThrow();
    });

    describe("Current password validation", () => {
      it("should throw MissingParamError when currentPassword is null", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: null as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha Atual"),
        );
      });

      it("should throw MissingParamError when currentPassword is undefined", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: undefined as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha Atual"),
        );
      });

      it("should throw MissingParamError when currentPassword is empty string", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha Atual"),
        );
      });

      it("should throw InvalidParamError when currentPassword is shorter than 8 characters", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "Pass@1",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve ter pelo menos 8 caracteres",
          ),
        );
      });

      it("should throw InvalidParamError when currentPassword has no uppercase letter", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "validpass@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should throw InvalidParamError when currentPassword has no lowercase letter", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "VALIDPASS@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should throw InvalidParamError when currentPassword has no number", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "ValidPass@",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve conter pelo menos 1 número",
          ),
        );
      });

      it("should throw InvalidParamError when currentPassword has no special character", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "ValidPass123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });
    });

    describe("New password validation", () => {
      it("should throw MissingParamError when newPassword is null", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: null as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Nova Senha"),
        );
      });

      it("should throw MissingParamError when newPassword is undefined", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: undefined as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Nova Senha"),
        );
      });

      it("should throw MissingParamError when newPassword is empty string", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Nova Senha"),
        );
      });

      it("should throw InvalidParamError when newPassword is shorter than 8 characters", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "Pass@1",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve ter pelo menos 8 caracteres",
          ),
        );
      });

      it("should throw InvalidParamError when newPassword has no uppercase letter", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "validpass@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should throw InvalidParamError when newPassword has no lowercase letter", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "VALIDPASS@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should throw InvalidParamError when newPassword has no number", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "ValidPass@",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve conter pelo menos 1 número",
          ),
        );
      });

      it("should throw InvalidParamError when newPassword has no special character", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "ValidPass123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });
    });

    describe("Password format validation with special characters", () => {
      it("should validate successfully with all allowed special characters in currentPassword", async () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          const inputData: UpdateUserInputDTO = {
            ...validInputData,
            currentPassword: `ValidPass${char}123`,
          };

          await expect(sut.validate(inputData)).resolves.not.toThrow();
        }
      });

      it("should validate successfully with all allowed special characters in newPassword", async () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          const inputData: UpdateUserInputDTO = {
            ...validInputData,
            newPassword: `NewPass${char}456`,
          };

          await expect(sut.validate(inputData)).resolves.not.toThrow();
        }
      });

      it("should validate successfully with valid passwords containing different patterns", async () => {
        const validPasswords = [
          "ValidPass@123",
          "MySecure#Pass1",
          "Test$Password9",
          "Strong!Pass123",
          "Complex&Pass456",
          "Secure*Pass789",
        ];

        for (const currentPassword of validPasswords) {
          for (const newPassword of validPasswords) {
            if (currentPassword !== newPassword) {
              const inputData: UpdateUserInputDTO = {
                currentPassword,
                newPassword,
              };

              await expect(sut.validate(inputData)).resolves.not.toThrow();
            }
          }
        }
      });
    });

    describe("Combined validation scenarios", () => {
      it("should throw first validation error when both passwords are invalid", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: null as any,
          newPassword: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha Atual"),
        );
      });

      it("should throw newPassword error after currentPassword validation passes", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          newPassword: "weak",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Nova Senha",
            "deve ter pelo menos 8 caracteres",
          ),
        );
      });

      it("should validate same password for current and new (business rule validation would be elsewhere)", async () => {
        const samePassword = "SamePass@123";
        const inputData: UpdateUserInputDTO = {
          currentPassword: samePassword,
          newPassword: samePassword,
        };

        // This validator only checks format, business rule for "different passwords" would be elsewhere
        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });
    });

    describe("Password complexity edge cases", () => {
      it("should accept password with minimum requirements", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "Aa1!aaaa", // Exactly 8 chars with all requirements
          newPassword: "Bb2@bbbb", // Exactly 8 chars with all requirements
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should accept password with multiple special characters", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "ValidPass@!#123",
          newPassword: "NewPass$%^456",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should accept password with numbers at different positions", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "1ValidPass@",
          newPassword: "Valid2Pass@",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should accept very long passwords", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "VeryLongValidPassword@123WithManyCharacters",
          newPassword: "AnotherVeryLongValidPassword@456WithManyCharacters",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should reject password with only 7 characters even if all other requirements are met", async () => {
        const inputData: UpdateUserInputDTO = {
          ...validInputData,
          currentPassword: "Aa1!aaa", // Only 7 chars
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha Atual",
            "deve ter pelo menos 8 caracteres",
          ),
        );
      });
    });

    describe("Unicode and international characters", () => {
      it("should handle passwords with unicode characters", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "ValidPáss@123", // Contains accented character
          newPassword: "NewSenhã@456", // Contains accented character
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should handle passwords with emojis", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "ValidPass🔒@123",
          newPassword: "NewPass🛡️@456",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });
    });

    describe("Whitespace handling", () => {
      it("should accept passwords with internal spaces", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: "Valid Pass@123",
          newPassword: "New Pass@456",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });

      it("should accept passwords with leading/trailing spaces", async () => {
        const inputData: UpdateUserInputDTO = {
          currentPassword: " ValidPass@123 ",
          newPassword: " NewPass@456 ",
        };

        await expect(sut.validate(inputData)).resolves.not.toThrow();
      });
    });
  });
});

import {
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { UserPasswordValidator } from "../../../../../src/application/validators";

describe("UserPasswordValidator", () => {
  let sut: UserPasswordValidator;

  beforeEach(() => {
    sut = new UserPasswordValidator();
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(UserPasswordValidator);
      expect(sut.validate).toBeDefined();
      expect(sut.validateFormat).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should validate successfully with valid password", () => {
      expect(() => sut.validate("ValidPass@123")).not.toThrow();
    });

    it("should validate successfully with custom label", () => {
      expect(() =>
        sut.validate("ValidPass@123", "Custom Password"),
      ).not.toThrow();
    });

    describe("presence validation", () => {
      it("should throw MissingParamError when password is null", () => {
        expect(() => sut.validate(null as any)).toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is undefined", () => {
        expect(() => sut.validate(undefined as any)).toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is empty string", () => {
        expect(() => sut.validate("")).toThrow(new MissingParamError("Senha"));
      });

      it("should throw MissingParamError with custom label", () => {
        expect(() => sut.validate("", "Custom Field")).toThrow(
          new MissingParamError("Custom Field"),
        );
      });
    });

    describe("format validation", () => {
      it("should throw InvalidParamError when password is shorter than 8 characters", () => {
        expect(() => sut.validate("Pass@1")).toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });

      it("should throw InvalidParamError when password has no uppercase letter", () => {
        expect(() => sut.validate("validpass@123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no lowercase letter", () => {
        expect(() => sut.validate("VALIDPASS@123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no number", () => {
        expect(() => sut.validate("ValidPass@")).toThrow(
          new InvalidParamError("Senha", "deve conter pelo menos 1 número"),
        );
      });

      it("should throw InvalidParamError when password has no special character", () => {
        expect(() => sut.validate("ValidPass123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });

      it("should throw InvalidParamError with custom label for format validation", () => {
        expect(() => sut.validate("short", "My Password")).toThrow(
          new InvalidParamError(
            "My Password",
            "deve ter pelo menos 8 caracteres",
          ),
        );
      });
    });

    describe("special characters validation", () => {
      it("should accept all allowed special characters", () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          expect(() => sut.validate(`ValidPass${char}123`)).not.toThrow();
        }
      });
    });

    describe("edge cases", () => {
      it("should accept password with minimum requirements", () => {
        expect(() => sut.validate("Aa1!aaaa")).not.toThrow();
      });

      it("should accept password with unicode characters", () => {
        expect(() => sut.validate("ValidPáss@123")).not.toThrow();
      });

      it("should accept password with emojis", () => {
        expect(() => sut.validate("ValidPass🔒@123")).not.toThrow();
      });

      it("should accept password with spaces", () => {
        expect(() => sut.validate("Valid Pass@123")).not.toThrow();
      });

      it("should accept very long password", () => {
        expect(() =>
          sut.validate("VeryLongValidPassword@123WithManyCharacters"),
        ).not.toThrow();
      });
    });
  });

  describe("validateFormat", () => {
    it("should validate format successfully with valid password", () => {
      expect(() => sut.validateFormat("ValidPass@123")).not.toThrow();
    });

    it("should validate format successfully with custom label", () => {
      expect(() =>
        sut.validateFormat("ValidPass@123", "Custom Password"),
      ).not.toThrow();
    });

    it("should not validate presence - only format", () => {
      expect(() => sut.validateFormat("")).toThrow(
        new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
      );
    });

    describe("length validation", () => {
      it("should throw InvalidParamError when password is shorter than 8 characters", () => {
        expect(() => sut.validateFormat("Pass@1")).toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });

      it("should accept exactly 8 characters", () => {
        expect(() => sut.validateFormat("Aa1!aaaa")).not.toThrow();
      });

      it("should accept more than 8 characters", () => {
        expect(() => sut.validateFormat("ValidPass@123")).not.toThrow();
      });
    });

    describe("uppercase validation", () => {
      it("should throw InvalidParamError when no uppercase letter", () => {
        expect(() => sut.validateFormat("validpass@123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should accept single uppercase letter", () => {
        expect(() => sut.validateFormat("Avalidpass@123")).not.toThrow();
      });

      it("should accept multiple uppercase letters", () => {
        expect(() => sut.validateFormat("ValidPass@123")).not.toThrow();
      });

      it("should throw with custom label", () => {
        expect(() => sut.validateFormat("validpass@123", "My Field")).toThrow(
          new InvalidParamError(
            "My Field",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });
    });

    describe("lowercase validation", () => {
      it("should throw InvalidParamError when no lowercase letter", () => {
        expect(() => sut.validateFormat("VALIDPASS@123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should accept single lowercase letter", () => {
        expect(() => sut.validateFormat("VALIDPASs@123")).not.toThrow();
      });

      it("should accept multiple lowercase letters", () => {
        expect(() => sut.validateFormat("ValidPass@123")).not.toThrow();
      });
    });

    describe("number validation", () => {
      it("should throw InvalidParamError when no number", () => {
        expect(() => sut.validateFormat("ValidPass@")).toThrow(
          new InvalidParamError("Senha", "deve conter pelo menos 1 número"),
        );
      });

      it("should accept single number", () => {
        expect(() => sut.validateFormat("ValidPass@1")).not.toThrow();
      });

      it("should accept multiple numbers", () => {
        expect(() => sut.validateFormat("ValidPass@123")).not.toThrow();
      });

      it("should accept numbers at different positions", () => {
        expect(() => sut.validateFormat("1ValidPass@")).not.toThrow();
        expect(() => sut.validateFormat("Valid2Pass@")).not.toThrow();
        expect(() => sut.validateFormat("ValidPass@3")).not.toThrow();
      });
    });

    describe("special character validation", () => {
      it("should throw InvalidParamError when no special character", () => {
        expect(() => sut.validateFormat("ValidPass123")).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });

      it("should accept each individual special character", () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          expect(() => sut.validateFormat(`ValidPass${char}123`)).not.toThrow();
        }
      });

      it("should accept multiple special characters", () => {
        expect(() => sut.validateFormat("ValidPass@!#123")).not.toThrow();
      });
    });

    describe("combined format requirements", () => {
      it("should validate password with all requirements at minimum", () => {
        expect(() => sut.validateFormat("Aa1!aaaa")).not.toThrow();
      });

      it("should validate password with all requirements exceeded", () => {
        expect(() => sut.validateFormat("ValidPassword@123")).not.toThrow();
      });

      it("should fail when missing only one requirement", () => {
        expect(() => sut.validateFormat("validpass@123")).toThrow(); // no uppercase
        expect(() => sut.validateFormat("VALIDPASS@123")).toThrow(); // no lowercase
        expect(() => sut.validateFormat("ValidPass@")).toThrow(); // no number
        expect(() => sut.validateFormat("ValidPass123")).toThrow(); // no special char
      });
    });

    describe("international and special cases", () => {
      it("should handle unicode uppercase letters", () => {
        expect(() => sut.validateFormat("Válídpass@123")).not.toThrow();
      });

      it("should handle unicode lowercase letters", () => {
        expect(() => sut.validateFormat("VALIDpáss@123")).not.toThrow();
      });

      it("should handle emojis as part of password", () => {
        expect(() => sut.validateFormat("ValidPass🔒@123")).not.toThrow();
      });

      it("should handle spaces in password", () => {
        expect(() => sut.validateFormat("Valid Pass@123")).not.toThrow();
        expect(() => sut.validateFormat(" ValidPass@123 ")).not.toThrow();
      });
    });
  });

  describe("method differences", () => {
    it("validate should check both presence and format", () => {
      expect(() => sut.validate("")).toThrow(MissingParamError);
      expect(() => sut.validate("short")).toThrow(InvalidParamError);
    });

    it("validateFormat should only check format, not presence", () => {
      expect(() => sut.validateFormat("")).toThrow(InvalidParamError);
      expect(() => sut.validateFormat("short")).toThrow(InvalidParamError);
    });

    it("both methods should accept custom labels", () => {
      expect(() => sut.validate("", "Custom")).toThrow(
        new MissingParamError("Custom"),
      );
      expect(() => sut.validateFormat("short", "Custom")).toThrow(
        new InvalidParamError("Custom", "deve ter pelo menos 8 caracteres"),
      );
    });
  });

  describe("private method coverage through public methods", () => {
    it("should cover validatePasswordPresence through validate method with null", () => {
      expect(() => sut.validate(null as any, "Test Label")).toThrow(
        new MissingParamError("Test Label"),
      );
    });

    it("should cover validatePasswordPresence through validate method with undefined", () => {
      expect(() => sut.validate(undefined as any, "Test Label")).toThrow(
        new MissingParamError("Test Label"),
      );
    });

    it("should cover validatePasswordPresence through validate method with empty string", () => {
      expect(() => sut.validate("", "Test Label")).toThrow(
        new MissingParamError("Test Label"),
      );
    });

    it("should cover validatePasswordPresence through validate method with whitespace", () => {
      expect(() => sut.validate("   ", "Test Label")).toThrow(
        new MissingParamError("Test Label"),
      );
    });

    it("should cover validatePasswordFormat through validate method with valid presence but invalid format", () => {
      expect(() => sut.validate("short", "Test Label")).toThrow(
        new InvalidParamError("Test Label", "deve ter pelo menos 8 caracteres"),
      );
    });

    it("should cover validatePasswordFormat through validateFormat method directly", () => {
      expect(() => sut.validateFormat("short", "Test Label")).toThrow(
        new InvalidParamError("Test Label", "deve ter pelo menos 8 caracteres"),
      );
    });
  });

  describe("branch coverage scenarios", () => {
    it("should cover all default label branches", () => {
      expect(() => sut.validate("")).toThrow(new MissingParamError("Senha"));
      expect(() => sut.validate("short")).toThrow(
        new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
      );
      expect(() => sut.validateFormat("short")).toThrow(
        new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
      );
    });

    it("should cover all custom label branches", () => {
      const customLabel = "Minha Senha";
      expect(() => sut.validate("", customLabel)).toThrow(
        new MissingParamError(customLabel),
      );
      expect(() => sut.validate("short", customLabel)).toThrow(
        new InvalidParamError(customLabel, "deve ter pelo menos 8 caracteres"),
      );
      expect(() => sut.validateFormat("short", customLabel)).toThrow(
        new InvalidParamError(customLabel, "deve ter pelo menos 8 caracteres"),
      );
    });

    it("should cover successful validation branches", () => {
      const validPassword = "ValidPass@123";
      const customLabel = "Test Password";

      expect(() => sut.validate(validPassword)).not.toThrow();
      expect(() => sut.validate(validPassword, customLabel)).not.toThrow();
      expect(() => sut.validateFormat(validPassword)).not.toThrow();
      expect(() =>
        sut.validateFormat(validPassword, customLabel),
      ).not.toThrow();
    });

    it("should cover default parameter execution paths", () => {
      // Force execution without passing the label parameter to trigger default value
      const instance = sut as any;

      // Direct calls without label should use default "Senha"
      expect(() => instance.validatePasswordPresence(null)).toThrow(
        new MissingParamError("Senha"),
      );
      expect(() => instance.validatePasswordPresence(undefined)).toThrow(
        new MissingParamError("Senha"),
      );
      expect(() => instance.validatePasswordPresence("")).toThrow(
        new MissingParamError("Senha"),
      );

      expect(() => instance.validatePasswordFormat("short")).toThrow(
        new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
      );
      expect(() => instance.validatePasswordFormat("validpass@123")).toThrow(
        new InvalidParamError(
          "Senha",
          "deve conter pelo menos 1 letra maiúscula",
        ),
      );
      expect(() => instance.validatePasswordFormat("VALIDPASS@123")).toThrow(
        new InvalidParamError(
          "Senha",
          "deve conter pelo menos 1 letra minúscula",
        ),
      );
      expect(() => instance.validatePasswordFormat("ValidPass@")).toThrow(
        new InvalidParamError("Senha", "deve conter pelo menos 1 número"),
      );
      expect(() => instance.validatePasswordFormat("ValidPass123")).toThrow(
        new InvalidParamError(
          "Senha",
          "deve conter pelo menos 1 caractere especial",
        ),
      );

      // Test successful validation with default parameter
      expect(() =>
        instance.validatePasswordPresence("ValidPass@123"),
      ).not.toThrow();
      expect(() =>
        instance.validatePasswordFormat("ValidPass@123"),
      ).not.toThrow();
    });
  });
});

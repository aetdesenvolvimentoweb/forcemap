import {
  InvalidParamError,
  MissingParamError,
} from "../../../../src/application/errors";
import { UserCredentialsInputDTOValidator } from "../../../../src/application/validators/user-credentials.input.dto.validator";
import { UserCredentialsInputDTO } from "../../../../src/domain/dtos";

describe("UserCredentialsInputDTOValidator", () => {
  let sut: UserCredentialsInputDTOValidator;

  const validInputData: UserCredentialsInputDTO = {
    rg: 1234,
    password: "ValidPass@123",
  };

  beforeEach(() => {
    sut = new UserCredentialsInputDTOValidator();
  });

  describe("constructor", () => {
    it("should create instance correctly", () => {
      expect(sut).toBeInstanceOf(UserCredentialsInputDTOValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should validate successfully with valid input data", () => {
      expect(() => sut.validate(validInputData)).not.toThrow();
    });

    describe("RG validation", () => {
      it("should throw MissingParamError when rg is null", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: null as any,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("RG"),
        );
      });

      it("should throw MissingParamError when rg is undefined", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: undefined as any,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("RG"),
        );
      });

      it("should throw InvalidParamError when rg is NaN", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: NaN,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("RG", "deve ser um número positivo"),
        );
      });

      it("should throw InvalidParamError when rg is not a number", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: "123" as any,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("RG", "deve ser um número positivo"),
        );
      });

      it("should throw InvalidParamError when rg is zero", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: 0,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("RG", "deve ser um número positivo"),
        );
      });

      it("should throw InvalidParamError when rg is negative", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: -123,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("RG", "deve ser um número positivo"),
        );
      });

      it("should throw InvalidParamError when rg is greater than 10000", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: 10001,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("RG", "deve estar entre 1 e 10000"),
        );
      });

      it("should validate successfully when rg is 1", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: 1,
        };

        expect(() => sut.validate(inputData)).not.toThrow();
      });

      it("should validate successfully when rg is 10000", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          rg: 10000,
        };

        expect(() => sut.validate(inputData)).not.toThrow();
      });
    });

    describe("Password validation", () => {
      it("should throw MissingParamError when password is null", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: null as any,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is undefined", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: undefined as any,
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is empty string", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw InvalidParamError when password is shorter than 8 characters", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "Pass@1",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });

      it("should throw InvalidParamError when password has no uppercase letter", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "validpass@123",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no lowercase letter", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "VALIDPASS@123",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no number", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "ValidPass@",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("Senha", "deve conter pelo menos 1 número"),
        );
      });

      it("should throw InvalidParamError when password has no special character", () => {
        const inputData: UserCredentialsInputDTO = {
          ...validInputData,
          password: "ValidPass123",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });

      it("should validate successfully with all special characters", () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          const inputData: UserCredentialsInputDTO = {
            ...validInputData,
            password: `ValidPass${char}123`,
          };

          expect(() => sut.validate(inputData)).not.toThrow();
        }
      });

      it("should validate successfully with valid password", () => {
        const validPasswords = [
          "ValidPass@123",
          "MySecure#Pass1",
          "Test$Password9",
          "Strong!Pass123",
        ];

        validPasswords.forEach((password) => {
          const inputData: UserCredentialsInputDTO = {
            ...validInputData,
            password,
          };

          expect(() => sut.validate(inputData)).not.toThrow();
        });
      });
    });

    describe("Combined validation", () => {
      it("should throw first validation error when multiple fields are invalid", () => {
        const inputData: UserCredentialsInputDTO = {
          rg: null as any,
          password: "",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new MissingParamError("RG"),
        );
      });

      it("should throw password error after RG validation passes", () => {
        const inputData: UserCredentialsInputDTO = {
          rg: 1234,
          password: "weak",
        };

        expect(() => sut.validate(inputData)).toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });
    });
  });
});

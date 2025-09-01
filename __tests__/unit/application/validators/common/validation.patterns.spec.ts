import {
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { ValidationPatterns } from "../../../../../src/application/validators";

describe("ValidationPatterns", () => {
  describe("validatePresence", () => {
    it("should not throw when value is present and non-empty string", () => {
      expect(() =>
        ValidationPatterns.validatePresence("valid", "fieldName"),
      ).not.toThrow();
    });

    it("should not throw when value is present and non-string", () => {
      expect(() =>
        ValidationPatterns.validatePresence(123, "fieldName"),
      ).not.toThrow();
      expect(() =>
        ValidationPatterns.validatePresence(true, "fieldName"),
      ).not.toThrow();
      expect(() =>
        ValidationPatterns.validatePresence({}, "fieldName"),
      ).not.toThrow();
      expect(() =>
        ValidationPatterns.validatePresence([], "fieldName"),
      ).not.toThrow();
    });

    it("should throw MissingParamError when value is null", () => {
      expect(() =>
        ValidationPatterns.validatePresence(null, "fieldName"),
      ).toThrow(new MissingParamError("fieldName"));
    });

    it("should throw MissingParamError when value is undefined", () => {
      expect(() =>
        ValidationPatterns.validatePresence(undefined, "fieldName"),
      ).toThrow(new MissingParamError("fieldName"));
    });

    it("should throw MissingParamError when string is empty", () => {
      expect(() =>
        ValidationPatterns.validatePresence("", "fieldName"),
      ).toThrow(new MissingParamError("fieldName"));
    });

    it("should throw MissingParamError when string is only whitespaces", () => {
      expect(() =>
        ValidationPatterns.validatePresence("   ", "fieldName"),
      ).toThrow(new MissingParamError("fieldName"));
    });

    it("should throw MissingParamError when string is tabs and spaces", () => {
      expect(() =>
        ValidationPatterns.validatePresence("\t\n  ", "fieldName"),
      ).toThrow(new MissingParamError("fieldName"));
    });

    it("should not throw when string has content with surrounding whitespace", () => {
      expect(() =>
        ValidationPatterns.validatePresence("  content  ", "fieldName"),
      ).not.toThrow();
    });
  });

  describe("validateStringLength", () => {
    it("should not throw when string length equals maxLength", () => {
      expect(() =>
        ValidationPatterns.validateStringLength("test", 4, "fieldName"),
      ).not.toThrow();
    });

    it("should not throw when string length is less than maxLength", () => {
      expect(() =>
        ValidationPatterns.validateStringLength("test", 10, "fieldName"),
      ).not.toThrow();
    });

    it("should not throw when string is empty and maxLength is 0", () => {
      expect(() =>
        ValidationPatterns.validateStringLength("", 0, "fieldName"),
      ).not.toThrow();
    });

    it("should throw InvalidParamError when string length exceeds maxLength", () => {
      expect(() =>
        ValidationPatterns.validateStringLength("toolong", 5, "fieldName"),
      ).toThrow(
        new InvalidParamError("fieldName", "não pode exceder 5 caracteres"),
      );
    });

    it("should throw InvalidParamError when string is much longer than maxLength", () => {
      const longString = "a".repeat(100);
      expect(() =>
        ValidationPatterns.validateStringLength(longString, 10, "description"),
      ).toThrow(
        new InvalidParamError("description", "não pode exceder 10 caracteres"),
      );
    });

    it("should handle zero maxLength correctly", () => {
      expect(() =>
        ValidationPatterns.validateStringLength("a", 0, "fieldName"),
      ).toThrow(
        new InvalidParamError("fieldName", "não pode exceder 0 caracteres"),
      );
    });
  });

  describe("validateStringFormat", () => {
    it("should not throw when string matches pattern", () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(() =>
        ValidationPatterns.validateStringFormat(
          "test@email.com",
          emailPattern,
          "email",
          "formato de email inválido",
        ),
      ).not.toThrow();
    });

    it("should not throw when string matches simple pattern", () => {
      const alphaPattern = /^[A-Z]+$/;
      expect(() =>
        ValidationPatterns.validateStringFormat(
          "ABC",
          alphaPattern,
          "code",
          "apenas letras maiúsculas",
        ),
      ).not.toThrow();
    });

    it("should throw InvalidParamError when string does not match pattern", () => {
      const alphaPattern = /^[A-Z]+$/;
      expect(() =>
        ValidationPatterns.validateStringFormat(
          "abc123",
          alphaPattern,
          "code",
          "apenas letras maiúsculas",
        ),
      ).toThrow(new InvalidParamError("code", "apenas letras maiúsculas"));
    });

    it("should throw InvalidParamError when email format is invalid", () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(() =>
        ValidationPatterns.validateStringFormat(
          "invalid-email",
          emailPattern,
          "email",
          "formato de email inválido",
        ),
      ).toThrow(new InvalidParamError("email", "formato de email inválido"));
    });

    it("should handle empty string with pattern", () => {
      const nonEmptyPattern = /^.+$/;
      expect(() =>
        ValidationPatterns.validateStringFormat(
          "",
          nonEmptyPattern,
          "field",
          "não pode ser vazio",
        ),
      ).toThrow(new InvalidParamError("field", "não pode ser vazio"));
    });

    it("should handle complex regex patterns", () => {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const invalidUuid = "not-a-uuid";

      expect(() =>
        ValidationPatterns.validateStringFormat(
          validUuid,
          uuidPattern,
          "id",
          "formato UUID inválido",
        ),
      ).not.toThrow();

      expect(() =>
        ValidationPatterns.validateStringFormat(
          invalidUuid,
          uuidPattern,
          "id",
          "formato UUID inválido",
        ),
      ).toThrow(new InvalidParamError("id", "formato UUID inválido"));
    });
  });

  describe("validateNumberRange", () => {
    it("should not throw when number is within range", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(5, 1, 10, "order"),
      ).not.toThrow();
    });

    it("should not throw when number equals minimum", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(1, 1, 10, "order"),
      ).not.toThrow();
    });

    it("should not throw when number equals maximum", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(10, 1, 10, "order"),
      ).not.toThrow();
    });

    it("should throw InvalidParamError when number is not integer", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(5.5, 1, 10, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser um número inteiro"));
    });

    it("should throw InvalidParamError when number is NaN", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(NaN, 1, 10, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser um número inteiro"));
    });

    it("should throw InvalidParamError when number is Infinity", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(Infinity, 1, 10, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser um número inteiro"));
    });

    it("should throw InvalidParamError when number is below minimum", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(0, 1, 10, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser maior que 0"));
    });

    it("should throw InvalidParamError when number is above maximum", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(11, 1, 10, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser menor que 10"));
    });

    it("should handle zero as valid number when in range", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(0, 0, 10, "order"),
      ).not.toThrow();
    });

    it("should handle negative numbers correctly", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(-5, -10, -1, "order"),
      ).not.toThrow();
    });

    it("should throw with correct message for negative minimum", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(-11, -10, -1, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser maior que -11"));
    });

    it("should handle single value range", () => {
      expect(() =>
        ValidationPatterns.validateNumberRange(5, 5, 5, "order"),
      ).not.toThrow();

      expect(() =>
        ValidationPatterns.validateNumberRange(4, 5, 5, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser maior que 4"));

      expect(() =>
        ValidationPatterns.validateNumberRange(6, 5, 5, "order"),
      ).toThrow(new InvalidParamError("order", "deve ser menor que 5"));
    });
  });
});

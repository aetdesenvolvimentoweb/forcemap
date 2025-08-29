import { InvalidParamError, MissingParamError } from "../../errors";

export class ValidationPatterns {
  static validatePresence(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new MissingParamError(fieldName);
    }

    if (typeof value === "string" && value.trim() === "") {
      throw new MissingParamError(fieldName);
    }
  }

  static validateStringLength(
    value: string,
    maxLength: number,
    fieldName: string,
  ): void {
    if (value.length > maxLength) {
      throw new InvalidParamError(
        fieldName,
        `não pode exceder ${maxLength} caracteres`,
      );
    }
  }

  static validateStringFormat(
    value: string,
    pattern: RegExp,
    fieldName: string,
    formatDescription: string,
  ): void {
    if (!pattern.test(value)) {
      throw new InvalidParamError(fieldName, formatDescription);
    }
  }

  static validateNumberRange(
    value: number,
    min: number,
    max: number,
    fieldName: string,
  ): void {
    if (!Number.isInteger(value)) {
      throw new InvalidParamError(fieldName, "deve ser um número inteiro");
    }

    if (value < min) {
      throw new InvalidParamError(fieldName, `deve ser maior que ${min - 1}`);
    }

    if (value > max) {
      throw new InvalidParamError(fieldName, `deve ser menor que ${max}`);
    }
  }
}

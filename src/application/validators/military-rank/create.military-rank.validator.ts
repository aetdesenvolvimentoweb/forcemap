import { InvalidParamError, MissingParamError } from "@application/errors";
import type { CreateMilitaryRankDTO } from "@domain/dtos";

export class CreateMilitaryRankValidator {
  private readonly validateAbbreviationPresence = (
    abbreviation: string,
  ): void => {
    if (!abbreviation || abbreviation.trim() === "") {
      throw new MissingParamError("Abreviatura");
    }
  };

  private readonly validateOrderPresence = (order: number): void => {
    if (order === null || order === undefined) {
      throw new MissingParamError("Ordem");
    }
  };

  private readonly validateAbbreviationFormat = (
    abbreviation: string,
  ): void => {
    if (abbreviation.length > 10) {
      throw new InvalidParamError(
        "Abreviatura",
        "não pode exceder 10 caracteres",
      );
    }

    if (!/^[A-Z0-9º ]+$/.test(abbreviation.trim())) {
      throw new InvalidParamError(
        "Abreviatura",
        "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
      );
    }
  };

  private readonly validateOrderRange = (order: number): void => {
    if (!Number.isInteger(order)) {
      throw new InvalidParamError("Ordem", "deve ser um número inteiro");
    }

    if (order < 1) {
      throw new InvalidParamError("Ordem", "deve ser maior que 0");
    }

    if (order > 20) {
      throw new InvalidParamError("Ordem", "não pode ser maior que 20");
    }
  };

  private readonly validateRequiredFields = (
    data: CreateMilitaryRankDTO,
  ): void => {
    this.validateAbbreviationPresence(data.abbreviation);
    this.validateOrderPresence(data.order);
  };

  private readonly validateBusinessRules = (
    data: CreateMilitaryRankDTO,
  ): void => {
    this.validateAbbreviationFormat(data.abbreviation);
    this.validateOrderRange(data.order);
  };

  public readonly validate = async (
    data: CreateMilitaryRankDTO,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateBusinessRules(data);
  };
}

import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "@application/errors";
import type { CreateMilitaryRankValidatorProtocol } from "@application/protocols";

import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";

interface CreateMilitaryRankValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class CreateMilitaryRankValidator
  implements CreateMilitaryRankValidatorProtocol
{
  constructor(private readonly props: CreateMilitaryRankValidatorProps) {}

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

  private readonly validateAbbreviationUniqueness = async (
    abbreviation: string,
  ): Promise<void> => {
    const exists =
      await this.props.militaryRankRepository.findByAbbreviation(abbreviation);
    if (exists) {
      throw new DuplicatedKeyError("Abreviatura");
    }
  };

  private readonly validateOrderUniqueness = async (
    order: number,
  ): Promise<void> => {
    const exists = await this.props.militaryRankRepository.findByOrder(order);
    if (exists) {
      throw new DuplicatedKeyError("Ordem");
    }
  };

  private readonly validateRequiredFields = (
    data: CreateMilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationPresence(data.abbreviation);
    this.validateOrderPresence(data.order);
  };

  private readonly validateBusinessRules = (
    data: CreateMilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationFormat(data.abbreviation);
    this.validateOrderRange(data.order);
  };

  private readonly validateUniqueness = async (
    data: CreateMilitaryRankInputDTO,
  ): Promise<void> => {
    await this.validateAbbreviationUniqueness(data.abbreviation);
    await this.validateOrderUniqueness(data.order);
  };

  public readonly validate = async (
    data: CreateMilitaryRankInputDTO,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateBusinessRules(data);
    await this.validateUniqueness(data);
  };
}

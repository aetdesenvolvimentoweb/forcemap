import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { DuplicatedKeyError } from "../../errors";
import { MilitaryRankInputDTOValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

interface MilitaryRankInputDTOValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class MilitaryRankInputDTOValidator
  implements MilitaryRankInputDTOValidatorProtocol
{
  constructor(private readonly props: MilitaryRankInputDTOValidatorProps) {}

  private readonly validateAbbreviationPresence = (
    abbreviation: string,
  ): void => {
    ValidationPatterns.validatePresence(abbreviation, "Abreviatura");
  };

  private readonly validateOrderPresence = (order: number): void => {
    ValidationPatterns.validatePresence(order, "Ordem");
  };

  private readonly validateAbbreviationFormat = (
    abbreviation: string,
  ): void => {
    ValidationPatterns.validateStringLength(abbreviation, 10, "Abreviatura");

    ValidationPatterns.validateStringFormat(
      abbreviation,
      /^[a-zA-Z0-9º ]+$/,
      "Abreviatura",
      "deve conter apenas letras, números, espaços e/ou o caractere ordinal (º)",
    );
  };

  private readonly validateOrderRange = (order: number): void => {
    ValidationPatterns.validateNumberRange(order, 1, 20, "Ordem");
  };

  private readonly validateAbbreviationUniqueness = async (
    abbreviation: string,
    idToIgnore?: string,
  ): Promise<void> => {
    const exists =
      await this.props.militaryRankRepository.findByAbbreviation(abbreviation);
    if (exists && (!idToIgnore || exists.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Abreviatura");
    }
  };

  private readonly validateOrderUniqueness = async (
    order: number,
    idToIgnore?: string,
  ): Promise<void> => {
    const exists = await this.props.militaryRankRepository.findByOrder(order);
    if (exists && (!idToIgnore || exists.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Ordem");
    }
  };

  private readonly validateRequiredFields = (
    data: MilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationPresence(data.abbreviation);
    this.validateOrderPresence(data.order);
  };

  private readonly validateBusinessRules = (
    data: MilitaryRankInputDTO,
  ): void => {
    this.validateAbbreviationFormat(data.abbreviation);
    this.validateOrderRange(data.order);
  };

  private readonly validateUniqueness = async (
    data: MilitaryRankInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    await this.validateAbbreviationUniqueness(data.abbreviation, idToIgnore);
    await this.validateOrderUniqueness(data.order, idToIgnore);
  };

  /**
   * Valida para create (idToIgnore não informado) ou update (idToIgnore informado)
   */
  public readonly validate = async (
    data: MilitaryRankInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateBusinessRules(data);
    await this.validateUniqueness(data, idToIgnore);
  };
}

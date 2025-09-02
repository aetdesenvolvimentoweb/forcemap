import { MilitaryInputDTO } from "../../../domain/dtos";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { DuplicatedKeyError, EntityNotFoundError } from "../../errors";
import {
  IdValidatorProtocol,
  MilitaryInputDTOValidatorProtocol,
} from "../../protocols";
import { ValidationPatterns } from "../common";

interface MilitaryInputDTOValidatorProps {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  idValidator: IdValidatorProtocol;
}

export class MilitaryInputDTOValidator
  implements MilitaryInputDTOValidatorProtocol
{
  constructor(private readonly props: MilitaryInputDTOValidatorProps) {}

  private readonly validateMilitaryRankIdPresence = (
    militaryRankId: string,
  ): void => {
    ValidationPatterns.validatePresence(militaryRankId, "Posto/Graduação");
  };

  private readonly validateNamePresence = (name: string): void => {
    ValidationPatterns.validatePresence(name, "Nome");
  };

  private readonly validateRgPresence = (rg: number): void => {
    ValidationPatterns.validatePresence(rg, "RG");
  };

  private readonly validateNameFormat = (name: string): void => {
    ValidationPatterns.validateStringLength(name, 100, "Nome");

    ValidationPatterns.validateStringFormat(
      name,
      /^[a-zA-Z]+$/,
      "Nome",
      "deve conter apenas letras, acentos e/ou espaços",
    );
  };

  private readonly validateRgRange = (rg: number): void => {
    ValidationPatterns.validateNumberRange(rg, 1, 9999, "RG");
  };

  private readonly validateRgUniqueness = async (
    rg: number,
    idToIgnore?: string,
  ): Promise<void> => {
    const exists = await this.props.militaryRepository.findByRg(rg);
    if (exists && (!idToIgnore || exists.id !== idToIgnore)) {
      throw new DuplicatedKeyError("RG");
    }
  };

  private readonly validateRequiredFields = (data: MilitaryInputDTO): void => {
    this.validateNamePresence(data.name);
    this.validateRgPresence(data.rg);
  };

  private readonly validateBusinessRules = async (
    data: MilitaryInputDTO,
  ): Promise<void> => {
    const { idValidator, militaryRankRepository } = this.props;

    idValidator.validate(data.militaryRankId);
    const militaryRank = await militaryRankRepository.findById(
      data.militaryRankId,
    );

    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    this.validateNameFormat(data.name);
    this.validateRgRange(data.rg);
  };

  private readonly validateUniqueness = async (
    data: MilitaryInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    await this.validateRgUniqueness(data.rg, idToIgnore);
  };

  /**
   * Valida para create (idToIgnore não informado) ou update (idToIgnore informado)
   */
  public readonly validate = async (
    data: MilitaryInputDTO,
    idToIgnore?: string,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    await this.validateBusinessRules(data);
    await this.validateUniqueness(data, idToIgnore);
  };
}

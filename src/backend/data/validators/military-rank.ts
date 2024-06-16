import { MilitaryRankProps, UpdateProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import {
  duplicatedKeyError,
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "../helpers";
import { MilitaryRankRepository } from "../repositories";

type Dependencies = {
  repository: MilitaryRankRepository;
  idValidator: IdValidator;
};

export class MilitaryRankValidator {
  private id: string;
  private order: number;
  private abbreviatedName: string;

  private repository: MilitaryRankRepository;
  private idValidator: IdValidator;

  constructor(dependencies: Dependencies) {
    this.id = "";
    this.order = 0;
    this.abbreviatedName = "";

    this.repository = dependencies.repository;
    this.idValidator = dependencies.idValidator;
  }

  private setId = (id: string): void => {
    this.id = id;
  };

  private setOrder = (order: number): void => {
    this.order = order;
  };

  private setAbbreviatedName = (abbreviatedName: string): void => {
    this.abbreviatedName = abbreviatedName;
  };

  private validateProps = async (): Promise<void> => {
    if (!this.order) {
      throw missingParamError("ordem");
    }

    if (!this.abbreviatedName) {
      throw missingParamError("nome abreviado");
    }

    const alreadyExist = await this.repository.getByAbbreviatedName(
      this.abbreviatedName
    );

    if (alreadyExist) {
      throw duplicatedKeyError("nome abreviado");
    }
  };

  private readonly checkId = async (): Promise<void> => {
    if (!this.id) {
      throw missingParamError("ID");
    }

    const isValid = this.idValidator.isValid(this.id);
    if (!isValid) {
      throw invalidParamError("ID");
    }

    const isRegistered = await this.repository.getById(this.id);
    if (!isRegistered) {
      throw unregisteredFieldIdError("posto/graduação");
    }
  };

  public readonly validateAddProps = async (
    props: MilitaryRankProps
  ): Promise<void> => {
    this.setOrder(props.order);
    this.setAbbreviatedName(props.abbreviatedName);

    await this.validateProps();
  };

  public readonly validateId = async (id: string): Promise<void> => {
    this.setId(id);

    await this.checkId();
  };

  public readonly validateUpdateProps = async (
    props: UpdateProps
  ): Promise<void> => {
    this.setId(props.id);
    this.setOrder(props.order);
    this.setAbbreviatedName(props.abbreviatedName);

    await this.checkId();
  };
}

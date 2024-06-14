import { MilitaryRankProps } from "@/backend/domain/entities";
import { duplicatedKeyError, missingParamError } from "../helpers";
import { MilitaryRankRepository } from "../repositories";

export class MilitaryRankValidator {
  private id: string;
  private order: number;
  private abbreviatedName: string;

  constructor(private readonly repository: MilitaryRankRepository) {
    this.id = "";
    this.order = 0;
    this.abbreviatedName = "";
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
}

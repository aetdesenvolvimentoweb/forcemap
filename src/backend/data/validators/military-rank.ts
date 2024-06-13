import { MilitaryRankProps } from "@/backend/domain/entities";
import { missingParamError } from "../helpers";

export class MilitaryRankValidator {
  private order: number;
  private abbreviatedName: string;

  constructor() {
    this.order = 0;
    this.abbreviatedName = "";
  }

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
  };

  public readonly validateAddProps = async (
    props: MilitaryRankProps
  ): Promise<void> => {
    this.setOrder(props.order);
    this.setAbbreviatedName(props.abbreviatedName);

    await this.validateProps();
  };
}

import { MilitaryRankProps } from "@/backend/domain/entities";
import { missingParamError } from "../helpers";

export class MilitaryRankValidator {
  private order: number;

  constructor() {
    this.order = 0;
  }

  private setOrder = (order: number): void => {
    this.order = order;
  };

  private validateProps = async (): Promise<void> => {
    if (!this.order) {
      throw missingParamError("ordem");
    }
  };

  public readonly validateAddProps = async (
    props: MilitaryRankProps
  ): Promise<void> => {
    this.setOrder(props.order);

    await this.validateProps();
  };
}

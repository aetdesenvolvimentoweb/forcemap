import { MilitaryProps } from "@/backend/domain/entities";
import { missingParamError } from "../helpers";

type Dependencies = {};

export class MilitaryValidator {
  private militaryRankId: string;

  constructor(dependencies: Dependencies) {
    this.militaryRankId = "";
  }

  private setMilitaryRankId = (militaryRankId: string): void => {
    this.militaryRankId = militaryRankId;
  };

  private readonly checkMilitaryRankId = async (): Promise<void> => {
    if (!this.militaryRankId) {
      throw missingParamError("posto/graduação");
    }
  };

  private validateProps = async (): Promise<void> => {
    await this.checkMilitaryRankId();
  };

  public readonly validateAddProps = async (
    props: MilitaryProps
  ): Promise<void> => {
    this.setMilitaryRankId(props.militaryRankId);

    await this.validateProps();
  };
}

import { MilitaryProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import { invalidParamError, missingParamError } from "../helpers";

type Dependencies = {
  idValidator: IdValidator;
};

export class MilitaryValidator {
  private idValidator: IdValidator;

  private militaryRankId: string;

  constructor(dependencies: Dependencies) {
    this.idValidator = dependencies.idValidator;
    this.militaryRankId = "";
  }

  private setMilitaryRankId = (militaryRankId: string): void => {
    this.militaryRankId = militaryRankId;
  };

  private readonly checkMilitaryRankId = async (): Promise<void> => {
    if (!this.militaryRankId) {
      throw missingParamError("posto/graduação");
    }

    const isValid = this.idValidator.isValid(this.militaryRankId);
    if (!isValid) {
      throw invalidParamError("posto/graduação");
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

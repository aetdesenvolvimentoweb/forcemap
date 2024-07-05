import { MilitaryProps } from "@/backend/domain/entities";
import { IdValidator } from "@/backend/domain/usecases";
import {
  invalidParamError,
  missingParamError,
  unregisteredFieldIdError,
} from "../helpers";
import { MilitaryRankRepository } from "../repositories";

type Dependencies = {
  idValidator: IdValidator;
  militaryRankRepository: MilitaryRankRepository;
};

export class MilitaryValidator {
  private readonly idValidator: IdValidator;
  private readonly militaryRankRepository: MilitaryRankRepository;

  private militaryRankId: string;
  private rg: number;

  constructor(dependencies: Dependencies) {
    this.idValidator = dependencies.idValidator;
    this.militaryRankRepository = dependencies.militaryRankRepository;
    this.militaryRankId = "";
    this.rg = 0;
  }

  private setMilitaryRankId = (militaryRankId: string): void => {
    this.militaryRankId = militaryRankId;
  };

  private setRg = (rg: number): void => {
    this.rg = rg;
  };

  private readonly checkMilitaryRankId = async (): Promise<void> => {
    if (!this.militaryRankId) {
      throw missingParamError("posto/graduação");
    }

    const isValid = this.idValidator.isValid(this.militaryRankId);
    if (!isValid) {
      throw invalidParamError("posto/graduação");
    }

    const registered = await this.militaryRankRepository.getById(
      this.militaryRankId
    );
    if (!registered) {
      throw unregisteredFieldIdError("posto/graduação");
    }
  };

  private validateProps = async (): Promise<void> => {
    await this.checkMilitaryRankId();

    if (!this.rg) {
      throw missingParamError("RG");
    }
  };

  public readonly validateAddProps = async (
    props: MilitaryProps
  ): Promise<void> => {
    this.setMilitaryRankId(props.militaryRankId);
    this.setRg(props.rg);

    await this.validateProps();
  };
}

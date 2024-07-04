import { MilitaryProps } from "@/backend/domain/entities";
import { AddMilitaryUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  validator: MilitaryValidator;
  repository: MilitaryRepository;
};

export class AddMilitaryService implements AddMilitaryUsecase {
  private readonly validator: MilitaryValidator;
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.validator = dependencies.validator;
    this.repository = dependencies.repository;
  }

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    await this.validator.validateAddProps(props);
    await this.repository.add(props);
  };
}

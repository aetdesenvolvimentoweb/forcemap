import { UpdateProps } from "@/backend/domain/entities";
import { UpdateMilitaryRankUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";
import { MilitaryRankValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRankRepository;
  validator: MilitaryRankValidator;
};

export class UpdateMilitaryRankService implements UpdateMilitaryRankUsecase {
  private readonly repository: MilitaryRankRepository;
  private readonly validator: MilitaryRankValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly update = async (props: UpdateProps): Promise<void> => {
    await this.validator.validateUpdateProps(props);

    return await this.repository.update(props);
  };
}

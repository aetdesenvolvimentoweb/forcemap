import { UpdateMilitaryProfileProps } from "@/backend/domain/entities";
import { UpdateMilitaryProfileUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRepository;
  validator: MilitaryValidator;
};

export class UpdateMilitaryProfileService
  implements UpdateMilitaryProfileUsecase
{
  private readonly repository: MilitaryRepository;
  private readonly validator: MilitaryValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly updateProfile = async (
    props: UpdateMilitaryProfileProps
  ): Promise<void> => {
    await this.validator.validateNewProfile(props);

    return await this.repository.updateProfile(props);
  };
}

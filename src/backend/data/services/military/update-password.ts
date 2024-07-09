import { UpdateMilitaryPasswordProps } from "@/backend/domain/entities";
import { UpdateMilitaryPasswordUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRepository;
  validator: MilitaryValidator;
};

export class UpdateMilitaryPasswordService
  implements UpdateMilitaryPasswordUsecase
{
  private readonly repository: MilitaryRepository;
  private readonly validator: MilitaryValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly updatePassword = async (
    props: UpdateMilitaryPasswordProps
  ): Promise<void> => {
    await this.validator.validateNewPassword(props);

    return await this.repository.updatePassword(props);
  };
}

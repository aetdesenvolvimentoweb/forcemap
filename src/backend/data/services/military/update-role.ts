import { UpdateMilitaryRoleProps } from "@/backend/domain/entities";
import { UpdateMilitaryRoleUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRepository;
  validator: MilitaryValidator;
};

export class UpdateMilitaryRoleService implements UpdateMilitaryRoleUsecase {
  private readonly repository: MilitaryRepository;
  private readonly validator: MilitaryValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly updateRole = async (
    props: UpdateMilitaryRoleProps
  ): Promise<void> => {
    await this.validator.validateNewRole(props);

    return await this.repository.updateRole(props);
  };
}

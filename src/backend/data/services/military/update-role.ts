import { UpdateMilitaryRoleProps } from "@/backend/domain/entities";
import { UpdateMilitaryRoleUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

type Dependencies = {
  repository: MilitaryRepository;
};

export class UpdateMilitaryRoleService implements UpdateMilitaryRoleUsecase {
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly updateRole = async (
    props: UpdateMilitaryRoleProps
  ): Promise<void> => {
    return await this.repository.updateRole(props);
  };
}

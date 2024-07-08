import { UpdateMilitaryProfileProps } from "@/backend/domain/entities";
import { UpdateMilitaryProfileUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

type Dependencies = {
  repository: MilitaryRepository;
};

export class UpdateMilitaryProfileService
  implements UpdateMilitaryProfileUsecase
{
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly updateProfile = async (
    props: UpdateMilitaryProfileProps
  ): Promise<void> => {
    return await this.repository.updateProfile(props);
  };
}

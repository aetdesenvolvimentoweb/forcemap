import { UpdateMilitaryPasswordProps } from "@/backend/domain/entities";
import { UpdateMilitaryPasswordUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

type Dependencies = {
  repository: MilitaryRepository;
};

export class UpdateMilitaryPasswordService
  implements UpdateMilitaryPasswordUsecase
{
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly updatePassword = async (
    props: UpdateMilitaryPasswordProps
  ): Promise<void> => {
    return await this.repository.updatePassword(props);
  };
}

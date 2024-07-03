import { MilitaryProps } from "@/backend/domain/entities";
import { AddMilitaryUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

type Dependencies = {
  repository: MilitaryRepository;
};

export class AddMilitaryService implements AddMilitaryUsecase {
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly add = async (props: MilitaryProps): Promise<void> => {
    await this.repository.add(props);
  };
}

import { DeleteMilitaryUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

export type Dependencies = {
  repository: MilitaryRepository;
};

export class DeleteMilitaryService implements DeleteMilitaryUsecase {
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly delete = async (id: string): Promise<void> => {
    await this.repository.delete(id);
  };
}

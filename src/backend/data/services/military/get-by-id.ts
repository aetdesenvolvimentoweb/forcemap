import { MilitaryPublic } from "@/backend/domain/entities";
import { GetMilitaryByIdUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

type Dependencies = {
  repository: MilitaryRepository;
};

export class GetMilitaryByIdService implements GetMilitaryByIdUsecase {
  private readonly repository: MilitaryRepository;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
  }

  public readonly getById = async (
    id: string
  ): Promise<MilitaryPublic | null> => {
    return await this.repository.getById(id);
  };
}

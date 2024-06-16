import { DeleteMilitaryRankUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";
import { MilitaryRankValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRankRepository;
  validator: MilitaryRankValidator;
};

export class DeleteMilitaryRankService implements DeleteMilitaryRankUsecase {
  private readonly repository: MilitaryRankRepository;
  private readonly validator: MilitaryRankValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly delete = async (id: string): Promise<void> => {
    await this.repository.delete(id);
  };
}

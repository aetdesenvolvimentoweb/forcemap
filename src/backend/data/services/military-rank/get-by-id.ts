import { MilitaryRank } from "@/backend/domain/entities";
import { GetMilitaryRankByIdUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";
import { MilitaryRankValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRankRepository;
  validator: MilitaryRankValidator;
};

export class GetMilitaryRankByIdService implements GetMilitaryRankByIdUsecase {
  private readonly repository: MilitaryRankRepository;
  private readonly validator: MilitaryRankValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly getById = async (
    id: string
  ): Promise<MilitaryRank | null> => {
    await this.validator.validateId(id);

    return await this.repository.getById(id);
  };
}

import { MilitaryRank } from "@/backend/domain/entities";
import { GetAllMilitaryRanksUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";

export class GetAllMilitaryRanksService implements GetAllMilitaryRanksUsecase {
  constructor(private readonly repository: MilitaryRankRepository) {}

  public readonly getAll = async (): Promise<MilitaryRank[]> => {
    return await this.repository.getAll();
  };
}

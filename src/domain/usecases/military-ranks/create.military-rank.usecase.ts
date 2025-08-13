import { CreateMilitaryRankDTO } from "../../dtos";
import { MilitaryRank } from "../../entities";

export interface CreateMilitaryRankUseCase {
  create(data: CreateMilitaryRankDTO): Promise<MilitaryRank>;
}

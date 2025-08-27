import { MilitaryRank } from "../../entities";

export interface ListAllMilitaryRankUseCase {
  listAll(): Promise<MilitaryRank[]>;
}

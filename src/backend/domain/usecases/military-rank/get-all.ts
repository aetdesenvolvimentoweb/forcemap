import { MilitaryRank } from "../../entities";

export interface GetAllMilitaryRanksUsecase {
  getAll: () => Promise<MilitaryRank[]>;
}

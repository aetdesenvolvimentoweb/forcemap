import { MilitaryRank } from "../../entities";

export interface ListByIdMilitaryRankUseCase {
  listById(id: string): Promise<MilitaryRank | null>;
}

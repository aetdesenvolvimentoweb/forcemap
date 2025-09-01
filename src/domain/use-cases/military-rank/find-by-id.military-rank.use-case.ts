import { MilitaryRank } from "../../entities";

export interface FindByIdMilitaryRankUseCase {
  findById(id: string): Promise<MilitaryRank | null>;
}

import { MilitaryRank } from "src/domain/entities";

export interface ListByIdMilitaryRankUseCase {
  listById(id: string): Promise<MilitaryRank | null>;
}

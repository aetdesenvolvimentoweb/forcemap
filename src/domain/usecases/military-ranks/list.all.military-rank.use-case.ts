import type { MilitaryRank } from "@domain/entities";

export interface ListAllMilitaryRankUseCase {
  listAll(): Promise<MilitaryRank[]>;
}

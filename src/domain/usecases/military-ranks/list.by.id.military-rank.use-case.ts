import type { MilitaryRank } from "@domain/entities";

export interface ListByIdMilitaryRankUseCase {
  listById(id: string): Promise<MilitaryRank | null>;
}

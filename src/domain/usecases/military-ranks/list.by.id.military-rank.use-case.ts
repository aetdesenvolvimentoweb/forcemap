import type { MilitaryRank } from "@domain/entities";

export interface ListMilitaryRankByIdUseCase {
  listById(id: string): Promise<MilitaryRank | null>;
}

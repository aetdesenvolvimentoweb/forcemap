import type { CreateMilitaryRankDTO, MilitaryRank } from "@domain/index";

export interface MilitaryRankRepository {
  create(data: CreateMilitaryRankDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
}

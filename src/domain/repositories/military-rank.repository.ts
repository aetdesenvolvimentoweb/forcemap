import type { CreateMilitaryRankDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";

export interface MilitaryRankRepository {
  create(data: CreateMilitaryRankDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
}

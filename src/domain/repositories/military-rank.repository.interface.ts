import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";

export interface MilitaryRankRepository {
  create(data: CreateMilitaryRankInputDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
  listAll(): Promise<MilitaryRank[]>;
  listById(id: string): Promise<MilitaryRank | null>;
  delete(id: string): Promise<void>;
}

import { MilitaryRankInputDTO } from "../dtos";
import { MilitaryRank } from "../entities";

export interface MilitaryRankRepository {
  create(data: MilitaryRankInputDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
  findById(id: string): Promise<MilitaryRank | null>;
  listAll(): Promise<MilitaryRank[]>;
  delete(id: string): Promise<void>;
}

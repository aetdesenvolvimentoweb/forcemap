import type {
  CreateMilitaryRankInputDTO,
  MilitaryRankListItemDTO,
} from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";

export interface MilitaryRankRepository {
  create(data: CreateMilitaryRankInputDTO): Promise<void>;
  findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null>;
  findByOrder(order: number): Promise<MilitaryRank | null>;
  listAll(): Promise<MilitaryRankListItemDTO[]>;
}

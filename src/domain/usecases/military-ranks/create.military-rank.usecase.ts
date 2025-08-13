import { CreateMilitaryRankDTO } from "@domain/dtos";
import { MilitaryRank } from "@domain/entities";

export interface CreateMilitaryRankUseCase {
  create(data: CreateMilitaryRankDTO): Promise<MilitaryRank>;
}

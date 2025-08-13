import { CreateMilitaryRankDTO } from "@domain/dtos";

export interface CreateMilitaryRankUseCase {
  create(data: CreateMilitaryRankDTO): Promise<void>;
}

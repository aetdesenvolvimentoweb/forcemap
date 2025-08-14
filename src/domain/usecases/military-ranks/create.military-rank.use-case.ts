import type { CreateMilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankUseCase {
  create(data: CreateMilitaryRankInputDTO): Promise<void>;
}

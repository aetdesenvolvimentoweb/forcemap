import { CreateMilitaryRankUseCase } from "@domain/usecases";

export interface MilitaryRankRepository {
  create: CreateMilitaryRankUseCase;
}

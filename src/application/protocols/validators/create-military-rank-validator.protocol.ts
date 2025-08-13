import type { CreateMilitaryRankDTO } from "@domain/dtos";

export interface CreateMilitaryRankValidatorProtocol {
  validate(data: CreateMilitaryRankDTO): Promise<void>;
}

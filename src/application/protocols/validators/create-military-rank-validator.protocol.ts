import type { CreateMilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankValidatorProtocol {
  validate(data: CreateMilitaryRankInputDTO): Promise<void>;
}

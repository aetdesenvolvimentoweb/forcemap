import type { MilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankValidatorProtocol {
  validate(data: MilitaryRankInputDTO): Promise<void>;
}

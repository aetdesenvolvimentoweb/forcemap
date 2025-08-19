import type { MilitaryRankInputDTO } from "@domain/dtos";

export interface MilitaryRankValidatorProtocol {
  validate(data: MilitaryRankInputDTO, idToIgnore?: string): Promise<void>;
}

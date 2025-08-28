import { MilitaryRankInputDTO } from "src/domain/dtos";

export interface MilitaryRankInputDTOValidatorProtocol {
  validate(data: MilitaryRankInputDTO, idToIgnore?: string): Promise<void>;
}

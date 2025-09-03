import { MilitaryInputDTO } from "../../../../domain/dtos";

export interface MilitaryInputDTOValidatorProtocol {
  validate(data: MilitaryInputDTO, idToIgnore?: string): Promise<void>;
}

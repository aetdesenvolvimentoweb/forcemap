import { MilitaryInputDTO } from "../../../domain/dtos";

export interface MilitaryInputDTOSanitizerProtocol {
  sanitize(data: MilitaryInputDTO): MilitaryInputDTO;
}

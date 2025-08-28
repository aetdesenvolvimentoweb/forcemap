import { MilitaryRankInputDTO } from "../../../domain/dtos";

export interface MilitaryRankInputDTOSanitizerProtocol {
  sanitize(data: MilitaryRankInputDTO): MilitaryRankInputDTO;
}

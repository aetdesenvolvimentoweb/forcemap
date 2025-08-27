import { MilitaryRankInputDTO } from "src/domain/dtos";

export interface MilitaryRankInputDTOSanitizerProtocol {
  sanitize(data: MilitaryRankInputDTO): MilitaryRankInputDTO;
}

import type { MilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankSanitizerProtocol {
  sanitize(data: MilitaryRankInputDTO): MilitaryRankInputDTO;
}

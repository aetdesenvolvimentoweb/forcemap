import type { CreateMilitaryRankInputDTO } from "@domain/dtos";

export interface CreateMilitaryRankSanitizerProtocol {
  sanitize(data: CreateMilitaryRankInputDTO): CreateMilitaryRankInputDTO;
}

import { CreateMilitaryRankDTO } from "@domain/dtos";

export interface CreateMilitaryRankSanitizerProtocol {
  sanitize(data: CreateMilitaryRankDTO): CreateMilitaryRankDTO;
}

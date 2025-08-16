import type { MilitaryRankListItemDTO } from "@domain/dtos";

export interface ListAllMilitaryRankUseCase {
  listAll(): Promise<MilitaryRankListItemDTO[]>;
}

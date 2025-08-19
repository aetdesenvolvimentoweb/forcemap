import type { MilitaryRankInputDTO } from "@domain/dtos";

export interface UpdateMilitaryRankUseCase {
  update(id: string, data: MilitaryRankInputDTO): Promise<void>;
}

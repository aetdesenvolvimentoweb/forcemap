import type { UpdateMilitaryRankInputDTO } from "@domain/dtos";

export interface UpdateMilitaryRankUseCase {
  update(id: string, data: UpdateMilitaryRankInputDTO): Promise<void>;
}

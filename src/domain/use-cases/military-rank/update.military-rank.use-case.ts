import { MilitaryRankInputDTO } from "../../dtos";

export interface UpdateMilitaryRankUseCase {
  update(id: string, data: MilitaryRankInputDTO): Promise<void>;
}

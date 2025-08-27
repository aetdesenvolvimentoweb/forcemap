import { MilitaryRankInputDTO } from "src/domain/dtos";

export interface CreateMilitaryRankUseCase {
  create(data: MilitaryRankInputDTO): Promise<void>;
}

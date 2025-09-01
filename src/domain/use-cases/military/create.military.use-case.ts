import { MilitaryInputDTO } from "../../dtos";

export interface CreateMilitaryUseCase {
  create(data: MilitaryInputDTO): Promise<void>;
}

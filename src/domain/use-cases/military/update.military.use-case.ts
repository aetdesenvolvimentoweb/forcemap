import { MilitaryInputDTO } from "../../dtos";

export interface UpdateMilitaryUseCase {
  update(id: string, data: MilitaryInputDTO): Promise<void>;
}

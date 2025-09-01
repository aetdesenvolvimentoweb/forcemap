import { MilitaryOutputDTO } from "../../dtos";

export interface FindByIdMilitaryUseCase {
  findById(id: string): Promise<MilitaryOutputDTO | null>;
}

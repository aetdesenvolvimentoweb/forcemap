import { MilitaryOutputDTO } from "../../dtos";

export interface FindByRgMilitaryUseCase {
  findByRg(rg: number): Promise<MilitaryOutputDTO | null>;
}

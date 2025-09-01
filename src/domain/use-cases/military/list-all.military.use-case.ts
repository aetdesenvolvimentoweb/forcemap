import { MilitaryOutputDTO } from "../../dtos";

export interface ListAllMilitaryUseCase {
  listAll(): Promise<MilitaryOutputDTO[]>;
}

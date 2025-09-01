import { MilitaryInputDTO, MilitaryOutputDTO } from "../dtos";

export interface MilitaryRepository {
  create(data: MilitaryInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<MilitaryOutputDTO | null>;
  findByRg(rg: number): Promise<MilitaryOutputDTO | null>;
  listAll(): Promise<MilitaryOutputDTO[]>;
  update(id: string, data: MilitaryInputDTO): Promise<void>;
}

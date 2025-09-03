import { UserInputDTO, UserOutputDTO } from "../dtos";
import { User } from "../entities";

export interface UserRepository {
  create(data: UserInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserOutputDTO | null>;
  findByMilitaryId(militaryId: string): Promise<UserOutputDTO | null>;
  findByMilitaryIdWithPassword(militaryId: string): Promise<User | null>;
  listAll(): Promise<UserOutputDTO[]>;
  update(id: string, data: UserInputDTO): Promise<void>;
}

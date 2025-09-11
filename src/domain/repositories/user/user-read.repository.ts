import { UserOutputDTO } from "../../dtos";
import { User } from "../../entities";

export interface UserReadRepository {
  findById(id: string): Promise<UserOutputDTO | null>;
  findByIdWithPassword(id: string): Promise<User | null>;
  findByMilitaryId(militaryId: string): Promise<UserOutputDTO | null>;
  findByMilitaryIdWithPassword(militaryId: string): Promise<User | null>;
  listAll(): Promise<UserOutputDTO[]>;
}

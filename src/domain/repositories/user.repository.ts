import { UpdateUserInputDTO, UserInputDTO, UserOutputDTO } from "../dtos";
import { User, UserRole } from "../entities";

export interface UserRepository {
  create(data: UserInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserOutputDTO | null>;
  findByMilitaryId(militaryId: string): Promise<UserOutputDTO | null>;
  findByMilitaryIdWithPassword(militaryId: string): Promise<User | null>;
  listAll(): Promise<UserOutputDTO[]>;
  updateUserRole(id: string, role: UserRole): Promise<void>;
  updateUserPassword(id: string, data: UpdateUserInputDTO): Promise<void>;
}

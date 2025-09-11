import { UpdateUserInputDTO, UserInputDTO } from "../../dtos";
import { UserRole } from "../../entities";

export interface UserWriteRepository {
  create(data: UserInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  updateUserRole(id: string, role: UserRole): Promise<void>;
  updateUserPassword(id: string, data: UpdateUserInputDTO): Promise<void>;
}

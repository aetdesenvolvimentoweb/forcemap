import { UserInputDTO } from "../../dtos";
import { UserRole } from "../../entities";

export interface CreateUserUseCase {
  create(data: UserInputDTO, requestingUserRole?: UserRole): Promise<void>;
}

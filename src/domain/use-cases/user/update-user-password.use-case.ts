import { UpdateUserInputDTO } from "../../dtos";

export interface UpdateUserPasswordUseCase {
  updateUserPassword(id: string, data: UpdateUserInputDTO): Promise<void>;
}

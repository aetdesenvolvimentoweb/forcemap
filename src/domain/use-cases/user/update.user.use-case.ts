import { UserInputDTO } from "../../dtos";

export interface UpdateUserUseCase {
  update(id: string, data: UserInputDTO): Promise<void>;
}

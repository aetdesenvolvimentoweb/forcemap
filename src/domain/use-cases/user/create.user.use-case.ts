import { UserInputDTO } from "../../dtos";

export interface CreateUserUseCase {
  create(data: UserInputDTO): Promise<void>;
}

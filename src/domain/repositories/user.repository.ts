import { UserInputDTO, UserOutputDTO } from "../dtos";

export interface UserRepository {
  create(data: UserInputDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserOutputDTO | null>;
  listAll(): Promise<UserOutputDTO[]>;
  update(id: string, data: UserInputDTO): Promise<void>;
}

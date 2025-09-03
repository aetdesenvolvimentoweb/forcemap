import { UserOutputDTO } from "../../dtos";

export interface ListAllUserUseCase {
  listAll(): Promise<UserOutputDTO[]>;
}

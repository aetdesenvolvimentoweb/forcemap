import { UserOutputDTO } from "../../dtos";

export interface FindByIdUserUseCase {
  findById(id: string): Promise<UserOutputDTO | null>;
}

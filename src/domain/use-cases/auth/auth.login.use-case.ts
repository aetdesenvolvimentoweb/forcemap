import { LoginInputDTO, UserLoggedDTO } from "../../dtos";

export interface AuthLoginUseCase {
  login(data: LoginInputDTO): Promise<UserLoggedDTO>;
}

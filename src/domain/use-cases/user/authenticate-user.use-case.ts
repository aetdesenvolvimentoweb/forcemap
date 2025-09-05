import { UserAuthenticatedDTO, UserCredentialsInputDTO } from "../../dtos";

export interface AuthenticateUserUseCase {
  authenticate(
    credentials: UserCredentialsInputDTO,
  ): Promise<UserAuthenticatedDTO | null>;
}

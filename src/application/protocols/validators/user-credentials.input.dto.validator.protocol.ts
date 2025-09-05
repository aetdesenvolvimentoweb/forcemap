import { UserCredentialsInputDTO } from "../../../domain/dtos";

export interface UserCredentialsInputDTOValidatorProtocol {
  validate(data: UserCredentialsInputDTO): void;
}

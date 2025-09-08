import { UserCredentialsInputDTO } from "../../../../domain/dtos";

export interface UserCredentialsInputDTOSanitizerProtocol {
  sanitize(data: UserCredentialsInputDTO): UserCredentialsInputDTO;
}

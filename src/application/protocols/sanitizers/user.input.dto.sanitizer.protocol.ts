import { UserInputDTO } from "../../../domain/dtos";

export interface UserInputDTOSanitizerProtocol {
  sanitize(data: UserInputDTO): UserInputDTO;
}

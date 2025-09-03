import { UserInputDTO } from "../../../../domain/dtos";

export interface UserInputDTOValidatorProtocol {
  validate(data: UserInputDTO, idToIgnore?: string): Promise<void>;
}

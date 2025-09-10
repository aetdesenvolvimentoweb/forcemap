import { UserInputDTO } from "../../../../domain/dtos";
import { UserRole } from "../../../../domain/entities";

export interface UserInputDTOValidatorProtocol {
  validate(
    data: UserInputDTO,
    requestingUserRole?: UserRole,
    idToIgnore?: string,
  ): Promise<void>;
}

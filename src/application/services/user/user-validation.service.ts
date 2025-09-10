import { UpdateUserInputDTO, UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import {
  IdValidatorProtocol,
  UpdateUserPasswordValidatorProtocol,
  UpdateUserRoleValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";

interface UserValidationServiceProps {
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  userInputDTOValidator: UserInputDTOValidatorProtocol;
  updateUserPasswordValidator: UpdateUserPasswordValidatorProtocol;
  updateUserRoleValidator: UpdateUserRoleValidatorProtocol;
}

export class UserValidationService {
  constructor(private readonly props: UserValidationServiceProps) {}

  async validateUserCreation(
    data: UserInputDTO,
    requestingUserRole?: UserRole,
  ): Promise<void> {
    await this.props.userInputDTOValidator.validate(data, requestingUserRole);
  }

  async validateUserPasswordUpdate(
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> {
    const { idValidator, idRegisteredValidator, updateUserPasswordValidator } =
      this.props;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
    await updateUserPasswordValidator.validate(data);
  }

  async validateUserRoleUpdate(id: string, role: UserRole): Promise<void> {
    const { idValidator, idRegisteredValidator, updateUserRoleValidator } =
      this.props;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
    await updateUserRoleValidator.validate(role);
  }

  async validateUserDeletion(id: string): Promise<void> {
    const { idValidator, idRegisteredValidator } = this.props;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
  }

  validateUserId(id: string): void {
    this.props.idValidator.validate(id);
  }

  async validateUserIdExists(id: string): Promise<void> {
    await this.props.idRegisteredValidator.validate(id);
  }
}

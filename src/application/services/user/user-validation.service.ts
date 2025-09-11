import { UpdateUserInputDTO, UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import {
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";
import {
  IUserCreationValidationStrategy,
  IUserDeletionValidationStrategy,
  IUserPasswordUpdateValidationStrategy,
  IUserRoleUpdateValidationStrategy,
} from "./validation";

interface UserValidationServiceProps {
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  userCreationValidationStrategy: IUserCreationValidationStrategy;
  userPasswordUpdateValidationStrategy: IUserPasswordUpdateValidationStrategy;
  userRoleUpdateValidationStrategy: IUserRoleUpdateValidationStrategy;
  userDeletionValidationStrategy: IUserDeletionValidationStrategy;
}

export class UserValidationService {
  constructor(private readonly props: UserValidationServiceProps) {}

  async validateUserCreation(
    data: UserInputDTO,
    requestingUserRole?: UserRole,
  ): Promise<void> {
    await this.props.userCreationValidationStrategy.validate(
      data,
      requestingUserRole,
    );
  }

  async validateUserPasswordUpdate(
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> {
    await this.props.userPasswordUpdateValidationStrategy.validate(id, data);
  }

  async validateUserRoleUpdate(id: string, role: UserRole): Promise<void> {
    await this.props.userRoleUpdateValidationStrategy.validate(id, role);
  }

  async validateUserDeletion(id: string): Promise<void> {
    await this.props.userDeletionValidationStrategy.validate(id);
  }

  validateUserId(id: string): void {
    this.props.idValidator.validate(id);
  }

  async validateUserIdExists(id: string): Promise<void> {
    await this.props.idRegisteredValidator.validate(id);
  }
}

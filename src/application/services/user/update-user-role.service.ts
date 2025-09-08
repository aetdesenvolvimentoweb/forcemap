import { UserRole } from "../../../domain/entities";
import { UserRepository } from "../../../domain/repositories";
import { UpdateUserRoleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UpdateUserRoleSanitizerProtocol,
  UpdateUserRoleValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";

interface UpdateUserRoleServiceProps {
  userRepository: UserRepository;
  idSanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  updateUserRoleSanitizer: UpdateUserRoleSanitizerProtocol;
  updateUserRoleValidator: UpdateUserRoleValidatorProtocol;
}

export class UpdateUserRoleService implements UpdateUserRoleUseCase {
  private readonly props: UpdateUserRoleServiceProps;

  constructor(props: UpdateUserRoleServiceProps) {
    this.props = props;
  }

  public readonly updateUserRole = async (
    id: string,
    role: UserRole,
  ): Promise<void> => {
    const {
      userRepository,
      idSanitizer,
      idValidator,
      idRegisteredValidator,
      updateUserRoleSanitizer,
      updateUserRoleValidator,
    } = this.props;

    const sanitizedUserId = idSanitizer.sanitize(id);
    idValidator.validate(sanitizedUserId);
    await idRegisteredValidator.validate(sanitizedUserId);

    const sanitizedUserRole = updateUserRoleSanitizer.sanitize(role);
    await updateUserRoleValidator.validate(sanitizedUserRole);

    await userRepository.updateUserRole(sanitizedUserId, sanitizedUserRole);
  };
}

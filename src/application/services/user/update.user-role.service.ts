import { UserRole } from "../../../domain/entities";
import { UserRepository } from "../../../domain/repositories";
import { UpdateUserRoleUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
  UserRoleSanitizerProtocol,
  UserRoleValidatorProtocol,
} from "../../protocols";

interface UpdateUserRoleServiceProps {
  userRepository: UserRepository;
  idSanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  userRoleSanitizer: UserRoleSanitizerProtocol;
  userRoleValidator: UserRoleValidatorProtocol;
}

export class UpdateUserRoleService implements UpdateUserRoleUseCase {
  private readonly props: UpdateUserRoleServiceProps;

  constructor(props: UpdateUserRoleServiceProps) {
    this.props = props;
  }

  public readonly updateUserRole = async (
    userId: string,
    userRole: UserRole,
  ): Promise<void> => {
    const {
      userRepository,
      idSanitizer,
      idValidator,
      idRegisteredValidator,
      userRoleSanitizer,
      userRoleValidator,
    } = this.props;

    const sanitizedUserId = idSanitizer.sanitize(userId);
    idValidator.validate(sanitizedUserId);
    await idRegisteredValidator.validate(sanitizedUserId);

    const sanitizedUserRole = userRoleSanitizer.sanitize(userRole);
    await userRoleValidator.validate(sanitizedUserRole);

    await userRepository.updateUserRole(sanitizedUserId, sanitizedUserRole);
  };
}

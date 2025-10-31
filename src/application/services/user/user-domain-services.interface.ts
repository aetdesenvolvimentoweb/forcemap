import {
  SessionRepository,
  UserRepository,
} from "../../../domain/repositories";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  PasswordHasherProtocol,
  UpdateUserPasswordSanitizerProtocol,
  UpdateUserPasswordValidatorProtocol,
  UpdateUserRoleSanitizerProtocol,
  UpdateUserRoleValidatorProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
  UserCredentialsInputDTOValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
  UserInputDTOSanitizerProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";

export interface UserDomainServices {
  repository: UserRepository;
  sessionRepository: SessionRepository;
  passwordHasher: PasswordHasherProtocol;

  // Validators
  idValidator: IdValidatorProtocol;
  userIdRegisteredValidator: UserIdRegisteredValidatorProtocol;
  userInputDTOValidator: UserInputDTOValidatorProtocol;
  userCredentialsInputDTOValidator: UserCredentialsInputDTOValidatorProtocol;
  updateUserPasswordValidator: UpdateUserPasswordValidatorProtocol;
  updateUserRoleValidator: UpdateUserRoleValidatorProtocol;

  // Sanitizers
  idSanitizer: IdSanitizerProtocol;
  userInputDTOSanitizer: UserInputDTOSanitizerProtocol;
  userCredentialsInputDTOSanitizer: UserCredentialsInputDTOSanitizerProtocol;
  updateUserPasswordSanitizer: UpdateUserPasswordSanitizerProtocol;
  updateUserRoleSanitizer: UpdateUserRoleSanitizerProtocol;
}

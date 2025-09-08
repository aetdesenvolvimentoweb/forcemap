import {
  UpdateUserInputDTO,
  UserCredentialsInputDTO,
  UserInputDTO,
} from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import {
  IdSanitizerProtocol,
  UpdateUserPasswordSanitizerProtocol,
  UpdateUserRoleSanitizerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
  UserInputDTOSanitizerProtocol,
} from "../../protocols";

interface UserSanitizationServiceProps {
  idSanitizer: IdSanitizerProtocol;
  userInputDTOSanitizer: UserInputDTOSanitizerProtocol;
  userCredentialsInputDTOSanitizer: UserCredentialsInputDTOSanitizerProtocol;
  updateUserPasswordSanitizer: UpdateUserPasswordSanitizerProtocol;
  updateUserRoleSanitizer: UpdateUserRoleSanitizerProtocol;
}

export class UserSanitizationService {
  constructor(private readonly props: UserSanitizationServiceProps) {}

  sanitizeId(id: string): string {
    return this.props.idSanitizer.sanitize(id);
  }

  sanitizeUserCreation(data: UserInputDTO): UserInputDTO {
    return this.props.userInputDTOSanitizer.sanitize(data);
  }

  sanitizeUserCredentials(
    data: UserCredentialsInputDTO,
  ): UserCredentialsInputDTO {
    return this.props.userCredentialsInputDTOSanitizer.sanitize(data);
  }

  sanitizePasswordUpdate(data: UpdateUserInputDTO): UpdateUserInputDTO {
    return this.props.updateUserPasswordSanitizer.sanitize(data);
  }

  sanitizeRoleUpdate(role: UserRole): UserRole {
    return this.props.updateUserRoleSanitizer.sanitize(role);
  }
}

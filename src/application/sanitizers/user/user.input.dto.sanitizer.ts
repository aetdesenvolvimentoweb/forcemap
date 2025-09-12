import { UserInputDTO } from "../../../domain/dtos";
import { UserRole } from "../../../domain/entities";
import {
  IdSanitizerProtocol,
  UserInputDTOSanitizerProtocol,
} from "../../protocols";
import { sanitizeString } from "../../utils";

interface UserInputDTOSanitizerProps {
  idSanitizer: IdSanitizerProtocol;
}

export class UserInputDTOSanitizer implements UserInputDTOSanitizerProtocol {
  constructor(private readonly props: UserInputDTOSanitizerProps) {}

  public readonly sanitize = (data: UserInputDTO): UserInputDTO => {
    const sanitized = {
      militaryId: this.props.idSanitizer.sanitize(data.militaryId),
      role: sanitizeString(data.role) as UserRole,
      password: sanitizeString(data.password),
    };
    return sanitized;
  };
}

import { UserInputDTO } from "../../domain/dtos";
import { UserRole } from "../../domain/entities";
import {
  IdSanitizerProtocol,
  UserInputDTOSanitizerProtocol,
} from "../protocols";

interface UserInputDTOSanitizerProps {
  idSanitizer: IdSanitizerProtocol;
}

export class UserInputDTOSanitizer implements UserInputDTOSanitizerProtocol {
  constructor(private readonly props: UserInputDTOSanitizerProps) {}

  private readonly sanitizeString = (value: string): string => {
    if (!value || typeof value !== "string") return value;

    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");
  };

  public readonly sanitize = (data: UserInputDTO): UserInputDTO => {
    const sanitized = {
      militaryId: this.props.idSanitizer.sanitize(data.militaryId),
      role: this.sanitizeString(data.role) as UserRole,
      password: this.sanitizeString(data.password),
    };
    return sanitized;
  };
}

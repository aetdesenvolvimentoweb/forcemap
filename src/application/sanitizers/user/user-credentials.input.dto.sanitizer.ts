import { UserCredentialsInputDTO } from "../../../domain/dtos";
import { UserCredentialsInputDTOSanitizerProtocol } from "../../protocols";
import { sanitizeNumber, sanitizePassword } from "../../utils";

export class UserCredentialsInputDTOSanitizer
  implements UserCredentialsInputDTOSanitizerProtocol
{
  public readonly sanitize = (
    data: UserCredentialsInputDTO,
  ): UserCredentialsInputDTO => {
    const sanitized = {
      rg: sanitizeNumber(data.rg),
      password: sanitizePassword(data.password),
    };
    return sanitized;
  };
}

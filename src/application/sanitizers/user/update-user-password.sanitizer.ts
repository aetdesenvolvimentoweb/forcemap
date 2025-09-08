import { UpdateUserInputDTO } from "src/domain/dtos";

import { UpdateUserPasswordSanitizerProtocol } from "../../protocols";

export class UpdateUserPasswordSanitizer
  implements UpdateUserPasswordSanitizerProtocol
{
  private readonly sanitizeUserPassword = (password: string): string => {
    if (!password || typeof password !== "string") return password;

    const sanitizedPassword = password
      .trim()
      .replace(/\s+/g, " ")
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "");

    return sanitizedPassword;
  };

  public readonly sanitize = (
    props: UpdateUserInputDTO,
  ): UpdateUserInputDTO => {
    const currentPasswordSanitized = this.sanitizeUserPassword(
      props.currentPassword,
    );
    const newPasswordSanitized = this.sanitizeUserPassword(props.newPassword);

    return {
      currentPassword: currentPasswordSanitized,
      newPassword: newPasswordSanitized,
    };
  };
}

import { UserCredentialsInputDTO } from "../../domain/dtos";
import { UserCredentialsInputDTOSanitizerProtocol } from "../protocols";

export class UserCredentialsInputDTOSanitizer
  implements UserCredentialsInputDTOSanitizerProtocol
{
  private readonly sanitizeRg = (rg: number): number => {
    return typeof rg === "string" ? parseFloat(rg) : rg;
  };

  private readonly sanitizePassword = (value: string): string => {
    if (!value || typeof value !== "string") return value;

    // Remove apenas caracteres de controle perigosos
    return (
      value
        .trim()
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f]/g, "") // Remove control characters
        // eslint-disable-next-line no-control-regex
        .replace(/\u0000/g, "")
    ); // Remove null bytes
    //foi preciso desativar as regras do eslint acima para garantir que caracteres maliciosos não sejam usados contra a aplicação.
  };

  public readonly sanitize = (
    data: UserCredentialsInputDTO,
  ): UserCredentialsInputDTO => {
    const sanitized = {
      rg: this.sanitizeRg(data.rg),
      password: this.sanitizePassword(data.password),
    };
    return sanitized;
  };
}

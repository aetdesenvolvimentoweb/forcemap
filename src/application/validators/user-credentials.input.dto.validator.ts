import { UserCredentialsInputDTO } from "../../domain/dtos";
import { InvalidParamError } from "../errors";
import { UserCredentialsInputDTOValidatorProtocol } from "../protocols";
import { ValidationPatterns } from "./common";

export class UserCredentialsInputDTOValidator
  implements UserCredentialsInputDTOValidatorProtocol
{
  private readonly validateRgPresence = (rg: number): void => {
    ValidationPatterns.validatePresence(rg, "RG");
  };

  private readonly validatePasswordPresence = (password: string): void => {
    ValidationPatterns.validatePresence(password, "Senha");
  };

  private readonly validateRgFormat = (rg: number): void => {
    if (typeof rg !== "number" || isNaN(rg) || rg <= 0) {
      throw new InvalidParamError("RG", "deve ser um número positivo");
    }

    if (rg > 10000) {
      throw new InvalidParamError("RG", "deve estar entre 1 e 10000");
    }
  };

  private readonly validatePasswordFormat = (password: string): void => {
    // Valida tamanho mínimo
    if (password.length < 8) {
      throw new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres");
    }

    // Valida se tem pelo menos 1 maiúscula
    if (!/[A-Z]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 letra maiúscula",
      );
    }

    // Valida se tem pelo menos 1 minúscula
    if (!/[a-z]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 letra minúscula",
      );
    }

    // Valida se tem pelo menos 1 número
    if (!/[0-9]/.test(password)) {
      throw new InvalidParamError("Senha", "deve conter pelo menos 1 número");
    }

    // Valida se tem pelo menos 1 caractere especial
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      throw new InvalidParamError(
        "Senha",
        "deve conter pelo menos 1 caractere especial",
      );
    }
  };

  private readonly validateRequiredFields = (
    data: UserCredentialsInputDTO,
  ): void => {
    this.validateRgPresence(data.rg);
    this.validatePasswordPresence(data.password);
  };

  private readonly validateFormats = (data: UserCredentialsInputDTO): void => {
    this.validateRgFormat(data.rg);
    this.validatePasswordFormat(data.password);
  };

  public readonly validate = (data: UserCredentialsInputDTO): void => {
    this.validateRequiredFields(data);
    this.validateFormats(data);
  };
}

import { InvalidParamError } from "../../errors";
import { UserPasswordValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UserPasswordValidator implements UserPasswordValidatorProtocol {
  private readonly validatePasswordPresence = (
    password: string,
    label: string = "Senha",
  ): void => {
    ValidationPatterns.validatePresence(password, label);
  };

  private readonly validatePasswordFormat = (
    password: string,
    label: string = "Senha",
  ): void => {
    // Valida tamanho mínimo
    if (password.length < 8) {
      throw new InvalidParamError(label, "deve ter pelo menos 8 caracteres");
    }

    // Valida se tem pelo menos 1 maiúscula
    if (!/[A-Z]/.test(password)) {
      throw new InvalidParamError(
        label,
        "deve conter pelo menos 1 letra maiúscula",
      );
    }

    // Valida se tem pelo menos 1 minúscula
    if (!/[a-z]/.test(password)) {
      throw new InvalidParamError(
        label,
        "deve conter pelo menos 1 letra minúscula",
      );
    }

    // Valida se tem pelo menos 1 número
    if (!/[0-9]/.test(password)) {
      throw new InvalidParamError(label, "deve conter pelo menos 1 número");
    }

    // Valida se tem pelo menos 1 caractere especial
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      throw new InvalidParamError(
        label,
        "deve conter pelo menos 1 caractere especial",
      );
    }
  };

  public readonly validateFormat = (
    password: string,
    label: string = "Senha",
  ): void => {
    this.validatePasswordFormat(password, label);
  };

  public readonly validate = (
    password: string,
    label: string = "Senha",
  ): void => {
    this.validatePasswordPresence(password, label);
    this.validatePasswordFormat(password, label);
  };
}

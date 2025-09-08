import { UpdateUserInputDTO } from "src/domain/dtos";

import { InvalidParamError } from "../../errors";
import { UpdateUserPasswordValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UpdateUserPasswordValidator
  implements UpdateUserPasswordValidatorProtocol
{
  private readonly validateRequiredFieldsPresence = (
    params: UpdateUserInputDTO,
  ): void => {
    ValidationPatterns.validatePresence(params.currentPassword, "Senha Atual");
    ValidationPatterns.validatePresence(params.newPassword, "Nova Senha");
  };

  private readonly validatePasswordFormat = (
    password: string,
    label: string,
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

  public readonly validate = async (
    params: UpdateUserInputDTO,
  ): Promise<void> => {
    this.validateRequiredFieldsPresence(params);
    this.validatePasswordFormat(params.currentPassword, "Senha Atual");
    this.validatePasswordFormat(params.newPassword, "Nova Senha");
  };
}

import { UpdateUserInputDTO } from "../../../domain/dtos";
import {
  UpdateUserPasswordValidatorProtocol,
  UserPasswordValidatorProtocol,
} from "../../protocols";

export class UpdateUserPasswordValidator
  implements UpdateUserPasswordValidatorProtocol
{
  constructor(
    private readonly passwordValidator: UserPasswordValidatorProtocol,
  ) {}

  public readonly validate = async (
    params: UpdateUserInputDTO,
  ): Promise<void> => {
    this.passwordValidator.validate(params.currentPassword, "Senha Atual");
    this.passwordValidator.validate(params.newPassword, "Nova Senha");
    this.passwordValidator.validateFormat(
      params.currentPassword,
      "Senha Atual",
    );
    this.passwordValidator.validateFormat(params.newPassword, "Nova Senha");
  };
}

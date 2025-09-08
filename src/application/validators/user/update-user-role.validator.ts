import { UserRole } from "../../../domain/entities";
import { InvalidParamError } from "../../errors";
import { UpdateUserRoleValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UpdateUserRoleValidator
  implements UpdateUserRoleValidatorProtocol
{
  private readonly validateUserRolePresence = (role: UserRole): void => {
    ValidationPatterns.validatePresence(role, "Função do Usuário");
  };

  private readonly validateUserRoleRange = (role: UserRole): void => {
    if (!Object.values(UserRole).includes(role)) {
      throw new InvalidParamError("Função do Usuário", "valor inválido");
    }
  };

  public readonly validate = async (role: UserRole): Promise<void> => {
    this.validateUserRolePresence(role);
    this.validateUserRoleRange(role);
  };
}

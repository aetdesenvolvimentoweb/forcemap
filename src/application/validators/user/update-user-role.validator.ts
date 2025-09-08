import { UserRole } from "../../../domain/entities";
import { InvalidParamError } from "../../errors";
import { UpdateUserRoleValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UpdateUserRoleValidator
  implements UpdateUserRoleValidatorProtocol
{
  private readonly validateUserRolePresence = (userRole: UserRole): void => {
    ValidationPatterns.validatePresence(userRole, "Função do Usuário");
  };

  private readonly validateUserRoleRange = (role: UserRole): void => {
    if (!Object.values(UserRole).includes(role)) {
      throw new InvalidParamError("Função do Usuário", "valor inválido");
    }
  };

  public readonly validate = async (userRole: UserRole): Promise<void> => {
    this.validateUserRolePresence(userRole);
    this.validateUserRoleRange(userRole);
  };
}

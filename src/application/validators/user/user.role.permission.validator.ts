import { UserRole } from "../../../domain/entities";
import { InvalidParamError } from "../../errors";
import { UserRolePermissionValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UserRolePermissionValidator
  implements UserRolePermissionValidatorProtocol
{
  private readonly validateUserRolePresence = (role: UserRole): void => {
    ValidationPatterns.validatePresence(role, "Função");
  };

  private readonly validateUserRoleRange = (role: UserRole): void => {
    if (!Object.values(UserRole).includes(role)) {
      throw new InvalidParamError("Função", "valor inválido");
    }
  };

  private readonly validateRoleCreationPermission = (
    roleToCreate: UserRole,
    requestingUserRole?: UserRole,
  ): void => {
    if (!requestingUserRole) return;

    if (requestingUserRole === UserRole.ADMIN) return;

    if (requestingUserRole === UserRole.CHEFE) {
      const allowedRoles = [UserRole.ACA, UserRole.BOMBEIRO];
      if (!allowedRoles.includes(roleToCreate)) {
        throw new InvalidParamError(
          "Função",
          "Chefe só pode criar usuários ACA ou Bombeiro",
        );
      }
      return;
    }

    throw new InvalidParamError(
      "Função",
      "usuário não tem permissão para criar outros usuários",
    );
  };

  public readonly validate = (
    roleToCreate: UserRole,
    requestingUserRole?: UserRole,
  ): void => {
    this.validateUserRolePresence(roleToCreate);
    this.validateUserRoleRange(roleToCreate);
    this.validateRoleCreationPermission(roleToCreate, requestingUserRole);
  };
}

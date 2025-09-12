import { UserRole } from "../../../../domain/entities";

export interface UserRolePermissionValidatorProtocol {
  validate(roleToCreate: UserRole, requestingUserRole?: UserRole): void;
}

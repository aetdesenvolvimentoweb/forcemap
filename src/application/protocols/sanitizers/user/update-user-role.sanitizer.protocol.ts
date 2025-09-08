import { UserRole } from "../../../../domain/entities";

export interface UpdateUserRoleSanitizerProtocol {
  sanitize(role: UserRole): UserRole;
}

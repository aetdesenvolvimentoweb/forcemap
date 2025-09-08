import { UserRole } from "../../../../domain/entities";

export interface UserRoleSanitizerProtocol {
  sanitize(role: UserRole): UserRole;
}
